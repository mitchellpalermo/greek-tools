# PRD: Daily Page Copy Polish

## Overview

Update the Daily Verse page copy and accessibility to properly credit [Daily Dose of Greek](https://dailydoseofgreek.com) — the source of the daily verse — and improve the alt text on the external link button.

---

## Goals

- Give users context about *where* the daily verse comes from before they interact with the page
- Improve accessibility by adding descriptive alt text to the "Watch the analysis" link

---

## Status

**Complete.** Subtitle copy updated in `daily.astro` to mention Daily Dose of Greek with a link. `aria-label` added to the "Watch the analysis" button in `DailyVerse.tsx`.

---

## Priority

Low

---

## Features

### 1. Page Description Copy

Update the subtitle text on `daily.astro` to mention Daily Dose of Greek as the verse source.

**Behavior:**

- The subtitle below the "Daily Verse" heading explains that the verse is sourced from Daily Dose of Greek
- When the Daily Dose API is unavailable (fallback to curated list), the page copy still works — it references Daily Dose without making a hard promise about today's specific verse

### 2. Accessible Link Label

Add an `aria-label` to the "Watch the analysis" button in `DailyVerse.tsx`.

**Behavior:**

- `aria-label="Watch analysis from Daily Dose of Greek"` on the external link
- Screen readers announce the full destination context rather than just "Watch the analysis"

---

## File Changes

| File | Change |
|---|---|
| `src/pages/daily.astro` | Update subtitle copy to mention Daily Dose of Greek |
| `src/components/DailyVerse.tsx` | Add `aria-label` to the Daily Dose link |

---

## Out of Scope

- Changing the page layout or visual design
- Adding a Daily Dose of Greek logo or branding
- Modifying the fallback behavior

---

## Decisions

- **Copy mentions Daily Dose generically:** The subtitle doesn't promise "today's verse is from Daily Dose" since the fallback curated list may be active. Instead it frames Daily Dose as the usual source.
