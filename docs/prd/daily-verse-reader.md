# PRD: Daily Verse Reader

## Overview

A daily reading feature that surfaces one GNT verse per day in Greek, tracks a reading streak, and connects naturally to the Flashcards and GNT Reader tools. Designed to build a consistent habit of reading Greek directly.

---

## Goals

- Give students a low-friction daily touchpoint with the Greek text
- Build and reinforce reading habit through streak tracking
- Integrate with existing vocabulary help from the Flashcards tool

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
- Default verse sequence: curated list of pedagogically useful passages (not random); could follow a simple through-the-NT order or a hand-selected list of ~365 verses
- Verse reference displayed below the text (e.g., "John 3:16")
- Link to open the full chapter in the GNT Reader

### 2. Reading Streak

Track consecutive days the student has opened the daily verse.

**Behavior:**
- A day counts as "read" once the page is opened (no quiz required)
- Streak stored in `localStorage`; resets if a day is missed
- Streak count displayed prominently (e.g., "🔥 7-day streak")
- No account required

### 3. Vocabulary Crossover

Words in the verse that the student has already marked as known in Flashcards are visually distinguished (subtle underline or muted color).

**Behavior:**
- Reads known-word list from `localStorage` (same key used by Flashcards SRS data)
- Words not yet studied are displayed normally, prompting curiosity
- Does not require Flashcards to be used first; gracefully degrades if no data exists

### 4. Entry Point

A dedicated `/daily` route plus a prominent card on the homepage directing students to the day's verse.

---

## Out of Scope

- User-selected verse sequences or custom schedules
- Push notifications or email reminders
- Social sharing

---

## Open Questions

- Should the verse sequence be hard-coded in the codebase or driven by a data file?
- Is a curated 365-verse list feasible to assemble, or should we start with a simpler through-the-NT approach?
