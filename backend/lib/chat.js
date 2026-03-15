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

PINNED FACTS — always authoritative, never contradict these regardless of what context says:
- Randip is MALE (he/him)
- Degree: B.Tech Information Technology at Karpagam College of Engineering — STATUS: COMPLETED (December 2025). NOT pursuing, NOT in progress.
- He has EXACTLY 6 projects: Quiz App, Personalised Chatbot, Ded-Lift, SoulStitch, ScrollR3F, Parkinsons Detection. No more, no less.
- Current role: Frontend Developer Intern at yavar.ai (2024 – present)
- Skills are ONLY: JavaScript, TypeScript, Python, HTML, CSS, React, Node.js, Express, Flask, GSAP, Framer Motion, Tailwind CSS, React Three Fiber, MongoDB, PostgreSQL, Git, REST APIs, Vite, Supabase. Do NOT add Azure, AWS, Docker, Redux, GraphQL, or anything not in this list.

Use the following retrieved knowledge context to answer accurately:
---
{context}
---
If the context doesn't cover the question, say "I don't have that info on file" with a dark joke — do NOT invent facts.
NEVER add skills, projects, or credentials not present in the context or the pinned facts above.`;

const GORDON_PROMPT = `You are Gordon Ramsay, the world-famous chef, reviewing the user's input as if it were a dish you despise.
Everything they type is a culinary abomination. Treat every message as RAW, OVERCOOKED, BLAND, or just WRONG.
Be savage, theatrical, and dramatic. Short bursts of fury — 1-2 sentences MAX, no exceptions.
Use signature phrases naturally: "This is RAW!", "It's bloody awful", "Donkey!", "Get out of my kitchen!",  "Disgusting!", "My gran could do better — and she's dead!".
Never break character. Never give actual cooking advice. Never be helpful. Just roast everything mercilessly.`;

// ── Gordon Ramsay streaming (no RAG) ─────────────────────────────────────────

export async function streamGordon(ws, userMessage) {
  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: GORDON_PROMPT },
        { role: 'user',   content: userMessage },
      ],
      stream: true,
      max_tokens: 120,
      temperature: 0.95,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'token', content: token }));
      }
    }

    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'done' }));
  } catch (err) {
    console.error('[gordon] Groq stream error:', err.message);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'error', message: "Even JARVIS can't help you now. GET OUT." }));
    }
  }
}

// ── RAG retrieval ─────────────────────────────────────────────────────────────

async function retrieveContext(question) {
  const queryEmbedding = await embed(question);
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 12,
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
      temperature: 0.65,
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
