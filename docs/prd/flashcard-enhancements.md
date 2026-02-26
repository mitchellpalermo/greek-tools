# PRD: Flashcard Enhancements

## Overview

Extend the existing flashcard tool with smarter study modes, filtering, and progress tracking so students can study more efficiently and focus on the words they actually need to learn.

---

## Status

**Partially complete.** Six of eight features shipped:
- ✅ Feature 1 — Spaced Repetition (SRS)
- ✅ Feature 2 — Frequency & Part-of-Speech Filters
- ❌ Feature 3 — Textbook Chapter Sets (not started)
- ✅ Feature 4 — Answer Modes (flip + type)
- ✅ Feature 5 — Progress Tracking & Streaks
- ❌ Feature 6 — Custom Deck Builder (not started)
- ✅ Feature 7 — Direction Toggle (Greek → English / English → Greek)
- ✅ Feature 8 — Keyboard Shortcuts

---

## Goals

- Make vocabulary review more effective than random cycling
- Give students control over what they study
- Persist progress across sessions without requiring an account

---

## Features

### 1. Spaced Repetition (SRS)

Replace random card cycling with a simple spaced repetition algorithm. When a user marks a card correct or incorrect, the interval before it reappears adjusts accordingly.

**Behavior:**
- Cards marked "hard" reappear sooner; cards marked "easy" reappear later
- Simplified SM-2 algorithm; SRS mode vs. "Study All" toggle in the UI
- Session state and intervals stored in `localStorage` under `greek-tools-srs-v2`
- "Reset SRS" option available in the footer

### 2. Frequency & Part-of-Speech Filters

Let students narrow the deck before starting a session.

**Behavior:**
- Frequency filter: preset ranges (500+, 100–499, 50–99, <50 occurrences)
- Part-of-speech filter: toggles for noun, verb, adjective, pronoun, preposition, conjunction, adverb, article
- Active filter count shown on the Filters button
- Filters reset on page load

### 3. Textbook Chapter Sets

Pre-built vocabulary lists mapped to common Koine Greek textbooks.

**Initial textbooks to support:**
- Mounce, *Basics of Biblical Greek* (31 chapters)
- Decker, *Reading Koine Greek* (if chapter word lists are available)

**Behavior:**
- Student selects a textbook and chapter range
- Deck is scoped to that word list
- Can be combined with SRS progress tracking

### 4. Answer Modes

Give students two ways to interact with cards.

**Flip mode:** Show front, click to reveal back; rate as "Got it" or "Still Learning."

**Type mode:** Student types the answer; submission is checked with fuzzy matching (case-insensitive, Levenshtein distance ≤ 1 for strings > 3 chars). Correct answer shown after wrong submission.

**Behavior:**
- Toggle between modes in the UI
- In type mode, Enter key submits the answer

### 5. Progress Tracking & Streaks

Lightweight persistence using `localStorage` to reward consistent study.

**Behavior:**
- Track cards studied per day; streak increments when daily goal (10 cards) is met
- Stats bar shows: Due / New (SRS mode) or Card N/Total (Study All), Today's progress, Streak, Accuracy
- Session summary screen on completion: percentage score, known vs. still-learning count
- No account required; data lives in the browser

### 6. Custom Deck Builder

Let students create and save their own word lists.

**Behavior:**
- Add words from the master vocabulary list to a custom deck
- Name and save multiple decks to `localStorage`
- Study a custom deck the same as any other

### 7. Direction Toggle (Greek → English / English → Greek)

Study cards in either direction.

**Behavior:**
- Toggle in the controls bar: "Greek → English" / "English → Greek"
- Front and back of cards swap accordingly
- Compatible with both Flip and Type answer modes

### 8. Keyboard Shortcuts

Desktop keyboard navigation for faster review in Flip mode.

**Behavior:**
- `Space` or `Enter` — flip the card
- `→` — mark as "Got it" (after flip)
- `←` — mark as "Still Learning" (after flip)
- In Type mode, `Enter` submits the answer

---

## Out of Scope

- Cloud sync or accounts
- Audio pronunciation
- Morphological forms on cards (covered in Parsing Drills PRD)

---

## Decisions

- **Fuzzy matching threshold:** Levenshtein distance ≤ 1 for words longer than 3 characters, plus prefix matching (answer is prefix of correct gloss). Handles minor typos without being too lenient.
- **Textbook chapter data:** Will be bundled in the codebase as a static JSON file.
