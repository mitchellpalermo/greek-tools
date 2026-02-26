/**
 * Tests for src/lib/greek-input.ts
 *
 * Covers: applyFinalSigma, normalizeAnswer, stripDiacritics,
 * checkAnswer, and processGreekKey.
 */

import { describe, it, expect } from 'vitest';
import {
  applyFinalSigma,
  normalizeAnswer,
  stripDiacritics,
  checkAnswer,
  processGreekKey,
  GREEK_MAP,
  DIACRITIC_MAP,
} from './greek-input';

// ---------------------------------------------------------------------------
// applyFinalSigma
// ---------------------------------------------------------------------------

describe('applyFinalSigma', () => {
  it('converts word-final σ to ς', () => {
    expect(applyFinalSigma('λόγος')).toBe('λόγος');       // already ς
    expect(applyFinalSigma('λόγοσ')).toBe('λόγος');       // trailing σ → ς
  });

  it('does not convert medial σ', () => {
    expect(applyFinalSigma('σάρξ')).toBe('σάρξ');
    expect(applyFinalSigma('πίστισ εστι')).toBe('πίστις εστι');
  });

  it('converts σ at end of string', () => {
    expect(applyFinalSigma('λυουσι')).toBe('λυουσι'); // ends in ι, no σ
    expect(applyFinalSigma('λυουσ')).toBe('λυους');    // ends in σ
  });

  it('converts σ before punctuation', () => {
    expect(applyFinalSigma('λόγοσ, καί')).toBe('λόγος, καί');
    expect(applyFinalSigma('λόγοσ.')).toBe('λόγος.');
  });

  it('leaves text without σ unchanged', () => {
    expect(applyFinalSigma('ἐλύθην')).toBe('ἐλύθην');
  });
});

// ---------------------------------------------------------------------------
// normalizeAnswer
// ---------------------------------------------------------------------------

describe('normalizeAnswer', () => {
  it('strips movable-nu notation (ν)', () => {
    expect(normalizeAnswer('λύουσι(ν)')).toBe('λύουσι');
    expect(normalizeAnswer('ἔλυε(ν)')).toBe('ἔλυε');
  });

  it('trims whitespace', () => {
    expect(normalizeAnswer('  λύω  ')).toBe('λύω');
  });

  it('applies NFC normalization', () => {
    // NFD decomposed form → NFC
    const nfd = '\u03bb\u03cd\u03c9'; // λύω as separate codepoints (NFD-like)
    const nfc = 'λύω';
    expect(normalizeAnswer(nfd)).toBe(nfc.normalize('NFC'));
  });

  it('leaves forms without (ν) unchanged', () => {
    expect(normalizeAnswer('λύω')).toBe('λύω');
  });
});

// ---------------------------------------------------------------------------
// stripDiacritics
// ---------------------------------------------------------------------------

describe('stripDiacritics', () => {
  it('removes accents from Greek text', () => {
    expect(stripDiacritics('λύω')).toBe('λυω');
    expect(stripDiacritics('ἡμέρα')).toBe('ημερα');
  });

  it('removes breathings', () => {
    expect(stripDiacritics('οὗτος')).toBe('ουτος');
    expect(stripDiacritics('ἄνθρωπος')).toBe('ανθρωπος');
  });

  it('removes iota subscript', () => {
    expect(stripDiacritics('ἡμέρᾳ')).toBe('ημερα');
  });

  it('leaves plain text unchanged', () => {
    expect(stripDiacritics('λυω')).toBe('λυω');
  });
});

// ---------------------------------------------------------------------------
// checkAnswer
// ---------------------------------------------------------------------------

describe('checkAnswer', () => {
  it('returns correct for exact match', () => {
    expect(checkAnswer('λύω', 'λύω')).toBe('correct');
  });

  it('returns correct for match after applying final sigma', () => {
    // User types 'λόγος' with raw sigma → applyFinalSigma converts it
    expect(checkAnswer('λόγος', 'λόγος')).toBe('correct');
  });

  it('returns correct when user omits movable nu from (ν) form', () => {
    expect(checkAnswer('λύουσι', 'λύουσι(ν)')).toBe('correct');
  });

  it('returns correct when user includes nu in (ν) form', () => {
    expect(checkAnswer('λύουσιν', 'λύουσι(ν)')).toBe('correct');
  });

  it('returns correct ignoring leading/trailing whitespace in input', () => {
    expect(checkAnswer('  λύω  ', 'λύω')).toBe('correct');
  });

  it('returns accent-only when consonants match but accent differs', () => {
    // λυω (no accent) vs λύω (acute on upsilon)
    expect(checkAnswer('λυω', 'λύω')).toBe('accent-only');
  });

  it('returns accent-only for wrong accent position', () => {
    // λῦω (circumflex) vs λύω (acute)
    expect(checkAnswer('λῦω', 'λύω')).toBe('accent-only');
  });

  it('returns wrong for different form', () => {
    expect(checkAnswer('λύεις', 'λύω')).toBe('wrong');
  });

  it('returns wrong for empty input', () => {
    expect(checkAnswer('', 'λύω')).toBe('wrong');
  });

  it('returns wrong for completely wrong input', () => {
    expect(checkAnswer('abc', 'λύω')).toBe('wrong');
  });
});

// ---------------------------------------------------------------------------
// processGreekKey
// ---------------------------------------------------------------------------

describe('processGreekKey', () => {
  it('returns Greek letter for mapped ASCII key', () => {
    const result = processGreekKey('l', false);
    expect(result.preventDefault).toBe(true);
    expect(result.append).toBe('λ');
  });

  it('returns diacritic for / key', () => {
    const result = processGreekKey('/', false);
    expect(result.preventDefault).toBe(true);
    expect(result.append).toBe('\u0301'); // acute
  });

  it('returns ano teleia for : key', () => {
    const result = processGreekKey(':', false);
    expect(result.preventDefault).toBe(true);
    expect(result.append).toBe('·');
  });

  it('returns Greek question mark for ? key', () => {
    const result = processGreekKey('?', false);
    expect(result.preventDefault).toBe(true);
    expect(result.append).toBe(';');
  });

  it('passes through when ctrl/meta is held', () => {
    const result = processGreekKey('l', true);
    expect(result.preventDefault).toBe(false);
    expect(result.append).toBeNull();
  });

  it('passes through unmapped keys', () => {
    const result = processGreekKey('F1', false);
    expect(result.preventDefault).toBe(false);
    expect(result.append).toBeNull();
  });

  it('passes through arrow keys', () => {
    const result = processGreekKey('ArrowLeft', false);
    expect(result.preventDefault).toBe(false);
    expect(result.append).toBeNull();
  });

  it('maps all lowercase letter keys in GREEK_MAP', () => {
    const lowerKeys = Object.keys(GREEK_MAP).filter(k => k === k.toLowerCase());
    for (const key of lowerKeys) {
      const result = processGreekKey(key, false);
      expect(result.preventDefault).toBe(true);
      expect(result.append).toBe(GREEK_MAP[key]);
    }
  });

  it('maps all diacritic keys in DIACRITIC_MAP', () => {
    for (const [key, char] of Object.entries(DIACRITIC_MAP)) {
      const result = processGreekKey(key, false);
      expect(result.preventDefault).toBe(true);
      expect(result.append).toBe(char);
    }
  });
});
