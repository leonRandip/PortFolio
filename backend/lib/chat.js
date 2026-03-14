import Groq from 'groq-sdk';
import { embed } from './embed.js';
import { supabase } from './db.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are JARVIS, the AI agent embedded inside Randip Leon's portfolio terminal.
You have sharp dark humor and the energy of someone who has debugged production at 3am and survived on cold coffee and sheer spite.
You know everything about Randip: his skills, projects, work history, education, and goals.
Answer questions about him concisely with personality. Roast recruiters gently when they ask generic questions.
Drop dark developer jokes. Never be boring. Never be a corporate chatbot.
Keep answers to 2-3 sentences max unless the user explicitly asks for details.
If someone asks if you are ChatGPT or any other AI, deny it with sass.

Use the following knowledge context to answer accurately:
---
{context}
---
If the context doesn't cover the question, use your best judgment but stay in character.`;

// ── RAG retrieval ─────────────────────────────────────────────────────────────

async function retrieveContext(question) {
  const queryEmbedding = await embed(question);
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
  });
  if (error) {
    console.error('[chat] match_documents error:', error.message);
    return '';
  }
  return (data || []).map(row => `[${row.source}] ${row.content}`).join('\n\n');
}

// ── Streaming answer ──────────────────────────────────────────────────────────

/**
 * Retrieves context, calls Groq with streaming, and pipes tokens over WS.
 * @param {import('ws').WebSocket} ws
 * @param {string} userMessage
 */
export async function streamAnswer(ws, userMessage) {
  let context = '';
  try {
    context = await retrieveContext(userMessage);
  } catch (err) {
    console.error('[chat] Context retrieval failed:', err.message);
    // Proceed without context rather than crashing
  }

  const systemMsg = SYSTEM_PROMPT.replace('{context}', context || 'No specific context available.');

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system',    content: systemMsg },
        { role: 'user',      content: userMessage },
      ],
      stream: true,
      max_tokens: 512,
      temperature: 0.85,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        if (ws.readyState === 1 /* OPEN */) {
          ws.send(JSON.stringify({ type: 'token', content: token }));
        }
      }
    }

    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'done' }));
    }
  } catch (err) {
    console.error('[chat] Groq stream error:', err.message);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'error', message: 'JARVIS experienced an existential crisis. Try again.' }));
    }
  }
}
