import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { hasActiveSubscription, getDailyUsageCount } from '../../../lib/subscription';
import { buildExplanationPrompt } from '../../../lib/claude';
import {
  DAILY_EXPLANATION_LIMIT,
  EXPLANATION_MAX_TOKENS,
} from '../../../lib/constants';

export const prerender = false;

// Dev mock — streamed explanation returned when running `astro dev` without Clerk/D1
const DEV_MOCK_EXPLANATION =
  'λόγος ends in -ος, the standard nominative singular ending for 2nd-declension masculine nouns. ' +
  'The lexical form λόγος is itself nominative singular masculine — so when you see this word ' +
  'unmodified in a sentence it is functioning as a subject. ' +
  'Compare the genitive λόγου (-ου) and dative λόγῳ (-ῳ) to see how the ending shifts across cases.';

export const POST: APIRoute = async ({ request, locals }) => {
  // Dev bypass — stream a canned explanation without calling Anthropic
  if (import.meta.env.DEV && typeof locals.auth !== 'function') {
    const encoder = new TextEncoder();
    const words = DEV_MOCK_EXPLANATION.split(' ');
    const readable = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`));
          await new Promise(r => setTimeout(r, 40)); // simulate streaming
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return new Response(readable, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  }

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
  const todayCount = await getDailyUsageCount(db, userId, 'explanation');
  if (todayCount >= DAILY_EXPLANATION_LIMIT) {
    return new Response(
      JSON.stringify({ error: 'Daily explanation limit reached', limit: DAILY_EXPLANATION_LIMIT }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── Parse request body ───────────────────────────────────────────────────────
  let body: {
    word: string;
    lemma: string;
    pos: string;
    correctParse: string;
    studentParse: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { word, lemma, pos, correctParse, studentParse } = body;
  if (!word || !lemma || !pos || !correctParse || !studentParse) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Record usage (fire-and-forget) ───────────────────────────────────────────
  db.prepare(
    `INSERT INTO drill_sessions (user_id, lemma, pos, parsing, correct)
     VALUES (?, ?, ?, '__explain__', 0)`,
  )
    .bind(userId, lemma, pos)
    .run()
    .catch((e: unknown) => console.error('Failed to record explain session:', e));

  // ── Build prompt + stream response ───────────────────────────────────────────
  const promptText = buildExplanationPrompt({ word, lemma, pos, correctParse, studentParse });
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: EXPLANATION_MAX_TOKENS,
    system: 'You are a Greek morphology tutor. Give clear, pedagogically helpful explanations. Plain text only — no markdown.',
    messages: [{ role: 'user', content: promptText }],
  });

  // Convert Anthropic stream to Server-Sent Events (SSE)
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        console.error('Streaming explanation error:', err);
        controller.enqueue(encoder.encode('data: [ERROR]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
