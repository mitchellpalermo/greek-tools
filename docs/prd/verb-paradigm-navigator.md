# PRD: Verb Paradigm Picker for Drills

## Overview

Replace the flat paradigm list with a compact tense-by-voice grid for selecting which verbal paradigm to drill. The current Grammar Reference uses a horizontal-scroll row of pill buttons with long labels like "Present Middle/Passive Indicative" — carrying this pattern into the quiz flow would require extensive scrolling on mobile before a student can even start drilling. The grid gives students a spatial view of the verb system and lets them pick any paradigm in 1–2 taps.

---

## Status

**Not started.**

---

## Priority

**High.** This is a dependency for the Parsing & Drills and Quiz Settings UX PRDs. The paradigm picker is the first thing students interact with when starting a drill — if it's clunky, they won't use it.

---

## Goals

- Let students pick any verbal paradigm in 1–2 taps, not 5+ horizontal swipes
- Show the tense/voice landscape at a glance so students can see what's available
- Scale gracefully as paradigms are added (μι-verbs, contract verbs, liquid verbs)
- Fit the entire paradigm picker + quiz settings + "Start" button on one mobile screen

---

## Problem

The Grammar Reference currently lists indicative paradigms in a flat row:

`Present Active Indicative` · `Present Middle/Passive Indicative` · `Imperfect Active Indicative` · ...

On a 375px mobile screen, only ~1.5 buttons are visible at a time. The student has to swipe blindly through 10 items to find "Aorist Passive Indicative." This is tolerable for a reference page (where you browse), but unacceptable for a drill setup flow (where you want to pick and go).

---

## Features

### 1. Tense × Voice Grid

Replace the flat button list with a compact grid. Rows are tenses, columns are voices. The mood tabs (Indicative / Subjunctive / Imperative) remain above the grid.

**Mobile layout (~375px wide):**

```
┌─────────────────────────────────────┐
│  Indicative   Subjunctive   Imper.  │  ← mood tabs
├─────────────────────────────────────┤
│              Act    Mid    Pass     │
│  Present    [ ● ] [ ○ ]    —       │
│  Imperfect  [ ○ ] [ ○ ]    —       │
│  Future     [ ○ ] [ ○ ]    —       │
│  Aorist     [ ○ ] [ ○ ] [ ○ ]     │
│  Perfect    [ ○ ]   —      —       │
├─────────────────────────────────────┤
│  ☐ Check accents       Core ◉ Full │  ← quiz settings
│                                     │
│          [ Start Drill ]            │  ← always visible
└─────────────────────────────────────┘
```

**Behavior:**
- Columns: **Active**, **Middle**, **Passive**
- Rows: **Present**, **Imperfect**, **Future**, **Aorist**, **Perfect** (Pluperfect added later)
- Each cell is a tappable button. Selected cell is filled/highlighted. One cell selected at a time.
- Cells where Middle/Passive are combined (Present, Imperfect) show a single cell spanning the Mid + Pass columns, labeled "M/P"
- Empty cells (e.g., Perfect Middle not yet in data) are dimmed/disabled
- Tapping a cell immediately updates the selected paradigm — no separate "confirm" step

**Desktop layout:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   Indicative    Subjunctive    Imperative                │
│                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │           Act   Mid  Pas │  │                      │  │
│  │  Present  [●]  [○]   —  │  │  ☐ Check accents     │  │
│  │  Impfct   [○]  [○]   —  │  │                      │  │
│  │  Future   [○]  [○]   —  │  │  Difficulty           │  │
│  │  Aorist   [○]  [○]  [○] │  │  ◉ Core  ○ Full      │  │
│  │  Perfect  [○]   —    —  │  │                      │  │
│  │                          │  │  [ Start Drill ]     │  │
│  └──────────────────────────┘  └──────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

On desktop, the grid and quiz settings sit side by side. Everything fits above the fold.

### 2. Grid Cell Design

Cells should be compact but clearly tappable.

**Behavior:**
- Cell size: ~60×36px on mobile, ~72×40px on desktop
- Selected state: filled primary color with white text or checkmark
- Available state: light border, muted text
- Disabled state: no border, very light background, no pointer cursor
- Cells do not show full labels — the row and column headers provide that context
- Optional: show the 1sg form inside the cell (e.g., `λύω`, `ἔλυον`) for extra context. If too tight, just show a dot or abbreviated label.

### 3. Subjunctive & Imperative Grids

The same grid pattern applies to all moods, just with fewer rows.

**Subjunctive grid:**

```
              Act    Pass
  Present    [ ● ] [ ○ ]
  Aorist     [ ○ ] [ ○ ]
```

**Imperative grid:**

```
              Act    M/P
  Present    [ ● ] [ ○ ]
  Aorist     [ ○ ] [ ○ ]
```

These are small enough to feel lightweight. The grid layout provides consistency across moods.

### 4. Multi-Select Mode (Future Enhancement)

Allow students to select multiple paradigms for a mixed drill session.

**Behavior:**
- A toggle at the top switches between "Single" (drill one paradigm) and "Mix" (drill across selected paradigms)
- In mix mode, tapping cells toggles them on/off independently
- A "Select All" / "Clear" shortcut for the current mood
- Not required for v1 — single-select is sufficient to launch

---

## Out of Scope

- Noun/adjective paradigm picker (separate concern — fewer paradigms, less need for a grid)
- Paradigm comparison view (side-by-side tables)
- Model verb switcher (always λύω for now)

---

## Open Questions

- Should cells show the 1sg form (`λύω`, `ἔλυον`, `ἔλυσα`) or just a selectable dot/chip? Forms are more informative but take more space.
- When μι-verbs are added, should they appear as a verb-class toggle above the grid (λύω / τίθημι / δίδωμι) or as a separate tab alongside the mood tabs?
