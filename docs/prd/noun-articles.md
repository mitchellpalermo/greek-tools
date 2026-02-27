# PRD: Definite Article Display in Noun Paradigms

## Overview

Display the definite article alongside each form in noun paradigm tables — the standard Greek textbook convention (e.g., ὁ λόγος, τοῦ λόγου). Also adds the definite article as a standalone quizzable paradigm in the Paradigm Quiz, fulfilling the planned "Definite Article" category referenced in the Paradigm Quiz PRD.

---

## Status

**Not started.**

## LOE

**Small** (half a day)

---

## Goals

- Match the presentation convention used in Mounce, Wallace, and most Koine Greek textbooks
- Help students correlate the article's form with the noun's case and gender at a glance
- Add the article paradigm as a standalone memorization target in the quiz
- Keep data DRY — derive article forms from a single lookup table, not per-paradigm repetition

---

## Features

### 1. Article Data in `grammar.ts`

Add the definite article paradigm as a new exported constant `articleForms` and a helper function `getArticle`.

**Data shape:**

```ts
export const articleForms: Record<CaseKey, Record<NumKey, Record<GenderKey, string | null>>>
```

Article forms (null = no form exists for that slot):

| Case | Masc Sg | Fem Sg | Neut Sg | Masc Pl | Fem Pl | Neut Pl |
|------|---------|--------|---------|---------|--------|---------|
| Nom  | ὁ       | ἡ      | τό      | οἱ      | αἱ     | τά      |
| Gen  | τοῦ     | τῆς    | τοῦ     | τῶν     | τῶν    | τῶν     |
| Dat  | τῷ      | τῇ     | τῷ      | τοῖς    | ταῖς   | τοῖς    |
| Acc  | τόν     | τήν    | τό      | τούς    | τάς    | τά      |
| Voc  | null    | null   | null    | null    | null   | null    |

**Helper:**

```ts
export function getArticle(
  caseKey: CaseKey,
  numKey: NumKey,
  gender: 'masculine' | 'feminine' | 'neuter'
): string | null
```

Maps `'masculine' | 'feminine' | 'neuter'` → `GenderKey` (`'m' | 'f' | 'n'`) and returns `articleForms[caseKey][numKey][genderKey]`.

---

### 2. Article Display in Grammar Reference

In `GrammarReference.tsx`, prepend the article to each noun cell's full form when not in endings-only mode.

**Behavior:**
- In full-form mode: cells display `[article] [noun form]` (e.g., `ὁ λόγος`, `τοῦ λόγου`)
- In endings-only mode: article is hidden — the toggle shows only the noun ending, unchanged from current behavior
- Vocative cells display the noun form alone (no article for vocative)
- The article is rendered in a visually subordinate style (muted color or slightly smaller) so the noun form remains the visual focus

---

### 3. Definite Article as Standalone Quiz Paradigm

Add the definite article as a quizzable `TableModel` in `paradigm-quiz.ts`, listed under a new `'article'` category.

**Table layout:**
- Rows = cases (Nom, Gen, Dat, Acc) — no Vocative row since the article has no vocative
- Col groups = Singular | Plural
- Leaf cols = Masc. | Fem. | Neut. (repeated per group)
- 24 cells total (4 cases × 2 numbers × 3 genders)

**Category updates:**
- Add `'article'` to the `Category` type union
- Add `'Article'` to `CATEGORY_LABELS`
- Add `'article'` to `ALL_CATEGORIES`
- Update `buildTableModels()` to include `buildArticleTable()`

---

## Data Sources

| Feature | Source |
|---------|--------|
| Article forms | New `articleForms` constant in `src/data/grammar.ts` |
| Noun paradigm gender | Existing `NounParadigm.gender` field |
| Quiz table | Derived from `articleForms` in `paradigm-quiz.ts` |

---

## Technical Notes

- **Files changed:** `src/data/grammar.ts`, `src/components/GrammarReference.tsx`, `src/lib/paradigm-quiz.ts`
- **Tests:** Add unit tests for `getArticle()` in `src/data/grammar.test.ts` and for `buildArticleTable()` in `src/lib/paradigm-quiz.test.ts`
- The `NounParadigm.gender` field already stores `'masculine' | 'feminine' | 'neuter'`, making the article lookup straightforward
- No schema changes — `articleForms` and `getArticle` are additive exports

---

## Out of Scope

- Showing articles in the Paradigm Quiz blank cells for noun paradigms (the quiz tests noun forms in isolation; mixing articles adds ambiguity about what is being tested)
- Audio pronunciation of article forms
- Indefinite article (Greek has none)

---

## Open Questions

- **Article styling:** Should the article be visually differentiated from the noun (e.g., muted color), or rendered in the same style? Recommendation: muted/smaller to keep noun form as the primary visual focus.
