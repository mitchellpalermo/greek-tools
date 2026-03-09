# PRD: Moveable Nu Tolerance

## Overview

Treat the moveable nu (ν) as an accent-level detail in answer validation. Students should never be penalized for including or omitting it, regardless of whether they wrap it in parentheses. When accent checking is off, moveable nu differences are ignored entirely. When accent checking is on, moveable nu differences are still ignored.

---

## Status

**Not started.**

---

## Priority

**High.** Moveable nu is a stylistic convention, not a grammatical distinction. Penalizing students for it creates frustration and teaches the wrong lesson — that ν-moveable matters for comprehension.

---

## Goals

- Never deduct points for moveable nu presence, absence, or formatting
- Handle all common ways students type moveable nu: with parentheses `(ν)`, without parentheses `ν`, or omitted entirely
- Keep the validation logic simple and centralized so it applies to all drill types

---

## Background

In Koine Greek, certain verb and noun forms optionally add a final ν (nu) before vowels or at the end of a clause. This is called the "moveable nu" or "nu-moveable" (ν ἐφελκυστικόν). Common examples:

- 3rd person singular: `ἔλυσε` / `ἔλυσε(ν)` / `ἔλυσεν`
- 3rd person plural: `ἔλυσα` / `ἔλυσα(ν)` / `ἔλυσαν`
- Dative plural: `πᾶσι` / `πᾶσι(ν)` / `πᾶσιν`

Textbooks and paradigm charts typically show it in parentheses — e.g., `λύουσι(ν)` — but students may type any of the three forms. All three should be accepted as correct.

---

## Features

### 1. Moveable Nu Normalization

Before comparing a student's answer to the expected form, normalize both strings so that moveable nu variations are equivalent.

**Behavior:**
- Strip parentheses around a trailing ν: `λύουσι(ν)` → `λύουσιν`
- The following answers for `λύουσι(ν)` are all accepted as correct:
  - `λύουσι` (nu omitted)
  - `λύουσιν` (nu included, no parens)
  - `λύουσι(ν)` (nu in parens, matching the paradigm chart)
- Normalization runs **before** accent comparison, so it works regardless of the accent checking toggle

### 2. Detection of Moveable Nu Positions

The system needs to know which forms have a moveable nu so it doesn't over-normalize (e.g., don't strip a final ν from `ἐλάλησεν` where ν is actually part of the form `ἐλαλήθην`).

**Behavior:**
- Moveable nu applies to forms where the paradigm data contains `(ν)` — the parenthetical notation is already present in the existing `grammar.ts` data (e.g., `σάρκι(ν)`, `πίστεσι(ν)`, `πᾶσι(ν)`)
- For verb paradigms: moveable nu positions should be tagged in the paradigm data (3sg and 3pl endings for certain tenses, and dative plurals)
- The answer checker compares the student's input against all acceptable variants of the expected form, rather than trying to detect moveable nu positions at runtime

### 3. Variant Generation

For each expected form that contains a moveable nu, generate the set of acceptable variants at drill-load time.

**Behavior:**
- Given a paradigm form `λύουσι(ν)`, generate:
  - `λύουσι` (base without nu)
  - `λύουσιν` (with nu, no parens)
  - `λύουσι(ν)` (original notation)
- Store these as an `acceptedForms: string[]` array alongside each drill item
- The answer checker does a simple `acceptedForms.includes(normalized(input))` check

---

## Out of Scope

- Teaching students when to use moveable nu in composition (this is a reference/drill tool, not a writing tool)
- Moveable sigma (ξ/σ alternations in some dialects) — not relevant to Koine
- Elision handling (e.g., `ἀπ'` vs. `ἀπό`) — separate concern

---

## Decisions

- **Moveable nu is always tolerated**, even with strict accent checking on. It is never a grading criterion.
- **Parentheses in student input are stripped**, not penalized. If a student types `λύει(ν)` we don't mark it wrong for including parens.
