# PRD: Grammar Reference Mobile Layout

## Overview

Fix the Grammar Reference page for mobile screens. The 6-column adjective and gendered pronoun tables overflow the viewport with no visible scroll affordance — plural forms are invisible unless you happen to swipe. The verb paradigm selector requires blind horizontal scrolling through 10+ pill buttons. This PRD addresses these layout issues with a singular/plural toggle, a compact verb grid, and better scroll indicators.

---

## Status

**Complete.** Implemented in PR #19. Extracted 8 sub-components into `src/components/grammar/`, added Sg/Pl toggle for adjective and gendered pronoun tables on mobile, replaced verb pill-button nav with tense x voice grid (`VerbParadigmGrid`), and added scroll-fade CSS utility. Open questions resolved: Sg/Pl toggle defaults to Singular (no localStorage persistence); verb grid cells show 1sg form previews on the reference page.

---

## Priority

**High.** The Grammar Reference is a primary study tool and mobile is the most common study context (phone on desk next to textbook). Half the content is currently unusable on a phone without accidentally discovering horizontal scroll.

---

## Problem

Three layout issues on screens < 768px:

### 1. Adjective tables — data hidden off-screen

The 2-1-2 and 3-1-3 adjective tables have 7 columns (case label + 3 genders × 2 numbers). On a 375px screen, only Singular is visible. The entire Plural half is clipped with no scroll indicator.

```
What the student sees:              What's hidden off-screen:
┌─────────────────────────┐ ┊ ┌─────────────────────────┐
│      SINGULAR           │ ┊ │      PLURAL             │
│      Masc.  Fem.  Neut. │ ┊ │      Masc.  Fem.  Neut. │
│ NOM  ἀγαθός ἀγαθή ἀγαθόν│ ┊ │ NOM  ἀγαθοί ἀγαθαί ἀγαθά│
│ GEN  ἀγαθοῦ ἀγαθῆς ...  │ ┊ │ GEN  ἀγαθῶν ...         │
└─────────────────────────┘ ┊ └─────────────────────────┘
                            ┊
                       no scroll indicator
```

### 2. Gendered pronoun tables — same overflow

αὐτός, οὗτος, ἐκεῖνος, ὅς, and τίς all use the same 6-column gender grid. Plural feminine and neuter forms are invisible.

### 3. Verb paradigm selector — blind horizontal scroll

10 indicative paradigms in a horizontal scroll row. Labels like "Present Middle/Passive Indicative" are ~280px wide. Only ~1.5 buttons visible at a time on a 375px screen. No way to see what's available without swiping through the entire list.

---

## Features

### 1. Singular / Plural Toggle for Wide Tables

On mobile (< 768px), replace the 6-column adjective and pronoun tables with a 3-column table plus a Sg/Pl toggle. Show one number at a time.

**Mobile layout with toggle:**

```
┌─────────────────────────────────┐
│ 2-1-2 Adjective — ἀγαθός       │
│                    ┌───────────┐│
│                    │ Sg · [Pl] ││
│                    └───────────┘│
├─────────────────────────────────┤
│         Masc.    Fem.    Neut.  │
│  NOM    ἀγαθοί   ἀγαθαί  ἀγαθά │
│  GEN    ἀγαθῶν   ἀγαθῶν  ἀγαθῶν│
│  DAT    ἀγαθοῖς  ἀγαθαῖς ἀγαθοῖς│
│  ACC    ἀγαθούς  ἀγαθάς  ἀγαθά │
│  VOC    ἀγαθοί   ἀγαθαί  ἀγαθά │
├─────────────────────────────────┤
│ Hover over a cell to see its... │
└─────────────────────────────────┘
```

**Behavior:**
- Toggle appears in the card header bar, next to the existing "Full forms / Endings only" toggle
- Default: Singular selected
- Tapping Pl swaps all cell values to plural forms
- The toggle is a small pill: `[Sg] Pl` or `Sg [Pl]` with filled state on the active side
- On desktop (≥ 768px), the full 6-column table remains unchanged — the toggle is hidden
- Applies to: all adjective tables and all gendered pronoun tables (αὐτός, οὗτος, ἐκεῖνος, ὅς, τίς)
- Does NOT apply to: noun tables or personal pronouns (1st/2nd person) — these already fit in 2 columns

### 2. Verb Paradigm Grid (Reference Context)

Replace the horizontal pill-button row with the same tense × voice grid pattern described in the Verb Paradigm Picker PRD, adapted for the reference page.

**Mobile layout:**

```
┌─────────────────────────────────┐
│ Verbs — λύω                     │
│                                 │
│ [Indicative]  Subjunctive  Imp. │
│                                 │
│            Act     M/P          │
│  Pres     [ ● ]  [ ○ ]         │
│  Impf     [ ○ ]  [ ○ ]         │
│  Fut      [ ○ ]  [ ○ ]  ← Mid  │
│  Aor      [ ○ ]  [ ○ ]  [ ○ ]  │
│  Perf     [ ○ ]    —           │
├─────────────────────────────────┤
│ Present Active Indicative       │
├─────────────────────────────────┤
│  PERSON   FORM                  │
│  1st sg   λύω                   │
│  2nd sg   λύεις                 │
│  3rd sg   λύει                  │
│  1st pl   λύομεν                │
│  2nd pl   λύετε                 │
│  3rd pl   λύουσι(ν)             │
└─────────────────────────────────┘
```

**Behavior:**
- Same grid structure as the Verb Paradigm Picker PRD (rows = tenses, columns = voices)
- Replaces the horizontal scroll nav on mobile only
- On desktop, the existing vertical sidebar layout can remain, or be replaced with the grid — either works since the sidebar already fits
- Tapping a grid cell updates the paradigm table below it
- Selected cell is highlighted with primary color fill
- The full paradigm label appears as the table card header after selection

### 3. Scroll Fade Indicator (Fallback)

For any remaining horizontal-scroll containers (if the toggle approach isn't applied everywhere), add a visual fade on the right edge to signal more content.

**Behavior:**
- A gradient fade (white → transparent, ~40px wide) appears on the trailing edge of any overflowing scroll container
- Fade disappears when the user scrolls to the end
- Implemented via CSS `mask-image` or a pseudo-element overlay — no JavaScript needed
- Applies as a safety net to any `overflow-x-auto` container on mobile

---

## Summary of Changes by Section

| Section | Current mobile state | Proposed fix |
|---------|---------------------|-------------|
| Nouns | 2 columns — fits fine | No change |
| Adjectives | 6 columns — overflows, hidden | Sg/Pl toggle (Feature 1) |
| Verbs (selector) | 10+ pill buttons — blind scroll | Tense × voice grid (Feature 2) |
| Verbs (table) | 1 column — fits fine | No change |
| Pronouns (1st/2nd) | 2 columns — fits fine | No change |
| Pronouns (gendered) | 6 columns — overflows, hidden | Sg/Pl toggle (Feature 1) |
| Prepositions | Cards — fits fine | No change |
| Accent rules | Text cards — fits fine | No change |

---

## Out of Scope

- Redesigning the desktop layout (it works well as-is)
- Adding new paradigm data or sections
- Touch gestures (swipe between paradigms, pinch-to-zoom tables)

---

## Open Questions

- Should the Sg/Pl toggle default to Singular, or remember the last selection in `localStorage`?
- For the verb grid on the reference page, should cells show the 1sg form (`λύω`, `ἔλυον`) or just a tappable dot? The reference context might benefit from showing the form since students are looking things up, not drilling.
