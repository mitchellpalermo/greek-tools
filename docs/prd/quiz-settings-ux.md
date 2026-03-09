# PRD: Quiz Settings UX

## Overview

Improve the quiz configuration experience so that settings like accent strictness and difficulty are immediately accessible after paradigm selection — not buried below the fold. On mobile especially, scrolling past a long paradigm list to find these controls is a bad experience. Also establishes sensible defaults (accent checking off).

---

## Status

**Not started.**

---

## Priority

**High.** This is a usability blocker for the Parsing & Drills feature. A confusing setup flow will discourage students from using drills at all, especially on mobile where most study happens.

---

## Goals

- Let students configure a drill session (paradigm + settings) without scrolling
- Make the quiz setup flow feel lightweight and fast, especially on mobile
- Default accent checking to off so beginners aren't penalized for accent errors

---

## Problem

The current Parsing & Drills PRD describes paradigm selection (mood tabs, tense/voice list) but doesn't address where difficulty and accent strictness controls live. If these settings sit below the paradigm list, the user has to:

1. Scroll through potentially 10+ paradigm options
2. Scroll past the paradigm list to find settings
3. Scroll back up if they want to change their paradigm choice

On a phone screen, this is 3–4 full swipes before they can even start drilling. It should be 1–2 taps.

---

## Features

### 1. Inline Settings Panel

After the user selects a paradigm, show quiz settings **directly adjacent to the selection** — not below the full paradigm list.

**Behavior:**
- On **desktop**: settings appear as a compact sidebar or panel to the right of the paradigm selector (same row), mirroring the existing verb paradigm layout in the Grammar Reference
- On **mobile**: settings appear in a collapsible section **immediately below** the selected paradigm button, before any other content
- Settings panel includes: Accent Strictness toggle and Difficulty selector
- The "Start Drill" button lives inside or directly below this settings panel — always visible without additional scrolling

### 2. Accent Checking Default: Off

Accent strictness defaults to **off** for all drill types.

**Behavior:**
- When accent checking is off, answers are compared after stripping all diacritical marks (accents, breathing marks, iota subscripts)
- Students can opt in to strict accent checking via a toggle in the settings panel
- The toggle label should be clear: "Check accents" with a brief subtitle like "Mark wrong if accents are missing or incorrect"
- Preference is saved to `localStorage` and persists across sessions

### 3. Difficulty Selector

A simple difficulty picker that scopes the drill set.

**Behavior:**
- Options: **Core** (common forms only) and **Full** (all forms including irregulars, 3rd declension, perfect, participles)
- Default: Core
- Displayed as a segmented control or pill toggle, same row as the accent toggle
- Preference saved to `localStorage`

### 4. Compact Mobile Layout

On screens < 768px, the entire setup flow (paradigm pick + settings + start button) should fit within a single viewport height.

**Behavior:**
- Paradigm selector uses the reusable `VerbParadigmGrid` component (built in PR #19, `src/components/grammar/VerbParadigmGrid.tsx`) — a compact tense x voice grid, not a vertical list
- Settings are 1–2 rows of compact toggles
- "Start Drill" button is always visible at the bottom of the setup area, not after the paradigm content

---

## Out of Scope

- Timer or competitive mode settings
- Per-paradigm difficulty memory (always resets to default)
- Advanced accent options (e.g., separate toggles for breathing marks vs. accents)

---

## Open Questions

- Should we use a bottom sheet / modal for settings on mobile, or keep everything inline?
- Should the "Start Drill" button be sticky at the bottom of the screen on mobile?
