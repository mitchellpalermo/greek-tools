import type { APIRoute } from 'astro';
import { sampleDrillPool } from '../../../data/morphgnt-drill-pool';

export const prerender = false;

// ── Dev mock — returned when running `astro dev` without real Clerk keys ──────
const DEV_MOCK_CHALLENGE = {
  word: 'λόγος',
  lemma: 'λόγος',
  gloss: 'word, message, reason',
  pos: 'N-',
  parsing: '----NSM-',
};

export const POST: APIRoute = async ({ locals }) => {
  // In dev (no CF runtime / no Clerk middleware), return a fixed challenge so the
  // UI is previewable without needing real API keys.
  if (import.meta.env.DEV && typeof locals.auth !== 'function') {
    return new Response(JSON.stringify(DEV_MOCK_CHALLENGE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pick one word at random from the curated pool — no AI involved.
  const [challenge] = sampleDrillPool(1);

  return new Response(JSON.stringify(challenge), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
