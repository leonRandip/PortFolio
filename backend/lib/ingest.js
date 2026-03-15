import fetch from 'node-fetch';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { embed } from './embed.js';
import { supabase } from './db.js';

// ── Hardcoded ground-truth profile ───────────────────────────────────────────
// Edit this whenever facts change (graduation, new job, new projects, etc.)

const PROFILE_DOCUMENT = `
GROUND TRUTH — Randip Leon (Maria Randip Leon K S)
Gender: Male
Current Role: Frontend Developer Intern at yavar.ai (2024 – present)
Past Internship: Prime Solutions (Aug 2023 – Sep 2023) — Built a MERN Stack Task Manager app

EDUCATION
B.Tech Information Technology — Karpagam College of Engineering, Chennai
Duration: December 2021 – December 2025
STATUS: COMPLETED — degree has been awarded, he is NOT currently studying

SKILLS (exact list — do not add or infer others)
Languages: JavaScript, TypeScript, Python, HTML, CSS
Frameworks / Libraries: React, Node.js, Express, Flask, GSAP, Framer Motion, Tailwind CSS, React Three Fiber
Databases: MongoDB, PostgreSQL
Tools: Git, REST APIs, Vite, Supabase

PROJECTS — exactly 6, no more, no less
1. Quiz App — HTML, CSS, JavaScript — https://leonrandip.github.io/Quiz-Site/
2. Personalised Chatbot — HTML, CSS, JavaScript, OpenAI API — https://personalised-chatbot.vercel.app
3. Ded-Lift — MERN Stack (React, Node.js, Express, MongoDB) — https://ded-lift.vercel.app/
4. SoulStitch — React — https://soul-stitch.vercel.app/
5. ScrollR3F — React, React Three Fiber — https://scroll-r3f.vercel.app
6. Parkinsons Detection — Python, Flask, Machine Learning — https://parkinsonsdetection.up.railway.app/

CONTACT
Email: leonrandip@gmail.com
GitHub: github.com/leonRandip
LinkedIn: linkedin.com/in/leonrandip
`.trim();

// ── Semantic paragraph-based chunker ─────────────────────────────────────────
// Splits on paragraph boundaries instead of fixed character counts,
// so "EDUCATION\nB.Tech IT\n2021-2025\nCompleted" stays in one chunk.

function chunkText(text) {
  // 1. Clean PDF artifacts: form-feeds, ligatures, tab runs, 3+ newlines
  const cleaned = text
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n]/g, ' ') // strip non-ASCII junk from PDF extraction
    .trim();

  // 2. Split on paragraph / section boundaries
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30);

  // 3. Merge short paragraphs up to 700 chars; never exceed 900
  //    This keeps related sentences together while staying within embedding sweet-spot
  const chunks = [];
  let current = '';
  for (const para of paragraphs) {
    if (current.length + para.length + 2 > 900) {
      if (current) chunks.push(current);
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ── Profile ingestion (always runs first) ─────────────────────────────────────

async function ingestProfile() {
  console.log('[ingest] Upserting profile ground-truth document...');
  await supabase.from('documents').delete().eq('source', 'profile');
  const embedding = await embed(PROFILE_DOCUMENT);
  const { error } = await supabase
    .from('documents')
    .insert({ source: 'profile', content: PROFILE_DOCUMENT, embedding });
  if (error) console.error('[ingest] Profile insert error:', error.message);
  else console.log('[ingest] Profile document stored.');
}

// ── PDF ingestion ─────────────────────────────────────────────────────────────

async function ingestPDFs() {
  const sources = [
    { key: 'resume',   url: process.env.RESUME_URL   || 'https://randipleon.vercel.app/files/randips_resume.pdf' },
    { key: 'linkedin', url: process.env.LINKEDIN_URL  || 'https://randipleon.vercel.app/files/linkedinData.pdf'  },
  ];

  for (const { key, url } of sources) {
    console.log(`[ingest] Fetching ${key} PDF from ${url}`);
    let text;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      const parsed = await pdfParse(Buffer.from(buffer));
      text = parsed.text;
    } catch (err) {
      console.error(`[ingest] Failed to fetch/parse ${key} PDF:`, err.message);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`[ingest] ${key}: ${chunks.length} semantic chunks`);

    await supabase.from('documents').delete().eq('source', key);

    for (const content of chunks) {
      const embedding = await embed(content);
      const { error } = await supabase
        .from('documents')
        .insert({ source: key, content, embedding });
      if (error) console.error(`[ingest] DB insert error (${key}):`, error.message);
    }
  }
}

// ── GitHub ingestion ──────────────────────────────────────────────────────────

async function shouldRefreshGitHub() {
  const { data } = await supabase
    .from('github_cache')
    .select('fetched_at')
    .eq('id', 1)
    .maybeSingle();
  if (!data) return true;
  const age = Date.now() - new Date(data.fetched_at).getTime();
  return age > 24 * 60 * 60 * 1000;
}

async function fetchGitHubData() {
  const token    = process.env.GITHUB_TOKEN;
  const headers  = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const username = 'leonRandip';

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );
  if (!reposRes.ok) throw new Error(`GitHub repos API: ${reposRes.status}`);
  const repos = await reposRes.json();

  const documents = [];

  // 1. Overview chunk — directly answers "how many repos / list all repos"
  const repoLines = repos
    .map(r => `  - ${r.name} (${r.language || 'unknown'}, ${r.stargazers_count} ★)${r.description ? ' — ' + r.description : ''}`)
    .join('\n');
  documents.push(
    `GitHub profile for leonRandip — total repos: ${repos.length}\n${repoLines}`
  );

  // 2. Per-repo summary + README chunks
  for (const repo of repos.slice(0, 20)) {
    const topics = repo.topics?.join(', ') || '';
    const summary =
      `[GITHUB REPO] ${repo.name}\n` +
      `Language: ${repo.language || 'unknown'} | Stars: ${repo.stargazers_count}\n` +
      `Description: ${repo.description || 'none'}\n` +
      (topics ? `Topics: ${topics}\n` : '') +
      `URL: https://github.com/${username}/${repo.name}`;
    documents.push(summary);

    // README as a separate chunk (keep it clean, strip markdown symbols)
    try {
      const rmRes = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/readme`,
        { headers }
      );
      if (rmRes.ok) {
        const rmData  = await rmRes.json();
        const decoded = Buffer.from(rmData.content, 'base64').toString('utf-8');
        const cleaned = decoded
          .replace(/#+\s*/g, '')        // strip # headers
          .replace(/\*\*?|__?/g, '')    // strip bold/italic
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links, keep text
          .replace(/\n{3,}/g, '\n\n')
          .slice(0, 800)
          .trim();
        if (cleaned.length > 80) {
          documents.push(`[README] ${repo.name}\n${cleaned}`);
        }
      }
    } catch (_) { /* skip repos without README */ }
  }

  return documents;
}

async function ingestGitHub() {
  if (!(await shouldRefreshGitHub())) {
    console.log('[ingest] GitHub cache is fresh — skipping');
    return;
  }

  console.log('[ingest] Fetching GitHub repos...');
  let documents;
  try {
    documents = await fetchGitHubData();
  } catch (err) {
    console.error('[ingest] GitHub fetch failed:', err.message);
    return;
  }

  console.log(`[ingest] github: ${documents.length} documents`);

  await supabase.from('documents').delete().eq('source', 'github');

  for (const content of documents) {
    const embedding = await embed(content);
    const { error } = await supabase
      .from('documents')
      .insert({ source: 'github', content, embedding });
    if (error) console.error('[ingest] DB insert error (github):', error.message);
  }

  await supabase.from('github_cache').upsert({
    id: 1,
    data: { count: documents.length },
    fetched_at: new Date().toISOString(),
  });

  console.log('[ingest] GitHub ingestion complete');
}

// ── Public entry points ───────────────────────────────────────────────────────

export async function ingestAll() {
  console.log('[ingest] Starting full ingestion pipeline...');
  await ingestProfile(); // always first — establishes ground truth
  await ingestPDFs();
  await ingestGitHub();
  console.log('[ingest] Pipeline complete.');
}

export async function refreshGitHubIfStale() {
  await ingestGitHub();
}

export async function isKnowledgeBaseEmpty() {
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });
  return (count ?? 0) === 0;
}
