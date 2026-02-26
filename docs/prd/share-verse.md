# PRD: Share a Verse

## Overview

Generate a styled, shareable image card for a GNT verse. Useful for sermon prep, teaching slides, social media, or simply sharing a passage with a study group.

---

## Status

**Not started.**

## LOE

**Medium** (~1 week)

---

## Goals

- Give students and pastors a way to share Greek verses in a polished, readable format
- Keep generation entirely client-side (no server, no cost)
- Surface the site's identity to new users who encounter shared images

---

## Features

### 1. Verse Card Generator

Given a verse reference, render a styled image card.

**Card content:**
- Greek verse text in the site's Greek font (GFS Didot)
- Verse reference (e.g., "John 3:16")
- greek.tools watermark / URL

**Behavior:**
- Verse reference selector (same book/chapter/verse UI as GNT Reader)
- Verse text fetched from MorphGNT (shared data layer)
- Live preview of the card before downloading
- "Download PNG" button exports the rendered card

### 2. Style Options

Choose from a small set of card styles.

**Options:**
- Light (white background, dark text — matches site default)
- Dark (dark background, light text)
- Parchment (warm off-white, sepia tones)

### 3. Entry Points

- "Share" button on the Daily Verse page
- "Share this verse" option in the GNT Reader toolbar (shares the current chapter's first verse, or a user-specified verse)

---

## Technical Notes

- **Rendering approach:** DOM-to-image using `html-to-image` or `dom-to-image-more` (lightweight, no canvas setup required). Renders a hidden styled `div` to a PNG data URL.
- **Alternative:** HTML Canvas API with manual text rendering — more control but more code, especially for Greek Unicode with diacritics; prefer DOM capture.
- **Font loading:** `html-to-image` embeds fonts as base64 in the canvas. Verify GFS Didot renders correctly in the output; may need to pre-load the font via `FontFace` API before capture.
- **Web Share API:** On mobile, after generating the image, offer native share sheet via `navigator.share({ files: [pngFile] })` where supported. Fall back to download on desktop.
- **Image dimensions:** 1200×630px (standard Open Graph dimensions) for compatibility with social media preview cards.

---

## Out of Scope

- Server-side image generation
- Social media posting integrations (generate + download only)
- Animated or video cards
- Including an English translation alongside the Greek (would require a translation dataset)
- Custom fonts beyond the three built-in styles

---

## Open Questions

- Should the verse reference selector also allow pasting a reference string, or dropdown only?
- Is including the English gloss beneath each Greek word (inline gloss mode) a useful option for shared images, or does it add too much complexity to the layout?
