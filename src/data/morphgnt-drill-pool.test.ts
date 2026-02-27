import { describe, it, expect } from 'vitest';
import { DRILL_POOL, sampleDrillPool, type DrillWord } from './morphgnt-drill-pool';

describe('DRILL_POOL', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DRILL_POOL)).toBe(true);
    expect(DRILL_POOL.length).toBeGreaterThan(100);
  });

  it('every entry has required DrillWord fields', () => {
    for (const w of DRILL_POOL) {
      expect(typeof w.word).toBe('string');
      expect(w.word.length).toBeGreaterThan(0);
      expect(typeof w.lemma).toBe('string');
      expect(w.lemma.length).toBeGreaterThan(0);
      expect(typeof w.pos).toBe('string');
      expect(w.pos.length).toBe(2);
      expect(typeof w.parsing).toBe('string');
      expect(w.parsing.length).toBe(8);
      expect(typeof w.gloss).toBe('string');
      expect(w.gloss.length).toBeGreaterThan(0);
    }
  });

  it('contains a mix of pos types', () => {
    const posSet = new Set(DRILL_POOL.map(w => w.pos));
    expect(posSet.has('N-')).toBe(true); // Noun
    expect(posSet.has('A-')).toBe(true); // Adjective
    expect(posSet.has('V-')).toBe(true); // Verb
  });

  it('contains infinitives (mood position = N)', () => {
    const infinitives = DRILL_POOL.filter(w => w.pos === 'V-' && w.parsing[3] === 'N');
    expect(infinitives.length).toBeGreaterThan(0);
  });

  it('contains participles (mood position = P)', () => {
    const participles = DRILL_POOL.filter(w => w.pos === 'V-' && w.parsing[3] === 'P');
    expect(participles.length).toBeGreaterThan(0);
  });

  it('contains finite verbs', () => {
    const finite = DRILL_POOL.filter(
      w => w.pos === 'V-' && w.parsing[3] !== 'N' && w.parsing[3] !== 'P',
    );
    expect(finite.length).toBeGreaterThan(0);
  });
});

describe('sampleDrillPool', () => {
  it('returns the requested number of words', () => {
    const sample = sampleDrillPool(20);
    expect(sample.length).toBe(20);
  });

  it('returns fewer words than requested if pool is smaller', () => {
    const sample = sampleDrillPool(99999);
    expect(sample.length).toBe(DRILL_POOL.length);
  });

  it('returns no duplicates within a sample', () => {
    const sample = sampleDrillPool(50);
    const words = sample.map((w: DrillWord) => w.word + w.parsing);
    const unique = new Set(words);
    expect(unique.size).toBe(sample.length);
  });

  it('returns DrillWord objects with valid structure', () => {
    const sample = sampleDrillPool(5);
    for (const w of sample) {
      expect(w.parsing.length).toBe(8);
      expect(w.pos.length).toBe(2);
    }
  });

  it('does not mutate the original DRILL_POOL', () => {
    const originalLength = DRILL_POOL.length;
    const originalFirst = DRILL_POOL[0].word;
    sampleDrillPool(20);
    expect(DRILL_POOL.length).toBe(originalLength);
    expect(DRILL_POOL[0].word).toBe(originalFirst);
  });
});
