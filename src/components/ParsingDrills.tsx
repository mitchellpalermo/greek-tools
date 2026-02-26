import { useState, useCallback, useRef } from 'react';
import { checkAnswer, type ChallengeResponse, type ParseSelection } from '../lib/claude';
import { formatParse } from '../data/morphgnt';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillState = 'loading' | 'answering' | 'feedback' | 'explaining';

const NOMINAL_POS = new Set(['N-', 'A-', 'RA', 'RP', 'RR', 'RD', 'RI', 'RX']);

// ─── Selector option arrays ───────────────────────────────────────────────────

const CASES   = ['N', 'G', 'D', 'A', 'V'] as const;
const NUMBERS = ['S', 'P'] as const;
const GENDERS = ['M', 'F', 'N'] as const;
const PERSONS = ['1', '2', '3'] as const;
const TENSES  = ['P', 'I', 'F', 'A', 'X', 'Y'] as const;
const VOICES  = ['A', 'M', 'P'] as const;
const MOODS   = ['I', 'D', 'S', 'O', 'N', 'P'] as const;

const CASE_LABELS: Record<string, string>   = { N: 'Nominative', G: 'Genitive', D: 'Dative', A: 'Accusative', V: 'Vocative' };
const NUMBER_LABELS: Record<string, string> = { S: 'Singular', P: 'Plural' };
const GENDER_LABELS: Record<string, string> = { M: 'Masculine', F: 'Feminine', N: 'Neuter' };
const PERSON_LABELS: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd' };
const TENSE_LABELS: Record<string, string>  = { P: 'Present', I: 'Imperfect', F: 'Future', A: 'Aorist', X: 'Perfect', Y: 'Pluperfect' };
const VOICE_LABELS: Record<string, string>  = { A: 'Active', M: 'Middle', P: 'Passive' };
const MOOD_LABELS: Record<string, string>   = { I: 'Indicative', D: 'Imperative', S: 'Subjunctive', O: 'Optative', N: 'Infinitive', P: 'Participle' };

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ButtonGroupProps {
  label: string;
  options: readonly string[];
  labels: Record<string, string>;
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
}

function ButtonGroup({ label, options, labels, value, onChange, disabled }: ButtonGroupProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
              value === opt
                ? 'border-transparent text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400',
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            style={value === opt ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ParsingDrills() {
  const [state, setState] = useState<DrillState>('loading');
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [selection, setSelection] = useState<ParseSelection>({});
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const explanationRef = useRef('');

  // ── Fetch a new challenge ────────────────────────────────────────────────────
  const loadChallenge = useCallback(async () => {
    setState('loading');
    setChallenge(null);
    setSelection({});
    setIsCorrect(null);
    setExplanation('');
    explanationRef.current = '';
    setLoadError(null);

    try {
      const res = await fetch('/api/drills/challenge', { method: 'POST' });
      if (res.status === 429) {
        setLoadError("You've reached today's challenge limit. Come back tomorrow!");
        setState('feedback');
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setLoadError(data.error ?? 'Failed to load challenge');
        setState('feedback');
        return;
      }
      const data = (await res.json()) as ChallengeResponse;
      setChallenge(data);
      setState('answering');
    } catch {
      setLoadError('Network error — please try again');
      setState('feedback');
    }
  }, []);

  // Auto-load on first render
  const hasLoaded = useRef(false);
  if (!hasLoaded.current) {
    hasLoaded.current = true;
    void loadChallenge();
  }

  // ── Submit answer ────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!challenge) return;
    const correct = checkAnswer(challenge, selection);
    setIsCorrect(correct);
    setState('feedback');

    // Record result (fire-and-forget)
    fetch('/api/drills/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lemma: challenge.lemma,
        pos: challenge.pos,
        parsing: challenge.parsing,
        correct,
      }),
    }).catch(() => {/* ignore */});
  }

  // ── Stream explanation ───────────────────────────────────────────────────────
  async function handleExplain() {
    if (!challenge) return;
    setState('explaining');
    setExplanation('');
    explanationRef.current = '';

    const correctParse = formatParse(challenge.pos, challenge.parsing);
    const studentParse = formatParse(challenge.pos, buildStudentParseCode(challenge, selection));

    try {
      const res = await fetch('/api/drills/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: challenge.word,
          lemma: challenge.lemma,
          pos: challenge.pos,
          correctParse,
          studentParse,
        }),
      });

      if (!res.ok || !res.body) {
        setExplanation('Could not load explanation. Please try again.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]' || payload === '[ERROR]') continue;
          try {
            const { text } = JSON.parse(payload) as { text: string };
            explanationRef.current += text;
            setExplanation(explanationRef.current);
          } catch {
            // ignore malformed SSE line
          }
        }
      }
    } catch {
      setExplanation('Failed to load explanation.');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setField(field: keyof ParseSelection, value: string) {
    setSelection(prev => ({ ...prev, [field]: value }));
  }

  /** Check if the current selection is complete enough to submit */
  function isSelectionComplete(): boolean {
    if (!challenge) return false;
    const { pos, parsing } = challenge;
    if (NOMINAL_POS.has(pos)) {
      return !!(selection.case && selection.number && selection.gender);
    }
    if (pos === 'V-') {
      const mood = selection.mood;
      if (!mood) return false;
      if (mood === 'N') return !!(selection.tense && selection.voice);
      if (mood === 'P') return !!(selection.tense && selection.voice && selection.case && selection.number && selection.gender);
      return !!(selection.person && selection.tense && selection.voice && selection.number);
    }
    // Use parsing code to detect infinitive/participle before mood is selected
    if (parsing[3] === 'N') return !!(selection.tense && selection.voice);
    if (parsing[3] === 'P') return !!(selection.tense && selection.voice && selection.case && selection.number && selection.gender);
    return false;
  }

  const isAnswering = state === 'answering';

  // ── Render ───────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-text-muted text-lg animate-pulse">Loading challenge…</p>
      </div>
    );
  }

  if (loadError && !challenge) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="mb-4" style={{ color: 'var(--color-coral, #F43F5E)' }}>{loadError}</p>
        <button
          onClick={() => void loadChallenge()}
          className="px-6 py-2 rounded-lg font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* ── Word display ──────────────────────────────────────────────────── */}
      {challenge && (
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Parse this word
          </p>
          <p
            className="text-6xl font-bold mb-2 select-none"
            style={{ fontFamily: 'var(--font-greek)', color: 'var(--color-greek, #8B4513)' }}
          >
            {challenge.word}
          </p>
          <p className="text-sm text-text-muted">
            Lexeme: <span style={{ fontFamily: 'var(--font-greek)' }}>{challenge.lemma}</span>
            {' '}— {challenge.gloss}
          </p>
        </div>
      )}

      {/* ── Selectors ─────────────────────────────────────────────────────── */}
      {challenge && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {NOMINAL_POS.has(challenge.pos) && (
            <>
              <ButtonGroup label="Case"   options={CASES}   labels={CASE_LABELS}   value={selection.case}   onChange={v => setField('case', v)}   disabled={!isAnswering} />
              <ButtonGroup label="Number" options={NUMBERS} labels={NUMBER_LABELS} value={selection.number} onChange={v => setField('number', v)} disabled={!isAnswering} />
              <ButtonGroup label="Gender" options={GENDERS} labels={GENDER_LABELS} value={selection.gender} onChange={v => setField('gender', v)} disabled={!isAnswering} />
            </>
          )}

          {challenge.pos === 'V-' && (
            <>
              {/* Always show Tense + Voice for verbs */}
              <ButtonGroup label="Tense" options={TENSES} labels={TENSE_LABELS} value={selection.tense} onChange={v => setField('tense', v)} disabled={!isAnswering} />
              <ButtonGroup label="Voice" options={VOICES} labels={VOICE_LABELS} value={selection.voice} onChange={v => setField('voice', v)} disabled={!isAnswering} />
              {/* Show Mood for verbs (determines which other fields are shown) */}
              {challenge.parsing[3] !== 'N' && (
                <ButtonGroup label="Mood" options={MOODS} labels={MOOD_LABELS} value={selection.mood ?? (challenge.parsing[3] === 'P' ? 'P' : undefined)} onChange={v => setField('mood', v)} disabled={!isAnswering} />
              )}
              {/* Infinitives: just tense + voice (already shown above) */}
              {/* Participles: add case/number/gender */}
              {(selection.mood === 'P' || challenge.parsing[3] === 'P') && (
                <>
                  <ButtonGroup label="Case"   options={CASES}   labels={CASE_LABELS}   value={selection.case}   onChange={v => setField('case', v)}   disabled={!isAnswering} />
                  <ButtonGroup label="Number" options={NUMBERS} labels={NUMBER_LABELS} value={selection.number} onChange={v => setField('number', v)} disabled={!isAnswering} />
                  <ButtonGroup label="Gender" options={GENDERS} labels={GENDER_LABELS} value={selection.gender} onChange={v => setField('gender', v)} disabled={!isAnswering} />
                </>
              )}
              {/* Finite verbs: person + number */}
              {selection.mood && selection.mood !== 'N' && selection.mood !== 'P' && challenge.parsing[3] !== 'N' && challenge.parsing[3] !== 'P' && (
                <>
                  <ButtonGroup label="Person" options={PERSONS} labels={PERSON_LABELS} value={selection.person} onChange={v => setField('person', v)} disabled={!isAnswering} />
                  <ButtonGroup label="Number" options={NUMBERS} labels={NUMBER_LABELS} value={selection.number} onChange={v => setField('number', v)} disabled={!isAnswering} />
                </>
              )}
            </>
          )}

          {isAnswering && (
            <button
              onClick={handleSubmit}
              disabled={!isSelectionComplete()}
              className="w-full mt-4 py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)' }}
            >
              Check Answer
            </button>
          )}
        </div>
      )}

      {/* ── Feedback card ─────────────────────────────────────────────────── */}
      {(state === 'feedback' || state === 'explaining') && challenge && !loadError && (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: isCorrect ? '#F0FDF4' : '#FFF1F2',
            borderLeft: `4px solid ${isCorrect ? 'var(--color-jade, #059669)' : 'var(--color-coral, #F43F5E)'}`,
          }}
        >
          <p
            className="font-bold text-lg mb-1"
            style={{ color: isCorrect ? 'var(--color-jade, #059669)' : 'var(--color-coral, #F43F5E)' }}
          >
            {isCorrect ? 'Correct!' : 'Not quite'}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Correct parse: </span>
            {formatParse(challenge.pos, challenge.parsing)}
          </p>

          {!isCorrect && state === 'feedback' && (
            <button
              onClick={() => void handleExplain()}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'var(--color-coral, #F43F5E)' }}
            >
              Explain this →
            </button>
          )}
        </div>
      )}

      {/* ── Explanation panel ─────────────────────────────────────────────── */}
      {state === 'explaining' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Explanation
          </p>
          {explanation ? (
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{explanation}</p>
          ) : (
            <p className="text-sm text-text-muted animate-pulse">Generating explanation…</p>
          )}
        </div>
      )}

      {/* ── Error card ────────────────────────────────────────────────────── */}
      {loadError && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#FFF1F2', borderLeft: '4px solid var(--color-coral, #F43F5E)' }}>
          <p className="text-sm" style={{ color: 'var(--color-coral, #F43F5E)' }}>{loadError}</p>
        </div>
      )}

      {/* ── Next challenge button ──────────────────────────────────────────── */}
      {(state === 'feedback' || state === 'explaining') && (
        <div className="text-center">
          <button
            onClick={() => void loadChallenge()}
            className="px-8 py-3 rounded-xl font-bold text-white text-base transition-all"
            style={{ background: 'var(--color-primary)' }}
          >
            Next Challenge →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build an approximate 8-char parse code from the student's selection.
 * Used only for display purposes in the explanation prompt.
 */
function buildStudentParseCode(
  challenge: ChallengeResponse,
  sel: ParseSelection,
): string {
  const p = challenge.parsing.split('');
  if (NOMINAL_POS.has(challenge.pos)) {
    if (sel.case)   p[4] = sel.case;
    if (sel.number) p[5] = sel.number;
    if (sel.gender) p[6] = sel.gender;
  } else if (challenge.pos === 'V-') {
    const mood = sel.mood ?? challenge.parsing[3];
    if (sel.person) p[0] = sel.person;
    if (sel.tense)  p[1] = sel.tense;
    if (sel.voice)  p[2] = sel.voice;
    p[3] = mood ?? '-';
    if (sel.case)   p[4] = sel.case;
    if (sel.number) p[5] = sel.number;
    if (sel.gender) p[6] = sel.gender;
  }
  return p.join('');
}
