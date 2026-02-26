# PRD: GNT Reader

## Overview

A passage reader for the Greek New Testament with inline vocabulary help and morphological data. Designed to support students who are beginning to read Greek texts directly, reducing friction without replacing the work of actual reading.

---

## Status

**Complete.** GNTReader component, `/reader` route, MorphGNT data layer, and build script are all implemented. Reading history (localStorage) and homepage "Continue reading" integration are live. Chapter navigation arrows and verse-anchor scrolling are also implemented.

---

## Priority

High — foundational feature; Daily Verse Reader and Verse Memorization both depend on it.

---

## Goals

- Let students read GNT passages directly in the browser without a physical interlinear
- Surface vocabulary and parsing help on demand (not by default, so students do the work first)
- Connect reading to the vocabulary they've studied in Flashcards

---

## Data Source

**MorphGNT** — SBLGNT base text with morphological tags. Licensed under CC BY 4.0 (text) and public domain (morphological data). Available at https://github.com/morphgnt/sblgnt.

The dataset provides per word: word form, normalized form, lemma, part of speech, and a full morphological parse code (person, tense, voice, mood, case, number, gender, degree).

---

## Features

### 1. Passage Selection

Student selects a passage to read by book and chapter. The full chapter is always loaded.

**Behavior:**
- Two dropdowns: Book → Chapter
- URL reflects the selected passage (e.g., `/reader?ref=JHN.3`) for shareability and bookmarking
- Default on first load: John 1
- Individual verse anchors in the URL are supported for deep-linking (e.g., `/reader?ref=JHN.3.16` scrolls to verse 16)
- **Chapter navigation arrows (← →)** in the toolbar for sequential reading; previous button disabled on chapter 1, next disabled on the final chapter

### 2. Greek Text Display

Render the passage word by word, styled for comfortable reading.

**Behavior:**
- Words displayed in natural reading order, left to right, with line wrapping
- Each word is an interactive element (click/tap triggers the word popup)
- Font: GFS Didot (open source, LGPL) at 1.35rem
- Verse numbers displayed inline as superscripts in a smaller, muted style
- Punctuation preserved and displayed (separated from the word span so it doesn't interfere with tap targets)

### 3. Word Popup (On Demand Help)

Clicking or tapping a word reveals a small popup with:
- The lexical form (lemma)
- Gloss (English meaning, from `vocabulary.ts`)
- Full morphological parse (e.g., "Verb — Present Active Indicative 3rd Singular")
- Frequency in the GNT
- Link to study this word in Flashcards

**Behavior:**
- Popup dismisses on click-away, scroll, or pressing Escape
- Only one popup open at a time
- Popup positioned below the tapped word, constrained within the viewport
- Words the student has already studied in Flashcards marked with a dotted underline

### 4. Inline Gloss Mode

A toggle that shows a small gloss beneath every word simultaneously, turning the display into a quasi-interlinear.

**Behavior:**
- Toggle button in the toolbar ("Show glosses" / "Hide glosses")
- Glosses appear in a smaller font (0.62rem) directly below each Greek word
- First gloss segment only shown (before the first comma) to keep it compact
- Toggle state is not persisted

### 5. Reading History

Remember the student's most recent passage so they can pick up where they left off.

**Behavior:**
- Store the single most recently visited passage reference in `localStorage` under `greek-tools-reader-last`
- Homepage shows a "Continue reading: [Book Chapter]" link when a prior passage exists and routes directly to that passage

---

## Out of Scope

- Audio pronunciation
- Side-by-side English translation display
- Syntactic diagram overlay
- User notes or annotation

---

## Decisions

- **Dataset:** MorphGNT (decided)
- **Bundling strategy:** Per-book JSON files generated at build time from MorphGNT source, output to `public/data/morphgnt/` (e.g., `JHN.json`, `ROM.json`). Fetched on demand at runtime when the user selects a passage; cached in memory for the session. Cloudflare serves these with Brotli compression automatically.
- **Passage granularity:** Chapter at a time. The selector is Book → Chapter. Individual verse anchors are supported in the URL for deep-linking.
- **Gloss data source:** MorphGNT provides lemmas but not English glosses. The existing `vocabulary.ts` dataset is the primary source. For lemmas not covered, the popup shows "gloss not available" — acceptable since lower-frequency words are less likely to be needed on demand. A fuller open lexicon can be added later (see Lexicon PRD).
- **Greek font:** GFS Didot (open source, LGPL).
- **Mobile tap interaction:** `touchAction: 'manipulation'` on word tokens suppresses the 300ms tap delay and prevents double-tap zoom without requiring custom timer logic. The simpler approach was chosen over the described timer + movement detection.
- **Flashcards integration:** SRS card keys are normalized to individual lemma forms so they match MorphGNT lemmas directly. The Reader reads studied words via `getStudiedLemmas(): Set<string>` exported from `srs.ts`.
- **LXX:** Out of scope for v1 (see LXX Reader PRD).
