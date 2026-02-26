import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { hasActiveSubscription, getDailyUsageCount } from '../../../lib/subscription';
import { buildChallengePrompt, parseChallengeResponse } from '../../../lib/claude';
import { sampleDrillPool } from '../../../data/morphgnt-drill-pool';
import {
  DAILY_CHALLENGE_LIMIT,
  CHALLENGE_MAX_TOKENS,
  DRILL_POOL_SAMPLE_SIZE,
} from '../../../lib/constants';

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = locals.runtime.env;
  const db = env.DB;

  // ── Subscription gate ────────────────────────────────────────────────────────
  const active = await hasActiveSubscription(db, userId);
  if (!active) {
    return new Response(JSON.stringify({ error: 'Subscription required' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Daily rate limit ─────────────────────────────────────────────────────────
  const todayCount = await getDailyUsageCount(db, userId, 'challenge');
  if (todayCount >= DAILY_CHALLENGE_LIMIT) {
    return new Response(
      JSON.stringify({ error: 'Daily challenge limit reached', limit: DAILY_CHALLENGE_LIMIT }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── Sample drill pool + call Claude ──────────────────────────────────────────
  const candidates = sampleDrillPool(DRILL_POOL_SAMPLE_SIZE);
  const { system, user } = buildChallengePrompt(candidates);

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  let raw: string;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: CHALLENGE_MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = message.content[0];
    raw = block.type === 'text' ? block.text : '';
  } catch (err) {
    console.error('Claude challenge error:', err);
    return new Response(JSON.stringify({ error: 'AI service error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const challenge = parseChallengeResponse(raw);
  if (!challenge) {
    console.error('Failed to parse Claude challenge response:', raw);
    return new Response(JSON.stringify({ error: 'Invalid AI response' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Record usage (fire-and-forget; don't fail the request if this errors) ────
  db.prepare(
    `INSERT INTO drill_sessions (user_id, lemma, pos, parsing, correct)
     VALUES (?, ?, ?, ?, 0)`,
  )
    .bind(userId, challenge.lemma, challenge.pos, challenge.parsing)
    .run()
    .catch((e: unknown) => console.error('Failed to record challenge session:', e));

  return new Response(JSON.stringify(challenge), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
