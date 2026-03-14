import 'dotenv/config';
import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { streamAnswer } from './lib/chat.js';
import { ingestAll, refreshGitHubIfStale, isKnowledgeBaseEmpty } from './lib/ingest.js';

const app = express();
app.use(express.json());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

// ── Health check (wake-up ping target) ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'JARVIS', version: '1.0.0' });
});

// ── Manual ingest trigger (protected) ────────────────────────────────────────
app.post('/ingest', async (req, res) => {
  const secret = process.env.INGEST_SECRET;
  const auth   = req.headers['authorization'];
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Ingestion started — check server logs.' });
  ingestAll().catch(err => console.error('[server] Ingest error:', err.message));
});

// ── HTTP server + WebSocket ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log(`[ws] Client connected from ${req.socket.remoteAddress}`);

  ws.on('message', async (raw) => {
    let payload;
    try {
      payload = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON payload.' }));
      return;
    }

    if (payload.type === 'chat' && typeof payload.message === 'string') {
      const message = payload.message.trim();
      if (!message) return;
      await streamAnswer(ws, message);
    }
  });

  ws.on('close', () => console.log('[ws] Client disconnected'));
  ws.on('error', (err) => console.error('[ws] Socket error:', err.message));
});

// ── Startup ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`[server] JARVIS backend running on port ${PORT}`);
  try {
    const empty = await isKnowledgeBaseEmpty();
    if (empty) {
      // First deploy: ingest everything
      console.log('[server] Knowledge base is empty — running initial ingest...');
      ingestAll().catch(err => console.error('[server] Initial ingest error:', err.message));
    } else {
      // Already populated: only check if GitHub needs a 24h refresh
      console.log('[server] Knowledge base ready. Checking GitHub freshness...');
      refreshGitHubIfStale().catch(err => console.error('[server] GitHub refresh error:', err.message));
    }
  } catch (err) {
    console.error('[server] Startup check error:', err.message);
  }
});
