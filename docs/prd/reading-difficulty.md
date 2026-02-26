# PRD: Reading Difficulty Estimator

## Overview

Before or while reading a chapter in the GNT Reader, show students how much of the vocabulary they already know based on their Flashcard SRS data. Helps students choose passages at the right challenge level and makes the payoff of flashcard study tangible.

---

## Status

**Not started.**

## LOE

**Small** (2–3 days)

---

## Goals

- Help students pick passages appropriate to their current vocabulary level
- Create a visible feedback loop between flashcard study and reading progress
- Require zero new data — uses only existing MorphGNT and SRS localStorage data

---

## Features

### 1. Chapter Vocabulary Coverage Badge

In the GNT Reader toolbar, show what percentage of the unique lemmas in the current chapter the student has already studied.

**Behavior:**
- Computed client-side: `getStudiedLemmas()` intersected with unique lemmas in the loaded chapter
- Displayed as a small pill: "You know 73% of words in this chapter"
- Includes a mini progress bar for quick visual scanning
- Updates when the book or chapter selection changes

### 2. Chapter Coverage on Book Selector (Optional Enhancement)

When the user has a book loaded, show per-chapter coverage percentages in the chapter dropdown.

**Behavior:**
- Computed lazily when the book is loaded (all chapter data is already in memory)
- Each chapter option in the dropdown shows its coverage percentage
- Helps students plan a reading sequence around their current vocabulary

---

## Technical Notes

- All required data is already client-side: `studiedLemmas` from `getStudiedLemmas()` and `bookData` from the MorphGNT fetch
- Coverage = `|studiedLemmas ∩ uniqueLemmasInChapter|` / `|uniqueLemmasInChapter|`
- No new network requests, no new localStorage keys
- Can be added directly to `GNTReader.tsx` with minimal changes

---

## Out of Scope

- Absolute difficulty scoring independent of the student's SRS data
- Recommended reading order generation
- Comparison across students
