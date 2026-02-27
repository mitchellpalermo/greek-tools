# PRD: Parsing & Drills

## Overview

AI-powered morphological parsing practice for Koine Greek students. Claude generates challenges drawn from real Greek New Testament words, students identify the parse via button selections, and Claude explains wrong answers in plain English. Requires an active subscription.

---

## Status

**In progress.** Architecture designed and approved. Implementation in progress.

## LOE

**Large (~2 weeks total, including auth and billing infrastructure)**

---

## Goals

- Give students a place to practice parsing without needing a workbook
- Use Claude to generate high-quality, varied challenges from verified GNT text — no hand-curated dataset required
- Provide immediate, readable explanations when a student gets something wrong
- Sustain API costs through a subscription model

---

## Dependencies

- User Authentication (see auth.md) — required before accessing drills
- Subscriptions (see subscriptions.md) — paid-only feature
- MorphGNT dataset (`public/data/morphgnt/`) — source of all challenge words

---

## Features

### 1. AI-Generated Parsing Challenge

Each challenge presents one Greek word from the GNT and asks the student to identify its full morphological parse.

**How challenges are generated:**
- The server pre-builds a pool of ~500 parse-worthy MorphGNT words (nouns, adjectives, finite verbs; no particles, conjunctions, or prepositions) in `src/data/morphgnt-drill-pool.ts`
- On each request, 20 words are sampled randomly and sent to Claude as context
- Claude selects the best challenge candidate and provides a concise English gloss
- This grounds all challenges in verified GNT data — Claude selects and glosses, it never invents Greek forms

**What the student sees:**
- The Greek word displayed prominently in the Greek font
- The lemma (lexical form) for context
- A short English gloss

**Parse selection — no typing required.** The student selects parse categories via button groups. The categories shown depend on the word's part of speech:

| Word type | Categories shown |
|---|---|
| Noun / pronoun / article / adjective | Case, Number, Gender |
| Finite verb | Person, Tense, Voice, Mood, Number |
| Infinitive | Tense, Voice |
| Participle | Tense, Voice, Case, Number, Gender |

**After submission:**
- Correct → green feedback card with the full parse label
- Wrong → red feedback card with the correct parse + an "Explain this" button

### 2. Claude-Powered Explanations

When a student gets a challenge wrong and clicks "Explain this," Claude streams a 3–5 sentence explanation.

**Explanation covers:**
- What morphological features (ending, augment, reduplication, stem) identify the correct parse
- What the student likely mistook and why
- Written in encouraging, plain English — no markdown formatting

**Delivered as a Server-Sent Events (SSE) stream** so the text appears word by word.

### 3. Session Tracking

The drill session tracks performance across challenges in the current browser session.

**Behavior:**
- Correct/wrong counts shown in a session bar
- Accuracy percentage shown on session end
- Drill attempts logged to the database for future analytics (no spaced repetition in v1 — each session is fresh)

### 4. Part-of-Speech Filter

Student can narrow challenges to a specific category before starting.

**Options:** All · Nouns & Adjectives · Verbs only

---

## Technical Design

### Challenge Flow

```
Student loads /drills
  → Server checks auth + subscription (D1 query)
  → ParsingDrills component loads
  → POST /api/drills/challenge
      → Sample 20 words from morphgnt-drill-pool.ts
      → Claude selects best challenge candidate
      → Return { word, lemma, gloss, pos, parsing }
  → Student selects parse via button groups
  → Client-side checkAnswer() against 8-char MorphGNT parse code
  → POST /api/drills/submit (fire-and-forget, records to D1)
  → Show feedback
  → (if wrong) POST /api/drills/explain → SSE stream → explanation panel
```

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/drills/challenge` | POST | Auth + subscription check → Claude challenge |
| `/api/drills/explain` | POST | Auth + subscription check → Claude SSE explanation |
| `/api/drills/submit` | POST | Auth check → record attempt to D1 |

### Key Library Files

- `src/lib/claude.ts` — `buildChallengePrompt()`, `buildExplanationPrompt()`, `parseChallengeResponse()`, `checkAnswer()`
- `src/data/morphgnt-drill-pool.ts` — static array of ~500 `MorphWord` objects for challenge sampling

---

## Out of Scope (v1)

- Spaced repetition for drills (covered by Flashcards; may be added in v2)
- Principal parts drill (planned; requires separate data and input type)
- Article + noun agreement drill (planned; lower priority)
- Timed or competitive modes
- Full sentence parsing

---

## Decisions

- **Route:** Single `/drills` page with part-of-speech filter. Principal parts and agreement drills added later as tabs on the same page.
- **Data strategy:** Pre-built drill pool rather than fetching all MorphGNT books at challenge time. Faster, simpler, and avoids large runtime fetches.
- **Answer input:** Button groups only (no typing for parsing). Typing is reserved for principal parts drill in a future iteration.
