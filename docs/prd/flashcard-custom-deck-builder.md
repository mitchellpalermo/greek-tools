# PRD: Flashcard Custom Deck Builder

## Overview

Let students create, name, and save their own vocabulary word lists. Custom decks are stored in `localStorage` and are studyable the same as any built-in deck.

---

## Status

**Not started.**

## LOE

**Medium** (1.5–2 days)

---

## Goals

- Give students full control over what they study
- Support use cases like "words from this week's passage" or "terms I keep missing"
- Persist decks across sessions without requiring an account

---

## Features

### 1. Deck Management

A dedicated UI for creating and managing custom decks.

**Behavior:**
- Student creates a new deck by giving it a name
- Multiple decks can be saved simultaneously
- Decks are listed in the deck selector alongside the built-in options
- Student can rename or delete a deck
- All deck data stored in `localStorage` under `greek-tools-custom-decks-v1`

---

### 2. Word Picker

A searchable list of the master vocabulary for adding words to a deck.

**Behavior:**
- Student browses or searches the full vocabulary list (Greek word + gloss + frequency)
- Checking a word adds it to the active deck
- Words already in the deck are indicated
- Bulk-add option: add all words currently visible (filtered by part-of-speech or frequency band) to the deck

---

### 3. Studying a Custom Deck

Custom decks plug into the existing study session the same as any other deck.

**Behavior:**
- Custom deck is selectable from the deck picker before a session
- Compatible with SRS, direction toggle, answer modes, and keyboard shortcuts
- SRS progress for custom deck words is tracked separately from progress in built-in decks

---

## Technical Notes

- **Component:** Extend `Flashcards.tsx` with a deck management view, or extract to a `DeckBuilder.tsx` modal/page
- **Storage key:** `greek-tools-custom-decks-v1`
- Words are stored by lemma ID — no duplication of vocabulary data in `localStorage`

---

## Out of Scope

- Sharing decks between users or devices
- Importing decks from external formats (Anki, CSV, etc.) — see Export to Anki PRD
- Deck versioning or history
