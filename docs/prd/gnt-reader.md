# PRD: GNT Reader

## Overview

A passage reader for the Greek New Testament with inline vocabulary help and morphological data. Designed to support students who are beginning to read Greek texts directly, reducing friction without replacing the work of actual reading.

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
- Dropdown or searchable selector: Book → Chapter
- URL reflects the selected passage (e.g., `/reader?ref=John.3`) for shareability and bookmarking
- Default on first load: John 1
- Individual verse anchors in the URL are supported for linking to a specific starting point within a chapter (e.g., `/reader?ref=John.3.16` scrolls to verse 16)

### 2. Greek Text Display

Render the passage word by word, styled for comfortable reading.

**Behavior:**
- Words displayed in natural reading order, left to right, with line wrapping
- Each word is an interactive element (hover/tap triggers the word popup — see below)
- Font: a serif Greek font (e.g., SBL Greek or GFS Didot) at a comfortable reading size
- Verse numbers displayed inline in a smaller, muted style
- Punctuation preserved and displayed

### 3. Word Popup (On Demand Help)

Clicking or tapping a word reveals a small popup with:
- The lexical form (lemma)
- Gloss (English meaning)
- Full morphological parse (e.g., "Verb — Present Active Indicative 3rd Singular")
- Frequency in the GNT
- Link to study this word in Flashcards

**Behavior:**
- Popup dismisses on click-away or pressing Escape
- Only one popup open at a time
- Words the student has already studied in Flashcards can be visually marked (subtle underline or color) if progress data is available in localStorage

### 4. Inline Gloss Mode

A toggle that shows a small gloss beneath every word simultaneously, turning the display into a quasi-interlinear.

**Behavior:**
- Toggle button in the toolbar ("Show glosses" / "Hide glosses")
- Glosses appear in a smaller font directly below each Greek word
- Intended as a check after reading, not a crutch — the toggle state is not persisted

### 5. Reading History

Remember the student's most recent passage so they can pick up where they left off.

**Behavior:**
- Store the single most recently visited passage reference in localStorage
- Homepage shows a "Continue reading: [Book Chapter:Verse]" link when a prior passage exists
- No list, no account required

---

## Out of Scope

- Audio pronunciation
- Side-by-side English translation display
- Syntactic diagram overlay
- User notes or annotation

---

## Decisions

- **Dataset:** MorphGNT (decided)
- **Bundling strategy:** Per-book JSON files generated at build time from MorphGNT source, output to `public/data/morphgnt/` (e.g., `JHN.json`, `ROM.json`). Fetched on demand at runtime when the user selects a passage; cached in memory for the session. Cloudflare Workers serves these with Brotli compression automatically.
- **Passage granularity:** Chapter at a time. The selector is Book → Chapter. Individual verse anchors are supported in the URL for deep-linking.
- **Gloss data source:** MorphGNT provides lemmas but not English glosses. The existing `vocabulary.ts` dataset (high-frequency GNT words with glosses) will be the primary source. For lemmas not covered by that list, display the lemma only with no English gloss — this is acceptable since lower-frequency words are less likely to be needed on demand. A fuller open lexicon can be added later if the gap is significant.
- **Greek font:** GFS Didot (open source, LGPL) as the default; SBL Greek listed as an alternative note in the UI since it requires a separate download and has distribution restrictions.
- **Mobile tap interaction:** Use tap delay + movement detection on touch devices. On `touchstart`, start a short timer; if the finger moves more than ~5px before `touchend` (scroll intent), cancel the popup. If the finger lifts without moving, open the popup. This is invisible to the user and avoids accidental popups while scrolling.
- **Flashcards integration:** SRS card keys will be normalized to individual lemma forms (e.g., `'ὁ'` not `'ὁ, ἡ, τό'`) so they match MorphGNT lemmas directly. This requires bumping the store to `greek-tools-srs-v2` with a one-time migration from `v1`. The Reader reads studied words via a `getStudiedLemmas(): Set<string>` helper exported from `srs.ts`.
- **LXX:** Out of scope for v1.
