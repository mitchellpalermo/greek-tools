# PRD: Participle Section Expansion

## Overview

The current participle reference shows only nominative singular forms for six tense-voice combinations, and the Paradigm Quiz tests only those six nominative singular cells. This is not enough to prepare a student to recognize or parse participles in the Greek New Testament (GNT), where participles decline across all cases, numbers, and genders — and where every voice (active, middle, passive) must be distinguished. This PRD expands the participle section to cover all voices, add missing tense-voice combinations, and expose full paradigm tables in both the Grammar Reference and the Paradigm Quiz.

---

## Status

**Not started.**

---

## Goals

- Cover all tense-voice combinations that appear in the GNT, including the currently missing Perfect Middle/Passive and all three Future participles
- Give students a clear, scannable reference for participle forms organized by voice
- Expose the full declension of each participle type (all cases × numbers × genders) so students can recognize oblique forms
- Integrate expanded participle data into the Paradigm Quiz with the same cell-level grading already used for nouns and adjectives

---

## Background: Voices and Tenses

Greek participles exist at the intersection of verbal aspect (tense-stem) and adjectival function (declining for case, number, gender). The current data covers six combinations; a complete reference covers ten:

| Tense | Active | Middle | Passive |
|-------|--------|--------|---------|
| Present | λύων / λύουσα / λῦον ✓ | λυόμενος / -η / -ον ✓ (combined Mid/Pass) | — |
| Future | — | — | — |
| Aorist | λύσας / λύσασα / λῦσαν ✓ | λυσάμενος / -η / -ον ✓ | λυθείς / λυθεῖσα / λυθέν ✓ |
| Perfect | λελυκώς / λελυκυῖα / λελυκός ✓ | — | — |

**Additions needed:**
1. **Perfect Middle/Passive** — λελυμένος / λελυμένη / λελυμένον
2. **Future Active** — λύσων / λύσουσα / λῦσον
3. **Future Middle** — λυσόμενος / λυσομένη / λυσόμενον
4. **Future Passive** — λυθησόμενος / λυθησομένη / λυθησόμενον

Future participles are relatively rare in the GNT but are needed for completeness and for students reading classical texts alongside GNT Greek. Perfect Mid/Pass is moderately common and fills an obvious gap.

---

## Features

### 1. Expanded Data Layer

Add the four missing tense-voice combinations to `participleRows` in `src/data/grammar.ts`.

**New entries (nominative singular only, for parity with existing rows):**

```ts
{ label: 'Perfect Mid./Pass.',  m: 'λελυμένος',   f: 'λελυμένη',    n: 'λελυμένον'   },
{ label: 'Future Active',       m: 'λύσων',        f: 'λύσουσα',     n: 'λῦσον'       },
{ label: 'Future Middle',       m: 'λυσόμενος',    f: 'λυσομένη',    n: 'λυσόμενον'   },
{ label: 'Future Passive',      m: 'λυθησόμενος',  f: 'λυθησομένη',  n: 'λυθησόμενον' },
```

This brings the total to ten tense-voice rows, covering active, middle, and passive across all four tense-stems that form participles.

### 2. Grammar Reference Navigation

Add a `participles` entry to `NAV_SECTIONS` in `GrammarReference.tsx`, positioned after `liquid-verbs` and before `pronouns`. Include it in `PARADIGM_NAV` so it appears under the "Paradigms" group in the mobile sticky nav (alongside Nouns, Adjectives, Verbs, Contract Verbs, and Liquid Verbs).

```ts
{ id: 'participles', label: 'Participles', shortLabel: 'Participles' },
```

Add a corresponding `<section id="participles">` in the page body.

### 3. Tense-Organized Display in Grammar Reference

Keep tense as the top-level organizing axis in `GrammarReference.tsx`, grouping rows by tense-stem and listing voices within each tense. Use a subtle section header or divider between tense groups.

**Proposed grouping:**

**Present**
- Present Active
- Present Middle/Passive

**Future**
- Future Active
- Future Middle
- Future Passive

**Aorist**
- Aorist Active
- Aorist Middle
- Aorist Passive

**Perfect**
- Perfect Active
- Perfect Middle/Passive

Add a brief callout explaining that Present and Perfect use the same forms for Middle and Passive, while Aorist and Future distinguish them.

### 4. Declension Tables per Participle Type

Each tense-voice combination declines differently, which is the core difficulty. Add a new `ParticipleParadigm` data structure to hold the full declension for each participle type, covering all cases (nominative, genitive, dative, accusative, vocative) in both singular and plural across all three genders.

**Key paradigm patterns to cover:**

| Participle | Masculine | Feminine | Neuter |
|------------|-----------|----------|--------|
| Present Active | 3rd decl (ων/οντος) | 1st decl (ουσα/ουσης) | 3rd decl (ον/οντος) |
| Aorist Active | 3rd decl (ας/αντος) | 1st decl (ασα/ασης) | 3rd decl (αν/αντος) |
| Aorist Passive | 3rd decl (εις/εντος) | 1st decl (εισα/εισης) | 3rd decl (εν/εντος) |
| Perfect Active | 3rd decl (ως/οτος) | 1st decl (υια/υιας) | 3rd decl (ος/οτος) |
| Mid/Pass forms | 2nd decl (ομενος) | 1st decl (ομενη) | 2nd decl (ομενον) |
| Future Passive | 2nd decl (ησομενος) | 1st decl (ησομενη) | 2nd decl (ησομενον) |

The Grammar Reference should show a declension card (similar to the adjective paradigm cards) for each participle type, switchable via tabs or a dropdown selector.

**Display behavior:**
- Gender tabs: Masculine | Feminine | Neuter, or a combined 3-column layout for compact viewing
- Singular and plural sections within each gender column
- An "Endings only" toggle (consistent with existing adjective and noun tables) that strips the stem and shows just the endings
- A note beneath each table identifying which declension pattern(s) the participle follows (e.g., "Masculine/Neuter: 3rd declension (ντ-stem); Feminine: 1st declension")

### 5. Paradigm Quiz Integration

Expose the full declension data in the Paradigm Quiz, using the same table-based format already used for nouns and adjectives.

- Add a "Participles" subsection within the Verbs tab (or as its own tab if the tab count allows)
- Each tense-voice combination is a selectable table to quiz
- The quiz blanks out cells in the full declension table, not just the nominative singular row
- Scoring and cell-level feedback follow the existing paradigm quiz pattern

---

## Out of Scope

- μι-verb participles (e.g., διδούς, τιθείς, ἱστάς) — covered by the μι-Verb Paradigms PRD
- Contract verb participles in full declension — the contract verbs PRD covers present active/mid/pass nom sg only; full declension for contracts is deferred
- Parsing drills on GNT participle forms — that belongs in the Parsing Drills PRD
- Verbal aspect annotations or explanatory notes on the difference between aorist and present participle aspect — belongs in the Verbal Aspect PRD

---

## Decisions

- **Tense grouping:** The current flat-list order (pres act, pres mid/pass, aor act, aor mid, aor pass, perf act) already follows tense order and that organization is preserved. Adding Future and Perfect Mid/Pass rows slots naturally into their tense groups. Tense is the primary axis because it drives the stem and accent pattern students need to recognize first.
- **Combined Mid/Pass for Present and Perfect:** The forms are identical; showing them as a single row with a label note is cleaner than duplicating a table. Aorist and Future are distinguished because the forms differ.
- **Full declension in Grammar Reference, not just nom sg:** The nom-sg-only table is useful as a quick lookup but insufficient for recognition. The Grammar Reference should model how participles actually behave as adjectives.
- **Data structure:** `ParticipleParadigm` should parallel `AdjParadigm` — the same component used for adjective declension cards can likely be reused or lightly extended for participles.

---

## Key Files

- Data: `src/data/grammar.ts` — `ParticipleRow`, `participleRows`, new `ParticipleParadigm` type and data
- Grammar UI: `src/components/GrammarReference.tsx` — participle section, voice grouping, declension cards
- Quiz: `src/lib/paradigm-quiz.ts` — participle table builder
- Tests: `src/data/grammar.test.ts`, `src/lib/paradigm-quiz.test.ts`
