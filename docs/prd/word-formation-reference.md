# PRD: Word Formation Reference

## Overview

A reference for common Greek prefixes and suffixes that helps students decode unfamiliar vocabulary. Knowing that -ία forms abstract nouns or that κατα- intensifies a verb gives students a systematic tool for guessing meaning from word parts — a significant reading aid in the GNT where vocabulary is large.

---

## Goals

- Teach students to recognize and use word-formation patterns
- Reduce reliance on looking up every unfamiliar word
- Cover the prefixes and suffixes with the highest payoff in GNT reading

---

## Priority

Low

---

## Features

### 1. Prepositional Prefixes

A table of the eight prepositions most commonly used as verb prefixes, with their base meaning and how they modify the verb.

| Prefix | Base Meaning | Effect on Verb | Example |
|--------|-------------|----------------|---------|
| ἀνα- | up, again | intensification or reversal | ἀνα + βαίνω = ἀναβαίνω (I go up) |
| ἀπο- | away from | separation, completion | ἀπο + λύω = ἀπολύω (I release, dismiss) |
| δια- | through | thoroughness | δια + κρίνω = διακρίνω (I distinguish) |
| ἐκ/ἐξ- | out of | removal, completion | ἐκ + βάλλω = ἐκβάλλω (I cast out) |
| ἐν- | in | location, entry | ἐν + τέλλω = ἐντέλλομαι (I command) |
| κατα- | down, against | intensification, completion | κατα + λύω = καταλύω (I destroy) |
| προ- | before, forward | priority, precedence | προ + άγω = προάγω (I lead forward) |
| συν- | with, together | association | συν + ἄγω = συνάγω (I gather together) |

### 2. Noun-Forming Suffixes

Common suffixes that form nouns from verb or adjective stems.

| Suffix | Meaning | Examples |
|--------|---------|---------|
| -ία (-εια) | abstract quality or state | πίστ + ία = πίστεια; ἀλήθ + εια = ἀλήθεια (truth) |
| -τής, -τοῦ | agent (one who does) | βαπτ + ιστής = βαπτιστής (baptizer) |
| -τήριον | place where action happens | προσ + ευχή → προσευχτήριον (place of prayer) |
| -μα, -ματος | result of an action | βάπτ + ισμα = βάπτισμα (baptism) |
| -σις, -σεως | act or process | πίστ + ις = πίστις (faith, act of trusting) |
| -ος, -ους (neuter) | abstract result | γέν + ος = γένος (race, kind) |

### 3. Adjective-Forming Suffixes

| Suffix | Meaning | Examples |
|--------|---------|---------|
| -ικός, -ή, -όν | pertaining to, characterized by | πνευματ + ικός = πνευματικός (spiritual) |
| -ινος | made of, belonging to | σαρκ + ινος = σάρκινος (fleshly, made of flesh) |
| -ιος | of, belonging to | οὐράν + ιος = οὐράνιος (heavenly) |

### 4. Interactive Decoder

A simple tool: student types a Greek word, and the tool highlights any recognized prefixes or suffixes and suggests the likely base meaning.

**Behavior:**
- Pattern matches against the prefix/suffix lists
- Shows the breakdown: prefix + root + suffix → likely meaning
- Not a full morphological parser; works on string pattern matching
- Suggests "Check lexicon" when no pattern is recognized

---

## Out of Scope

- Full derivational morphology (a linguistics textbook topic)
- Compound nouns from two noun stems

---

## Open Questions

- Is the interactive decoder in scope for v1, or should we ship the static reference tables first and add the decoder later?
