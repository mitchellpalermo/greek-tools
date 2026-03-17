# PRD: Sentence Diagramming Tool

## Overview

A lightweight visual tool for diagramming Greek sentences. Students input a Greek sentence, arrange words as draggable nodes on a canvas, draw connecting lines between nodes, and label the relationships. Useful for students working through syntax and clause structure in exegesis.

---

## Status

**Not started.**

## LOE

**Large** (3–5 days for a simple v1)

---

## Goals

- Give students a visual workspace for analyzing Greek sentence structure
- Keep v1 simple — free-form canvas with no automated syntax analysis
- Support save/export so students can use diagrams in papers or study notes

---

## Features

### 1. Sentence Input

Student pastes or types a Greek sentence into an input area. The Greek keyboard component is available for input.

**Behavior:**
- On submit, each word becomes a draggable node on the canvas
- Words retain their original Greek text including diacritics
- Student can manually add or remove nodes after the initial parse

---

### 2. Draggable Word Nodes

Each word is displayed as a labeled node that can be freely positioned on the canvas.

**Behavior:**
- Nodes are drag-and-drop repositionable
- Node label shows the Greek word form
- Optional: small secondary label below for gloss or parsing tag (student-entered)
- Nodes snap to a loose grid to keep alignment manageable

---

### 3. Connecting Lines & Labels

Student draws lines between nodes to represent syntactic relationships and labels them.

**Behavior:**
- Click a node then click another to draw a connecting line
- Line label is editable: subject, verb, direct object, indirect object, modifier, prepositional phrase, relative clause, etc.
- Lines can be deleted by clicking them
- Visual style: straight lines with an arrowhead indicating direction (head → dependent)

---

### 4. Export

Student can save the finished diagram.

**Behavior:**
- Export as PNG image (canvas screenshot)
- No server-side storage — diagram data lives in the browser only
- Optional: save/restore diagram state via `localStorage` for the current session

---

## Technical Notes

- **Route:** `/diagram` (new page)
- **Component:** `SentenceDiagram.tsx`
- **Diagramming library options:** React Flow (most full-featured), or a lightweight canvas approach with `konva` / plain HTML canvas. React Flow is the recommendation given it handles drag, connections, and labels natively.
- **Shared components:** Reuse `GreekKeyboard.tsx` for sentence input

---

## Out of Scope

- Automated syntactic analysis or morphological parsing
- Reed-Kellogg style traditional diagramming (complex to implement, less useful for Greek)
- Cloud save or account-based storage
- Collaborative/shared diagrams
- Timed or graded modes

---

## Open Questions

- Should nodes show a gloss automatically (pulled from the vocabulary data) or only what the student types?
- React Flow vs. plain canvas: React Flow is faster to build but adds ~200kb to the bundle. Worth evaluating bundle impact before committing.
- Should v1 support clause-level grouping (visually boxing subordinate clauses), or is free-form node placement sufficient?
