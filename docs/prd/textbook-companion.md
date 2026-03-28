# PRD: Textbook Companion

## Overview

Chapter-by-chapter companion pages for the most common Koine Greek textbooks. Each chapter page aggregates the vocabulary, grammar concepts, and paradigms introduced in that chapter and links directly to the relevant tools on greek.tools for practice.

---

## Goals

- Make greek.tools a natural supplement to any Koine Greek course
- Reduce the friction of finding the right study resources for a given chapter
- Drive deeper tool usage by contextualizing vocabulary and grammar within a student's curriculum

---

## Priority

Low

---

## Textbooks to Support (v1)

1. **Mounce, *Basics of Biblical Greek*** — most widely used in seminaries; 31 chapters
2. **Decker, *Reading Koine Greek*** — growing adoption; chapter structure TBD

Additional textbooks can be added in future versions.

---

## Features

### 1. Chapter Index Page

A landing page at `/textbooks` listing supported textbooks. Each textbook links to its chapter list.

### 2. Chapter Page

For each chapter, a page showing:

**Vocabulary introduced this chapter:**
- List of Greek words with glosses
- "Study this chapter's vocabulary" button → opens Flashcards pre-filtered to this chapter's word list

**Grammar concepts introduced:**
- List of grammar topics (e.g., "2nd Declension Masculine Nouns", "Present Active Indicative")
- Links to the relevant section in the Grammar Reference (e.g., → Grammar Reference › Nouns › 2nd Declension)

**Paradigms to know:**
- Inline summary of any paradigm tables introduced this chapter
- Link to the full paradigm in Grammar Reference

**Related drills:**
- Links to Parsing Drills filtered to the forms introduced in this chapter (once Parsing Drills is built)

### 3. Progress Tracking

Students can mark chapters as complete. Progress stored in `localStorage`.

**Behavior:**
- Checkmark on completed chapters in the index
- "You've completed 8 of 31 chapters" summary on the textbook landing page

---

## Data Requirements

- Mounce chapter vocabulary lists: available in published workbooks and several open-source datasets online; licensing must be verified before use
- Grammar concept mapping: requires manual curation to link each chapter to the relevant Grammar Reference sections

---

## Out of Scope

- Full textbook content reproduction (only vocabulary lists and grammar concept labels, not explanations)
- Answer keys or exercise solutions

---

## Open Questions

- Are Mounce's chapter vocabulary lists available under a license that permits use in a free web tool?
- Should chapter pages be statically generated at build time (from a data file) or dynamically rendered?
