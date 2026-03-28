# PRD: Principal Parts Reference Table

## Overview

A comprehensive lookup table of the six principal parts for the most common irregular verbs in the GNT. This is a reference companion to the Principal Parts Drill (see `parsing-drills.md`) — students use this to look up forms when reading, the drill to practice producing them from memory.

---

## Goals

- Give students a single place to look up any common irregular verb's principal parts
- Cover the ~100 highest-frequency irregular verbs in the GNT
- Make the table filterable and searchable

---

## Priority

Medium

---

## The Six Principal Parts

| # | Tense/Voice/Mood | Example (λύω) |
|---|-----------------|---------------|
| 1 | Present Active Indicative 1sg | λύω |
| 2 | Future Active Indicative 1sg | λύσω |
| 3 | Aorist Active Indicative 1sg | ἔλυσα |
| 4 | Perfect Active Indicative 1sg | λέλυκα |
| 5 | Perfect Middle/Passive Indicative 1sg | λέλυμαι |
| 6 | Aorist Passive Indicative 1sg | ἐλύθην |

A dash (—) indicates the form does not occur in the GNT or does not exist for that verb.

---

## Features

### 1. Full Principal Parts Table

A sortable, searchable table with one row per verb.

**Columns:** Lexical form | Gloss | PP1 | PP2 | PP3 | PP4 | PP5 | PP6

**Sample rows:**

| Lexical | Gloss | PP1 | PP2 | PP3 | PP4 | PP5 | PP6 |
|---------|-------|-----|-----|-----|-----|-----|-----|
| ἄγω | I lead | ἄγω | ἄξω | ἤγαγον | — | ἦγμαι | ἤχθην |
| αἴρω | I take up | αἴρω | ἀρῶ | ἦρα | ἦρκα | ἦρμαι | ἤρθην |
| βάλλω | I throw | βάλλω | βαλῶ | ἔβαλον | βέβληκα | βέβλημαι | ἐβλήθην |
| γινώσκω | I know | γινώσκω | γνώσομαι | ἔγνων | ἔγνωκα | ἔγνωσμαι | ἐγνώσθην |
| ἔρχομαι | I come | ἔρχομαι | ἐλεύσομαι | ἦλθον | ἐλήλυθα | — | — |
| ὁράω | I see | ὁράω | ὄψομαι | εἶδον | ἑώρακα | — | ὤφθην |
| λέγω | I say | λέγω | ἐρῶ | εἶπον | εἴρηκα | εἴρημαι | ἐρρέθην |

### 2. Search and Filter

**Behavior:**
- Search by any form (type any of the six parts, get the full row)
- Filter by: has 2nd aorist, deponent, missing forms
- Sort by GNT frequency of the lexical form (default) or alphabetically

### 3. Click-to-Study Link

Each row links to the Principal Parts Drill pre-loaded with that verb, so students can go straight from lookup to practice.

---

## Data

The ~100 verb list should prioritize:
1. Verbs occurring 50+ times in the GNT
2. Verbs with irregular (non-sigma) principal parts
3. Verbs whose parts differ significantly from the lexical form (e.g., ὁράω → εἶδον)

Regular verbs (predictable sigma aorist, kappa perfect) can be omitted as they add little reference value.

---

## Out of Scope

- Full paradigm generation from principal parts (covered by Grammar Reference)
- Deponent verb explanations (covered by Deponent Verb List PRD)

---

## Open Questions

- Should the table be paginated or fully loaded at once? (~100 rows is manageable as a single table with client-side filtering.)
- Should PP forms link to the GNT Reader to show occurrences in context?
