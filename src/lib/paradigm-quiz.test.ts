/**
 * Tests for src/lib/paradigm-quiz.ts
 *
 * Covers: buildTableModels, getQuizCells, applyDensity,
 * and the category/density utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  buildTableModels,
  getQuizCells,
  applyDensity,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type TableModel,
  type Density,
} from './paradigm-quiz';

// ---------------------------------------------------------------------------
// buildTableModels
// ---------------------------------------------------------------------------

describe('buildTableModels', () => {
  it('returns models for all four categories', () => {
    const tables = buildTableModels();
    const categories = new Set(tables.map(t => t.category));
    expect(categories).toContain('noun');
    expect(categories).toContain('adjective');
    expect(categories).toContain('verb');
    expect(categories).toContain('pronoun');
  });

  it('all models have required fields', () => {
    const tables = buildTableModels();
    for (const t of tables) {
      expect(t.id).toBeTruthy();
      expect(t.label).toBeTruthy();
      expect(t.cols.length).toBeGreaterThan(0);
      expect(t.rows.length).toBeGreaterThan(0);
    }
  });

  it('each row has answers matching the cols count', () => {
    const tables = buildTableModels();
    for (const t of tables) {
      for (const row of t.rows) {
        expect(row.answers).toHaveLength(t.cols.length);
      }
    }
  });

  // ── Nouns ────────────────────────────────────────────────────────────────

  it('includes all 9 noun paradigms', () => {
    const tables = buildTableModels();
    const nouns = tables.filter(t => t.category === 'noun');
    expect(nouns.length).toBe(9);
  });

  it('noun tables have 2 columns (Singular, Plural)', () => {
    const tables = buildTableModels();
    const nouns = tables.filter(t => t.category === 'noun');
    for (const noun of nouns) {
      expect(noun.cols).toHaveLength(2);
      expect(noun.cols[0]).toBe('Singular');
      expect(noun.cols[1]).toBe('Plural');
    }
  });

  it('noun tables have 5 rows (cases)', () => {
    const tables = buildTableModels();
    const nouns = tables.filter(t => t.category === 'noun');
    for (const noun of nouns) {
      expect(noun.rows).toHaveLength(5);
    }
  });

  it('noun tables have no null answers', () => {
    const tables = buildTableModels();
    const nouns = tables.filter(t => t.category === 'noun');
    for (const noun of nouns) {
      for (const row of noun.rows) {
        expect(row.answers.every(a => a !== null)).toBe(true);
      }
    }
  });

  // ── Adjectives ───────────────────────────────────────────────────────────

  it('includes both adjective paradigms', () => {
    const tables = buildTableModels();
    const adjs = tables.filter(t => t.category === 'adjective');
    expect(adjs.length).toBe(2);
  });

  it('adjective tables have 6 columns (3 genders × 2 numbers)', () => {
    const tables = buildTableModels();
    const adjs = tables.filter(t => t.category === 'adjective');
    for (const adj of adjs) {
      expect(adj.cols).toHaveLength(6);
      expect(adj.colGroups).toHaveLength(2);
    }
  });

  it('adjective tables have 5 rows (cases)', () => {
    const tables = buildTableModels();
    const adjs = tables.filter(t => t.category === 'adjective');
    for (const adj of adjs) {
      expect(adj.rows).toHaveLength(5);
    }
  });

  // ── Verbs ────────────────────────────────────────────────────────────────

  it('includes verb paradigms including infinitives and participles', () => {
    const tables = buildTableModels();
    const verbs = tables.filter(t => t.category === 'verb');
    const ids = verbs.map(v => v.id);
    expect(ids).toContain('verb-infinitives');
    expect(ids).toContain('verb-participles');
  });

  it('verb conjugation tables have 1 column (Form)', () => {
    const tables = buildTableModels();
    const conj = tables.filter(t => t.category === 'verb' && !['verb-infinitives', 'verb-participles'].includes(t.id));
    for (const v of conj) {
      expect(v.cols).toHaveLength(1);
      expect(v.cols[0]).toBe('Form');
    }
  });

  it('participle table has 3 columns (M, F, N)', () => {
    const tables = buildTableModels();
    const participles = tables.find(t => t.id === 'verb-participles')!;
    expect(participles.cols).toHaveLength(3);
  });

  it('imperative paradigms have null answers for missing person-numbers', () => {
    const tables = buildTableModels();
    const impv = tables.find(t => t.id === 'verb-pres-act-imp');
    // Imperative has no 1sg or 1pl — row for 1sg should have null or the row is excluded
    // (our implementation filters rows where 1sg/1pl is null for imperative)
    if (impv) {
      const allAnswers = impv.rows.flatMap(r => r.answers);
      // At most 4 non-null answers (2sg, 3sg, 2pl, 3pl)
      const nonNull = allAnswers.filter(a => a !== null);
      expect(nonNull.length).toBeLessThanOrEqual(4);
    }
  });

  // ── Pronouns ─────────────────────────────────────────────────────────────

  it('includes pronouns for ἐγώ and σύ', () => {
    const tables = buildTableModels();
    const pronouns = tables.filter(t => t.category === 'pronoun');
    const ids = pronouns.map(p => p.id);
    expect(ids).toContain('pronoun-ego');
    expect(ids).toContain('pronoun-su');
  });

  it('includes gendered pronouns (αὐτός, οὗτος, ἐκεῖνος, ὅς, τίς)', () => {
    const tables = buildTableModels();
    const pronounIds = tables.filter(t => t.category === 'pronoun').map(t => t.id);
    expect(pronounIds).toContain('pronoun-autos');
    expect(pronounIds).toContain('pronoun-outos');
    expect(pronounIds).toContain('pronoun-ekeinos');
    expect(pronounIds).toContain('pronoun-hos');
    expect(pronounIds).toContain('pronoun-tis');
  });

  it('personal pronoun tables have 2 columns (Singular, Plural)', () => {
    const tables = buildTableModels();
    const ego = tables.find(t => t.id === 'pronoun-ego')!;
    expect(ego.cols).toHaveLength(2);
  });

  it('gendered pronoun tables have 6 columns and col groups', () => {
    const tables = buildTableModels();
    const autos = tables.find(t => t.id === 'pronoun-autos')!;
    expect(autos.cols).toHaveLength(6);
    expect(autos.colGroups).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// getQuizCells
// ---------------------------------------------------------------------------

describe('getQuizCells', () => {
  it('returns one cell per non-null answer', () => {
    const tables = buildTableModels();
    const noun = tables.find(t => t.category === 'noun')!;
    const cells = getQuizCells(noun);
    // 5 cases × 2 numbers = 10 cells
    expect(cells).toHaveLength(10);
  });

  it('cell indices are unique', () => {
    const tables = buildTableModels();
    for (const t of tables) {
      const cells = getQuizCells(t);
      const indices = cells.map(c => c.index);
      expect(new Set(indices).size).toBe(indices.length);
    }
  });

  it('cells have correct rowIndex and colIndex', () => {
    const tables = buildTableModels();
    const noun = tables.find(t => t.category === 'noun')!;
    const cells = getQuizCells(noun);
    // First cell: row 0, col 0 (Nom Sg)
    const first = cells[0];
    expect(first.rowIndex).toBe(0);
    expect(first.colIndex).toBe(0);
    // Last cell: row 4, col 1 (Voc Pl)
    const last = cells[cells.length - 1];
    expect(last.rowIndex).toBe(4);
    expect(last.colIndex).toBe(1);
  });

  it('all cells start with isBlank=false', () => {
    const tables = buildTableModels();
    const noun = tables.find(t => t.category === 'noun')!;
    const cells = getQuizCells(noun);
    expect(cells.every(c => !c.isBlank)).toBe(true);
  });

  it('cells with null answers are excluded', () => {
    // Imperative paradigm has missing forms (1sg, 1pl)
    const tables = buildTableModels();
    const impv = tables.find(t => t.id === 'verb-pres-act-imp');
    if (impv) {
      const cells = getQuizCells(impv);
      expect(cells.every(c => c.answer !== null)).toBe(true);
    }
  });

  it('cell.answer matches the table data', () => {
    const tables = buildTableModels();
    const noun = tables.find(t => t.id === 'noun-1f-alpha-pure')!;
    const cells = getQuizCells(noun);
    // Nom Sg of ἡμέρα is ἡμέρα
    const nomSg = cells.find(c => c.rowIndex === 0 && c.colIndex === 0)!;
    expect(nomSg.answer).toBe('ἡμέρα');
    // Gen Pl of ἡμέρα is ἡμερῶν
    const genPl = cells.find(c => c.rowIndex === 1 && c.colIndex === 1)!;
    expect(genPl.answer).toBe('ἡμερῶν');
  });
});

// ---------------------------------------------------------------------------
// applyDensity
// ---------------------------------------------------------------------------

describe('applyDensity', () => {
  function makeCells(n: number) {
    return Array.from({ length: n }, (_, i) => ({
      index: i,
      rowIndex: 0,
      colIndex: i,
      answer: `form${i}`,
      isBlank: false,
    }));
  }

  it('easy mode blanks ~25% of cells', () => {
    const cells = makeCells(20);
    const result = applyDensity(cells, 'easy');
    const blanked = result.filter(c => c.isBlank).length;
    expect(blanked).toBe(5); // 20 * 0.25 = 5
  });

  it('medium mode blanks ~50% of cells', () => {
    const cells = makeCells(20);
    const result = applyDensity(cells, 'medium');
    const blanked = result.filter(c => c.isBlank).length;
    expect(blanked).toBe(10);
  });

  it('hard mode blanks all cells', () => {
    const cells = makeCells(10);
    const result = applyDensity(cells, 'hard');
    expect(result.every(c => c.isBlank)).toBe(true);
  });

  it('always blanks at least 1 cell', () => {
    const cells = makeCells(1);
    const densities: Density[] = ['easy', 'medium', 'hard'];
    for (const d of densities) {
      const result = applyDensity(cells, d);
      expect(result.filter(c => c.isBlank).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('does not modify non-blank cells', () => {
    const cells = makeCells(10);
    const result = applyDensity(cells, 'medium');
    // All cells should still be present
    expect(result).toHaveLength(10);
    // Answers should be unchanged
    result.forEach((c, i) => {
      expect(c.answer).toBe(cells[i].answer);
      expect(c.index).toBe(cells[i].index);
    });
  });

  it('returns a new array (does not mutate input)', () => {
    const cells = makeCells(10);
    const result = applyDensity(cells, 'medium');
    // Original cells should all still have isBlank=false
    expect(cells.every(c => !c.isBlank)).toBe(true);
    // Result should have some blanks
    expect(result.some(c => c.isBlank)).toBe(true);
  });

  it('blank selection is random (different results across calls)', () => {
    const cells = makeCells(10);
    const runs = Array.from({ length: 10 }, () =>
      applyDensity(cells, 'medium')
        .filter(c => c.isBlank)
        .map(c => c.index)
        .join(','),
    );
    // At least 2 unique blank patterns across 10 runs (probabilistic)
    const unique = new Set(runs);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Category utilities
// ---------------------------------------------------------------------------

describe('ALL_CATEGORIES', () => {
  it('contains all four categories', () => {
    expect(ALL_CATEGORIES).toContain('noun');
    expect(ALL_CATEGORIES).toContain('adjective');
    expect(ALL_CATEGORIES).toContain('verb');
    expect(ALL_CATEGORIES).toContain('pronoun');
    expect(ALL_CATEGORIES).toHaveLength(4);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has a label for every category', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy();
    }
  });
});
