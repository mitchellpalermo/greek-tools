# PRD: Analytics

## Overview

Add PostHog analytics to greek.tools to understand how users engage with the site's tools — which features get used, how often users return, and where they drop off in interactive flows. The primary question driving this feature is: **are users coming back for the daily verse?**

---

## Status

**Not started.**

## LOE

**Small** (1–2 days)

---

## Goals

- Understand which tools users engage with most
- Measure daily verse return rate (retention)
- Identify drop-off points in interactive flows (Flashcards, Paradigm Quiz)
- Lay groundwork for data-informed prioritization of future features

---

## Features

### 1. Pageview Tracking

Automatically track every page visit across the site.

**Behavior:**
- PostHog's autocapture records pageviews on every route change
- No custom code required beyond the script initialization
- Covers: `/`, `/daily`, `/flashcards`, `/reader`, `/grammar`, `/paradigms`, `/keyboard`, `/transliteration`

### 2. Daily Verse Retention

Track whether users return to `/daily` on subsequent days.

**Behavior:**
- Fire a `daily_verse_viewed` event when the `DailyVerse` component mounts
- PostHog's retention chart answers "of users who visited on day 0, what % returned on day N?"
- Anonymous device-based identity (no accounts required); same browser = same user
- Streak data remains in `localStorage` — this is separate aggregate analytics, not a replacement

### 3. Tool Engagement Events

Custom events for meaningful interactions within each tool.

**Event taxonomy:**

| Event | Properties | Fired when |
|---|---|---|
| `daily_verse_viewed` | `verse_reference` | DailyVerse mounts |
| `flashcard_session_started` | `deck_size` | User begins a flashcard session |
| `flashcard_reviewed` | `result: correct \| incorrect`, `interval_days` | User flips and rates a card |
| `paradigm_quiz_started` | `quiz_type` | Paradigm Quiz begins |
| `paradigm_quiz_answered` | `correct: boolean`, `paradigm` | User submits an answer |
| `gnt_reader_passage_opened` | `book`, `chapter` | Reader loads a passage |
| `grammar_section_viewed` | `section` | User navigates to a grammar section |

### 4. Session Replay

Record anonymized session replays to observe real usage patterns.

**Behavior:**
- Enabled for a sample of sessions (configurable — start at 20%)
- No personally identifiable information (PII) captured; PostHog masks input fields by default
- Particularly useful for: watching how users navigate the Paradigm Quiz, seeing where readers scroll in Grammar Reference

---

## Setup Steps (Manual — Mitch)

Before implementation can begin, a PostHog project must be created:

1. **Create an account** at [posthog.com](https://posthog.com) (free tier: 1M events/month)
2. **Create a new project** — name it "greek.tools"
3. **Copy your Project API Key** from Project Settings → Project API Key (format: `phc_...`)
4. **Copy your PostHog host** — use `https://us.i.posthog.com` unless you chose EU cloud during signup
5. **Add to your Cloudflare Pages environment variables:**
   - `PUBLIC_POSTHOG_KEY` = your project API key
   - `PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
6. Hand the keys off for implementation

---

## Technical Notes

- **Package:** `posthog-js` — the official PostHog JavaScript SDK with React support
- **Initialization:** PostHog is initialized once in `Layout.astro` via a `<script>` tag or a React provider wrapping island components
- **React integration:** A `PostHogProvider` wraps the React tree so components can call `usePostHog()` for custom events
- **Astro pages:** Pageviews are captured automatically; custom events from `.astro` pages fire via the `window.posthog` global
- **Environment variables:** Astro exposes `PUBLIC_` prefixed variables to the client — keys are write-only ingest keys, safe to expose
- **Cloudflare Pages:** Environment variables are set in the Pages dashboard under Settings → Environment Variables; no `wrangler.toml` changes needed

### Preventing test/dev data from polluting analytics

Two layers of protection ensure local development and testing do not appear in PostHog:

1. **Environment guard:** PostHog initialization is wrapped in `import.meta.env.PROD`. Vite sets this to `true` only for production builds — `astro dev` and `astro preview` both skip initialization entirely.
2. **No local key:** `PUBLIC_POSTHOG_KEY` exists only in Cloudflare Pages environment variables, not in any committed or local `.env` file. Even if the environment guard were bypassed, there is no key to initialize with.

**Edge case — Cloudflare preview deployments:** If Playwright end-to-end tests are ever run against a Cloudflare preview URL (rather than localhost), that deployment will carry the production key and events would be captured. If this becomes a concern, create a second PostHog project (e.g. "greek.tools staging") and set its key only on non-production Cloudflare environments. This is not required for the initial implementation.

---

## Out of Scope

- User accounts or identity (all tracking is anonymous/device-based)
- A/B testing or feature flags (PostHog supports this, but not in scope for this phase)
- Server-side event tracking
- Exposing analytics data within the greek.tools UI

---

## Open Questions

- What session replay sample rate is appropriate to start? (20% suggested above)
- Should session replay be disabled on the flashcard input fields specifically, even though PostHog masks inputs by default?
