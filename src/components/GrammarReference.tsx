/**
 * GrammarReference — interactive grammar paradigm reference for Koine Greek.
 *
 * Sections: Nouns · Adjectives · Verbs · Pronouns · Prepositions · Accent Rules
 *
 * Features:
 * - Sticky sidebar navigation (desktop) / horizontal scroll nav (mobile)
 * - Full-form / endings-only toggle on noun and adjective tables
 * - Verb paradigm tab selector by tense/voice/mood
 * - Hover/tap tooltip showing grammatical description for each cell
 */

import { useState, useCallback } from 'react';
import {
  CASES,
  NUMBERS,
  GENDERS,
  PERSONS,
  CASE_LABELS,
  CASE_DESCRIPTIONS,
  NUM_LABELS,
  GENDER_LABELS,
  PERSON_LABELS,
  PERSON_FULL_LABELS,
  nounParadigms,
  adjParadigms,
  verbParadigms,
  infinitiveForms,
  participleRows,
  personalPronouns12,
  genderedPronouns,
  prepositions,
  accentSections,
  getArticle,
  type NounParadigm,
  type AdjParadigm,
  type VerbParadigm,
  type PersonalPronoun12,
  type GenderedPronoun,
  type CaseKey,
  type NumKey,
  type GenderKey,
  type PersonNum,
} from '../data/grammar';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_SECTIONS = [
  { id: 'nouns',       label: 'Nouns'        },
  { id: 'adjectives',  label: 'Adjectives'   },
  { id: 'verbs',       label: 'Verbs'        },
  { id: 'pronouns',    label: 'Pronouns'     },
  { id: 'prepositions', label: 'Prepositions' },
  { id: 'accents',     label: 'Accents'      },
] as const;

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

/** Section heading with an anchor ID for sidebar links. */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold mb-6 pb-2 border-b-2 scroll-mt-6"
      style={{ color: 'var(--color-primary)', borderColor: 'var(--color-accent)' }}
    >
      {children}
    </h2>
  );
}

/** Smaller heading within a section (e.g. for individual paradigm names). */
function ParadigmHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-semibold uppercase tracking-wider mb-3"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {children}
    </h3>
  );
}

/** Toggle button for switching between full forms and endings only. */
function EndingsToggle({
  showEndings,
  onToggle,
}: {
  showEndings: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors"
      style={
        showEndings
          ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
          : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-text-muted)' }
      }
    >
      {showEndings ? 'Endings only' : 'Full forms'}
    </button>
  );
}

/**
 * Description bar displayed below paradigm tables.
 * Shows the active cell's grammatical description on hover/tap.
 */
function DescriptionBar({ text }: { text: string | null }) {
  return (
    <div
      className="mt-2 px-3 py-1.5 rounded text-xs min-h-[28px] transition-opacity"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text-muted)',
        border: '1px solid #e5e7eb',
        opacity: text ? 1 : 0.4,
      }}
    >
      {text ?? 'Hover over a cell to see its grammatical description'}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Noun paradigm table
// ---------------------------------------------------------------------------

function NounParadigmCard({ paradigm }: { paradigm: NounParadigm }) {
  const [showEndings, setShowEndings] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  const handleCell = useCallback((caseKey: CaseKey, numKey: NumKey) => {
    setDescription(`${CASE_DESCRIPTIONS[caseKey].split(' — ')[0]} ${NUM_LABELS[numKey]} — ${CASE_DESCRIPTIONS[caseKey].split(' — ')[1]}`);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm"
      style={{ border: '1px solid #e5e7eb' }}
    >
      {/* Card header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: 'var(--color-primary)' }}
      >
        <span className="text-sm font-semibold text-white">{paradigm.name}</span>
        <EndingsToggle showEndings={showEndings} onToggle={() => setShowEndings(v => !v)} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ background: 'var(--color-bg-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
              <th className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', width: '4rem' }} />
              <th className="px-4 py-2 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Singular</th>
              <th className="px-4 py-2 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Plural</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c, i) => {
              const sgForm = paradigm.forms[c].sg;
              const plForm = paradigm.forms[c].pl;
              return (
                <tr
                  key={c}
                  style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}
                >
                  <td
                    className="px-3 py-2 font-semibold text-xs uppercase tracking-wider cursor-default"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={() => setDescription(CASE_DESCRIPTIONS[c])}
                    onMouseLeave={() => setDescription(null)}
                  >
                    {CASE_LABELS[c]}
                  </td>
                  {([['sg', sgForm], ['pl', plForm]] as [NumKey, typeof sgForm][]).map(([numKey, form]) => {
                    const article = !showEndings ? getArticle(c, numKey, paradigm.gender) : null;
                    return (
                      <td
                        key={numKey}
                        className="px-4 py-2 text-center font-serif text-base cursor-default rounded transition-colors"
                        style={{ color: 'var(--color-greek)' }}
                        onMouseEnter={() => handleCell(c, numKey)}
                        onMouseLeave={() => setDescription(null)}
                        onClick={() => handleCell(c, numKey)}
                      >
                        {showEndings ? (
                          form.ending
                        ) : (
                          <>
                            {article && (
                              <span style={{ color: 'var(--color-text-muted)', marginRight: '0.2em' }}>
                                {article}
                              </span>
                            )}
                            {form.full}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 pb-3 pt-1" style={{ background: 'var(--color-bg-card)' }}>
        <DescriptionBar text={description} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Adjective paradigm table
// ---------------------------------------------------------------------------

function AdjParadigmCard({ paradigm }: { paradigm: AdjParadigm }) {
  const [showEndings, setShowEndings] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  // For 2-1-2 adjectives the endings follow the noun patterns; for display we just show full forms.
  // The endings-only toggle is less meaningful for adjectives so we omit it here.

  const handleCell = useCallback((caseKey: CaseKey, numKey: NumKey, genderKey: GenderKey) => {
    setDescription(
      `${CASE_DESCRIPTIONS[caseKey].split(' — ')[0]} ${NUM_LABELS[numKey]} ${GENDER_LABELS[genderKey]} — ${CASE_DESCRIPTIONS[caseKey].split(' — ')[1]}`
    );
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm"
      style={{ border: '1px solid #e5e7eb' }}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: 'var(--color-primary)' }}
      >
        <span className="text-sm font-semibold text-white">{paradigm.name}</span>
        <EndingsToggle showEndings={showEndings} onToggle={() => setShowEndings(v => !v)} />
      </div>

      <div className="overflow-x-auto" style={{ background: 'var(--color-bg-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
              <th className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', width: '4rem' }} />
              {NUMBERS.map(num => (
                <th
                  key={num}
                  colSpan={3}
                  className="px-2 py-2 text-center font-semibold text-xs uppercase tracking-wider border-l"
                  style={{ color: 'var(--color-text-muted)', borderColor: '#e5e7eb' }}
                >
                  {NUM_LABELS[num]}
                </th>
              ))}
            </tr>
            <tr style={{ background: 'rgba(30,58,95,0.03)' }}>
              <th />
              {NUMBERS.map(num =>
                GENDERS.map(g => (
                  <th
                    key={`${num}-${g}`}
                    className="px-3 py-1.5 text-center text-xs font-medium"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {GENDER_LABELS[g]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {CASES.map((c, i) => (
              <tr
                key={c}
                style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}
              >
                <td
                  className="px-3 py-2 font-semibold text-xs uppercase tracking-wider cursor-default"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={() => setDescription(CASE_DESCRIPTIONS[c])}
                  onMouseLeave={() => setDescription(null)}
                >
                  {CASE_LABELS[c]}
                </td>
                {NUMBERS.map(num =>
                  GENDERS.map(g => (
                    <td
                      key={`${num}-${g}`}
                      className="px-3 py-2 text-center font-serif text-sm cursor-default"
                      style={{ color: 'var(--color-greek)' }}
                      onMouseEnter={() => handleCell(c, num, g)}
                      onMouseLeave={() => setDescription(null)}
                      onClick={() => handleCell(c, num, g)}
                    >
                      {paradigm.forms[c][num][g]}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 pb-3 pt-1" style={{ background: 'var(--color-bg-card)' }}>
        <DescriptionBar text={description} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verb paradigm tab + table
// ---------------------------------------------------------------------------

function VerbSection() {
  const groups = ['indicative', 'subjunctive', 'imperative'] as const;
  const [activeGroup, setActiveGroup] = useState<(typeof groups)[number]>('indicative');
  const [activeId, setActiveId] = useState('pres-act-ind');
  const [description, setDescription] = useState<string | null>(null);

  const grouped = groups.reduce(
    (acc, g) => ({ ...acc, [g]: verbParadigms.filter(p => p.group === g) }),
    {} as Record<(typeof groups)[number], VerbParadigm[]>
  );

  const activeParsed = verbParadigms.find(p => p.id === activeId) ?? verbParadigms[0];

  const groupLabel: Record<(typeof groups)[number], string> = {
    indicative: 'Indicative',
    subjunctive: 'Subjunctive',
    imperative: 'Imperative',
  };

  return (
    <section id="verbs" className="mb-16">
      <SectionHeading id="verbs">Verbs — λύω</SectionHeading>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        All paradigms use λύω (I loose, release) as the model verb. Hover over any form to see its full parse.
      </p>

      {/* Mood group tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(30,58,95,0.07)' }}>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => {
              setActiveGroup(g);
              setActiveId(grouped[g][0].id);
            }}
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={
              activeGroup === g
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'transparent', color: 'var(--color-text-muted)' }
            }
          >
            {groupLabel[g]}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Paradigm selector list — horizontal scroll on mobile, vertical on desktop */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 md:shrink-0 md:w-52 md:space-y-0.5">
          {grouped[activeGroup].map(p => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className="shrink-0 md:shrink md:w-full text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
              style={
                activeId === p.id
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'rgba(30,58,95,0.07)', color: 'var(--color-text)' }
              }
            >
              {p.label}
            </button>
          ))}
        </nav>

        {/* Paradigm table */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-4 py-2.5" style={{ background: 'var(--color-primary)' }}>
              <span className="text-sm font-semibold text-white">{activeParsed.label}</span>
            </div>
            <div style={{ background: 'var(--color-bg-card)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', width: '5rem' }}>Person</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Form</th>
                  </tr>
                </thead>
                <tbody>
                  {PERSONS.map((p, i) => {
                    const form = activeParsed.forms[p];
                    if (form === undefined) return null;
                    return (
                      <tr
                        key={p}
                        style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}
                      >
                        <td className="px-4 py-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          {PERSON_LABELS[p]}
                        </td>
                        <td
                          className="px-4 py-2 font-serif text-lg cursor-default"
                          style={{ color: 'var(--color-greek)' }}
                          onMouseEnter={() => setDescription(`${activeParsed.label} — ${PERSON_FULL_LABELS[p]}`)}
                          onMouseLeave={() => setDescription(null)}
                          onClick={() => setDescription(`${activeParsed.label} — ${PERSON_FULL_LABELS[p]}`)}
                        >
                          {form}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 pb-3 pt-1" style={{ background: 'var(--color-bg-card)' }}>
              <DescriptionBar text={description} />
            </div>
          </div>
        </div>
      </div>

      {/* Infinitives */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div>
          <ParadigmHeading>Infinitives</ParadigmHeading>
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-4 py-2.5" style={{ background: 'var(--color-primary)' }}>
              <span className="text-sm font-semibold text-white">Infinitives</span>
            </div>
            <table className="w-full text-sm" style={{ background: 'var(--color-bg-card)' }}>
              <tbody>
                {infinitiveForms.map(({ label, form }, i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</td>
                    <td className="px-4 py-2 font-serif text-base" style={{ color: 'var(--color-greek)' }}>{form}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Participles */}
        <div>
          <ParadigmHeading>Participles (Nominative Singular)</ParadigmHeading>
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-4 py-2.5" style={{ background: 'var(--color-primary)' }}>
              <span className="text-sm font-semibold text-white">Participles</span>
            </div>
            <table className="w-full text-sm" style={{ background: 'var(--color-bg-card)' }}>
              <thead>
                <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }} />
                  {(['m', 'f', 'n'] as GenderKey[]).map(g => (
                    <th key={g} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      {GENDER_LABELS[g]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participleRows.map((row, i) => (
                  <tr key={row.label} style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.label}</td>
                    {(['m', 'f', 'n'] as GenderKey[]).map(g => (
                      <td key={g} className="px-3 py-2 text-center font-serif text-sm" style={{ color: 'var(--color-greek)' }}>
                        {row[g]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pronoun tables
// ---------------------------------------------------------------------------

function PronounCard12({ pronoun }: { pronoun: PersonalPronoun12 }) {
  const [description, setDescription] = useState<string | null>(null);
  const cases = ['nom', 'gen', 'dat', 'acc'] as CaseKey[];

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
      <div className="px-4 py-2.5" style={{ background: 'var(--color-primary)' }}>
        <span className="text-sm font-semibold text-white">{pronoun.name}</span>
      </div>
      <div className="overflow-x-auto" style={{ background: 'var(--color-bg-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', width: '4rem' }} />
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Singular</th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Plural</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <tr key={c} style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}>
                <td
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-default"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={() => setDescription(CASE_DESCRIPTIONS[c])}
                  onMouseLeave={() => setDescription(null)}
                >
                  {CASE_LABELS[c]}
                </td>
                {(['sg', 'pl'] as NumKey[]).map(num => (
                  <td
                    key={num}
                    className="px-4 py-2 text-center font-serif text-base cursor-default"
                    style={{ color: 'var(--color-greek)' }}
                    onMouseEnter={() => setDescription(`${CASE_DESCRIPTIONS[c].split(' — ')[0]} ${NUM_LABELS[num]} — ${CASE_DESCRIPTIONS[c].split(' — ')[1]}`)}
                    onMouseLeave={() => setDescription(null)}
                    onClick={() => setDescription(`${CASE_DESCRIPTIONS[c].split(' — ')[0]} ${NUM_LABELS[num]}`)}
                  >
                    {pronoun.forms[num][c] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 pb-3 pt-1" style={{ background: 'var(--color-bg-card)' }}>
        <DescriptionBar text={description} />
      </div>
    </div>
  );
}

function GenderedPronounCard({ pronoun }: { pronoun: GenderedPronoun }) {
  const [description, setDescription] = useState<string | null>(null);
  const cases = (['nom', 'gen', 'dat', 'acc'] as CaseKey[]).filter(c => pronoun.forms[c]);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
      <div className="px-4 py-2.5" style={{ background: 'var(--color-primary)' }}>
        <span className="text-sm font-semibold text-white">{pronoun.name}</span>
      </div>
      <div className="overflow-x-auto" style={{ background: 'var(--color-bg-card)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(30,58,95,0.06)' }}>
              <th className="px-3 py-2" style={{ width: '4rem' }} />
              {(['sg', 'pl'] as NumKey[]).map(num => (
                <th
                  key={num}
                  colSpan={3}
                  className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider border-l"
                  style={{ color: 'var(--color-text-muted)', borderColor: '#e5e7eb' }}
                >
                  {NUM_LABELS[num]}
                </th>
              ))}
            </tr>
            <tr style={{ background: 'rgba(30,58,95,0.03)' }}>
              <th />
              {(['sg', 'pl'] as NumKey[]).map(num =>
                (['m', 'f', 'n'] as GenderKey[]).map(g => (
                  <th key={`${num}-${g}`} className="px-3 py-1 text-center text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {GENDER_LABELS[g]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <tr key={c} style={{ background: i % 2 === 0 ? 'var(--color-bg-card)' : 'rgba(30,58,95,0.03)' }}>
                <td
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-default"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={() => setDescription(CASE_DESCRIPTIONS[c])}
                  onMouseLeave={() => setDescription(null)}
                >
                  {CASE_LABELS[c]}
                </td>
                {(['sg', 'pl'] as NumKey[]).map(num =>
                  (['m', 'f', 'n'] as GenderKey[]).map(g => {
                    const form = pronoun.forms[c]?.[num]?.[g];
                    return (
                      <td
                        key={`${num}-${g}`}
                        className="px-3 py-2 text-center font-serif text-sm cursor-default"
                        style={{ color: 'var(--color-greek)' }}
                        onMouseEnter={() =>
                          setDescription(
                            `${CASE_DESCRIPTIONS[c].split(' — ')[0]} ${NUM_LABELS[num]} ${GENDER_LABELS[g]} — ${CASE_DESCRIPTIONS[c].split(' — ')[1]}`
                          )
                        }
                        onMouseLeave={() => setDescription(null)}
                        onClick={() =>
                          setDescription(
                            `${CASE_DESCRIPTIONS[c].split(' — ')[0]} ${NUM_LABELS[num]} ${GENDER_LABELS[g]}`
                          )
                        }
                      >
                        {form ?? '—'}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 pb-3 pt-1" style={{ background: 'var(--color-bg-card)' }}>
        <DescriptionBar text={description} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prepositions
// ---------------------------------------------------------------------------

const PREP_CASE_LABELS: Record<string, string> = {
  gen: 'Genitive',
  dat: 'Dative',
  acc: 'Accusative',
};

const PREP_CASE_COLORS: Record<string, string> = {
  gen: '#1e3a5f',
  dat: '#7c3d12',
  acc: '#c49b3c',
};

function PrepCard({ entry }: { entry: (typeof prepositions)[number] }) {
  return (
    <div
      className="rounded-xl p-4 shadow-sm flex flex-col gap-2"
      style={{ background: 'var(--color-bg-card)', border: '1px solid #e5e7eb' }}
    >
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl" style={{ color: 'var(--color-greek)' }}>{entry.greek}</span>
        <div className="flex gap-1 flex-wrap">
          {entry.cases.map(c => (
            <span
              key={c}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
              style={{ background: PREP_CASE_COLORS[c] }}
            >
              {PREP_CASE_LABELS[c]}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {entry.cases.map(c =>
          entry.glosses[c] ? (
            <p key={c} className="text-xs" style={{ color: 'var(--color-text)' }}>
              <span className="font-medium" style={{ color: PREP_CASE_COLORS[c] }}>
                +{PREP_CASE_LABELS[c]}:{' '}
              </span>
              {entry.glosses[c]}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GrammarReference() {
  const [activeSection, setActiveSection] = useState<string>('nouns');

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex gap-8 relative">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-44 shrink-0">
        <nav className="sticky top-6 space-y-0.5">
          {NAV_SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={e => { e.preventDefault(); handleNavClick(s.id); }}
              className="block px-3 py-2 rounded-lg text-sm transition-colors font-medium"
              style={
                activeSection === s.id
                  ? { background: 'rgba(30,58,95,0.1)', color: 'var(--color-primary)' }
                  : { color: 'var(--color-text-muted)' }
              }
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 flex gap-1 overflow-x-auto px-4 py-2 shadow-lg"
        style={{ background: 'var(--color-bg-card)', borderTop: '1px solid #e5e7eb' }}>
        {NAV_SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={e => { e.preventDefault(); handleNavClick(s.id); }}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
            style={
              activeSection === s.id
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'rgba(30,58,95,0.07)', color: 'var(--color-text-muted)' }
            }
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">

        {/* Nouns */}
        <section id="nouns" className="mb-16">
          <SectionHeading id="nouns">Noun Declensions</SectionHeading>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Toggle between full inflected forms and endings only. Hover over any cell to see its case description.
          </p>
          <div className="space-y-6">
            {nounParadigms.map(p => <NounParadigmCard key={p.id} paradigm={p} />)}
          </div>
        </section>

        {/* Adjectives */}
        <section id="adjectives" className="mb-16">
          <SectionHeading id="adjectives">Adjectives</SectionHeading>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            The 2-1-2 pattern follows 2nd declension (masc./neut.) and 1st declension (fem.). The 3-1-3 pattern uses 3rd declension for masc./neut. and 1st for fem.
          </p>
          <div className="space-y-6">
            {adjParadigms.map(p => <AdjParadigmCard key={p.id} paradigm={p} />)}
          </div>
        </section>

        {/* Verbs */}
        <VerbSection />

        {/* Pronouns */}
        <section id="pronouns" className="mb-16">
          <SectionHeading id="pronouns">Pronouns</SectionHeading>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Personal, demonstrative, relative, and interrogative pronouns. Hover over cells for case descriptions.
          </p>
          <div className="space-y-6">
            {personalPronouns12.map(p => <PronounCard12 key={p.id} pronoun={p} />)}
            {genderedPronouns.map(p => <GenderedPronounCard key={p.id} pronoun={p} />)}
          </div>
        </section>

        {/* Prepositions */}
        <section id="prepositions" className="mb-16">
          <SectionHeading id="prepositions">Prepositions</SectionHeading>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            All GNT prepositions grouped by the case(s) they govern. The case badge color indicates:
            <span className="ml-2 font-semibold" style={{ color: '#1e3a5f' }}>Genitive</span>
            <span className="mx-2">·</span>
            <span className="font-semibold" style={{ color: '#7c3d12' }}>Dative</span>
            <span className="mx-2">·</span>
            <span className="font-semibold" style={{ color: '#c49b3c' }}>Accusative</span>
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prepositions.map(p => <PrepCard key={p.greek} entry={p} />)}
          </div>
        </section>

        {/* Accent rules */}
        <section id="accents" className="mb-16">
          <SectionHeading id="accents">Accent Rules</SectionHeading>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            A structured summary of Greek accentuation for reference while reading.
          </p>
          <div className="space-y-5">
            {accentSections.map(section => (
              <div
                key={section.title}
                className="rounded-xl p-5 shadow-sm"
                style={{ background: 'var(--color-bg-card)', border: '1px solid #e5e7eb' }}
              >
                <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.rules.map((rule, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'var(--color-accent)' }}>
                        {i + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
