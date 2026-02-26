# PRD: Stats Dashboard

## Overview

A single page that aggregates study progress from across all tools: flashcard streaks, words learned, chapters read, daily verse streak, and overall GNT coverage. Gives students a sense of cumulative progress across their Greek study.

---

## Status

**Not started.**

## LOE

**Small** (2–3 days)

---

## Goals

- Surface the progress data already scattered across `localStorage` keys into one rewarding summary view
- Motivate continued study by making progress visible
- Require no new data collection for the core features; optionally expand what's stored for richer charts

---

## Features

### 1. GNT Coverage Headline

The single most motivating metric: what percentage of the GNT can the student now read based on their mastered vocabulary.

**Behavior:**
- "You know enough to recognize X% of words in the GNT"
- Derived from: `getStudiedLemmas()` intersected with unique GNT lemma frequencies (weighted by occurrence count)
- Example: knowing all 313 words that occur 100+ times = ~80% of GNT word tokens

### 2. Flashcard Stats

- Total words in the SRS store
- Words "mastered" (interval > 21 days)
- Due today vs. reviewed today
- Current streak and longest streak
- All-time accuracy rate

### 3. Reading Stats

- Daily verse streak (from `greek-tools-daily-streak`)
- Last book/chapter read (from `greek-tools-reader-last`)
- Number of unique books visited *(requires expanding reading history — see note below)*

### 4. Weekly Activity Chart (Optional)

A simple 7-bar chart showing cards reviewed per day for the past week.

**Behavior:**
- Requires storing per-day review counts; `greek-tools-stats` currently tracks `cardsStudiedToday` but resets daily
- Would need a `reviewHistory: { [date: string]: number }` addition to the stats store
- Opt-in enhancement; not required for MVP

---

## Technical Notes

- **Route:** `/stats` or `/progress`
- **Existing localStorage keys used:**
  - `greek-tools-srs-v2` — full SRS store (intervals, due dates)
  - `greek-tools-stats` — streak, accuracy, daily count
  - `greek-tools-daily-streak` — daily verse streak data
  - `greek-tools-reader-last` — most recent passage
- **GNT coverage calculation:** At build time, generate a `public/data/lemma-frequencies.json` mapping lemma → occurrence count. Client-side: sum occurrences for studied lemmas / total GNT word tokens.
- **Reading history expansion:** To show "books visited," `greek-tools-reader-last` would need to track a set of visited books rather than just the single most recent passage. This is a small schema change but requires a migration.

---

## Out of Scope

- Cloud sync or cross-device stats
- Comparative stats across users
- Historical data before this feature ships (no retroactive data collection)

---

## Open Questions

- Should reading history be expanded to track all visited chapters (enables richer stats) or stay minimal (single most-recent passage)?
- Is the weekly activity chart worth adding the per-day storage overhead? Could be deferred to a v2.
