# PRD: Security & Cost Controls

## Overview

greek.tools makes server-side calls to the Claude API on behalf of paying subscribers. Left unprotected, a single compromised account or a bug in the billing check could result in unbounded API spend. This document defines the layered protections that make the total monthly Claude spend predictable and bounded regardless of how many users the site has or how they behave.

---

## Status

**Not started.** Must be implemented alongside — not after — the Parsing Drills feature.

## LOE

**Small (~1 day)** — most controls are a few lines of code each, but they are non-negotiable before shipping.

---

## Threat Model

| Threat | Impact | Control |
|---|---|---|
| User hammers the challenge endpoint | Unbounded Claude spend | Per-user daily rate limit in D1 |
| Shared/leaked subscription credentials | Same as above | Rate limit applies per user, not per session |
| Subscription check is bypassed | Free Claude access | Double-check in every API route, not just the page |
| Fake Stripe webhook modifies subscription | Free access granted | Stripe signature verification on every webhook |
| Prompt injection via word data | Unexpected Claude behavior | System prompt is server-only; user never controls prompt content |
| Claude API is slow/unavailable | Worker timeout, bad UX | Hard timeout on every Claude call |
| Runaway Claude response streams forever | Worker CPU/memory | `max_tokens` cap + stream abort on client disconnect |
| D1 storage grows unbounded | Minor cost, potential slowdown | Drill sessions table has a retention policy |

---

## Controls

### 1. Per-User Daily Rate Limit

Before every call to Claude, check how many challenges + explanations the user has made today.

**Limits:**
- **50 challenges per user per day** (UTC day)
- **25 explanations per user per day** (UTC day)

These bounds are generous for any real student and cost ~$0.20/user/month at worst-case usage (far below the $5 subscription price).

**Implementation:** Check `drill_sessions` in D1 before calling Claude:

```ts
const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
const { count } = await db
  .prepare(`SELECT COUNT(*) as count FROM drill_sessions
            WHERE user_id = ? AND date(created_at, 'unixepoch') = ?`)
  .bind(userId, today)
  .first<{ count: number }>();

if (count >= DAILY_CHALLENGE_LIMIT) {
  return new Response(JSON.stringify({ error: 'daily_limit_reached' }), { status: 429 });
}
```

Rate limit constants defined in `src/lib/constants.ts` so they can be adjusted in one place without hunting through routes:
```ts
export const DAILY_CHALLENGE_LIMIT = 50;
export const DAILY_EXPLANATION_LIMIT = 25;
```

### 2. Subscription Check in Every API Route

The page (`drills.astro`) checks subscription status server-side to decide what to render — but the API routes must also independently verify subscription status before calling Claude. Trusting the page's check is insufficient because API routes are callable directly.

**Rule:** Every call to Claude must be preceded by:
1. Auth check (`userId` from Clerk — return 401 if null)
2. Subscription check (`hasActiveSubscription(db, userId)` — return 402 if false)
3. Rate limit check (D1 count — return 429 if over limit)

These three checks run in order in every Claude-touching route. The shared helper `src/lib/subscription.ts` is the single implementation of the subscription check.

### 3. Hard Token Cap on Every Claude Call

`max_tokens` is set conservatively on every Anthropic API call:

| Endpoint | `max_tokens` |
|---|---|
| Challenge generation | 512 |
| Explanation (streaming) | 600 |

These caps bound the worst-case cost per call. A Claude Sonnet call capped at 600 output tokens costs at most ~$0.009.

### 4. Request Timeout

Every Claude API call is wrapped in a `Promise.race` against a 25-second timeout:

```ts
const result = await Promise.race([
  anthropic.messages.create({ ... }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Claude timeout')), 25_000)
  ),
]);
```

Cloudflare Workers have a 30-second CPU time limit; the 25-second timeout ensures the route returns a clean 504 rather than being killed mid-response.

### 5. Stripe Webhook Signature Verification

Every request to `/api/billing/webhook` is verified using Stripe's `constructEventAsync()` before any D1 writes occur. If the signature is invalid, return 400 immediately — no side effects.

```ts
const rawBody = await request.text(); // Do NOT parse as JSON first
const event = await stripe.webhooks.constructEventAsync(
  rawBody, signature, env.STRIPE_WEBHOOK_SECRET
);
```

**Never** process a webhook event without a valid signature. This prevents an attacker from crafting a fake `subscription.created` event to grant themselves free access.

### 6. Server-Side-Only Prompts

The prompt sent to Claude is built entirely on the server from the pre-built drill pool. No part of the prompt is derived from user input. This eliminates prompt injection as an attack surface.

The client sends only:
- `{ pos?: string }` — a filter for noun/verb/all (validated against an allowlist server-side)

Everything else — the word list, the system instructions, the parse code format — is assembled server-side.

### 7. D1 Session Retention

The `drill_sessions` table accumulates one row per drill attempt. At 50 challenges/day × 1,000 active users, that is 50,000 rows/day or ~18 million rows/year. D1 handles this comfortably, but to keep query performance sharp:

- Add a scheduled Cloudflare Worker (cron) that deletes rows older than 90 days
- Alternatively, rely on D1 indexes on `user_id` and `created_at` and revisit if needed

### 8. Anthropic Usage Alerts

Set a spend alert in the Anthropic console at $20/month and a hard cap at $50/month. If Claude spend is approaching $50 while the subscription revenue doesn't support it, the daily rate limit can be tightened immediately with a constant change and redeploy.

### 9. Cloudflare Spend Limits

Set a Cloudflare Workers spend cap in the Cloudflare dashboard. The site's Worker usage is minimal (short-lived requests), but a spending cap prevents surprises if traffic spikes unexpectedly.

---

## What This Costs at Scale

Assuming claude-sonnet-4-5 pricing (~$3/MTok input, ~$15/MTok output):

| Scenario | Claude cost/user/month |
|---|---|
| Light use (5 challenges, 2 explanations/day) | ~$0.02 |
| Moderate use (20 challenges, 10 explanations/day) | ~$0.08 |
| Heavy use (50 challenges, 25 explanations/day) | ~$0.20 |
| Worst case (at daily cap, every day) | ~$0.20 |

At $5/month per subscription and a worst-case $0.20 API cost, Claude costs are at most 4% of revenue even for the most active users. The margin is very comfortable.

---

## Out of Scope

- IP-based rate limiting (per-user limit is sufficient; IP limiting is easy to bypass with VPNs)
- Fraud detection for subscription payments (Stripe Radar handles this)
- Content filtering on Claude responses (Claude's built-in safety is sufficient for Greek grammar explanations)
