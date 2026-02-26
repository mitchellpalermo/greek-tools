# PRD: Concordance

## Overview

A searchable word concordance that shows every occurrence of a Greek lemma across the GNT. Accessible from word popups in the GNT Reader and Daily Verse, or via a standalone search page. Helps students do word studies without leaving the site.

---

## Status

**Not started.**

## LOE

**Medium** (~1 week)

---

## Goals

- Let students see a word in all its contexts, deepening vocabulary comprehension
- Make basic word study possible without leaving the site
- Leverage the MorphGNT dataset already integrated into the project

---

## Features

### 1. Lemma Search

Enter a Greek lemma to find all its GNT occurrences.

**Behavior:**
- Search input with Greek keyboard support (or type in the native OS Greek IME)
- Prefix matching so students can type a partial form and see suggestions
- Searches against a pre-built lemma index generated at build time
- Returns a result list: reference + verse snippet with the target word highlighted

### 2. Results Display

Results grouped by book, showing reference and context.

**Behavior:**
- Show book name, chapter:verse, ~8 words of context around the target word
- Target word highlighted in the snippet
- "X occurrences in Y books" summary header
- Click a result to open that passage in the GNT Reader (`/reader?ref=BOOK.CH.V`)
- Results paginated or virtualized for high-frequency words (e.g., ὁ has 20,000+ occurrences)

### 3. In-Context Entry Point

From the word popup in the GNT Reader or Daily Verse, a "See all occurrences" link opens the concordance pre-filtered to that lemma.

**Behavior:**
- Adds `?lemma=<lemma>` to the concordance URL
- Pre-populates the search field and runs the query automatically on load

---

## Technical Notes

- **Build script:** Generate `public/data/concordance.json` at build time mapping each lemma to an array of `{ book, chapter, verse, snippet, wordIndex }` objects. Script runs after `build-morphgnt.mjs`.
- **Index size estimate:** ~5,500 lemmas × avg 30 occurrences = ~165k entries. With Brotli compression on Cloudflare, wire size should be acceptable. Alternatively, split into per-lemma files fetched on demand.
- **High-frequency word handling:** Cap displayed results at 200 with a "show all X" option to avoid rendering 20k rows for articles and conjunctions.
- **Route:** `/concordance`

---

## Out of Scope

- LXX concordance (see LXX Reader PRD)
- Semantic domain grouping or cross-references
- Export of concordance results

---

## Open Questions

- One monolithic `concordance.json` fetched lazily, or per-lemma files? The monolithic approach is simpler; per-lemma is lighter on initial load.
- Should this be a dedicated page or a modal panel overlay within the Reader?
