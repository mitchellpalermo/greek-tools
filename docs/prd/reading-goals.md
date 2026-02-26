# PRD: Reading Goals

## Overview

Let students set a goal to read a specific NT book by a target date, then track their chapter-by-chapter progress from within the GNT Reader. Adds a forward-looking motivational layer without being prescriptive.

---

## Status

**Not started.**

## LOE

**Small** (2–3 days)

---

## Goals

- Give students a structured reading plan they set for themselves
- Make chapter-by-chapter progress visible and satisfying to track
- Integrate naturally with the GNT Reader rather than requiring a separate workflow

---

## Features

### 1. Goal Creation

Student picks a book and a target completion date.

**Behavior:**
- Simple form: Book selector (same list as GNT Reader) + date picker
- After setting: "To finish [Book] by [Date], read ~X chapters/week"
- Multiple simultaneous goals are supported (e.g., "Finish John by March, Romans by May")
- Goals stored in `localStorage` under `greek-tools-reading-goals`

### 2. Chapter Progress Tracking

Mark a chapter as read from within the GNT Reader or from the goals overview.

**Behavior:**
- GNT Reader shows a "Mark as read" button in the toolbar when the current book has an active goal
- Completed chapters stored in `localStorage` under `greek-tools-chapter-progress` as `{ [bookCode]: Set<number> }`
- Completed chapters are visually marked in the chapter dropdown (checkmark or muted style)

### 3. Goals Overview Page

A dedicated view of all active goals with progress bars and pacing status.

**Behavior:**
- Progress bar: chapters read / total chapters
- Pacing indicator: chapters read on track vs. pace needed to hit the target date
- Color coding: on track (green), slightly behind (amber), significantly behind (red)
- Option to delete a goal

**Placement:** Could be a small widget surfaced on the Reader page, a modal, or a standalone `/goals` page. Prefer integrating into `/reader` as a collapsible panel to avoid context-switching.

---

## Technical Notes

- **New localStorage keys:**
  - `greek-tools-reading-goals` — array of `{ book, targetDate, createdDate }`
  - `greek-tools-chapter-progress` — `{ [bookCode]: number[] }` (array of completed chapter numbers)
- **Chapter count data:** Already available from `books.json` (`currentBook.chapters`)
- **Pacing calculation:** `(targetDate - today) / daysPerChapter` compared to `chaptersRemaining`

---

## Out of Scope

- Pre-built reading plans (e.g., "Read the NT in a year") — student sets their own pace
- Sharing goals or progress
- Goals for LXX reading (can be added once LXX Reader is built)
