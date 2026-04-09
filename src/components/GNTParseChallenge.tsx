import React, { useState, useEffect } from 'react';
import PassageSelector from './PassageSelector';
import GNTParseQuestion from './GNTParseQuestion';
import ParseResults from './ParseResults';
import type { SessionResults } from './ParseResults';
import { splitWordPunct } from '../data/morphgnt';
import { fetchBook } from '../data/morphgnt';
import type { MorphBook } from '../data/morphgnt';
import {
  extractVerbs, sampleVerbs, gradeGNTAnswer, emptyGNTAnswer,
  loadGNTSettings, saveGNTSettings,
  DEFAULT_GNT_SETTINGS,
  GNT_TENSE_LABELS, GNT_VOICE_LABELS, GNT_MOOD_LABELS,
  GNT_PERSON_LABELS, GNT_NUMBER_LABELS, GNT_CASE_LABELS, GNT_GENDER_LABELS,
  FINITE_MOODS,
} from '../lib/gnt-parse';
import type { GNTParseItem, GNTParseAnswer, GNTParseResult, GNTPassageSettings } from '../lib/gnt-parse';
import { fetchBooks } from '../data/morphgnt';

type Phase = 'select' | 'question' | 'feedback' | 'results';

export default function GNTParseChallenge() {
  const [settings, setSettings] = useState<GNTPassageSettings>(DEFAULT_GNT_SETTINGS);
  const [bookData, setBookData] = useState<MorphBook | null>(null);
  const [bookName, setBookName] = useState('John');
  const [verbCount, setVerbCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>('select');
  const [session, setSession] = useState<GNTParseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState<GNTParseAnswer>(emptyGNTAnswer());
  const [results, setResults] = useState<GNTParseResult[]>([]);
  const [currentResult, setCurrentResult] = useState<GNTParseResult | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSettings(loadGNTSettings());
    setSettingsLoaded(true);
  }, []);

  // Fetch book data whenever book or chapter changes
  useEffect(() => {
    if (!settingsLoaded) return;
    setVerbCount(null);
    setLoading(true);
    Promise.all([
      fetchBook(settings.book),
      fetchBooks(),
    ]).then(([data, books]) => {
      setBookData(data);
      const meta = books.find(b => b.code === settings.book);
      if (meta) setBookName(meta.name);
      const verbs = extractVerbs(data, String(settings.chapter), meta?.name ?? settings.book);
      setVerbCount(verbs.length);
    }).catch(console.error).finally(() => setLoading(false));
  }, [settings.book, settings.chapter, settingsLoaded]);

  function handleSettingsChange(s: GNTPassageSettings) {
    setSettings(s);
    saveGNTSettings(s);
  }

  function handleStart() {
    if (!bookData) return;
    const all = extractVerbs(bookData, String(settings.chapter), bookName);
    const count = settings.sessionLength === 'all' ? all.length : settings.sessionLength;
    const items = sampleVerbs(all, count);
    if (items.length === 0) return;
    setSession(items);
    setCurrentIndex(0);
    setResults([]);
    setAnswer(emptyGNTAnswer());
    setCurrentResult(null);
    setPhase('question');
  }

  function handleSubmit() {
    const result = gradeGNTAnswer(session[currentIndex], answer);
    setCurrentResult(result);
    setPhase('feedback');
  }

  function handleNext() {
    const updated = [...results, currentResult!];
    setResults(updated);
    if (currentIndex + 1 >= session.length) {
      setPhase('results');
    } else {
      setCurrentIndex(i => i + 1);
      setAnswer(emptyGNTAnswer());
      setCurrentResult(null);
      setPhase('question');
    }
  }

  // Adapt GNTParseResult[] → ParseResult[] for the shared ParseResults component
  const sessionResults: SessionResults = {
    results: results.map(r => ({
      tense:  r.tense,
      voice:  r.voice,
      mood:   r.mood,
      // For person/number/case/gender: count nulls as correct (not graded)
      person: r.person ?? true,
      number: r.number ?? true,
      allCorrect: r.allCorrect,
    })),
    total: session.length,
  };

  if (!settingsLoaded) return null;

  if (phase === 'select') {
    return (
      <PassageSelector
        settings={settings}
        verbCount={verbCount}
        onChange={handleSettingsChange}
        onStart={handleStart}
        loading={loading}
      />
    );
  }

  if (phase === 'question' && session[currentIndex]) {
    return (
      <GNTParseQuestion
        item={session[currentIndex]}
        index={currentIndex}
        total={session.length}
        answer={answer}
        onChange={setAnswer}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === 'feedback' && session[currentIndex] && currentResult) {
    return (
      <GNTFeedback
        item={session[currentIndex]}
        answer={answer}
        result={currentResult}
        onNext={handleNext}
        isLast={currentIndex + 1 >= session.length}
      />
    );
  }

  if (phase === 'results') {
    return (
      <ParseResults
        sessionResults={sessionResults}
        onRetry={handleStart}
        onChangeSettings={() => {
          setPhase('select');
          setSession([]);
          setResults([]);
          setCurrentIndex(0);
        }}
      />
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Inline feedback — similar to ParseFeedback but handles nullable properties
// ---------------------------------------------------------------------------

function GNTFeedback({
  item,
  answer,
  result,
  onNext,
  isLast,
}: {
  item: GNTParseItem;
  answer: GNTParseAnswer;
  result: GNTParseResult;
  onNext: () => void;
  isLast: boolean;
}) {
  const isFinite   = item.type === 'finite';
  const isParticiple = item.type === 'participle';

  // Build the correct parse label
  const correctLabel = (() => {
    if (item.type === 'finite') {
      return `${GNT_PERSON_LABELS[item.person]} ${GNT_TENSE_LABELS[item.tense]} ${GNT_VOICE_LABELS[item.voice]} ${GNT_MOOD_LABELS[item.mood]} ${GNT_NUMBER_LABELS[item.number]}`;
    }
    if (item.type === 'infinitive') {
      return `${GNT_TENSE_LABELS[item.tense]} ${GNT_VOICE_LABELS[item.voice]} Infinitive`;
    }
    return `${GNT_TENSE_LABELS[item.tense]} ${GNT_VOICE_LABELS[item.voice]} Participle — ${GNT_CASE_LABELS[item.parseCase]} ${GNT_NUMBER_LABELS[item.number]} ${GNT_GENDER_LABELS[item.gender]}`;
  })();

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Form + ref */}
      <div className="text-center py-5">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-1">{item.verseRef}</p>
        <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-greek)', color: 'var(--color-accent)' }}>
          {item.form}
        </p>
        <p className="mt-2 text-sm text-text-muted">{correctLabel}</p>
      </div>

      {/* Per-property rows */}
      <div className="space-y-2">
        <FeedbackRow property="Tense" correct={result.tense}
          given={answer.tense ? GNT_TENSE_LABELS[answer.tense] : '—'}
          expected={GNT_TENSE_LABELS[item.tense]} />
        <FeedbackRow property="Voice" correct={result.voice}
          given={answer.voice ? GNT_VOICE_LABELS[answer.voice] : '—'}
          expected={GNT_VOICE_LABELS[item.voice]} />
        <FeedbackRow property="Mood" correct={result.mood}
          given={answer.mood ? GNT_MOOD_LABELS[answer.mood] : '—'}
          expected={GNT_MOOD_LABELS[item.mood]} />

        {/* Finite */}
        {isFinite && item.type === 'finite' && (
          <>
            <FeedbackRow property="Person" correct={result.person!}
              given={answer.person ? GNT_PERSON_LABELS[answer.person] : '—'}
              expected={GNT_PERSON_LABELS[item.person]} />
            <FeedbackRow property="Number" correct={result.number!}
              given={answer.number ? GNT_NUMBER_LABELS[answer.number] : '—'}
              expected={GNT_NUMBER_LABELS[item.number]} />
          </>
        )}

        {/* Participle */}
        {isParticiple && item.type === 'participle' && (
          <>
            <FeedbackRow property="Case" correct={result.parseCase!}
              given={answer.parseCase ? GNT_CASE_LABELS[answer.parseCase] : '—'}
              expected={GNT_CASE_LABELS[item.parseCase]} />
            <FeedbackRow property="Number" correct={result.number!}
              given={answer.number ? GNT_NUMBER_LABELS[answer.number] : '—'}
              expected={GNT_NUMBER_LABELS[item.number]} />
            <FeedbackRow property="Gender" correct={result.gender!}
              given={answer.gender ? GNT_GENDER_LABELS[answer.gender] : '—'}
              expected={GNT_GENDER_LABELS[item.gender]} />
          </>
        )}
      </div>

      {/* Verdict */}
      <div className={[
        'rounded-xl px-5 py-3 text-center font-semibold text-sm',
        result.allCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
      ].join(' ')}>
        {result.allCorrect ? 'Correct!' : 'Not quite — review the corrections above.'}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl text-base font-bold bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
      >
        {isLast ? 'See Results' : 'Next Form'}
      </button>
    </div>
  );
}

function FeedbackRow({ property, correct, given, expected }: {
  property: string; correct: boolean; given: string; expected: string;
}) {
  return (
    <div className={['flex items-center justify-between rounded-lg px-4 py-2.5 text-sm', correct ? 'bg-green-50' : 'bg-red-50'].join(' ')}>
      <span className={['font-semibold', correct ? 'text-green-700' : 'text-red-700'].join(' ')}>{property}</span>
      <div className="flex items-center gap-2">
        {correct ? (
          <span className="text-green-700 font-medium">{given}</span>
        ) : (
          <>
            <span className="text-red-500 line-through">{given}</span>
            <span className="text-red-700 font-semibold">{expected}</span>
          </>
        )}
        <span className={correct ? 'text-green-600' : 'text-red-600'}>{correct ? '✓' : '✗'}</span>
      </div>
    </div>
  );
}
