# PRD: Flashcard Enhancements

## Overview

Extend the existing flashcard tool with smarter study modes, filtering, and progress tracking so students can study more efficiently and focus on the words they actually need to learn.

---

## Status

**Partially complete.** Four of six features shipped:
- ✅ Feature 1 — Spaced Repetition (SRS)
- ✅ Feature 2 — Frequency & Part-of-Speech Filters
- ❌ Feature 3 — Textbook Chapter Sets (not started)
- ✅ Feature 4 — Answer Modes (flip + type)
- ✅ Feature 5 — Progress Tracking & Streaks
- ❌ Feature 6 — Custom Deck Builder (not started)

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
- Use a simplified SM-2 or Leitner-style algorithm
- Session state and intervals stored in `localStorage`
- "Reset progress" option available in settings

### 2. Frequency & Part-of-Speech Filters

Let students narrow the deck before starting a session.

**Behavior:**
- Frequency filter: slider or preset ranges (e.g., 500+, 100–499, 50–99, <50 occurrences)
- Part-of-speech filter: checkboxes for noun, verb, adjective, pronoun, preposition, conjunction, adverb
- Filters persist for the session; reset on page load

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

**Flip mode (current):** Show Greek, click to reveal English gloss.

**Type mode:** Show Greek, student types the gloss, submission is checked with fuzzy matching (case-insensitive, minor spelling tolerance).

**Behavior:**
- Toggle between modes in the UI
- Type mode shows correct answer after wrong submission before advancing

### 5. Progress Tracking & Streaks

Lightweight persistence using `localStorage` to reward consistent study.

**Behavior:**
- Track cards studied per day
- Show a streak counter (consecutive days with at least 10 cards reviewed)
- Show a simple stats panel: total cards learned, current streak, accuracy rate
- No account required; data lives in the browser

### 6. Custom Deck Builder

Let students create and save their own word lists.

**Behavior:**
- Add words from the master vocabulary list to a custom deck
- Name and save multiple decks to `localStorage`
- Study a custom deck the same as any other

---

## Out of Scope

- Cloud sync or accounts
- Audio pronunciation
- Morphological forms on cards (covered in Parsing Drills PRD)

---

## Open Questions

- Should textbook chapter data be bundled in the codebase or fetched from a file?
- What fuzzy matching threshold works well for type mode?
