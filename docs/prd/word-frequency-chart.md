# PRD: Word Frequency Chart

## Overview

A simple visualization showing the distribution of GNT vocabulary by frequency of occurrence. Helps students see the payoff curve of vocabulary study — how many words are needed to cover 50%, 80%, and 95% of the GNT text — and tracks their own coverage as they learn.

---

## Status

**Not started.**

## LOE

**Extra Small** (< 1 day)

---

## Goals

- Give students an intuitive sense of why high-frequency vocabulary study is high-leverage
- Motivate continued flashcard study by showing how much coverage increases with each new word learned
- Require no new data; everything is derivable from `vocabulary.ts` and the SRS store

---

## Features

### 1. Frequency Distribution Chart

A bar chart showing how many unique lemmas fall in each frequency band, and what percentage of total GNT word occurrences they represent.

**Frequency bands:**
- 500+ occurrences
- 100–499
- 50–99
- 10–49
- 5–9
- 1–4

**Behavior:**
- Each bar labeled with: number of unique words in the band, and the cumulative % of GNT text covered up to that band
- Example: "Words appearing 100+ times: 313 words cover ~80% of the GNT"

### 2. Your Coverage Overlay

A second data series showing how many words in each frequency band the student has studied in Flashcards.

**Behavior:**
- Reads from `getStudiedLemmas()` via SRS localStorage
- Shows "X / Y words known" per frequency band
- Gracefully omits if no SRS data is present

---

## Technical Notes

- All data is static and derivable at runtime from `vocabulary.ts`; no new data files needed
- Chart can be implemented with a small library (recharts, visx) or as hand-built SVG/CSS bars
- Could live on the Flashcards page as a progress panel, or as a standalone page at `/stats` (see Stats Dashboard PRD)
- Prefer a lightweight implementation; a CSS-only bar chart avoids adding a chart library dependency

---

## Out of Scope

- Per-lemma frequency tables (available in the word popup in the GNT Reader)
- Semantic domain frequency analysis
- Time-series of coverage growth over days
