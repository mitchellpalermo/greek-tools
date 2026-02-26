# PRD: Paradigm Quiz

## Overview

A quiz mode that tests students on their ability to recall complete Greek paradigm tables from memory. Distinct from the Parsing & Drills tool (which presents individual GNT word forms) and the Grammar Reference (which is a lookup tool). The paradigm quiz is for students who need to internalize the declension and conjugation tables — the kind of rote memorization most Greek courses require.

---

## Status

**Not started.**

## LOE

**Medium** (2–3 days)

---

## Goals

- Test paradigm table recall, not just individual word recognition
- Give immediate, cell-level feedback so students know exactly which forms they missed
- Reuse the grammar data already in `src/data/grammar.ts` — no new data files required
- Complement the Grammar Reference (reference) and Parsing & Drills (GNT form recognition)

---

## Features

### 1. Paradigm Selection

Student picks a paradigm to be quizzed on before a session begins.

**Available paradigm categories:**

- **Nouns** — all entries from `nounParadigms` (1st/2nd/3rd declension examples)
- **Adjectives** — all entries from `adjParadigms` (2-1-2 and 3-1-3 patterns)
- **Verbs** — all entries from `verbParadigms` (present/imperfect/future/aorist/perfect, active/middle-passive indicative; subjunctive; imperative; participle summary)
- **Pronouns** — personal (ἐγώ, σύ), demonstrative (οὗτος, ἐκεῖνος), relative (ὅς), interrogative (τίς)
- **Definite Article** — the article paradigm as a standalone quiz target

**UI:** A selector screen organized by category. Each paradigm is listed by its display name (e.g., "1st Declension Feminine — ἡμέρα"). Includes a "Random" option per category.

---

### 2. Fill-in-the-Blank Mode

The primary quiz mode. Present the full paradigm table with a subset of cells blanked out; student types the missing forms.

**Behavior:**
- The blanked cells are randomly selected each session (not the same cells every time)
- **Density options:** Easy (25% of cells blank), Medium (50%), Hard (all cells blank)
- Student types the Greek form into each blank using the existing Greek keyboard input or transliteration fallback
- Submit button checks all blanks at once (or per-cell inline checking — see Open Questions)
- After submission:
  - Correct cells turn green
  - Incorrect cells turn red and reveal the correct form alongside the student's input
  - Score shown: "14 / 20 correct"
- Student can retry the same paradigm with new blank placement, or switch paradigms
- Accents are checked strictly — this is a memorization exercise, not a recognition one. Accent errors are marked wrong with a note distinguishing the accent from the consonant/vowel error.

**Greek input:**
- Each blank cell contains a small text input
- The global Greek keyboard component attaches to whichever input has focus
- Transliteration mode (Beta Code or simple romanization) available as an alternative

---

### 3. Full Recall Mode

No cells are pre-filled. Student reconstructs the entire paradigm from scratch.

**Behavior:**
- The column/row headers are visible (e.g., case labels, number labels, person labels)
- All form cells are blank inputs
- Same checking and feedback behavior as Fill-in-the-Blank
- Intended for advanced drill after the student is comfortable with the paradigm

---

### 4. Spot-the-Error Mode

Show the complete paradigm table but with 3–5 cells intentionally wrong. Student identifies which cells contain errors.

**Behavior:**
- Student clicks to flag cells they believe are incorrect
- On submit: correctly flagged cells highlight green, missed errors highlight red, false positives highlight orange
- Shows the correct form for each flagged cell
- Useful for students who are close to mastery and need a different angle

---

### 5. Session Progress & Scoring

Lightweight per-session tracking (no persistence needed for V1).

**Behavior:**
- Score shown as correct/total at the end of each attempt
- "Best this session" tracked if the student retries the same paradigm
- No SRS or cross-session tracking in V1 (defer to Flashcard SRS system)

---

## Data Sources

All quiz data derives from existing exports in `src/data/grammar.ts`:

| Paradigm type | Source |
|---|---|
| Noun paradigms | `nounParadigms` |
| Adjective paradigms | `adjParadigms` |
| Verb paradigms | `verbParadigms`, `infinitiveForms`, `participleRows` |
| Personal pronouns | `personalPronouns12` |
| Gendered pronouns | `genderedPronouns` |

No new data files or scripts are required.

---

## Technical Notes

- **Route:** `/paradigms` (new page) — keeps separation from `/grammar` (reference) and `/drills` (GNT parsing)
- **Component:** `ParadigmQuiz.tsx` — a React island on `src/pages/paradigms.astro`
- **Shared components:** Reuse `GreekKeyboard.tsx` and the cell/table layout patterns from `GrammarReference.tsx`
- **State:** All quiz state is local to the component (no `localStorage` needed for V1)
- **Accent normalization:** The checking function should distinguish accent errors from root form errors in its feedback message. Normalize using Unicode normalization (NFC) before comparison, then separately check if the unaccented forms match to produce the right error label.

---

## Out of Scope

- Cross-session progress tracking or SRS for paradigms (handled by Flashcards)
- Audio pronunciation
- Generating paradigm tables programmatically at runtime for arbitrary lemmas
- Timed quiz modes
- Leaderboards or sharing scores

---

## Open Questions

- **Per-cell vs. submit-all checking:** Inline checking (as the student types) gives faster feedback but may feel like too much hand-holding in Hard mode. Recommendation: inline for Easy, submit-all for Medium and Hard.
- **Should Spot-the-Error mode ship in V1?** It's the most novel quiz type but also the most implementation effort. Could defer to V2 if scope is tight.
- **Route naming:** `/paradigms` vs. `/quiz` vs. adding a tab to `/grammar` — the standalone route makes the feature more discoverable and avoids cluttering the reference page.
