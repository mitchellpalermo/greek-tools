# PRD: Passage Difficulty Estimator

## Overview

Enter a GNT passage reference and get a difficulty score based on the vocabulary frequency profile of that passage. Helps students know which texts to tackle next as they build their vocabulary, and gives instructors a tool for sequencing reading assignments.

---

## Goals

- Give students a data-driven answer to "am I ready to read this passage?"
- Visualize vocabulary coverage at different knowledge thresholds
- Recommend what vocabulary to study before tackling a passage

---

## Priority

Medium

---

## Features

### 1. Passage Input

Student enters a passage reference (e.g., Romans 8:1–17) using a book/chapter/verse selector or typed reference.

**Behavior:**
- Pulls word list from MorphGNT dataset (shared with GNT Reader)
- Deduplicates by lemma (counts unique vocabulary items, not raw word count)

### 2. Difficulty Score

Display a difficulty rating based on the vocabulary frequency profile.

**Metrics shown:**
- Total words in passage
- Unique lemmas
- % of words in the top 100 GNT lemmas
- % of words in the top 200, 500, 1000
- Estimated % readable if student knows top N words (shown as a bar chart)

**Example output for John 3:16:**
- 25 words, 20 unique lemmas
- 80% covered by top 100 words
- 95% covered by top 300 words
- Unknown words at top-100 level: ἀγαπάω, μονογενής, ἀπόλλυμι, αἰώνιος

### 3. Unknown Word List

For any given vocabulary threshold (e.g., "top 200 words"), show the list of words in the passage that fall outside that threshold — these are the words to study before reading.

**Behavior:**
- Each unknown word links to its Flashcard entry
- "Study these words" button loads them as a custom Flashcard deck

### 4. Comparative Difficulty

Show how the passage compares to other GNT books/sections:

- "This passage is easier than 72% of GNT passages"
- Small histogram showing where the passage falls in the overall GNT difficulty distribution

---

## Dependencies

- MorphGNT dataset (for passage word lists and lemmas)
- Vocabulary frequency data (already in `src/data/vocabulary.ts`, may need expansion)
- Flashcards custom deck feature (for the "Study these words" action)

---

## Out of Scope

- Syntactic difficulty (sentence length, subordinate clause density) — vocabulary only in v1
- Non-GNT texts (LXX, patristics)

---

## Open Questions

- What vocabulary threshold should be the default display? Top 200 (covers ~90% of GNT) seems reasonable as a starting point.
- Should difficulty be presented as a letter grade (A–F), a numeric score, or purely as the raw coverage percentages?
