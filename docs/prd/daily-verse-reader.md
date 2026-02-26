# PRD: Daily Verse Reader

## Overview

A daily reading feature that surfaces one GNT verse per day in Greek, tracks a reading streak, and connects naturally to the Flashcards and GNT Reader tools. Designed to build a consistent habit of reading Greek directly.

---

## Goals

- Give students a low-friction daily touchpoint with the Greek text
- Build and reinforce reading habit through streak tracking
- Integrate with existing vocabulary help from the Flashcards tool

---

## Status

**Complete.** All features implemented: `/daily` route with `DailyVerse` component, 62-verse curated list in `src/data/dailyVerses.ts`, localStorage streak tracking, vocabulary crossover from Flashcards SRS data, inline gloss toggle, and homepage card + nav link. Word-popup help reuses shared `GreekText.tsx` components.

---

## Priority

Low

---

## Features

### 1. Daily Verse Display

Show one GNT verse per day in Greek with the same word-popup help as the GNT Reader (lexical form, gloss, parse, frequency on click/hover).

**Behavior:**
- Verse is the same for all users on a given calendar day (deterministic selection, not personalized)
- Verse changes at midnight local time
- Verse sequence: 62-verse hand-curated list hard-coded in `src/data/dailyVerses.ts`; cycles after the last verse
- Verse reference displayed below the text (e.g., "John 3:16")
- Link to open the full chapter in the GNT Reader
- **Show/Hide glosses toggle** — inline gloss mode identical to the GNT Reader; displays a small English gloss beneath each Greek word. Toggle state is not persisted.

### 2. Reading Streak

Track consecutive days the student has opened the daily verse.

**Behavior:**
- A day counts as "read" once the page is opened (no quiz required)
- Streak stored in `localStorage`; resets if a day is missed
- Streak count displayed prominently (e.g., "🔥 7-day streak")
- No account required

### 3. Vocabulary Crossover

Words in the verse that the student has already studied in Flashcards are visually distinguished (dotted underline).

**Behavior:**
- Reads studied lemma set from `localStorage` via `getStudiedLemmas()` from `srs.ts`
- Words not yet studied are displayed normally
- Gracefully degrades if no SRS data exists
- A legend below the verse explains the dotted underline when SRS data is present

### 4. Entry Point

A dedicated `/daily` route plus a prominent card on the homepage directing students to the day's verse.

---

## Out of Scope

- User-selected verse sequences or custom schedules
- Push notifications or email reminders
- Social sharing (see Share a Verse PRD)

---

## Decisions

- **Verse sequence:** Hard-coded 62-verse curated list in `dailyVerses.ts`. Started with a manageable set rather than a full 365-verse list; can be expanded incrementally.
- **Inline glosses:** Added Show/Hide glosses toggle (same as GNT Reader) since the shared `GreekText.tsx` `WordToken` component already supports it at zero extra cost.
