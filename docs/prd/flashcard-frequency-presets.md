# PRD: Flashcard Frequency-Based Presets

## Overview

Pre-built vocabulary sets scoped to GNT word frequency bands, selectable before a study session. All data derived from public domain frequency counts — no textbook licensing required.

---

## Status

**Not started.**

## LOE

**Small** (0.5–1 day)

---

## Goals

- Let students scope their deck to a meaningful frequency band without manually configuring filters
- Complement the existing Frequency & Part-of-Speech Filters (Feature 2) with a one-tap starting point
- Remain fully public domain — no dependency on any copyrighted textbook's chapter structure

---

## Features

### 1. Preset Selector

A menu or button group shown in the deck setup area before a session begins.

**Preset ranges:**
- Top 100 (500+ occurrences)
- 101–300 (100–499 occurrences)
- 301–500 (50–99 occurrences)
- 500+ (<50 occurrences)

**Behavior:**
- Student selects one or more preset ranges
- Deck is immediately scoped to words in those frequency bands
- Selection is combinable with the existing part-of-speech filter toggles
- Presets reset on page load (same behavior as other filters)
- Active preset shown in the filter summary badge

---

## Technical Notes

- Frequency data already exists in the vocabulary dataset — no new data files needed
- Preset ranges map directly to the existing frequency filter ranges in Feature 2; this feature is essentially named shortcuts over the same filter logic
- **Component:** Extend the existing filter panel in `Flashcards.tsx`

---

## Out of Scope

- Custom frequency range input (handled by the existing filter sliders)
- Textbook chapter mappings
- Saving a preset as a named deck (covered by Custom Deck Builder PRD)
