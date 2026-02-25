# PRD: GNT Reader

## Overview

A passage reader for the Greek New Testament with inline vocabulary help and morphological data. Designed to support students who are beginning to read Greek texts directly, reducing friction without replacing the work of actual reading.

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

Student selects a passage to read by book, chapter, and verse range.

**Behavior:**
- Dropdown or searchable selector: Book → Chapter → Verse(s)
- URL reflects the selected passage (e.g., `/reader?ref=John.3.16`) for shareability and bookmarking
- Default on first load: John 1:1

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

Track which passages the student has opened.

**Behavior:**
- Store last 10 passages visited in localStorage
- "Recently read" list on the reader page for quick return
- No account required

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
- **LXX:** Out of scope for v1.
