# PRD: Subscriptions & Billing

## Overview

A monthly subscription that unlocks the AI-powered Parsing Drills feature. Stripe handles payment processing and subscription lifecycle; a Cloudflare D1 database stores subscription status, which is checked server-side on every request to protected features.

---

## Status

**Not started.** Planned for implementation alongside Parsing Drills and Authentication.

## LOE

**Medium (2–3 days)** as a standalone concern; bundled with auth infrastructure in the Parsing Drills build.

---

## Goals

- Cover the cost of Claude API calls (the only non-trivial ongoing cost of the site)
- Keep the checkout flow frictionless — one click from the upgrade prompt to Stripe Checkout
- Ensure subscription status is enforced server-side so it cannot be bypassed client-side

---

## Pricing

**$5/month**, cancel any time. No free tier, no trials.

Price is set in Stripe and referenced via `STRIPE_PRICE_ID` environment variable. Changing price in Stripe requires no code change.

---

## Features

### 1. Upgrade Gate

When an authenticated user visits a paid feature without an active subscription, they see an upgrade prompt instead of the feature.

**Behavior:**
- Shown server-side (via Astro frontmatter reading D1) — no flash of content
- Displays: feature name, what they get, price ($5/month), "Subscribe" button
- "Subscribe" button POSTs to `/api/billing/checkout` → redirects to Stripe Checkout

### 2. Stripe Checkout

Standard hosted Stripe Checkout page for subscription creation.

**Behavior:**
- Monthly subscription, card payment
- On success: Stripe redirects to `/drills?checkout=success`; webhook fires to update D1
- On cancel: Stripe redirects to `/drills?checkout=canceled`; upgrade gate still shown
- Stripe handles all PCI compliance, payment method storage, and receipts

### 3. Subscription Lifecycle

Subscription status is synced to D1 via Stripe webhooks.

**Events handled:**

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Create user record in D1 if not exists |
| `customer.subscription.created` | Insert subscription row in D1 |
| `customer.subscription.updated` | Update subscription status and period end in D1 |
| `customer.subscription.deleted` | Set subscription status to `canceled` in D1 |

**D1 is the source of truth for subscription status at request time** — the app never calls Stripe's API inline on user requests. This keeps latency at ~1ms (D1 edge query) rather than ~100–300ms (Stripe API call).

### 4. Customer Portal (Future)

In a future iteration, a "Manage subscription" link opens Stripe's hosted Customer Portal where users can update payment methods, view invoices, or cancel.

**Not in v1** — Stripe dashboard handles refunds and edge cases for now.

---

## Technical Design

### Database Schema

See `migrations/0001_auth_and_subscriptions.sql`:

```sql
-- Users: one row per Clerk user ID
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER);

-- Subscriptions: one row per Stripe subscription
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,           -- Stripe subscription ID
  user_id TEXT NOT NULL,         -- Clerk user ID
  stripe_customer_id TEXT,
  status TEXT NOT NULL,          -- 'active' | 'trialing' | 'past_due' | 'canceled'
  current_period_end INTEGER,    -- Unix timestamp — checked on every request
  ...
);
```

### Subscription Check Helper

```ts
// src/lib/subscription.ts
export async function hasActiveSubscription(db, userId): Promise<boolean>
```

Called from:
- `src/pages/drills.astro` (server-side, gates the page)
- `src/pages/api/drills/challenge.ts` (double-check before Claude call)
- `src/pages/api/drills/explain.ts` (double-check before Claude call)

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/billing/checkout` | POST | Create Stripe Checkout session → return `{ url }` |
| `/api/billing/webhook` | POST | Verify Stripe signature → sync subscription to D1 |

### Webhook Signature Verification

Stripe's `constructEventAsync()` uses the Web Crypto API and works natively in Cloudflare Workers. The raw request body (`request.text()`) must be used — parsing as JSON first breaks signature verification.

### Environment Variables

| Variable | Where |
|---|---|
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public (used for future Stripe.js if needed) |
| `STRIPE_SECRET_KEY` | Wrangler secret |
| `STRIPE_WEBHOOK_SECRET` | Wrangler secret (from Stripe webhook dashboard) |
| `STRIPE_PRICE_ID` | Wrangler secret or var (the monthly price ID from Stripe dashboard) |

---

## Out of Scope (v1)

- Customer Portal (manage/cancel subscription self-serve)
- Annual pricing
- Multiple subscription tiers
- Promo codes or trials
- Invoice history page within the app (Stripe emails handle this)

---

## Open Questions

- Should a "Manage subscription" link (Stripe Customer Portal) be added to the nav immediately, or deferred to v2?
- What should happen at `/drills?checkout=success`? A success toast for 5 seconds seems right. Does the page need to poll D1 briefly while the webhook fires, or can it assume the webhook will arrive before the next page load?
