# PRD: Grammar Reference

## Overview

A set of clean, scannable reference tables covering the core grammatical paradigms students need when reading Koine Greek. Designed for quick lookup during reading and translation work, not for memorization drills (see Parsing & Drills PRD).

---

## Status

**Complete.** All five sections implemented in `GrammarReference.tsx` and live at `/grammar`: noun/adjective declension tables, verb conjugation tables, pronoun reference, preposition quick reference, and accent rules summary. Includes sticky sidebar nav (desktop), horizontal scroll nav (mobile), hover tooltips, and endings-only toggle.

---

## Goals

- Give students a fast, browser-accessible alternative to flipping through a textbook
- Cover the paradigms that come up most often in GNT reading
- Keep the UI scannable and printer-friendly

---

## Features

### 1. Noun & Adjective Declension Tables

Display the standard Greek noun paradigms organized by declension.

**Tables to include:**
- First declension: feminine (ἡμέρα, δόξα), masculine (νεανίας)
- Second declension: masculine (λόγος), neuter (ἔργον)
- Third declension: representative examples (σάρξ, πίστις, βασιλεύς, γένος)
- Adjective: 2-1-2 pattern (ἀγαθός), third declension adjective (πᾶς)

**Behavior:**
- Each table shows case labels (Nom, Gen, Dat, Acc, Voc) × number (Sg, Pl)
- Cells show the inflected form
- Hover or tap a cell to see the case name + description (e.g., "Genitive Plural — of [noun]s")
- Toggle to show endings only (stripped from the stem) vs. full forms

### 2. Verb Conjugation Tables

Display indicative and common non-indicative paradigms for λύω as the base model.

**Tables to include:**
- Present active/middle-passive indicative
- Imperfect active/middle-passive indicative
- Future active/middle indicative
- Aorist active/middle indicative, aorist passive indicative
- Perfect active indicative
- Present active/passive subjunctive and imperative
- Present and aorist infinitives and participles (summary table)

**Behavior:**
- Person × number grid (1sg, 2sg, 3sg, 1pl, 2pl, 3pl)
- Label each form with its full parse on hover
- Sidebar navigation to switch between tense/mood/voice combinations

### 3. Pronoun Reference

Quick-reference tables for the pronouns students encounter most.

**Tables to include:**
- Personal pronouns: ἐγώ, σύ, αὐτός
- Demonstrative: οὗτος, ἐκεῖνος
- Relative: ὅς, ἥ, ὅ
- Interrogative/indefinite: τίς/τις

### 4. Preposition Quick Reference

A single-page reference card for all GNT prepositions, organized by the case(s) they govern.

**Behavior:**
- Group prepositions by case (genitive only, accusative only, dative only, multiple cases)
- For each preposition: show the Greek form, the case(s) it takes, and primary glosses per case

### 5. Accent Rules Summary

A structured summary of Greek accent rules for students who need a reference while reading.

**Content:**
- Types of accents (acute, grave, circumflex) and where they can stand
- Persistent vs. recessive accent rules
- Rules for nouns (genitive plural always circumflex on ultima in 1st/2nd decl., etc.)
- Proclitics and enclitics list
- Common accent shifts to know (e.g., oxytone → grave before another word)

---

## Out of Scope

- Paradigm-based quizzing (see Parsing & Drills PRD)
- Syntax rules or clause-level grammar
- Audio
- Print/PDF export (see below)

---

## Decisions

- **Layout:** One long scrollable page with sticky sidebar nav (desktop) / horizontal scroll nav (mobile). Sub-pages were considered but add navigation overhead for a reference tool; single-page with anchors is faster for lookup.
- **Print export:** Not implemented. The browser's native print/PDF functionality (Cmd+P) is sufficient for the use case of printing paradigm tables. A dedicated export button would add complexity without meaningful gain.
