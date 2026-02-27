# PRD: Contract Verbs Reference & Drills

## Overview

A dedicated reference and practice module for Greek contract verbs — verbs whose stems end in α, ε, or ο. These vowels contract with the following endings according to fixed rules, producing forms that look nothing like the standard λύω paradigm. Contract verbs are extremely common in the GNT (ἀγαπάω, ποιέω, πληρόω, etc.), so students need both a clear reference and targeted practice recognizing contracted forms.

---

## Status

**Complete.** Implemented as a new section within the Grammar Reference page (`/grammar`).

- Contraction rules table (7-row reference card: following vowel × α/ε/ο stem result) with examples on hover
- Contract type tabs: α-contract (ἀγαπάω) | ε-contract (ποιέω) | ο-contract (πληρόω)
- Paradigm selector (4 paradigms per type: pres act ind, pres mid/pass ind, impf act ind, impf mid/pass ind)
- Paradigm table: contracted form prominent, uncontracted form shown muted alongside
- Common GNT contract verbs list (21 verbs across all 3 types), grouped with color-coded type badges
- Paradigms also exposed in the Paradigm Quiz (`/paradigms`) Verbs tab via `buildContractVerbTables()` in `paradigm-quiz.ts`

**Key files:**
- Data: `src/data/grammar.ts` — `ContractVerbParadigm`, `ContractionRule`, `CommonContractVerb` types + data arrays
- Component: `src/components/GrammarReference.tsx` — `ContractVerbsSection`, `ContractParadigmTable`, `ContractionRulesCard`
- Quiz: `src/lib/paradigm-quiz.ts` — `buildContractVerbTables()`
- Tests: `src/lib/paradigm-quiz.test.ts`

---

## Goals

- Give students a concise reference for contraction rules and paradigms, separated from the base λύω tables in the Grammar Reference
- Help students decode contracted forms they encounter in GNT reading
- Provide targeted drills so students can recognize and parse contracted forms quickly
- Surface the most common GNT contract verbs as primary examples

---

## Features

### 1. Contraction Rules Table

A compact reference card showing how the three stem vowels contract with following vowels and diphthongs.

**Content:**

Display contraction outcomes organized by stem vowel (α, ε, ο) vs. the vowel/diphthong that follows:

| Stem + Following | α-contract | ε-contract | ο-contract |
|---|---|---|---|
| + ε | ā (long α) | ει | ου |
| + ο | ω | ου | ω |
| + ει | ᾳ | ει | οι |
| + ου | ω | ου | ου |
| + η | ā | η | ω |
| + ω | ω | ω | ω |
| + οι | ῳ | οι | οι |

**Behavior:**
- Hovering a cell shows a worked example (e.g., ε + ει → ει: ποι**ε** + **εις** → ποι**εῖς**)
- A "Key Rules" callout highlights the two most important: (1) like vowels contract to the long form, (2) ο is dominant over α and ε

### 2. Contract Verb Paradigm Tables

Full conjugation tables for the three contract verb types in the tenses/moods most needed for GNT reading.

**Representative verbs:**
- α-contract: ἀγαπάω (I love)
- ε-contract: ποιέω (I do/make)
- ο-contract: πληρόω (I fill/fulfill)

**Tables to include per verb:**
- Present active indicative (all six persons)
- Present middle/passive indicative
- Imperfect active indicative
- Imperfect middle/passive indicative
- Present active subjunctive
- Present active imperative
- Present active/passive infinitive
- Present active participle (Nom sg M/F/N)

**Behavior:**
- Tabs or a selector to switch between the three contract types
- Contracted form shown prominently; uncontracted form shown in a muted style underneath (e.g., ἀγαπ**ῶ** / ἀγαπά**ω**)
- Toggle to show either contracted forms only or contracted + uncontracted side-by-side
- Hover any cell to confirm the full parse
- Visual highlight showing which letters contracted (stem vowel + ending vowel → result)

### 3. Common GNT Contract Verbs List

A scannable reference list of the most frequent contract verbs a student will encounter in the GNT.

**Content (sorted by GNT frequency):**
- ε-contracts: ποιέω, λαλέω, καλέω, ζητέω, θεωρέω, εὐλογέω, τηρέω, προσκυνέω, μαρτυρέω, ἀκολουθέω
- α-contracts: ἀγαπάω, ὁράω, ἐρωτάω, νικάω, πλανάω, τιμάω, γεννάω
- ο-contracts: πληρόω, δηλόω, δικαιόω, σταυρόω, ἐλευθερόω

**Behavior:**
- Each entry links to its paradigm table
- Frequency rank shown (GNT occurrence count)
- Click any verb to filter the paradigm table to that verb

### 4. Contract Verb Parsing Drill

Targeted parsing practice on contracted forms, integrated with the broader Parsing & Drills page.

**Behavior:**
- Present a contracted form (e.g., ποιεῖτε) and ask the student to identify: Tense, Voice, Mood, Person, Number, and Lexical Form
- Input method: dropdowns for parse fields, text input (with Greek keyboard) for lexical form
- After submission: show the correct parse, the uncontracted form alongside the contracted form, and which contraction rule applied
- Drill set drawn from high-frequency GNT contract verbs; optionally filterable by contract type (α / ε / ο)
- Track accuracy per contract type so students can see where they struggle

---

## Out of Scope

- Contract adjectives or nouns (ὀστοῦν, etc.) — this PRD covers verbs only
- Attic contracts or dialectal variations — focus on Koine
- Future and aorist tenses of contract verbs (these follow regular patterns after the stem is treated; see Liquid Verbs PRD for a parallel case of irregular futures)

---

## Decisions

- **Location:** Section within Grammar Reference (`/grammar`), not a standalone route. Keeps all paradigm reference in one place.
- **Uncontracted display:** Third column in the paradigm table, muted gray text. Cleanest way to show both forms without adding a toggle.
- **Drill integration:** Contract paradigms added to the Paradigm Quiz Verbs tab rather than a separate drill page. Re-uses existing quiz infrastructure with zero new UI.
- **Scope:** Covered pres act ind, pres mid/pass ind, impf act ind, impf mid/pass ind for all three types (12 paradigms total). Present subjunctive and imperative deferred — less critical for initial reading.
