# PRD: GNT Book Statistics

## Overview

A data dashboard showing vocabulary and frequency statistics for each of the 27 NT books. Helps students understand the scope of the GNT, identify which books are most accessible given their current vocabulary, and motivate continued study with concrete coverage metrics.

---

## Goals

- Give students a bird's-eye view of the GNT's vocabulary profile
- Surface which books are most accessible at different vocabulary levels
- Make the data interesting and browsable, not just utilitarian

---

## Priority

Low

---

## Features

### 1. Book Statistics Table

A sortable table with one row per NT book.

**Columns:**
- Book name
- Total word count
- Unique lemmas
- % of words from the top 100 GNT lemmas
- % of words from the top 500 GNT lemmas
- Hapax legomena count (words appearing only once in the GNT)
- Estimated difficulty (derived from vocabulary frequency profile)

**Default sort:** NT canonical order (Matthew → Revelation)
**Sort options:** Difficulty (easy → hard), word count, unique lemmas

### 2. Difficulty Bar Chart

A horizontal bar chart visualizing each book's vocabulary difficulty, colored by NT section (Gospels, Acts, Pauline letters, General letters, Revelation).

**Behavior:**
- Hover a bar to see the full stats for that book
- Click to jump to the book detail view (see below)

### 3. Book Detail View

Clicking a book opens a detail panel or sub-page showing:
- The 20 most frequent words unique to that book (not in the top 500 overall)
- Distribution chart: how many words occur 1×, 2–5×, 6–10×, 10+× in this book
- "Start reading this book" → opens GNT Reader at chapter 1

### 4. Vocabulary Coverage Calculator

An interactive slider: "If you know the top ___ GNT words, you can read ___% of [selected book]."

**Behavior:**
- Slider from 50 to 5,000 words
- Per-book coverage updates in real time
- Summary line: "You'd encounter an unknown word roughly every ___ words"

---

## Dependencies

- MorphGNT dataset (for per-book word frequency data)
- Vocabulary frequency data (already partially in `src/data/vocabulary.ts`)

---

## Out of Scope

- Syntactic complexity metrics
- Comparison with LXX or other Greek texts

---

## Open Questions

- Should the book statistics be pre-computed at build time (from MorphGNT) and stored as a static JSON, or computed client-side from the MorphGNT data? Pre-computation is much faster at runtime.
- Is "difficulty" best expressed as a single number, a letter grade, or left as raw coverage percentages?
