# PRD: Verse Memorization Tool

## Overview

An interactive tool for memorizing GNT verses in Greek. Uses progressive word blanking to move students from reading to recall, reinforcing both vocabulary and syntactic pattern recognition.

---

## Goals

- Help students memorize key GNT passages in the original Greek
- Complement flashcard vocabulary work with full-sentence recall
- Keep the interaction simple and low-friction

---

## Priority

Low

---

## Features

### 1. Verse Selection

Student selects a verse to memorize by book/chapter/verse (same selector as GNT Reader).

**Behavior:**
- Paste a verse reference or use a dropdown selector
- Verse text pulled from MorphGNT dataset (shared with GNT Reader)
- Student can also paste in their own Greek text if preferred
- Recently practiced verses stored in `localStorage` for quick return

### 2. Three Recall Modes

**Mode 1 — First Letters:** Each word is replaced by its first letter only (e.g., Ἐν → Ἐ___). Student reads aloud or writes from memory using the letters as prompts.

**Mode 2 — Blanks:** Words are replaced by a blank line scaled to word length. No letter hint. Student attempts full recall.

**Mode 3 — Full Recall:** All words are hidden. Student types the verse from memory into a text area. Submission is checked word-by-word against the source text, highlighting correct and incorrect words.

**Behavior:**
- Student selects mode before beginning
- In Modes 1 and 2, tapping/clicking a blank reveals the word temporarily (3 seconds) so the student can self-correct
- Mode 3 uses fuzzy matching for accent marks (correct form without accent = marked as close but not exact)
- All three modes can be cycled in sequence as a progressive drill workflow

### 3. Mastery Tracking

Track how many times a verse has been practiced in each mode.

**Behavior:**
- Per-verse practice count stored in `localStorage`
- A verse is marked "mastered" after completing Mode 3 with 90%+ accuracy on two separate occasions
- Mastered verses displayed with a visual indicator in the verse list

### 4. Verse Library

A small curated starter list of commonly memorized GNT passages, pre-loaded so students can begin without needing to find references.

**Starter passages:**
- John 1:1, John 3:16, Romans 3:23, Romans 6:23, Romans 8:1, Ephesians 2:8–9, Philippians 4:13, Colossians 1:15–16

---

## Out of Scope

- Audio playback or recording
- Syncing with external scripture memory apps (e.g., Verses, Fighter Verses)
- Hebrew support

---

## Dependencies

- MorphGNT dataset (shared with GNT Reader) for verse text lookup
- GNT Reader must be built first if verse selection is to pull from the dataset dynamically; alternatively, the starter list can be hard-coded to unblock development

---

## Open Questions

- Should Mode 3 (full recall) use the Greek keyboard component for input, or allow transliteration input as a fallback?
- What accent-checking tolerance is appropriate — strict (exact Unicode match), loose (ignore all diacritics), or middle (accept correct base letters)?
