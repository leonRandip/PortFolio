import { pipeline } from '@xenova/transformers';

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    // Downloads ~25 MB on first call, then cached for the process lifetime.
    // model: all-MiniLM-L6-v2 → 384-dimensional embeddings
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

/**
 * Generate a 384-dim embedding for the given text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embed(text) {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
