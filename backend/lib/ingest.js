import fetch from 'node-fetch';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { embed } from './embed.js';
import { supabase } from './db.js';

const CHUNK_SIZE   = 500;
const CHUNK_OVERLAP = 50;

// ── Text chunking ─────────────────────────────────────────────────────────────

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) chunks.push(chunk);  // skip near-empty chunks
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ── PDF ingestion ─────────────────────────────────────────────────────────────

async function ingestPDFs() {
  const sources = [
    { key: 'resume',   url: process.env.RESUME_URL  || 'https://randipleon.vercel.app/files/randips_resume.pdf' },
    { key: 'linkedin', url: process.env.LINKEDIN_URL || 'https://randipleon.vercel.app/files/linkedinData.pdf'  },
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
    console.log(`[ingest] ${key}: ${chunks.length} chunks`);

    // Delete old rows for this source first (idempotent)
    await supabase.from('documents').delete().eq('source', key);

    for (const content of chunks) {
      const embedding = await embed(content);
      const { error } = await supabase.from('documents').insert({ source: key, content, embedding });
      if (error) console.error(`[ingest] DB insert error (${key}):`, error.message);
    }
  }
}

// ── GitHub ingestion ───────────────────────────────────────────────────────────

async function shouldRefreshGitHub() {
  const { data } = await supabase
    .from('github_cache')
    .select('fetched_at')
    .eq('id', 1)
    .maybeSingle();
  if (!data) return true;
  const age = Date.now() - new Date(data.fetched_at).getTime();
  return age > 24 * 60 * 60 * 1000; // 24 hours
}

async function fetchGitHubData() {
  const token = process.env.GITHUB_TOKEN;
  const headers = { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const username = 'leonRandip';

  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`, { headers });
  if (!reposRes.ok) throw new Error(`GitHub repos API: ${reposRes.status}`);
  const repos = await reposRes.json();

  const summaries = [];
  for (const repo of repos.slice(0, 15)) {
    let readmeExcerpt = '';
    try {
      const rmRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, { headers });
      if (rmRes.ok) {
        const rmData = await rmRes.json();
        const decoded = Buffer.from(rmData.content, 'base64').toString('utf-8');
        readmeExcerpt = decoded.slice(0, 600).replace(/\n+/g, ' ').trim();
      }
    } catch (_) { /* skip */ }

    summaries.push(
      `Repo: ${repo.name} | Stars: ${repo.stargazers_count} | Lang: ${repo.language || 'unknown'} | ` +
      `Desc: ${repo.description || 'none'} | README: ${readmeExcerpt}`
    );
  }

  return summaries;
}

async function ingestGitHub() {
  if (!(await shouldRefreshGitHub())) {
    console.log('[ingest] GitHub cache is fresh — skipping');
    return;
  }

  console.log('[ingest] Fetching GitHub repos...');
  let summaries;
  try {
    summaries = await fetchGitHubData();
  } catch (err) {
    console.error('[ingest] GitHub fetch failed:', err.message);
    return;
  }

  console.log(`[ingest] github: ${summaries.length} repo summaries`);

  // Delete old github rows
  await supabase.from('documents').delete().eq('source', 'github');

  for (const content of summaries) {
    const embedding = await embed(content);
    const { error } = await supabase.from('documents').insert({ source: 'github', content, embedding });
    if (error) console.error('[ingest] DB insert error (github):', error.message);
  }

  // Update github_cache timestamp
  await supabase.from('github_cache').upsert({ id: 1, data: { count: summaries.length }, fetched_at: new Date().toISOString() });

  console.log('[ingest] GitHub ingestion complete');
}

// ── Public entry points ───────────────────────────────────────────────────────

export async function ingestAll() {
  console.log('[ingest] Starting full ingestion pipeline...');
  await ingestPDFs();
  await ingestGitHub();
  console.log('[ingest] Pipeline complete.');
}

/** Only refresh GitHub if the 24h cache is stale. Used on warm restarts. */
export async function refreshGitHubIfStale() {
  await ingestGitHub();
}

export async function isKnowledgeBaseEmpty() {
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });
  return (count ?? 0) === 0;
}
