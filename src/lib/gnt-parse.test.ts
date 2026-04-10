/**
 * Tests for src/lib/gnt-parse.ts
 *
 * Covers: extractVerbs, sampleVerbs, gradeGNTAnswer.
 * Uses synthetic MorphBook fixtures — no network calls.
 */

import { describe, expect, it } from 'vitest';
import type { MorphBook } from '../data/morphgnt';
import {
  emptyGNTAnswer,
  extractVerbs,
  type GNTParseAnswer,
  type GNTParseItem,
  gradeGNTAnswer,
  sampleVerbs,
} from './gnt-parse';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Build a minimal MorphBook with a single chapter/verse of provided words. */
function makeBook(
  words: Array<{ text: string; lemma: string; pos: string; parsing: string }>,
): MorphBook {
  return { '1': { '1': words.map((w) => ({ ...w })) } };
}

const FINITE_VERB = { text: 'λύει', lemma: 'λύω', pos: 'V-', parsing: '3PAI-S--' };
// 3=3rd, P=Present, A=Active, I=Indicative, -=no case, S=Singular, -=no gender
const INFINITIVE = { text: 'λύειν', lemma: 'λύω', pos: 'V-', parsing: '-PAN----' };
// -=no person, P=Present, A=Active, N=Infinitive
const PARTICIPLE = { text: 'βοώντος', lemma: 'βοάω', pos: 'V-', parsing: '-PAPGSMX' };
// -=no person, P=Present, A=Active, P=Participle, G=Genitive, S=Singular, M=Masculine
const NOUN = { text: 'ἀρχῇ', lemma: 'ἀρχή', pos: 'N-', parsing: '---DSF--' };

// ---------------------------------------------------------------------------
// extractVerbs
// ---------------------------------------------------------------------------

describe('extractVerbs', () => {
  it('ignores non-verb parts of speech', () => {
    const book = makeBook([NOUN]);
    expect(extractVerbs(book, '1', 'John')).toHaveLength(0);
  });

  it('extracts a finite verb', () => {
    const book = makeBook([FINITE_VERB]);
    const items = extractVerbs(book, '1', 'John');
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.type).toBe('finite');
    expect(item.tense).toBe('present');
    expect(item.voice).toBe('active');
    expect(item.mood).toBe('indicative');
    if (item.type === 'finite') {
      expect(item.person).toBe('3rd');
      expect(item.number).toBe('singular');
    }
    expect(item.form).toBe('λύει');
    expect(item.lemma).toBe('λύω');
    expect(item.verseRef).toBe('John 1:1');
  });

  it('extracts an infinitive', () => {
    const book = makeBook([INFINITIVE]);
    const items = extractVerbs(book, '1', 'John');
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.type).toBe('infinitive');
    expect(item.tense).toBe('present');
    expect(item.voice).toBe('active');
    expect(item.mood).toBe('infinitive');
  });

  it('extracts a participle', () => {
    const book = makeBook([PARTICIPLE]);
    const items = extractVerbs(book, '1', 'John');
    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item.type).toBe('participle');
    expect(item.tense).toBe('present');
    expect(item.voice).toBe('active');
    expect(item.mood).toBe('participle');
    if (item.type === 'participle') {
      expect(item.parseCase).toBe('genitive');
      expect(item.number).toBe('singular');
      expect(item.gender).toBe('masculine');
    }
  });

  it('extracts mixed verbs from the same verse', () => {
    const book = makeBook([NOUN, FINITE_VERB, INFINITIVE, PARTICIPLE]);
    const items = extractVerbs(book, '1', 'John');
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.type).sort()).toEqual(['finite', 'infinitive', 'participle'].sort());
  });

  it('returns empty array for missing chapter', () => {
    const book = makeBook([FINITE_VERB]);
    expect(extractVerbs(book, '99', 'John')).toHaveLength(0);
  });

  it('strips trailing punctuation from form', () => {
    const book = makeBook([{ ...FINITE_VERB, text: 'λύει·' }]);
    const items = extractVerbs(book, '1', 'John');
    expect(items[0].form).toBe('λύει');
  });

  it('records correct wordIndex for highlighting', () => {
    const book = makeBook([NOUN, FINITE_VERB]);
    const items = extractVerbs(book, '1', 'John');
    expect(items[0].wordIndex).toBe(1); // FINITE_VERB is at index 1
  });

  it('skips verbs with unrecognised parse codes', () => {
    const bad = { text: 'foo', lemma: 'foo', pos: 'V-', parsing: '---' }; // too short
    const book = makeBook([bad]);
    expect(extractVerbs(book, '1', 'John')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// sampleVerbs
// ---------------------------------------------------------------------------

describe('sampleVerbs', () => {
  const book = makeBook([FINITE_VERB, INFINITIVE, PARTICIPLE]);
  const all = extractVerbs(book, '1', 'John');

  it('returns at most count items', () => {
    expect(sampleVerbs(all, 2)).toHaveLength(2);
  });

  it('returns all items when count >= length', () => {
    expect(sampleVerbs(all, 10)).toHaveLength(3);
  });

  it('does not mutate the original array', () => {
    const copy = [...all];
    sampleVerbs(all, 2);
    expect(all).toHaveLength(copy.length);
  });
});

// ---------------------------------------------------------------------------
// gradeGNTAnswer — finite verb
// ---------------------------------------------------------------------------

describe('gradeGNTAnswer — finite verb', () => {
  const book = makeBook([FINITE_VERB]);
  const item = extractVerbs(book, '1', 'John')[0] as GNTParseItem;

  it('all correct', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'indicative',
      person: '3rd',
      number: 'singular',
      parseCase: '',
      gender: '',
    };
    const result = gradeGNTAnswer(item, answer);
    expect(result.allCorrect).toBe(true);
    expect(result.tense).toBe(true);
    expect(result.voice).toBe(true);
    expect(result.mood).toBe(true);
    expect(result.person).toBe(true);
    expect(result.number).toBe(true);
    expect(result.parseCase).toBeNull();
    expect(result.gender).toBeNull();
  });

  it('wrong tense', () => {
    const answer: GNTParseAnswer = {
      tense: 'aorist',
      voice: 'active',
      mood: 'indicative',
      person: '3rd',
      number: 'singular',
      parseCase: '',
      gender: '',
    };
    const result = gradeGNTAnswer(item, answer);
    expect(result.allCorrect).toBe(false);
    expect(result.tense).toBe(false);
  });

  it('empty answer — all false', () => {
    const result = gradeGNTAnswer(item, emptyGNTAnswer());
    expect(result.allCorrect).toBe(false);
    expect(result.tense).toBe(false);
    expect(result.voice).toBe(false);
    expect(result.mood).toBe(false);
    expect(result.person).toBe(false);
    expect(result.number).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gradeGNTAnswer — infinitive
// ---------------------------------------------------------------------------

describe('gradeGNTAnswer — infinitive', () => {
  const book = makeBook([INFINITIVE]);
  const item = extractVerbs(book, '1', 'John')[0];

  it('all correct — no person/number/case/gender', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'infinitive',
      person: '',
      number: '',
      parseCase: '',
      gender: '',
    };
    const result = gradeGNTAnswer(item, answer);
    expect(result.allCorrect).toBe(true);
    expect(result.person).toBeNull();
    expect(result.number).toBeNull();
    expect(result.parseCase).toBeNull();
    expect(result.gender).toBeNull();
  });

  it('wrong voice', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'passive',
      mood: 'infinitive',
      person: '',
      number: '',
      parseCase: '',
      gender: '',
    };
    expect(gradeGNTAnswer(item, answer).allCorrect).toBe(false);
    expect(gradeGNTAnswer(item, answer).voice).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gradeGNTAnswer — participle
// ---------------------------------------------------------------------------

describe('gradeGNTAnswer — participle', () => {
  const book = makeBook([PARTICIPLE]);
  const item = extractVerbs(book, '1', 'John')[0];

  it('all correct', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'participle',
      person: '',
      number: 'singular',
      parseCase: 'genitive',
      gender: 'masculine',
    };
    const result = gradeGNTAnswer(item, answer);
    expect(result.allCorrect).toBe(true);
    expect(result.person).toBeNull();
    expect(result.parseCase).toBe(true);
    expect(result.number).toBe(true);
    expect(result.gender).toBe(true);
  });

  it('wrong case', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'participle',
      person: '',
      number: 'singular',
      parseCase: 'nominative',
      gender: 'masculine',
    };
    const result = gradeGNTAnswer(item, answer);
    expect(result.allCorrect).toBe(false);
    expect(result.parseCase).toBe(false);
  });

  it('wrong gender', () => {
    const answer: GNTParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'participle',
      person: '',
      number: 'singular',
      parseCase: 'genitive',
      gender: 'feminine',
    };
    expect(gradeGNTAnswer(item, answer).gender).toBe(false);
  });
});
