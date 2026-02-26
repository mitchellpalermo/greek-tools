# PRD: Lexicon Lookup

## Overview

A searchable Greek lexicon drawing on public-domain sources. Gives students more semantic depth than the single-gloss entries in the word popup, without requiring a physical copy of BDAG or Thayer's.

---

## Status

**Not started.**

## LOE

**Large** (2–3 weeks)

---

## Goals

- Provide students access to a full lexical entry without leaving the site
- Surface richer semantic information than the one-line gloss currently available in the word popup and Flashcards
- Use only public-domain data to avoid licensing constraints

---

## Data Sources

All three options below are public domain and have been digitized:

| Source | Coverage | Notes |
|---|---|---|
| **Abbott-Smith Manual Greek Lexicon** | ~5,000 GNT lemmas | Compact, pedagogically oriented — best fit for students |
| **Thayer's Greek-English Lexicon** | ~5,600 entries | More comprehensive; some entries are dated |
| **Strong's Exhaustive Concordance** | Full GNT | Brief but widely recognized; good for cross-referencing |

**Recommendation:** Abbott-Smith as the primary source. It is designed for NT students, compact, and available in digitized form (e.g., OpenScriptures / SWORD modules).

---

## Features

### 1. Lemma Search

Enter a Greek lemma (with Greek keyboard support) to retrieve its lexical entry.

**Behavior:**
- Exact match on lemma or prefix match for partial input
- Search suggestions as the user types
- Handles diacritic normalization (searching without accents finds the accented form)

### 2. English Keyword Search

Search by English word to find Greek lemmas with that gloss.

**Behavior:**
- Full-text search across gloss/definition fields
- Returns a list of matching lemmas with brief previews
- Useful for "What's the Greek word for X?" lookups

### 3. Entry Display

Full lexical entry for the selected lemma.

**Content (Abbott-Smith):**
- Lemma with accents
- Transliteration
- Part of speech and principal forms (for verbs)
- Definition and semantic range
- Key GNT usage notes

### 4. Integration with Reader and Flashcards

"Look up in Lexicon" link added to the word popup in the GNT Reader and Daily Verse.

**Behavior:**
- Link opens `/lexicon?lemma=<lemma>` with the entry pre-loaded
- Also accessible from a "More info" button on Flashcard cards (optional enhancement)

---

## Technical Notes

- **Data prep:** Parse Abbott-Smith from its digitized source format (SWORD/OSIS XML or plain text). Write a `scripts/build-lexicon.mjs` to output `public/data/lexicon.json` (one entry per lemma).
- **Estimated size:** ~5,000 entries × ~600 bytes average = ~3 MB JSON. Load lazily (not on initial page load); fetch only when the user navigates to `/lexicon` or clicks a popup link.
- **Diacritic normalization:** Strip combining diacritics using Unicode normalization (NFD + strip combining marks) for search; display the accented form.
- **Route:** `/lexicon`

---

## Out of Scope

- BDAG (copyrighted, not available for redistribution)
- Audio pronunciation
- Etymology beyond what Abbott-Smith provides
- Morphological forms index (covered by Parsing Drills and Concordance)

---

## Open Questions

- Which digitized source has the cleanest data for Abbott-Smith? (OpenScriptures, SWORD module, or a raw text scan?)
- Should Strong's numbers be included alongside Abbott-Smith entries for cross-referencing with other tools?
