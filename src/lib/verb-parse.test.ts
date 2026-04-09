/**
 * Tests for src/lib/verb-parse.ts
 *
 * Covers: buildSession, gradeAnswer, normalizeForm, and type helpers.
 */

import { describe, it, expect } from 'vitest';
import {
  buildSession,
  gradeAnswer,
  normalizeForm,
  emptyAnswer,
  DEFAULT_PARSE_SETTINGS,
  PARSE_TENSES,
  PARSE_VOICES,
  PARSE_MOODS,
  type ParseSettings,
  type ParseAnswer,
} from './verb-parse';

// ---------------------------------------------------------------------------
// normalizeForm
// ---------------------------------------------------------------------------

describe('normalizeForm', () => {
  it('strips parenthesized movable-nu', () => {
    expect(normalizeForm('λύουσι(ν)')).toBe('λύουσι');
  });

  it('leaves plain forms unchanged', () => {
    expect(normalizeForm('λύω')).toBe('λύω');
    expect(normalizeForm('ἔλυσαν')).toBe('ἔλυσαν');
  });
});

// ---------------------------------------------------------------------------
// buildSession
// ---------------------------------------------------------------------------

describe('buildSession', () => {
  it('returns at most the requested count', () => {
    const items = buildSession(DEFAULT_PARSE_SETTINGS, 10);
    expect(items.length).toBeLessThanOrEqual(10);
    expect(items.length).toBeGreaterThan(0);
  });

  it('all items have the required fields', () => {
    const items = buildSession(DEFAULT_PARSE_SETTINGS, 20);
    for (const item of items) {
      expect(item.form).toBeTruthy();
      expect(PARSE_TENSES).toContain(item.tense);
      expect([...PARSE_VOICES, 'mid-pass']).toContain(item.voice);
      expect(PARSE_MOODS).toContain(item.mood);
      expect(['1st', '2nd', '3rd']).toContain(item.person);
      expect(['singular', 'plural']).toContain(item.number);
      expect(item.paradigmLabel).toContain('λύω');
    }
  });

  it('respects tense filter — present only', () => {
    const settings: ParseSettings = {
      ...DEFAULT_PARSE_SETTINGS,
      tenses: ['present'],
    };
    const items = buildSession(settings, 30);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.tense).toBe('present');
    }
  });

  it('respects mood filter — indicative only', () => {
    const settings: ParseSettings = {
      ...DEFAULT_PARSE_SETTINGS,
      moods: ['indicative'],
    };
    const items = buildSession(settings, 30);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.mood).toBe('indicative');
    }
  });

  it('respects voice filter — active only', () => {
    const settings: ParseSettings = {
      ...DEFAULT_PARSE_SETTINGS,
      voices: ['active'],
    };
    const items = buildSession(settings, 30);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      // mid-pass paradigms are excluded when only 'active' is selected
      expect(item.voice).toBe('active');
    }
  });

  it('returns empty array when no paradigms match', () => {
    const settings: ParseSettings = {
      ...DEFAULT_PARSE_SETTINGS,
      // imperfect subjunctive does not exist
      tenses: ['imperfect'],
      moods: ['subjunctive'],
    };
    const items = buildSession(settings, 10);
    expect(items).toHaveLength(0);
  });

  it('present active indicative filter returns only pres-act-ind forms', () => {
    const settings: ParseSettings = {
      tenses: ['present'],
      voices: ['active'],
      moods: ['indicative'],
      sessionLength: 10,
    };
    const items = buildSession(settings, 30);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.tense).toBe('present');
      expect(item.voice).toBe('active');
      expect(item.mood).toBe('indicative');
    }
  });

  it('de-duplicates forms that appear in multiple paradigms', () => {
    const items = buildSession(DEFAULT_PARSE_SETTINGS, 200);
    const forms = items.map(i => normalizeForm(i.form));
    const unique = new Set(forms);
    expect(forms.length).toBe(unique.size);
  });
});

// ---------------------------------------------------------------------------
// gradeAnswer
// ---------------------------------------------------------------------------

describe('gradeAnswer', () => {
  const presActIndItem = {
    form: 'λύω',
    tense: 'present' as const,
    voice: 'active' as const,
    mood: 'indicative' as const,
    person: '1st' as const,
    number: 'singular' as const,
    paradigmLabel: 'Present Active Indicative — λύω',
  };

  it('returns allCorrect=true for a fully correct answer', () => {
    const answer: ParseAnswer = {
      tense: 'present',
      voice: 'active',
      mood: 'indicative',
      person: '1st',
      number: 'singular',
    };
    const result = gradeAnswer(presActIndItem, answer);
    expect(result.allCorrect).toBe(true);
    expect(result.tense).toBe(true);
    expect(result.voice).toBe(true);
    expect(result.mood).toBe(true);
    expect(result.person).toBe(true);
    expect(result.number).toBe(true);
  });

  it('returns allCorrect=false when any property is wrong', () => {
    const answer: ParseAnswer = {
      tense: 'aorist', // wrong
      voice: 'active',
      mood: 'indicative',
      person: '1st',
      number: 'singular',
    };
    const result = gradeAnswer(presActIndItem, answer);
    expect(result.allCorrect).toBe(false);
    expect(result.tense).toBe(false);
    expect(result.voice).toBe(true);
  });

  it('accepts "middle" or "passive" for a mid-pass paradigm', () => {
    const midPassItem = {
      ...presActIndItem,
      voice: 'mid-pass' as const,
      paradigmLabel: 'Present Middle/Passive Indicative — λύω',
    };
    const withMiddle: ParseAnswer = { ...emptyAnswer(), voice: 'middle', tense: 'present', mood: 'indicative', person: '1st', number: 'singular' };
    const withPassive: ParseAnswer = { ...emptyAnswer(), voice: 'passive', tense: 'present', mood: 'indicative', person: '1st', number: 'singular' };
    expect(gradeAnswer(midPassItem, withMiddle).voice).toBe(true);
    expect(gradeAnswer(midPassItem, withPassive).voice).toBe(true);
  });

  it('rejects wrong voice for mid-pass paradigm', () => {
    const midPassItem = {
      ...presActIndItem,
      voice: 'mid-pass' as const,
    };
    const withActive: ParseAnswer = { ...emptyAnswer(), voice: 'active', tense: 'present', mood: 'indicative', person: '1st', number: 'singular' };
    expect(gradeAnswer(midPassItem, withActive).voice).toBe(false);
  });

  it('handles empty answers — all false', () => {
    const result = gradeAnswer(presActIndItem, emptyAnswer());
    expect(result.allCorrect).toBe(false);
    expect(result.tense).toBe(false);
    expect(result.voice).toBe(false);
    expect(result.mood).toBe(false);
    expect(result.person).toBe(false);
    expect(result.number).toBe(false);
  });
});
