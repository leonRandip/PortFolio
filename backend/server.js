import 'dotenv/config';
import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { streamAnswer, streamGordon, streamMinutes } from './lib/chat.js';
import { ingestAll, refreshGitHubIfStale, isKnowledgeBaseEmpty } from './lib/ingest.js';
import { createRoom, getRoom, setHost, joinRoom, broadcast, destroyRoom, getRoomByWs } from './lib/rooms.js';

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

// ── Hire Me — in-memory rate limit (1 per IP per 24h) ────────────────────────
const hireAttempts = new Map(); // ip → timestamp

app.post('/hire', async (req, res) => {
  const { message, org } = req.body ?? {};
  if (!message || !org) return res.status(400).json({ error: 'missing_fields' });

  // Basic spam guard: reject if message contains URLs
  if (/https?:\/\//.test(message)) return res.json({ ok: true }); // silent drop

  const ip = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown')
    .toString().split(',')[0].trim();

  const last = hireAttempts.get(ip);
  if (last && Date.now() - last < 24 * 60 * 60 * 1000) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  hireAttempts.set(ip, Date.now());

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const emailText = [
      'Someone typed into your terminal, Randip.',
      '',
      `Message:      ${message}`,
      `Organization: ${org}`,
      `Time:         ${new Date().toISOString()}`,
      `IP:           ${ip}`,
      '',
      '---',
      'Sent via randip-leon.dev terminal easter egg',
    ].join('\n');

    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'terminal@randip-leon.dev',
          to:      'leonrandip@gmail.com',
          subject: `\u{1F5A5}\uFE0F Terminal transmission from ${org}`,
          text:    emailText,
        }),
      });
      if (!r.ok) {
        const body = await r.text();
        console.error('[hire] Resend error:', r.status, body);
        return res.status(500).json({ error: 'send_failed' });
      }
    } catch (err) {
      console.error('[hire] Fetch error:', err.message);
      return res.status(500).json({ error: 'send_failed' });
    }
  } else {
    // No API key configured — log to console so dev can see it
    console.log(`[hire] RESEND_API_KEY not set. Logging instead:\nOrg: ${org}\nMsg: ${message}\nIP:  ${ip}`);
  }

  res.json({ ok: true });
});

// ── Multiplayer rooms ─────────────────────────────────────────────────────────
app.post('/rooms', (_req, res) => {
  try {
    const roomId = createRoom();
    res.json({ roomId });
  } catch (err) {
    console.error('[rooms] Create error:', err.message);
    res.status(500).json({ error: 'Could not create room.' });
  }
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

    // ── AI chat ──────────────────────────────────────────────────────────────
    if (payload.type === 'chat' && typeof payload.message === 'string') {
      const message = payload.message.trim();
      if (!message) return;
      if (payload.mode === 'gordon') {
        await streamGordon(ws, message);
      } else if (payload.mode === 'minutes') {
        await streamMinutes(ws, message);
      } else {
        await streamAnswer(ws, message);
      }
      return;
    }

    // ── Multiplayer: register as host ─────────────────────────────────────────
    if (payload.type === 'room_host') {
      const { roomId } = payload;
      if (!getRoom(roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
        return;
      }
      setHost(roomId, ws);
      ws.send(JSON.stringify({ type: 'room_ready', roomId }));
      return;
    }

    // ── Multiplayer: join as guest ────────────────────────────────────────────
    if (payload.type === 'room_join') {
      const { roomId } = payload;
      const joined = joinRoom(roomId, ws);
      if (!joined) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found or already full.' }));
        return;
      }
      ws.send(JSON.stringify({ type: 'room_joined', roomId }));
      broadcast(roomId, { type: 'peer_joined', label: 'visitor2@randip' }, ws);
      return;
    }

    // ── Multiplayer: broadcast command to peer ────────────────────────────────
    if (payload.type === 'room_command') {
      const { roomId, command } = payload;
      broadcast(roomId, { type: 'peer_command', command }, ws);
      return;
    }

    // ── Multiplayer: leave room ───────────────────────────────────────────────
    if (payload.type === 'room_leave') {
      const { roomId } = payload;
      broadcast(roomId, { type: 'peer_left' }, ws);
      destroyRoom(roomId);
      return;
    }
  });

  ws.on('close', () => {
    // Clean up any room this socket was part of
    const entry = getRoomByWs(ws);
    if (entry) {
      broadcast(entry.roomId, { type: 'peer_left' }, ws);
      destroyRoom(entry.roomId);
    }
    console.log('[ws] Client disconnected');
  });

  ws.on('error', (err) => console.error('[ws] Socket error:', err.message));
});

// ── Startup ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`[server] JARVIS backend running on port ${PORT}`);
  try {
    const empty = await isKnowledgeBaseEmpty();
    if (empty) {
      console.log('[server] Knowledge base is empty — running initial ingest...');
      ingestAll().catch(err => console.error('[server] Initial ingest error:', err.message));
    } else {
      console.log('[server] Knowledge base ready. Checking GitHub freshness...');
      refreshGitHubIfStale().catch(err => console.error('[server] GitHub refresh error:', err.message));
    }
  } catch (err) {
    console.error('[server] Startup check error:', err.message);
  }
});
