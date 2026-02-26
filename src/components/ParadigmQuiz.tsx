/**
 * ParadigmQuiz — three-phase interactive quiz for Greek paradigm tables.
 *
 * Phases:
 *   1. Select  — pick a paradigm and a difficulty mode
 *   2. Quiz    — fill in the blanked cells using Beta Code keyboard input
 *   3. Results — see score, per-cell color coding, and retry options
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  buildTableModels,
  applyDensity,
  getQuizCells,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  type TableModel,
  type QuizCell,
  type Density,
  type Category,
  type CellResult,
} from '../lib/paradigm-quiz';
import { applyFinalSigma, checkAnswer, processGreekKey } from '../lib/greek-input';

// ---------------------------------------------------------------------------
// Phase types
// ---------------------------------------------------------------------------

type Phase =
  | { name: 'select' }
  | { name: 'quiz'; table: TableModel; cells: QuizCell[]; density: Density }
  | { name: 'results'; table: TableModel; cells: QuizCell[]; inputs: InputMap; density: Density };

type InputMap = Record<number, string>; // cell.index → raw text

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cellKey(rowIndex: number, colIndex: number): string {
  return `${rowIndex}-${colIndex}`;
}

const DENSITY_LABELS: Record<Density, string> = {
  easy:   'Easy (25%)',
  medium: 'Medium (50%)',
  hard:   'Full Recall',
};

const DENSITY_DESCS: Record<Density, string> = {
  easy:   'A quarter of the cells are blank.',
  medium: 'Half of the cells are blank.',
  hard:   'Every cell is blank — full recall from memory.',
};

const RESULT_STYLES: Record<CellResult, { bg: string; border: string; text: string }> = {
  correct:      { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  'accent-only': { bg: '#fef3c7', border: '#fcd34d', text: '#78350f' },
  wrong:         { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
};

// ---------------------------------------------------------------------------
// CellInput — single Greek-keyboard-enabled input for a blank cell
// ---------------------------------------------------------------------------

interface CellInputProps {
  cellIndex: number;
  value: string;
  onChange: (cellIndex: number, raw: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

function CellInput({ cellIndex, value, onChange, autoFocus, disabled }: CellInputProps) {
  const displayValue = applyFinalSigma(value);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // append is non-null whenever preventDefault is true (processGreekKey contract).
      // Combining into one check avoids an unreachable branch.
      const { append } = processGreekKey(e.key, e.ctrlKey || e.metaKey);
      if (append !== null) {
        e.preventDefault();
        onChange(cellIndex, value + append);
      }
    },
    [cellIndex, value, onChange],
  );

  return (
    <input
      type="text"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={e => onChange(cellIndex, e.target.value)}
      autoFocus={autoFocus}
      disabled={disabled}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      className="w-full text-center text-base rounded border-2 px-1 py-0.5 focus:outline-none transition-colors"
      style={{
        color: 'var(--color-greek)',
        fontFamily: 'var(--font-greek)',
        borderColor: 'var(--color-accent)',
        background: 'var(--color-bg)',
        minWidth: '5rem',
      }}
      aria-label={`Answer for cell ${cellIndex}`}
    />
  );
}

// ---------------------------------------------------------------------------
// ParadigmSelector — phase 1
// ---------------------------------------------------------------------------

interface ParadigmSelectorProps {
  onStart: (table: TableModel, density: Density) => void;
}

function ParadigmSelector({ onStart }: ParadigmSelectorProps) {
  const tables = useMemo(() => buildTableModels(), []);
  const [activeCategory, setActiveCategory] = useState<Category>('noun');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>('medium');

  const filtered = tables.filter(t => t.category === activeCategory);
  const selected = filtered.find(t => t.id === selectedId) ?? null;

  const handleStart = () => {
    if (!selected) return;
    onStart(selected, density);
  };

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSelectedId(null); }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={
              activeCategory === cat
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', border: '1px solid #e5e7eb' }
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Paradigm grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(table => {
          const isSelected = table.id === selectedId;
          const totalCells = table.rows.reduce(
            (sum, row) => sum + row.answers.filter(a => a !== null).length,
            0,
          );
          return (
            <button
              key={table.id}
              onClick={() => setSelectedId(isSelected ? null : table.id)}
              className="text-left rounded-xl p-4 transition-all shadow-sm"
              style={{
                border: `2px solid ${isSelected ? 'var(--color-accent)' : '#e5e7eb'}`,
                background: isSelected ? 'rgba(245,158,11,0.08)' : 'var(--color-bg-card)',
              }}
            >
              <div className="font-semibold text-sm mb-0.5" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                {table.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {totalCells} cells
              </div>
            </button>
          );
        })}
      </div>

      {/* Density selector */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--color-bg-card)', border: '1px solid #e5e7eb' }}>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Difficulty
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left"
              style={
                density === d
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid #e5e7eb' }
              }
            >
              <div className="font-semibold">{DENSITY_LABELS[d].split(' (')[0]}</div>
              <div className="text-xs opacity-70 mt-0.5">{DENSITY_DESCS[d].split('.')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Inputs use Beta Code — type English letters to produce Greek (e.g., <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">l</kbd> → λ, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">/</kbd> → acute accent).
      </p>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!selected}
        className="w-full py-3 rounded-xl font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={
          selected
            ? { background: 'var(--color-coral)', color: '#fff' }
            : { background: '#e5e7eb', color: '#9ca3af' }
        }
      >
        {selected ? `Start Quiz — ${selected.label}` : 'Select a paradigm to begin'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuizTable — phase 2
// ---------------------------------------------------------------------------

interface QuizTableProps {
  table: TableModel;
  cells: QuizCell[];
  inputs: InputMap;
  onInputChange: (cellIndex: number, raw: string) => void;
  submitted: boolean;
  results: Record<number, CellResult>;
}

function QuizTable({ table, cells, inputs, onInputChange, submitted, results }: QuizTableProps) {
  const blankSet = useMemo(() => new Set(cells.filter(c => c.isBlank).map(c => c.index)), [cells]);
  const cellMap = useMemo(
    () => new Map(cells.map(c => [c.index, c])),
    [cells],
  );

  const hasColGroups = !!table.colGroups;
  const numGroups = table.colGroups?.length ?? 0;
  const colsPerGroup = hasColGroups ? table.cols.length / numGroups : 0;

  let firstBlank = true;

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-sm">
        <thead>
          {/* Column group row (e.g., Singular / Plural for adjectives) */}
          {hasColGroups && (
            <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
              <th className="px-3 py-2" style={{ width: '5rem' }} />
              {table.colGroups!.map((group, gi) => (
                <th
                  key={gi}
                  colSpan={colsPerGroup}
                  className="px-2 py-2 text-center font-semibold text-xs uppercase tracking-wider border-l"
                  style={{ color: 'var(--color-text-muted)', borderColor: '#e5e7eb' }}
                >
                  {group}
                </th>
              ))}
            </tr>
          )}
          {/* Leaf column header row */}
          <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', width: '5rem' }} />
            {table.cols.map((col, ci) => (
              <th
                key={ci}
                className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{ background: rowIndex % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}
            >
              <td
                className="px-3 py-2 font-semibold text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {row.label}
              </td>
              {row.answers.map((answer, colIndex) => {
                const idx = rowIndex * table.cols.length + colIndex;
                const isBlank = blankSet.has(idx);
                const result = submitted ? results[idx] : undefined;
                const cell = cellMap.get(idx);

                if (answer === null) {
                  return (
                    <td key={colIndex} className="px-3 py-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      —
                    </td>
                  );
                }

                if (!isBlank) {
                  return (
                    <td
                      key={colIndex}
                      className="px-3 py-2 text-center font-serif text-base"
                      style={{ color: 'var(--color-greek)' }}
                    >
                      {answer}
                    </td>
                  );
                }

                // Blank cell
                const shouldAutoFocus = !submitted && firstBlank;
                if (firstBlank) firstBlank = false;

                if (submitted && result) {
                  const style = RESULT_STYLES[result];
                  const userInput = applyFinalSigma((inputs[idx] ?? '').trim());
                  return (
                    <td key={colIndex} className="px-2 py-1.5 text-center">
                      <div
                        className="rounded px-1.5 py-1 text-sm font-serif"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                      >
                        {result === 'correct' ? (
                          <span>{answer}</span>
                        ) : (
                          <span>
                            <span className="line-through opacity-60">{userInput || '—'}</span>
                            {' '}
                            <span className="font-semibold">{answer}</span>
                          </span>
                        )}
                      </div>
                      {result === 'accent-only' && (
                        <div className="text-xs mt-0.5" style={{ color: style.text }}>accent</div>
                      )}
                    </td>
                  );
                }

                return (
                  <td key={colIndex} className="px-2 py-1.5 text-center">
                    <CellInput
                      cellIndex={idx}
                      value={inputs[idx] ?? ''}
                      onChange={onInputChange}
                      autoFocus={shouldAutoFocus}
                      disabled={submitted}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreBadge
// ---------------------------------------------------------------------------

function ScoreBadge({ correct, accentOnly, total }: { correct: number; accentOnly: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const color = pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="text-4xl font-extrabold" style={{ color }}>
        {correct}/{total}
      </span>
      <span className="text-xl font-semibold" style={{ color }}>
        {pct}%
      </span>
      {accentOnly > 0 && (
        <span className="text-sm px-2 py-0.5 rounded-full font-medium" style={{ background: '#fef3c7', color: '#78350f' }}>
          +{accentOnly} accent {accentOnly === 1 ? 'error' : 'errors'}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParadigmQuiz — root component
// ---------------------------------------------------------------------------

export default function ParadigmQuiz() {
  const [phase, setPhase] = useState<Phase>({ name: 'select' });
  const [inputs, setInputs] = useState<InputMap>({});
  const [results, setResults] = useState<Record<number, CellResult>>({});
  const submitted = phase.name === 'results';

  const handleStart = useCallback((table: TableModel, density: Density) => {
    const allCells = getQuizCells(table);
    const cells = applyDensity(allCells, density);
    setInputs({});
    setResults({});
    setPhase({ name: 'quiz', table, cells, density });
  }, []);

  const handleInputChange = useCallback((cellIndex: number, raw: string) => {
    setInputs(prev => ({ ...prev, [cellIndex]: raw }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (phase.name !== 'quiz') return;
    const { table, cells, density } = phase;
    const newResults: Record<number, CellResult> = {};
    for (const cell of cells) {
      if (!cell.isBlank) continue;
      const userInput = inputs[cell.index] ?? '';
      newResults[cell.index] = checkAnswer(userInput, cell.answer);
    }
    setResults(newResults);
    setPhase({ name: 'results', table, cells, density, inputs });
  }, [phase, inputs]);

  const handleRetry = useCallback(() => {
    if (phase.name !== 'results') return;
    handleStart(phase.table, phase.density);
  }, [phase, handleStart]);

  const handleNewParadigm = useCallback(() => {
    setPhase({ name: 'select' });
    setInputs({});
    setResults({});
  }, []);

  // Score computation for results phase
  const score = useMemo(() => {
    if (phase.name !== 'results') return { correct: 0, accentOnly: 0, wrong: 0, total: 0 };
    const vals = Object.values(results);
    return {
      correct:     vals.filter(r => r === 'correct').length,
      accentOnly:  vals.filter(r => r === 'accent-only').length,
      wrong:       vals.filter(r => r === 'wrong').length,
      total:       vals.length,
    };
  }, [phase, results]);

  // ── Select phase ──────────────────────────────────────────────────────────
  if (phase.name === 'select') {
    return (
      <div>
        <ParadigmSelector onStart={handleStart} />
      </div>
    );
  }

  // ── Quiz & Results phases ─────────────────────────────────────────────────
  const { table, cells, density } = phase;
  const activeInputs = phase.name === 'results' ? phase.inputs : inputs;
  const blankCount = cells.filter(c => c.isBlank).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {table.label}
          </h2>
          <span
            className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(30,58,95,0.1)', color: 'var(--color-primary)' }}
          >
            {DENSITY_LABELS[density]} — {blankCount} blank{blankCount !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleNewParadigm}
          className="text-sm underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ← Change paradigm
        </button>
      </div>

      {/* Score (results phase only) */}
      {phase.name === 'results' && (
        <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid #e5e7eb' }}>
          <ScoreBadge correct={score.correct} accentOnly={score.accentOnly} total={score.total} />
          <div className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {score.correct === score.total
              ? 'Perfect! Every cell correct.'
              : score.accentOnly > 0
              ? 'Yellow = correct letters, wrong accent. Red = wrong form.'
              : 'Red = wrong form — correct answer shown.'}
          </div>
        </div>
      )}

      {/* Table */}
      <QuizTable
        table={table}
        cells={cells}
        inputs={activeInputs}
        onInputChange={handleInputChange}
        submitted={submitted}
        results={results}
      />

      {/* Legend (results phase) */}
      {phase.name === 'results' && (
        <div className="flex gap-4 flex-wrap text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Correct</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Accent error</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Wrong</span>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        {phase.name === 'quiz' && (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
            style={{ background: 'var(--color-coral)', color: '#fff' }}
          >
            Submit Answers
          </button>
        )}
        {phase.name === 'results' && (
          <>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              Try Again
            </button>
            <button
              onClick={handleNewParadigm}
              className="px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
              style={{ background: 'var(--color-bg-card)', color: 'var(--color-primary)', border: '1px solid #e5e7eb' }}
            >
              New Paradigm
            </button>
          </>
        )}
      </div>

      {/* Keyboard hint (quiz phase only) */}
      {phase.name === 'quiz' && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Type English letters for Greek (Beta Code): <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">l</kbd>→λ, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">/</kbd>→acute, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">(</kbd>→rough breathing, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">)</kbd>→smooth breathing, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">=</kbd>→circumflex, <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono">|</kbd>→iota subscript.
        </p>
      )}
    </div>
  );
}
