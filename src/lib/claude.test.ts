import { describe, it, expect } from 'vitest';
import {
  buildChallengePrompt,
  buildExplanationPrompt,
  parseChallengeResponse,
  checkAnswer,
  type ChallengeResponse,
  type ParseSelection,
} from './claude';
import type { DrillWord } from '../data/morphgnt-drill-pool';

// ─── Sample data ──────────────────────────────────────────────────────────────

const sampleWord: DrillWord = {
  word: 'θεός',
  lemma: 'θεός',
  pos: 'N-',
  parsing: '----NSM-',
  gloss: 'God',
};

const sampleCandidates: DrillWord[] = [sampleWord];

// ─── buildChallengePrompt ─────────────────────────────────────────────────────

describe('buildChallengePrompt', () => {
  it('returns an object with system and user strings', () => {
    const result = buildChallengePrompt(sampleCandidates);
    expect(typeof result.system).toBe('string');
    expect(typeof result.user).toBe('string');
  });

  it('includes word data in user prompt', () => {
    const result = buildChallengePrompt(sampleCandidates);
    expect(result.user).toContain('θεός');
    expect(result.user).toContain('N-');
    expect(result.user).toContain('----NSM-');
  });

  it('includes JSON schema reminder in system prompt', () => {
    const result = buildChallengePrompt(sampleCandidates);
    expect(result.system).toContain('"word"');
    expect(result.system).toContain('"parsing"');
  });

  it('numbers each candidate in the user prompt', () => {
    const candidates: DrillWord[] = [
      sampleWord,
      { word: 'λόγος', lemma: 'λόγος', pos: 'N-', parsing: '----NSM-', gloss: 'word' },
    ];
    const result = buildChallengePrompt(candidates);
    expect(result.user).toContain('1.');
    expect(result.user).toContain('2.');
  });
});

// ─── buildExplanationPrompt ───────────────────────────────────────────────────

describe('buildExplanationPrompt', () => {
  it('includes all required fields in the prompt', () => {
    const result = buildExplanationPrompt({
      word: 'ἔλυσεν',
      lemma: 'λύω',
      correctParse: '3rd Singular Aorist Active Indicative',
      studentParse: '3rd Singular Present Active Indicative',
      pos: 'V-',
    });
    expect(result).toContain('ἔλυσεν');
    expect(result).toContain('λύω');
    expect(result).toContain('Aorist Active Indicative');
    expect(result).toContain('Present Active Indicative');
  });

  it('requests plain text output', () => {
    const result = buildExplanationPrompt({
      word: 'ἔλυσεν',
      lemma: 'λύω',
      correctParse: 'correct',
      studentParse: 'wrong',
      pos: 'V-',
    });
    expect(result.toLowerCase()).toContain('plain text');
  });
});

// ─── parseChallengeResponse ───────────────────────────────────────────────────

describe('parseChallengeResponse', () => {
  const validResponse = JSON.stringify({
    word: 'θεός',
    lemma: 'θεός',
    gloss: 'God',
    pos: 'N-',
    parsing: '----NSM-',
  });

  it('parses a valid JSON response', () => {
    const result = parseChallengeResponse(validResponse);
    expect(result).not.toBeNull();
    expect(result?.word).toBe('θεός');
    expect(result?.parsing).toBe('----NSM-');
  });

  it('strips markdown code fences', () => {
    const fenced = '```json\n' + validResponse + '\n```';
    const result = parseChallengeResponse(fenced);
    expect(result).not.toBeNull();
    expect(result?.word).toBe('θεός');
  });

  it('strips plain code fences without language tag', () => {
    const fenced = '```\n' + validResponse + '\n```';
    expect(parseChallengeResponse(fenced)).not.toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseChallengeResponse('not json')).toBeNull();
  });

  it('returns null if parsing is not 8 characters', () => {
    const bad = JSON.stringify({ word: 'θεός', lemma: 'θεός', gloss: 'God', pos: 'N-', parsing: 'SHORT' });
    expect(parseChallengeResponse(bad)).toBeNull();
  });

  it('returns null if required field is missing', () => {
    const noGloss = JSON.stringify({ word: 'θεός', lemma: 'θεός', pos: 'N-', parsing: '----NSM-' });
    expect(parseChallengeResponse(noGloss)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseChallengeResponse('')).toBeNull();
  });
});

// ─── checkAnswer ─────────────────────────────────────────────────────────────

describe('checkAnswer — nominals (N-)', () => {
  const challenge: Pick<ChallengeResponse, 'pos' | 'parsing'> = {
    pos: 'N-',
    parsing: '----NSM-', // Nominative Singular Masculine
  };

  it('returns true for correct case/number/gender', () => {
    const sel: ParseSelection = { case: 'N', number: 'S', gender: 'M' };
    expect(checkAnswer(challenge, sel)).toBe(true);
  });

  it('returns false for wrong case', () => {
    expect(checkAnswer(challenge, { case: 'G', number: 'S', gender: 'M' })).toBe(false);
  });

  it('returns false for wrong number', () => {
    expect(checkAnswer(challenge, { case: 'N', number: 'P', gender: 'M' })).toBe(false);
  });

  it('returns false for wrong gender', () => {
    expect(checkAnswer(challenge, { case: 'N', number: 'S', gender: 'F' })).toBe(false);
  });
});

describe('checkAnswer — adjectives (A-)', () => {
  const challenge = { pos: 'A-', parsing: '----GSF-' }; // Genitive Singular Feminine

  it('returns true for correct parse', () => {
    expect(checkAnswer(challenge, { case: 'G', number: 'S', gender: 'F' })).toBe(true);
  });

  it('returns false for wrong gender', () => {
    expect(checkAnswer(challenge, { case: 'G', number: 'S', gender: 'M' })).toBe(false);
  });
});

describe('checkAnswer — article (RA)', () => {
  const challenge = { pos: 'RA', parsing: '----DPM-' }; // Dative Plural Masculine

  it('returns true for correct parse', () => {
    expect(checkAnswer(challenge, { case: 'D', number: 'P', gender: 'M' })).toBe(true);
  });
});

describe('checkAnswer — finite verb (V-)', () => {
  const challenge: Pick<ChallengeResponse, 'pos' | 'parsing'> = {
    pos: 'V-',
    parsing: '3PAI-S--', // 3rd Person Present Active Indicative Singular
  };

  it('returns true for correct person/tense/voice/mood/number', () => {
    const sel: ParseSelection = { person: '3', tense: 'P', voice: 'A', mood: 'I', number: 'S' };
    expect(checkAnswer(challenge, sel)).toBe(true);
  });

  it('returns false for wrong person', () => {
    expect(checkAnswer(challenge, { person: '1', tense: 'P', voice: 'A', mood: 'I', number: 'S' })).toBe(false);
  });

  it('returns false for wrong tense', () => {
    expect(checkAnswer(challenge, { person: '3', tense: 'A', voice: 'A', mood: 'I', number: 'S' })).toBe(false);
  });

  it('returns false for wrong voice', () => {
    expect(checkAnswer(challenge, { person: '3', tense: 'P', voice: 'P', mood: 'I', number: 'S' })).toBe(false);
  });

  it('returns false for wrong mood', () => {
    expect(checkAnswer(challenge, { person: '3', tense: 'P', voice: 'A', mood: 'S', number: 'S' })).toBe(false);
  });

  it('returns false for wrong number', () => {
    expect(checkAnswer(challenge, { person: '3', tense: 'P', voice: 'A', mood: 'I', number: 'P' })).toBe(false);
  });
});

describe('checkAnswer — infinitive (V- mood=N)', () => {
  const challenge = { pos: 'V-', parsing: '-PAN----' }; // Present Active Infinitive

  it('returns true for correct tense + voice', () => {
    expect(checkAnswer(challenge, { tense: 'P', voice: 'A' })).toBe(true);
  });

  it('returns false for wrong tense', () => {
    expect(checkAnswer(challenge, { tense: 'A', voice: 'A' })).toBe(false);
  });

  it('returns false for wrong voice', () => {
    expect(checkAnswer(challenge, { tense: 'P', voice: 'P' })).toBe(false);
  });
});

describe('checkAnswer — aorist passive infinitive', () => {
  const challenge = { pos: 'V-', parsing: '-APN----' }; // Aorist Passive Infinitive

  it('returns true for correct parse', () => {
    expect(checkAnswer(challenge, { tense: 'A', voice: 'P' })).toBe(true);
  });
});

describe('checkAnswer — participle (V- mood=P)', () => {
  const challenge = { pos: 'V-', parsing: '-PAPNSM-' }; // Present Active Participle Nom Sg Masc

  it('returns true for all correct fields', () => {
    const sel: ParseSelection = { tense: 'P', voice: 'A', case: 'N', number: 'S', gender: 'M' };
    expect(checkAnswer(challenge, sel)).toBe(true);
  });

  it('returns false for wrong tense', () => {
    expect(checkAnswer(challenge, { tense: 'A', voice: 'A', case: 'N', number: 'S', gender: 'M' })).toBe(false);
  });

  it('returns false for wrong case', () => {
    expect(checkAnswer(challenge, { tense: 'P', voice: 'A', case: 'G', number: 'S', gender: 'M' })).toBe(false);
  });

  it('returns false for wrong gender', () => {
    expect(checkAnswer(challenge, { tense: 'P', voice: 'A', case: 'N', number: 'S', gender: 'F' })).toBe(false);
  });
});

describe('checkAnswer — aorist passive participle', () => {
  const challenge = { pos: 'V-', parsing: '-APPGSF-' }; // Aorist Passive Participle Gen Sg Fem

  it('returns true for correct parse', () => {
    expect(checkAnswer(challenge, { tense: 'A', voice: 'P', case: 'G', number: 'S', gender: 'F' })).toBe(true);
  });
});

describe('checkAnswer — unsupported POS', () => {
  it('returns false for preposition', () => {
    expect(checkAnswer({ pos: 'P-', parsing: '--------' }, {})).toBe(false);
  });

  it('returns false for conjunction', () => {
    expect(checkAnswer({ pos: 'CC', parsing: '--------' }, {})).toBe(false);
  });
});
