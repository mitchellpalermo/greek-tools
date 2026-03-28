# PRD: Case Uses Reference

## Overview

A syntax reference covering the major uses of the Greek cases with definitions, GNT examples, and brief exegetical notes. Focuses on the Nominative and Accusative in v1, with Genitive, Dative, and Vocative to follow.

Distinct from the Grammar Reference (which covers paradigm forms/morphology), this page covers function: what a case signals about a word's role in the sentence.

---

## Placement

**Route:** `/syntax` — a new top-level page for syntactical reference material.

This page is the first section of a planned Syntax Reference that will eventually include:
1. Case uses (this PRD — Nominative + Accusative in v1)
2. Genitive, Dative, and Vocative uses (future PRD)
3. Syntax constructions: genitive absolute, indirect statement, conditionals, etc. (see `syntax-constructions.md`)

The `/syntax` route gives this content room to grow without crowding the Grammar Reference.

---

## Priority

Medium

---

## Features

### 1. Navigation

A sidebar (matching the Grammar Reference layout) with anchor links to each case section. On mobile, a horizontal scroll pill nav.

Within each case, sub-links for each use category.

---

### 2. Nominative Uses

#### Subject Nominative
The standard use. The nominative identifies the subject of a finite verb.

> **GNT example:** ὁ **θεός** ἀγαπᾷ τὸν κόσμον — "**God** loves the world" (John 3:16)

#### Predicate Nominative
A nominative that renames or describes the subject, linked by a copulative verb (εἰμί, γίνομαι, etc.). Both subject and predicate are nominative; the subject is typically the more definite noun.

> **GNT example:** ὁ **λόγος** ἦν **θεός** — "the Word was **God**" (John 1:1)
>
> *Note:* The anarthrous predicate nominative (θεός without the article) is the basis of significant exegetical debate about John 1:1c.

#### Nominative Absolute (Hanging Nominative / *Nominativus Pendens*)
A nominative that stands outside the grammatical structure of the sentence, introducing a topic that is then resumed by a pronoun in a different case. Common in John and Revelation.

> **GNT example:** ὁ νικῶν, δώσω αὐτῷ — "**The one who overcomes** — I will give to **him**..." (Rev 2:26)
>
> *Note:* ὁ νικῶν is nominative but has no grammatical role in the main clause; αὐτῷ (dative) resumes it. This is a Semitic construction reflecting Hebrew/Aramaic influence.

#### Nominative of Address
A nominative used as a form of direct address, functioning like the vocative. Especially common in John's Gospel.

> **GNT example:** ναί, **κύριε** (vocative) vs. **κύριος** used in similar address contexts.
>
> *Note:* The line between nominative of address and true vocative is sometimes blurry; both signal direct address.

#### Nominative of Appellation
Proper names and titles used in nominative form regardless of syntactic function. Particularly common with indeclinable Hebrew names.

> **GNT example:** The name Ἰσραήλ is often used as a nominative of appellation rather than following case requirements strictly.

---

### 3. Accusative Uses

#### Direct Object
The standard use. The accusative receives the action of a transitive verb.

> **GNT example:** ἠγάπησεν ὁ θεὸς τὸν **κόσμον** — "God loved the **world**" (John 3:16)

#### Double Accusative — Person and Thing
Some verbs take two accusative objects: one for the person and one for the thing. Common with verbs of teaching, asking, and clothing.

> **GNT example (διδάσκω):** ταῦτα ἐδίδασκεν... — teaching **them** **these things** (cf. John 14:26)
>
> *Key verbs:* διδάσκω (teach), αἰτέω (ask), ἐνδύω (clothe), ὑπομιμνῄσκω (remind)

#### Double Accusative — Object and Complement
A verb takes an accusative object and an accusative complement that predicates something of the object. The complement renames or describes the object.

> **GNT example:** θήσω αὐτὸν **υἱόν** — "I will make him my **Son**" (Heb 1:5, allusion to Ps 2:7)
>
> *Key verbs:* καλέω (call), τίθημι (make, appoint), ποιέω (make)

#### Cognate Accusative
An accusative direct object formed from the same root as the verb (or closely related). Intensifies or specifies the verbal action. A Hebraism, common in the Septuagint and John.

> **GNT example:** ἐφοβήθησαν **φόβον μέγαν** — "they feared **a great fear**" (Mark 4:41)
>
> *Note:* φόβον (accusative) is cognate with ἐφοβήθησαν (verb). This mirrors the Hebrew infinitive absolute construction.

#### Accusative of Extent of Time
The accusative answers the question "how long?" — the duration of an action.

> **GNT example:** ἔμεινεν ἐκεῖ **δύο ἡμέρας** — "he stayed there **two days**" (John 4:40)

#### Accusative of Extent of Space
The accusative answers the question "how far?" — the distance covered by a movement.

> **GNT example:** ἀπῆλθεν ὡς **λίθου βολήν** — "he withdrew about **a stone's throw**" (Luke 22:41)

#### Accusative of Respect / Reference
The accusative limits or specifies in what respect an adjective or verb applies. Sometimes called the "Greek accusative of specification."

> **GNT example:** τυφλοὺς **τοὺς ὀφθαλμούς** — "blind **with respect to the eyes**"
>
> *Note:* Less common in the GNT than in classical Greek; appears most often in set phrases.

#### Accusative as Subject of Infinitive
In indirect discourse with an infinitive, the subject of the infinitive is put in the accusative case.

> **GNT example:** νομίζουσιν... **αὐτοὺς** εἶναι σοφούς — "they think **them** to be wise" (Rom 1:22, loosely)
>
> *Note:* αὐτούς is the accusative subject of the infinitive εἶναι. This is one of the three constructions for indirect discourse in Greek (ὅτι clause, infinitive, participle).

---

### 4. Display Format

Each use is presented as a card containing:
- **Name** of the use (bold heading)
- **One-sentence definition**
- **GNT example** — Greek text with the relevant word(s) bolded, followed by a translation
- **Reference** — displayed as a link that opens the GNT Reader at that passage (e.g., clicking "John 3:16" navigates to `/reader?ref=John.3.16`)
- **Exegetical note** where the syntax has interpretive significance (optional, collapsible)

Cards within each case section are linked from the sidebar for direct navigation.

**Dependency:** GNT Reader links will be live once the GNT Reader is built. Until then, references are displayed as plain text.

---

## Out of Scope (v1)

- Genitive, Dative, and Vocative uses (follow-on PRD)
- Vocative of address beyond what is noted under Nominative of Address
- Parsing exercises for case identification (covered by Parsing Drills PRD)

---

## Decisions

- **GNT Reader links:** Each example reference links to the GNT Reader at that passage. Links are plain text until the GNT Reader is built.

## Open Questions

- Should exegetical notes be shown by default or hidden behind a "Show note" toggle to keep the cards scannable?
- Should this page also cover the **article** as a separate section (its use as pronoun, with participles, etc.) since it is closely tied to case usage?
