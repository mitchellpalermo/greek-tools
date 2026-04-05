# PRD: Full GNT Vocabulary Expansion

## Overview

Expand `vocabulary.ts` from its current 50-word seed list to cover all ~4,800 lemmas in the GNT, using a public-domain lexicon and frequency counts derived from the MorphGNT data already in the build pipeline. After this ships, no reader popup will ever show "gloss not available" for a GNT word.

---

## Status

**Not started.**

## LOE

**Small** (0.5–1 day)

---

## Goals

- Eliminate "gloss not available" in the GNT Reader and Daily Verse word popup for every GNT lemma
- Derive frequency counts from MorphGNT directly rather than relying on manually entered values
- Keep all vocabulary data public domain and reproducible from source
- Leave the flashcard frequency filters unchanged — they already handle large word lists

---

## Data Sources

### Glosses: Dodson Greek-English Lexicon
**John Jeffrey Dodson (2010), CC0 public domain.**

~4,800 entries keyed to GNT lemmas. Lemma forms are aligned with MorphGNT's SBLGNT lemmatization, which is the same dataset already powering the site. The Dodson CSV is published and maintained on GitHub.

This is a better fit than the alternatives for this use case:
- **Abbott-Smith / Thayer's** — richer definitions but better suited to the full Lexicon feature (see `lexicon.md`); not structured as a simple lemma→gloss mapping
- **Strong's** — uses its own numbering system; lemma-to-MorphGNT mapping is imperfect and requires a secondary concordance

### Frequencies: derived from MorphGNT build artifacts
The `public/data/morphgnt/` per-book JSON files produced by `build-morphgnt.mjs` contain every word occurrence with its lemma. Counting occurrences per lemma at build time gives exact GNT frequency with no manual entry.

---

## Features

### 1. Generated vocabulary covering all GNT lemmas

`vocabulary.ts` is replaced by a generated artifact containing one entry per GNT lemma — approximately 4,800 entries — with `greek`, `gloss`, `frequency`, and `partOfSpeech` fields unchanged from the current `VocabWord` shape. No consuming code changes required.

**Behavior:**
- Every lemma that appears in MorphGNT has an entry
- Existing hand-curated glosses for the current top-50 words are preserved as overrides so higher-quality entries are not downgraded
- Entries sorted by frequency descending (highest first), matching the current ordering convention

### 2. Build script: `scripts/build-vocabulary.mjs`

A new build script that generates the vocabulary file from source data. Follows the same pattern as `build-morphgnt.mjs`: skips regeneration if the output file exists, re-runs on `--force`.

**Steps performed by the script:**
1. Verify MorphGNT JSON files exist in `public/data/morphgnt/` (dependency on `build-morphgnt.mjs`)
2. Compute per-lemma frequency counts by scanning all per-book JSON files
3. Fetch Dodson CSV from GitHub (pinned to a specific commit SHA, not `master`)
4. Parse Dodson POS codes → our POS enum (`noun`, `verb`, `adjective`, `pronoun`, `adverb`, `preposition`, `conjunction`, `article`, `particle`)
5. Apply hand-curated overrides for the existing top-50 entries
6. For each MorphGNT lemma: join on Dodson gloss; emit a warning for any lemma with no Dodson match
7. Write `src/data/vocabulary.ts`

### 3. Build pipeline integration

`package.json` build command updated to:
```
node scripts/build-morphgnt.mjs && node scripts/build-vocabulary.mjs && astro build
```

The vocabulary script runs after morphgnt since it reads the morphgnt output.

---

## Technical Notes

- **Output format:** Keep the existing TypeScript object literal format (`export const vocabulary: VocabWord[] = [...]`) so no import changes are needed anywhere. The generated file includes a header comment marking it as generated and noting the source.
- **Committing the generated file:** `src/data/vocabulary.ts` should be committed to the repo after generation, the same way the MorphGNT JSON build artifacts would be cached. This ensures the dev experience doesn't require a network fetch just to run the flashcard component.
- **POS mapping table:** Dodson uses codes like `n`, `v`, `adj`, `adv`, `prep`, `conj`, `pron`, `part`, `art`. The mapping is straightforward but must be explicitly defined in the script; any unmapped code should warn and fall back to `particle`.
- **File size:** ~4,800 entries at ~90 bytes each is roughly 430 KB of TypeScript source. After Vite's tree-shaking and minification, the compiled bundle contribution is significantly smaller. No lazy-loading change is needed.
- **Test updates:** `vocabulary.test.ts` tests are data-shape checks and should pass without modification. Consider adding an assertion that `vocabulary.length` exceeds a meaningful threshold (e.g., `> 4000`) to catch a script that silently produces an empty or truncated output.

---

## Risks

### R1 — Lemma form mismatches between Dodson and MorphGNT
**Risk:** Dodson's lemma forms may diverge from MorphGNT's for a subset of entries (e.g., alternate accenting, augment conventions, compound verb forms). This would leave those lemmas unmatched and still show "gloss not available."

**Mitigation:** The build script logs all unmatched MorphGNT lemmas at build time with their frequency counts. After the first run, review the log and add a `src/data/vocabulary-overrides.ts` file for manual corrections. High-frequency unmatched lemmas are the priority — a word occurring 5 times is far less critical than one occurring 500 times. Expectation: fewer than 50 unmatched lemmas, most of them rare.

---

### R2 — Dodson gloss quality for high-frequency words
**Risk:** Dodson is a compact student lexicon, not a critical-text lexicon. Some glosses may be oversimplified or slightly misleading compared to the hand-curated entries currently in `vocabulary.ts`.

**Mitigation:** The current 50 entries are preserved as overrides and will not be overwritten by Dodson data. For any new high-frequency words where the Dodson gloss seems inadequate after review, the same override mechanism applies. This is a one-time editorial pass on the top ~100 entries.

---

### R3 — Upstream source instability
**Risk:** The Dodson CSV at its GitHub URL could move, be removed, or change format between now and a future `--force` rebuild. A broken build script that can't fetch the data would block deploys.

**Mitigation:** Pin the script to a specific commit SHA rather than `master`. Commit the generated `vocabulary.ts` so the build can proceed from cached output even if the fetch fails. The script only re-fetches when explicitly run with `--force`.

---

### R4 — Build time regression
**Risk:** Scanning all 27 MorphGNT book JSON files to compute frequencies adds time to the build. Each file is already on disk from the previous build step, but parsing ~140,000 word tokens has a cost.

**Mitigation:** This is a one-time offline step, not a hot-path. In practice, `build-vocabulary.mjs` should complete in under 5 seconds. The script also skips regeneration if the output file exists (same pattern as `build-morphgnt.mjs`), so normal `astro build` runs are unaffected after the initial generation.

---

### R5 — Flashcard performance with 4,800 words
**Risk:** `Flashcards.tsx` currently filters a 50-word array. Filtering and sorting a 4,800-word array on every render could introduce perceptible lag, especially on mobile.

**Mitigation:** The existing frequency and POS filter logic is a simple `Array.filter` — 4,800 items is well within what JavaScript handles instantaneously. If profiling shows otherwise, memoizing the filtered result with `useMemo` is a straightforward fix. This risk is low given the data size.

---

## Out of Scope

- LXX vocabulary (separate data pipeline — see `lxx-reader.md`)
- Full lexical entries with semantic ranges and usage notes (see `lexicon.md`)
- Pronunciation audio or transliterations
- Manual editorial review of all 4,800 glosses — Dodson is accepted as-is for low-frequency words

---

## Open Questions

- Should the vocabulary overrides file (`vocabulary-overrides.ts`) be introduced upfront to hold the existing 50 entries, or should the override mechanism only be added if the first run reveals meaningful mismatches?
- After generation, should a count of unmatched lemmas be surfaced in the build output as a named metric (e.g., "47 lemmas unmatched") to make regressions visible on future `--force` runs?
