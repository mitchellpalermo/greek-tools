# PRD: LXX Reader

## Overview

Extend the GNT Reader infrastructure to support reading the Septuagint (LXX) in Greek. Valuable for students studying Old Testament backgrounds, working with LXX quotations in the NT, or wanting to read the OT in Greek alongside Hebrew studies.

---

## Status

**Not started.**

## LOE

**Large** (2–3 weeks)

---

## Goals

- Give students access to the LXX text with the same word-popup help as the GNT Reader
- Reuse as much existing infrastructure as possible (reader component, MorphGNT data layer, vocabulary integration)
- Maintain clear separation between GNT and LXX corpora in the UI

---

## Data Source

**CATSS (Computer Assisted Tools for Septuagint Studies)** — morphologically tagged LXX based on the Rahlfs text. The CATSS morphological data is widely used in academic tools and is available in the public domain.

**Evaluation needed before implementation:**
- Confirm CATSS licensing permits redistribution in a web app
- Assess tagging quality and completeness for all 39 books
- Evaluate alternative: the SBLGNT LXX project or OpenGNT-LXX variant if available

---

## Features

### 1. LXX Passage Reader

Mirrors the GNT Reader: Book → Chapter navigation, word popup (lemma, gloss, parse, frequency), inline gloss toggle, and Flashcards integration.

**Behavior:**
- Separate route: `/lxx`
- Book list includes all LXX books (including deuterocanonical where data is available)
- LXX book names and chapter counts loaded from a `public/data/lxx/books.json` file (same structure as `morphgnt/books.json`)
- Default passage on first load: Genesis 1

### 2. Shared Vocabulary Integration

Where LXX lemmas overlap with GNT lemmas (which is substantial — the NT writers were familiar with the LXX), the existing `vocabulary.ts` glosses and SRS dotted-underline markup apply automatically.

**Behavior:**
- Uses the same `vocabLookup` and `getStudiedLemmas()` functions already used by the GNT Reader
- LXX-only lemmas (no GNT occurrence) show "gloss not available" in the popup — same graceful degradation as the GNT Reader for rare words

### 3. Homepage Entry Point

New card on the homepage and nav link.

---

## Technical Notes

- **Build script:** New `scripts/build-lxx.mjs` to process CATSS morphological data into the same per-book JSON format used by MorphGNT (`{ [chapter]: { [verse]: MorphWord[] } }`). Output to `public/data/lxx/`.
- **`GNTReader` component:** Should be parameterized to accept a `dataset` prop (`'gnt' | 'lxx'`) and a `dataPath` prop pointing to the correct public data directory. This avoids duplicating the reader component.
- **Book name mapping:** LXX uses different book names and ordering than the NT (e.g., 1 Kingdoms = 1 Samuel, Psalms numbering differs). A `lxx-books.ts` mapping file is needed.
- **Frequency data:** LXX word frequency differs from GNT. The popup can show GNT frequency where available and note "LXX frequency data not available" otherwise, or a separate LXX frequency dataset can be built at build time.

---

## Out of Scope (v1)

- LXX/GNT parallel text view
- Textual criticism (Rahlfs vs. Göttingen apparatus)
- Deuterocanonical books if not covered by the chosen dataset
- Hebrew text alongside the LXX

---

## Open Questions

- Which LXX dataset is the best fit: CATSS, OpenGNT-LXX, or another source?
- Should the LXX use a separate vocabulary frequency dataset or rely entirely on the existing GNT-derived `vocabulary.ts`?
- Deuterocanonical books: include from the start, or defer?
