# PRD: μι-Verb Paradigms

## Overview

Reference tables for the major μι-verbs in the GNT. These verbs follow a different conjugation pattern from the standard ω-verbs and are consistently difficult for intermediate students because they appear frequently in the text but aren't covered by the λύω paradigm. μι-verbs use athematic (reduplicated) stems and a distinct set of personal endings that must be learned separately.

---

## Status

**Planned.** Not yet implemented. The existing Grammar Reference covers ω-verbs (λύω), contract verbs, and liquid verbs, but has no μι-verb section.

---

## Goals

- Give students a dedicated reference for μι-verb forms alongside the existing Grammar Reference
- Cover the four highest-frequency μι-verbs in the GNT
- Surface the key structural differences between μι-verbs and ω-verbs so students can recognize forms in the text
- Reuse the same card layout, interaction model, and data architecture as the existing Grammar Reference

---

## Priority

**Medium-High.** The four verbs covered appear a combined 812 times in the GNT. Students regularly encounter forms that look nothing like the λύω paradigm and have no reference for them.

---

## Verbs to Cover

| Verb | Gloss | GNT Frequency | Notes |
|------|-------|---------------|-------|
| δίδωμι | I give | 415× | Most frequent; o/ω stem alternation |
| ἵστημι | I stand / I set | 154× | Intransitive vs. transitive distinction by tense; 2nd aorist ἔστην |
| ἀφίημι | I forgive, release, permit | 143× | Compound of ἀπό + ἵημι; shares ἵημι stem patterns |
| τίθημι | I place, put | 100× | e/η stem alternation; 2nd aorist ἔθηκα (mixed) |

**Deferred:** εἰμί — treated as a special case and will be added in a later phase.

---

## Features

### 1. Paradigm Tables

For each verb, display conjugation tables in the tense/mood combinations most critical for GNT reading. Coverage mirrors what the contract verbs section provides: indicative mood across key tenses, plus common non-indicative forms.

**Tenses and moods per verb:**

| Form | Notes |
|------|-------|
| Present active indicative | Athematic endings (-μι, -ς, -σι, -μεν, -τε, -ᾶσι) |
| Present middle-passive indicative | |
| Imperfect active indicative | Augmented; same athematic pattern |
| Imperfect middle-passive indicative | |
| Present active subjunctive | Lengthened vowel endings |
| Present active imperative | |
| Present active infinitive | |
| Present active participle | Nominative singular M/F/N only |
| Aorist active indicative | 1st aorist (δίδωμι, τίθημι) or 2nd aorist (ἵστημι, ἀφίημι) — note where applicable |
| Aorist middle indicative | Where applicable |
| Aorist passive indicative | |
| Aorist active infinitive | |
| Aorist active participle | Nominative singular M/F/N only |

**Display behavior:**
- Same card layout as existing Grammar Reference paradigm tables: navy header bar, 6-row person × number grid (1sg–3pl), hover/tap description bar showing full parse
- Label each card clearly: verb name + tense + voice + mood (e.g., "δίδωμι — Present Active Indicative")
- Where a verb uses a 2nd aorist, call it out explicitly in the card header (e.g., "2nd Aorist Active Indicative — ἔστην")
- Endings-only toggle: same behavior as noun and adjective tables — strips the stem to isolate the ending

### 2. Verb Selector Grid

Reuse the `VerbParadigmGrid` pattern from the existing Verbs section. A tense × voice grid lets students navigate to the paradigm they need without scrolling through all cards at once.

- Rows: Present, Imperfect, Aorist
- Columns: Active, Middle, Passive
- Cells show the 1st singular form as a preview (or a dot if that combination doesn't exist for that verb)
- Tabs above the grid switch between the four verbs

### 3. Pattern Notes

A callout card per verb (or a shared introductory card for the section) explaining the key structural differences from ω-verbs. These are the things students need to internalize to recognize μι-verb forms in the wild.

**Section-level note (shared):**
- μι-verbs use reduplication in the present stem: δι-δω-, τι-θη-, ἵ-στη-, ἀφ-ι-η-
- Present and imperfect use athematic personal endings (-μι, -ς, —, -μεν, -τε, -ᾶσι) rather than thematic (-ω, -εις, -ει, -ομεν, -ετε, -ουσι)
- Stem vowel alternates between long (singular) and short (plural) forms in the present and imperfect

**Per-verb notes:**

| Verb | Key pattern note |
|------|-----------------|
| δίδωμι | Stem vowel: ω (singular) / ο (plural). 1st aorist ἔδωκα (κ-aorist). |
| ἵστημι | Transitive in present/imperfect ("I set"), intransitive in 2nd aorist/perfect ("I stood/stand"). 2nd aorist ἔστην uses 2nd aorist passive endings. |
| ἀφίημι | Compound (ἀπό + ἵημι). The simplex ἵημι rarely appears alone in the GNT; ἀφ- prefix is standard. η/ε stem alternation follows ἵημι. |
| τίθημι | Stem vowel: η (singular) / ε (plural). Aorist is mixed: ἔθηκα looks like a 1st aorist but uses 2nd aorist forms in some persons. |

### 4. Integration with Grammar Reference

Add a "μι-Verbs" entry to the `NAV_SECTIONS` array in `GrammarReference.tsx`, inserting it after the existing "Liquid Verbs" section. The new section renders inline on the same `/grammar` page, consistent with all other Grammar Reference sections.

No sub-route (`/grammar/mi-verbs`) needed — keeping everything on one page preserves the lookup-first UX.

---

## Data Architecture

Follow the existing pattern in `src/data/grammar.ts`.

**New type:**

```typescript
interface MiVerbParadigm {
  id: string;
  verb: 'didomi' | 'histemi' | 'aphiemi' | 'tithemi';
  label: string;           // e.g., "Present Active Indicative"
  tense: 'pres' | 'impf' | 'aor';
  voice: 'act' | 'mid' | 'pass' | 'mid-pass';
  group: 'indicative' | 'subjunctive' | 'imperative';
  isSecondAorist?: boolean;
  forms: Partial<Record<PersonNum, string>>;
}
```

**New constant:**

```typescript
export const miVerbParadigms: MiVerbParadigm[] = [ ... ];
```

Reuse existing `PersonNum`, `PERSONS`, and `NUMBERS` label constants — no new label infrastructure needed.

---

## Out of Scope

- Full coverage of all moods and tenses across all persons (this PRD focuses on the forms most frequently encountered in GNT reading)
- εἰμί (deferred; may be added as a 5th entry later)
- Compound forms beyond ἀφίημι (e.g., παραδίδωμι, ἀνίστημι) — the base paradigms cover these by analogy
- Parsing drills for μι-verb forms (see Parsing & Drills PRD for integration point)

---

## Open Questions

- Should εἰμί be included here or remain deferred? It has ~2,460 GNT occurrences and students need it urgently, but its paradigm is irregular enough that it may warrant its own treatment.
- Should the Paradigm Quiz (`/paradigms`) expose μι-verb tables via a new `buildMiVerbTables()` function, similar to `buildContractVerbTables()`? Worth doing at the same time to avoid a second pass.
