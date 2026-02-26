# PRD: Utilities

## Overview

Small, self-contained tools that round out the site. These are lower priority than the core study features but add meaningful value for students who are typing, writing, or checking their work in Greek.

---

## Status

**Transliteration Tool — Complete.** Implemented in `src/lib/transliteration.ts` and `src/components/Transliteration.tsx`, live at `/transliteration`. Handles SBL scheme bidirectionally including breathing marks, accents, and iota subscripts.

**Sentence Diagramming Tool — Not started.**

---

## Features

### 1. Transliteration Tool

Convert between Greek script and romanized transliteration in both directions.

**Behavior:**
- Two text areas side by side: Greek | Transliteration
- Editing either side updates the other in real time
- Transliteration scheme: Society of Biblical Literature (SBL) standard (most common in academic writing)
- Handles all diacritics (breathing marks, accents, iota subscript)
- Copy button on each side

**Use cases:**
- Student writing a paper who needs the SBL transliteration of a word
- Student seeing a transliteration in a commentary and wanting the Greek script

### 2. Sentence Diagramming Tool

A lightweight visual tool for diagramming Greek sentences. This is the most complex utility and could be a later addition.

**Behavior:**
- Student inputs a Greek sentence (via paste or the Greek keyboard)
- Words are displayed as draggable nodes
- Student draws connecting lines between nodes and labels them (subject, verb, direct object, modifier, etc.)
- Save/export as image

**Scope note:** This is significantly more complex than the other utilities. A v1 could be much simpler — just a blank canvas with Greek text blocks the student can arrange manually, with no built-in syntax analysis.

**Dependencies:** Would likely need a diagramming library (e.g., React Flow, Mermaid, or a canvas approach).

---

## Out of Scope for Utilities

- Automated syntactic analysis (parsing sentences programmatically)
- Morphological lookup (covered in GNT Reader and Parsing Drills)

---

## Priority Notes

- Transliteration is a small, self-contained feature — good candidate for early implementation.
- Sentence diagramming is a significant undertaking; defer until core study tools are stable. A simple v1 scope (free-form canvas only, no automated analysis) is feasible if the demand is clear.
