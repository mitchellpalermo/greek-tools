# PRD: Parsing & Drills

## Overview

Interactive parsing practice and principal parts drills to help students build the pattern recognition they need for reading Greek fluently. Complements the Grammar Reference (lookup) and Flashcards (vocabulary) tools.

---

## Status

**Not started.**

---

## Goals

- Give students a place to practice parsing without needing a workbook
- Cover the two core drill types used in most Koine Greek courses: morphological parsing and principal parts
- Provide immediate, informative feedback

---

## Features

### 1. Morphological Parsing Drill

Present a Greek word form and ask the student to identify its grammatical parse.

**For nouns, adjectives, pronouns:**
- Student selects: Case, Number, Gender
- Input method: dropdowns or button groups (no typing required)

**For verbs:**
- Student selects: Tense, Voice, Mood, Person, Number (or Tense, Voice, Case, Number, Gender for participles)
- Infinitives: Tense + Voice only

**Behavior:**
- Source word list: drawn from high-frequency GNT vocabulary, inflected forms
- After submission, show: correct answer, a brief explanation if wrong (e.g., "The -σαμεν ending marks 1st plural aorist active indicative")
- Track accuracy per session
- Option to filter drill by: word category (nouns only, verbs only, all), difficulty (common forms only vs. including 3rd declension / perfect / participles)

**Data source:**
- MorphGNT is now fully integrated and available at `public/data/morphgnt/`. It provides inflected forms with correct morphological tags for every word in the GNT — this is the preferred data source. Filter to high-frequency lemmas for a starter drill set.
- A curated hand-built set of ~200–400 common forms is also viable as a lighter alternative.

### 2. Principal Parts Drill

Present a verb's first principal part (lexical form) and ask the student to produce one or more of the remaining five.

**The six principal parts:**
1. Present active indicative (1sg) — λύω
2. Future active indicative (1sg) — λύσω
3. Aorist active indicative (1sg) — ἔλυσα
4. Perfect active indicative (1sg) — λέλυκα
5. Perfect middle/passive indicative (1sg) — λέλυμαι
6. Aorist passive indicative (1sg) — ἐλύθην

**Behavior:**
- Show the lexical form; student types the requested principal part using the Greek keyboard (or a transliteration fallback)
- Checking: exact match or whitelist of acceptable variants
- Student can also drill in reverse: shown a principal part form, identify which number it is and the lexical form
- Word list: the ~50 most common irregular verbs in the GNT

### 3. Article + Noun Agreement Practice

A targeted drill for beginners on matching the definite article to a noun in case/number/gender.

**Behavior:**
- Given a noun form (e.g., λόγου), student selects the correct article form (τοῦ)
- Or given the article + noun stem, select the correct combined form
- Short drill sets (10–15 items), randomized
- Useful companion to the Grammar Reference declension tables

---

## Out of Scope

- Full sentence parsing or syntax analysis
- Generating novel inflected forms programmatically at runtime (start with a dataset)
- Timed/competitive modes

---

## Open Questions

- Should parsing drill and principal parts live on one `/drills` page with tabs, or separate routes?
