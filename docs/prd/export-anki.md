# PRD: Export to Anki

## Overview

Let students export their flashcard vocabulary deck (with optional SRS progress) to an Anki-compatible `.apkg` file. Allows students who use Anki on mobile to carry their greek.tools vocabulary work with them.

---

## Status

**Not started.**

## LOE

**Medium** (~1 week)

---

## Goals

- Give Anki users a way to continue studying the same vocabulary on mobile
- Respect the SRS work students have done by mapping intervals to Anki's scheduler where possible
- Keep the export entirely client-side (no server required)

---

## Features

### 1. Export Deck

Export the current vocabulary deck as a `.apkg` file.

**Card format:**
- Front: Greek word (displayed in the Greek font)
- Back: English gloss + part of speech + GNT frequency

**Export scope options:**
- All words in the master vocabulary
- Only words the student has studied (have an SRS entry)
- Current filtered subset (respects the active frequency/POS filters)

**Behavior:**
- "Export to Anki" button in the Flashcards footer or settings area
- Clicking generates the `.apkg` file and triggers a browser download
- Option to include SRS interval data (see below)

### 2. SRS Interval Mapping (Optional)

Map greek.tools SRS intervals to Anki's scheduling fields so studied cards carry over their progress.

**Behavior:**
- Cards with a greek.tools interval > 0 are exported with equivalent Anki `due` and `ivl` fields set
- Cards never studied are exported as new cards
- A note in the UI: "SRS progress is approximate — Anki uses a different scheduler"

---

## Technical Notes

- **`.apkg` format:** A ZIP file containing:
  - `collection.anki2` — an SQLite database with `notes`, `cards`, `col`, and `graves` tables
  - `media` — a JSON file mapping media indices to filenames (empty for text-only decks)
- **Implementation options:**
  - Use `anki-apkg-export` npm package (small, purpose-built) — check if actively maintained
  - Use `sql.js` (SQLite in WebAssembly) + `jszip` to build the database manually — more control, heavier dependency
  - Recommend evaluating `anki-apkg-export` first; fall back to manual construction if needed
- **Greek font in Anki:** Anki cards can include HTML/CSS. The front of the card can use `font-family: 'GFS Didot', serif` in a `<style>` tag embedded in the card template. This renders correctly in AnkiWeb and desktop Anki; mobile Anki may fall back to a system serif.
- **File size:** ~5,000 cards × ~200 bytes per card = ~1 MB SQLite; zipped to ~300 KB — well within browser download limits.

---

## Out of Scope

- Importing from Anki (one-way export only)
- Syncing with AnkiWeb
- Keeping greek.tools and Anki in sync after export (two systems will diverge)
- Custom card templates beyond basic front/back

---

## Open Questions

- Is there a well-maintained JS library for `.apkg` generation, or does this need to be built from scratch with `sql.js` + `jszip`?
- Should SRS interval mapping be on by default, or opt-in? (Opt-in is safer since the schedulers differ.)
