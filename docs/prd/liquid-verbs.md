# PRD: Liquid Verbs Reference & Drills

## Overview

A dedicated reference and practice module for Greek liquid verbs — verbs whose stems end in a liquid consonant (λ, μ, ν, or ρ). Liquid verbs are irregular in a predictable way: they lack the sigma (σ) of the standard future and instead use a contracted future form, and their aorists often show distinctive patterns. Because common GNT verbs like βάλλω, κρίνω, μένω, and αἴρω are liquids, students frequently encounter forms they cannot parse using the standard λύω paradigm.

---

## Status

**Complete.** Implemented as a new section within the Grammar Reference page (`/grammar`).

- σ-drop explainer callout card (amber, explains the phonological reason liquids are irregular)
- Side-by-side future comparison table: Standard λύσω vs. Liquid βαλῶ, all 6 persons, liquid column highlighted in amber
- Three numbered aorist pattern cards: (1) Sigmatic with stem change (μένω→ἔμεινα), (2) Asigmatic/2nd aorist (βάλλω→ἔβαλον), (3) Stem + augment irregularity (αἴρω→ἦρα)
- Principal parts table for 8 high-frequency GNT liquid verbs (βάλλω, αἴρω, ἀποστέλλω, κρίνω, μένω, ἐγείρω, ἀγγέλλω, φαίνω)
- Liquid future paradigm (βαλῶ) also exposed in the Paradigm Quiz Verbs tab via `buildLiquidVerbTables()`

**Key files:**
- Data: `src/data/grammar.ts` — `LiquidFutureRow`, `LiquidPrincipalParts` types + data arrays
- Component: `src/components/GrammarReference.tsx` — `LiquidVerbsSection`
- Quiz: `src/lib/paradigm-quiz.ts` — `buildLiquidVerbTables()`
- Tests: `src/lib/paradigm-quiz.test.ts`

---

## Goals

- Explain the underlying phonological reason liquids behave differently (sigma drops between a liquid and a vowel, triggering compensatory lengthening or contraction)
- Provide paradigm tables for the tenses where liquid verbs deviate from the norm
- List the most common GNT liquid verbs with their principal parts
- Offer targeted drilling on the future and aorist forms that trip students up most

---

## Features

### 1. Liquid Verb Explainer

A brief, focused explanation of why liquid verbs are irregular — no more than a short summary card.

**Content:**
- Definition: liquid consonants are λ, μ, ν, ρ (so called because they "flow" — the voice is not completely blocked)
- The problem: when the future-tense σ is added to a stem ending in a liquid, the σ is unstable between a liquid and a vowel and drops out
- The result: the future uses ε-contract endings instead of the standard -σω/-σεις pattern (e.g., βαλ + σω → βαλῶ, not βαλσω)
- The aorist: sigmatic aorist (ε + stem + σ + α) is also affected; many liquid verbs form a non-sigmatic (asigmatic) aorist with a distinctive stem vowel change (e.g., βάλλω → ἔβαλον)
- Visual: a simple diagram showing σ-drop and compensatory contraction

### 2. Liquid Future Paradigm Table

A comparison table showing the liquid future alongside the standard future so students see exactly where the forms diverge.

**Representative verb:** βάλλω (I throw) — stem βαλ-, future βαλῶ

| Person | Standard Future (λύσω) | Liquid Future (βαλῶ) |
|---|---|---|
| 1sg | λύσω | βαλῶ |
| 2sg | λύσεις | βαλεῖς |
| 3sg | λύσει | βαλεῖ |
| 1pl | λύσομεν | βαλοῦμεν |
| 2pl | λύσετε | βαλεῖτε |
| 3pl | λύσουσι(ν) | βαλοῦσι(ν) |

**Behavior:**
- Side-by-side layout (standard vs. liquid) with differences highlighted
- Toggle to show middle/passive future forms as well
- Hover any form for full parse confirmation
- Additional verb selector: switch example verb among common GNT liquid futures (βαλῶ, μενῶ, κρινῶ, ἀρῶ, ἀποστελῶ)

### 3. Liquid Aorist Patterns

Reference section covering the aorist forms of common liquid verbs, which vary more than the future.

**Content — three aorist patterns to document:**

1. **Sigmatic aorist with stem change:** stem vowel lengthens to compensate for sigma loss
   - μένω → ἔμεινα (stem: μεν- → μειν-)
   - κρίνω → ἔκρινα (stem regular, sigma drops cleanly)

2. **Asigmatic (second) aorist:** no sigma at all, with a distinct stem
   - βάλλω → ἔβαλον
   - ἔρχομαι → ἦλθον (suppletive, listed for cross-reference)

3. **Verbs with multiple irregularities:** augment + liquid + stem change
   - αἴρω → ἦρα (stem ἀρ-, augment + ε → η, no sigma)
   - ἀποστέλλω → ἀπέστειλα

**Behavior:**
- Tabbed display: "Future" | "Aorist Active" | "Aorist Passive"
- For each pattern, show the full 6-person paradigm of a representative verb
- Brief note on which pattern a given verb follows

### 4. Common GNT Liquid Verbs — Principal Parts List

A reference table of the ~25 most frequent GNT liquid verbs with all six principal parts.

**Columns:** Lexical Form | Meaning | Future | Aorist Act | Perfect Act | Perfect M/P | Aorist Pass

**Verbs to include (by GNT frequency):**
- βάλλω, αἴρω, ἀποστέλλω, κρίνω, μένω, ἀγγέλλω, ἐγείρω, αἰτέω (if treated as liquid context), σώζω (ζ-stem, for contrast), φαίνω, σπείρω, κλίνω, ὀφείλω, βουλεύομαι (deponent liquid), στέλλω, χαίρω, ἀποθνῄσκω (for contrast with true liquids)

**Behavior:**
- Sortable by verb or by frequency
- Click a verb to jump to its paradigm in the table above
- Cells with irregular or unexpected forms highlighted; hover for explanation

### 5. Liquid Verb Parsing Drill

Targeted drilling on the forms students are most likely to misparse: liquid futures (mistaken for present or epsilon-contract forms) and liquid aorists (mistaken for imperfects or second aorists).

**Behavior:**
- Present a form (e.g., βαλεῖτε or ἔμεινεν) and ask: Tense, Voice, Mood, Person, Number, Lexical Form
- After submission: show correct parse, call out what makes this a liquid verb form, and identify which pattern it follows (σ-drop future, asigmatic aorist, etc.)
- Drill set drawn from high-frequency GNT liquid verb forms
- Filter option: Future only | Aorist only | Mixed
- Track accuracy per tense to identify trouble spots

---

## Out of Scope

- Liquid nouns or adjectives
- Full treatment of second aorists generally (βάλλω/ἔβαλον is covered as a liquid example; second aorist as a system belongs in the Parsing Drills PRD or Grammar Reference)
- Attic or non-Koine dialectal liquid patterns

---

## Decisions

- **Location:** Section within Grammar Reference (`/grammar`), not a standalone route.
- **σ-drop explainer:** Featured prominently as a callout card at the top of the section. The "why" is included because understanding the phonological rule (σ is unstable between liquid + vowel) helps students recognize other liquid futures they haven't memorized.
- **Quiz integration:** Only the liquid future of βαλῶ is added to the Paradigm Quiz — the principal parts table is reference-only, not quiz-able in this version.
- **Principal parts scope:** 8 highest-frequency GNT liquid verbs chosen. Curated separately from the Parsing & Drills principal parts drill; a shared data source can be established if that feature is built.
