# PRD: Greek Alphabet & Manuscript Guide

## Overview

An interactive guide to the Greek alphabet covering printed letter forms, stroke order for handwriting, the names and phonetic values of each letter, and a sampling of common manuscript letter forms. Useful for beginners learning to write Greek and for anyone curious about how letters look in actual manuscripts.

---

## Goals

- Give beginners a clear, interactive reference for learning the alphabet
- Show stroke order to help students develop legible Greek handwriting
- Provide a brief introduction to manuscript letter forms for students moving into textual criticism or exegesis

---

## Priority

Low

---

## Features

### 1. Alphabet Table

A clean table of all 24 Greek letters showing:
- Uppercase and lowercase printed forms
- Letter name (e.g., α = alpha)
- Erasmian phonetic value
- Rough English equivalent sound
- Letter's numeric value (Greek numerals)

### 2. Stroke Order Animations

For each lowercase letter, a simple CSS/SVG animation showing stroke order.

**Behavior:**
- Click or tap a letter to trigger the stroke animation
- Animation plays at readable speed; can be replayed
- Particularly useful for letters students commonly write incorrectly (ξ, ψ, γ, χ)

### 3. Diacritics Guide

A sub-section explaining the diacritical marks used in polytonic Greek:
- Breathing marks: smooth (᾿) and rough (῾)
- Accent marks: acute (´), grave (`), circumflex (ˆ)
- Iota subscript (ᾳ, ῃ, ῳ)
- Dieresis (ϊ, ϋ)
- Where each mark sits relative to the letter
- How they combine (e.g., ᾶ = alpha + circumflex + smooth breathing)

### 4. Manuscript Forms

A brief gallery showing how each letter appears in major manuscript styles:
- Uncial (all-caps, used in early manuscripts like Codex Sinaiticus)
- Minuscule (cursive lowercase, used in later manuscripts)

**Scope:** One representative image per letter for each style. Sourced from public domain manuscript images.

---

## Out of Scope

- Full paleography course
- Interactive manuscript reading exercises
- Hebrew alphabet (separate tool if ever needed)

---

## Technical Notes

- Stroke order animations can be implemented as SVG path animations with `stroke-dashoffset` technique — no external library needed
- Manuscript images must be sourced from public domain collections (e.g., Codex Sinaiticus Project, British Library digitized manuscripts)

---

## Open Questions

- Should Erasmian pronunciation be the only system shown, or should Restored Koine be included here? (See also: Pronunciation Guide PRD)
- Is the manuscript forms section useful enough for the target audience (GNT students) to include in v1, or should it be deferred?
