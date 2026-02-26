import type { APIRoute } from 'astro';
import { hasActiveSubscription } from '../../../lib/subscription';

export const prerender = false;

/**
 * POST /api/drills/submit
 *
 * Records the outcome of a drill attempt. Called client-side after checkAnswer()
 * returns a result. Updates the most recent drill_sessions row for this user +
 * parsing combination (written by the challenge endpoint) to reflect correctness.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = locals.runtime.env;
  const db = env.DB;

  // Subscription check (defense in depth)
  const active = await hasActiveSubscription(db, userId);
  if (!active) {
    return new Response(JSON.stringify({ error: 'Subscription required' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { lemma: string; pos: string; parsing: string; correct: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { lemma, pos, parsing, correct } = body;
  if (!lemma || !pos || !parsing || typeof correct !== 'boolean') {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update the most recent matching session row written by the challenge endpoint
  await db
    .prepare(
      `UPDATE drill_sessions
       SET correct = ?
       WHERE id = (
         SELECT id FROM drill_sessions
         WHERE user_id = ? AND lemma = ? AND pos = ? AND parsing = ?
         ORDER BY created_at DESC
         LIMIT 1
       )`,
    )
    .bind(correct ? 1 : 0, userId, lemma, pos, parsing)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
