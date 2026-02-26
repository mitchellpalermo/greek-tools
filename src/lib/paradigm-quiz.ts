/**
 * Paradigm Quiz — data model and game logic.
 *
 * Converts raw grammar data (nounParadigms, verbParadigms, etc.) into a
 * unified TableModel structure, then manages which cells are blanked and
 * how to score the student's answers.
 */

import {
  CASES,
  NUMBERS,
  GENDERS,
  PERSONS,
  CASE_LABELS,
  NUM_LABELS,
  GENDER_LABELS,
  PERSON_LABELS,
  nounParadigms,
  adjParadigms,
  verbParadigms,
  infinitiveForms,
  participleRows,
  personalPronouns12,
  genderedPronouns,
} from '../data/grammar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A quiz-friendly, flat representation of a single paradigm table. */
export interface TableModel {
  id: string;
  label: string;
  category: 'noun' | 'adjective' | 'verb' | 'pronoun';
  /** Optional top-level grouping header spanning multiple leaf columns. */
  colGroups?: string[];
  /** Leaf-level column headers. */
  cols: string[];
  /**
   * Rows: each row has a label (e.g., "Nom") and one answer per leaf column.
   * null means the form doesn't exist (e.g., 1sg imperative) — never blanked.
   */
  rows: TableRow[];
}

export interface TableRow {
  label: string;
  answers: (string | null)[];
}

/** Quiz difficulty — controls the fraction of cells that are blanked. */
export type Density = 'easy' | 'medium' | 'hard';

/** Result of grading a single blank cell. */
export type CellResult = 'correct' | 'accent-only' | 'wrong';

/** A single scoreable quiz cell (only cells with non-null answers). */
export interface QuizCell {
  /** Flat index into the cells array: rowIndex * cols.length + colIndex. */
  index: number;
  rowIndex: number;
  colIndex: number;
  answer: string;
  isBlank: boolean;
}

// ---------------------------------------------------------------------------
// Table builders
// ---------------------------------------------------------------------------

/** Build all available TableModels from grammar data. */
export function buildTableModels(): TableModel[] {
  return [
    ...buildNounTables(),
    ...buildAdjTables(),
    ...buildVerbTables(),
    ...buildPronounTables(),
  ];
}

/** Noun paradigms: rows = cases, cols = [Singular, Plural]. */
function buildNounTables(): TableModel[] {
  return nounParadigms.map(p => ({
    id: `noun-${p.id}`,
    label: p.name,
    category: 'noun' as const,
    cols: NUMBERS.map(n => NUM_LABELS[n]),
    rows: CASES.map(c => ({
      label: CASE_LABELS[c],
      answers: NUMBERS.map(n => p.forms[c][n].full),
    })),
  }));
}

/**
 * Adjective paradigms: rows = cases, col groups = [Singular, Plural],
 * leaf cols = [Masc., Fem., Neut.] repeated per group.
 */
function buildAdjTables(): TableModel[] {
  return adjParadigms.map(p => ({
    id: `adj-${p.id}`,
    label: p.name,
    category: 'adjective' as const,
    colGroups: NUMBERS.map(n => NUM_LABELS[n]),
    cols: NUMBERS.flatMap(() => GENDERS.map(g => GENDER_LABELS[g])),
    rows: CASES.map(c => ({
      label: CASE_LABELS[c],
      answers: NUMBERS.flatMap(n => GENDERS.map(g => p.forms[c][n][g])),
    })),
  }));
}

/**
 * Verb paradigms: one table per VerbParadigm entry, plus two combined tables
 * for infinitives and participles.
 */
function buildVerbTables(): TableModel[] {
  const conjugationTables: TableModel[] = verbParadigms.map(p => ({
    id: `verb-${p.id}`,
    label: p.label,
    category: 'verb' as const,
    cols: ['Form'],
    rows: PERSONS.map(pn => ({
      label: PERSON_LABELS[pn],
      answers: [p.forms[pn] ?? null],
    })).filter(row => row.answers[0] !== null || p.group !== 'imperative'),
  }));

  const infinitiveTable: TableModel = {
    id: 'verb-infinitives',
    label: 'Infinitives (λύω)',
    category: 'verb',
    cols: ['Form'],
    rows: infinitiveForms.map(inf => ({
      label: inf.label,
      answers: [inf.form],
    })),
  };

  const participleTable: TableModel = {
    id: 'verb-participles',
    label: 'Participles (λύω)',
    category: 'verb',
    cols: ['Masc.', 'Fem.', 'Neut.'],
    rows: participleRows.map(row => ({
      label: row.label,
      answers: [row.m, row.f, row.n],
    })),
  };

  return [...conjugationTables, infinitiveTable, participleTable];
}

/**
 * Pronoun paradigms:
 * - 1st/2nd person: rows = cases, cols = [Singular, Plural]
 * - Gendered pronouns: rows = cases, col groups = [Singular, Plural],
 *   leaf cols = [Masc., Fem., Neut.]
 */
function buildPronounTables(): TableModel[] {
  const personal: TableModel[] = personalPronouns12.map(p => ({
    id: `pronoun-${p.id}`,
    label: p.name,
    category: 'pronoun' as const,
    cols: NUMBERS.map(n => NUM_LABELS[n]),
    rows: CASES.filter(c => c !== 'voc').map(c => ({
      label: CASE_LABELS[c],
      answers: NUMBERS.map(n => p.forms[n][c] ?? null),
    })),
  }));

  const gendered: TableModel[] = genderedPronouns.map(p => ({
    id: `pronoun-${p.id}`,
    label: p.name,
    category: 'pronoun' as const,
    colGroups: NUMBERS.map(n => NUM_LABELS[n]),
    cols: NUMBERS.flatMap(() => GENDERS.map(g => GENDER_LABELS[g])),
    rows: CASES.filter(c => p.forms[c] !== undefined).map(c => ({
      label: CASE_LABELS[c],
      answers: NUMBERS.flatMap(n =>
        GENDERS.map(g => p.forms[c]?.[n]?.[g] ?? null)
      ),
    })),
  }));

  return [...personal, ...gendered];
}

// ---------------------------------------------------------------------------
// Quiz cell helpers
// ---------------------------------------------------------------------------

/**
 * Flatten a TableModel into an array of quiz cells.
 * Cells with null answers (missing forms) are excluded.
 */
export function getQuizCells(table: TableModel): QuizCell[] {
  const cells: QuizCell[] = [];
  table.rows.forEach((row, rowIndex) => {
    row.answers.forEach((answer, colIndex) => {
      if (answer !== null) {
        cells.push({
          index: rowIndex * table.cols.length + colIndex,
          rowIndex,
          colIndex,
          answer,
          isBlank: false,
        });
      }
    });
  });
  return cells;
}

/** Seeded shuffle using Fisher-Yates — returns a new array. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Density ratios for blank selection. */
const DENSITY_RATIO: Record<Density, number> = {
  easy: 0.25,
  medium: 0.5,
  hard: 1.0,
};

/**
 * Mark which cells in the quiz cell array are blank for this attempt.
 * Always blanks at least one cell.
 * Returns a new array with `isBlank` set appropriately.
 */
export function applyDensity(cells: QuizCell[], density: Density): QuizCell[] {
  const count = Math.max(1, Math.round(cells.length * DENSITY_RATIO[density]));
  const shuffled = shuffle(cells.map(c => c.index));
  const blankSet = new Set(shuffled.slice(0, count));
  return cells.map(c => ({ ...c, isBlank: blankSet.has(c.index) }));
}

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------

export type Category = 'noun' | 'adjective' | 'verb' | 'pronoun';

export const CATEGORY_LABELS: Record<Category, string> = {
  noun: 'Nouns',
  adjective: 'Adjectives',
  verb: 'Verbs',
  pronoun: 'Pronouns',
};

export const ALL_CATEGORIES: Category[] = ['noun', 'adjective', 'verb', 'pronoun'];
