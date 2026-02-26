import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { vocabulary, type VocabWord } from '../data/vocabulary';
import {
  type SRSCard,
  loadSRSStore, saveSRSStore, loadStats, saveStats,
  recordReview, newCard, nextSRS, isDue, STREAK_THRESHOLD,
} from '../data/srs';

// ─── Types ────────────────────────────────────────────────────────────────────

type StudyMode = 'srs' | 'all';
type AnswerMode = 'flip' | 'type';
type Direction = 'gr-en' | 'en-gr';
type FreqFilter = 'all' | '500+' | '100-499' | '50-99' | '<50';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[i - 1], dp[i]);
      prev = tmp;
    }
  }
  return dp[a.length];
}

function checkAnswer(input: string, gloss: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[()]/g, '').trim();
  const ans = norm(input);
  if (!ans) return false;
  const parts = gloss.split(/[,/]/).map(norm).filter(Boolean);
  return parts.some(
    p =>
      p === ans ||
      (ans.length >= 4 && p.startsWith(ans)) ||
      (p.length > 3 && levenshtein(p, ans) <= 1),
  );
}

function matchFreq(freq: number, f: FreqFilter): boolean {
  if (f === 'all') return true;
  if (f === '500+') return freq >= 500;
  if (f === '100-499') return freq >= 100 && freq < 500;
  if (f === '50-99') return freq >= 50 && freq < 100;
  return freq < 50;
}

function buildQueue(
  vocab: VocabWord[],
  mode: StudyMode,
  store: Record<string, SRSCard>,
): VocabWord[] {
  if (mode === 'all') return shuffle(vocab);
  const due: VocabWord[] = [];
  const fresh: VocabWord[] = [];
  for (const w of vocab) {
    const c = store[w.greek];
    if (!c) fresh.push(w);
    else if (isDue(c)) due.push(w);
  }
  // Due cards first (shuffled), then new cards (shuffled)
  return [...shuffle(due), ...shuffle(fresh)];
}

// ─── Part-of-speech options present in the vocabulary ─────────────────────────

const ALL_POS = ['noun', 'verb', 'adjective', 'pronoun', 'preposition', 'conjunction', 'adverb', 'article'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Flashcards() {
  // Persistent state (localStorage)
  const [srsStore, setSrsStore] = useState<Record<string, SRSCard>>(() => loadSRSStore());
  const [stats, setStats] = useState(() => loadStats());

  // Mode / direction
  const [studyMode, setStudyMode] = useState<StudyMode>('srs');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('flip');
  const [direction, setDirection] = useState<Direction>('gr-en');

  // Filters
  const [freqFilter, setFreqFilter] = useState<FreqFilter>('all');
  const [posFilter, setPosFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Session state
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionScore, setSessionScore] = useState({ known: 0, learning: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // Keep a ref to srsStore so buildQueue always uses latest without deps
  const srsStoreRef = useRef(srsStore);
  srsStoreRef.current = srsStore;

  // ─── Filtered vocabulary ────────────────────────────────────────────────────

  const filteredVocab = useMemo(
    () =>
      vocabulary.filter(
        w =>
          matchFreq(w.frequency, freqFilter) &&
          (posFilter.length === 0 || posFilter.includes(w.partOfSpeech)),
      ),
    [freqFilter, posFilter],
  );

  // SRS stats for display
  const dueCount = useMemo(
    () => filteredVocab.filter(w => { const c = srsStore[w.greek]; return c ? isDue(c) : false; }).length,
    [filteredVocab, srsStore],
  );
  const newCount = useMemo(
    () => filteredVocab.filter(w => !srsStore[w.greek]).length,
    [filteredVocab, srsStore],
  );

  // ─── Session management ─────────────────────────────────────────────────────

  const startSession = useCallback(() => {
    setQueue(buildQueue(filteredVocab, studyMode, srsStoreRef.current));
    setIndex(0);
    setFlipped(false);
    setTypedAnswer('');
    setAnswerResult(null);
    setSessionScore({ known: 0, learning: 0 });
    setSessionDone(false);
  }, [filteredVocab, studyMode]);

  // Mount: start initial session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { startSession(); }, []);

  // Restart when mode or filters change (not on srsStore changes)
  const posFilterKey = posFilter.join(',');
  const prevStudyMode = useRef(studyMode);
  const prevFreqFilter = useRef(freqFilter);
  const prevPosFilterKey = useRef(posFilterKey);

  useEffect(() => {
    if (
      studyMode !== prevStudyMode.current ||
      freqFilter !== prevFreqFilter.current ||
      posFilterKey !== prevPosFilterKey.current
    ) {
      prevStudyMode.current = studyMode;
      prevFreqFilter.current = freqFilter;
      prevPosFilterKey.current = posFilterKey;
      startSession();
    }
  });

  // ─── Review handler ─────────────────────────────────────────────────────────

  const card = queue[index];

  const handleReview = useCallback(
    (correct: boolean) => {
      if (!card) return;

      if (studyMode === 'srs') {
        setSrsStore(prev => {
          const existing = prev[card.greek] ?? newCard(card.greek);
          const updated = nextSRS(existing, correct ? 4 : 1);
          const next = { ...prev, [card.greek]: updated };
          saveSRSStore(next);
          return next;
        });
      }

      setStats(prev => {
        const next = recordReview(prev, correct);
        saveStats(next);
        return next;
      });

      setSessionScore(s => ({
        known: s.known + (correct ? 1 : 0),
        learning: s.learning + (correct ? 0 : 1),
      }));

      if (index + 1 < queue.length) {
        setIndex(i => i + 1);
        setFlipped(false);
        setTypedAnswer('');
        setAnswerResult(null);
      } else {
        setSessionDone(true);
      }
    },
    [card, studyMode, index, queue.length],
  );

  const handleFlip = useCallback(() => setFlipped(f => !f), []);

  const handleTypeSubmit = useCallback(() => {
    if (!card || answerResult !== null) return;
    const expected = direction === 'gr-en' ? card.gloss : card.greek;
    const correct = checkAnswer(typedAnswer, expected);
    setAnswerResult(correct ? 'correct' : 'incorrect');
  }, [card, direction, typedAnswer, answerResult]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (sessionDone) return;
      if (answerMode === 'flip') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
        if (e.key === 'ArrowRight' && flipped) handleReview(true);
        if (e.key === 'ArrowLeft' && flipped) handleReview(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answerMode, flipped, sessionDone, handleFlip, handleReview]);

  // Focus type input when card changes
  useEffect(() => {
    if (answerMode === 'type' && !sessionDone) {
      inputRef.current?.focus();
    }
  }, [answerMode, index, sessionDone]);

  // ─── Derived values ──────────────────────────────────────────────────────────

  const accuracy =
    stats.totalReviewed > 0
      ? Math.round((stats.totalCorrect / stats.totalReviewed) * 100)
      : null;
  const front = card ? (direction === 'gr-en' ? card.greek : card.gloss) : '';
  const back = card ? (direction === 'gr-en' ? card.gloss : card.greek) : '';
  const expectedAnswer = card ? (direction === 'gr-en' ? card.gloss : card.greek) : '';
  const hasActiveFilters = freqFilter !== 'all' || posFilter.length > 0;

  // ─── Session complete screen ─────────────────────────────────────────────────

  if (sessionDone) {
    const total = sessionScore.known + sessionScore.learning;
    const pct = total > 0 ? Math.round((sessionScore.known / total) * 100) : 0;
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-6xl font-bold" style={{ color: 'var(--color-primary)' }}>
          {pct}%
        </div>
        <h2 className="text-2xl font-bold text-text">Session Complete</h2>
        <p className="text-text-muted">
          {sessionScore.known} got it · {sessionScore.learning} still learning
        </p>
        {studyMode === 'srs' && dueCount === 0 && newCount === 0 && (
          <p className="text-text-muted text-sm">
            You're all caught up! Check back tomorrow for more reviews.
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 px-4 sm:px-0">
          <button
            onClick={startSession}
            className="px-5 py-3 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
          >
            Study Again
          </button>
          {studyMode === 'srs' && (
            <button
              onClick={() => setStudyMode('all')}
              className="px-5 py-3 sm:py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Study All Cards
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Empty state ─────────────────────────────────────────────────────────────

  if (!card) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-lg text-text-muted">
          {studyMode === 'srs'
            ? "You're all caught up — no cards due for review."
            : 'No cards match the current filters.'}
        </p>
        {studyMode === 'srs' && (
          <button
            onClick={() => setStudyMode('all')}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
          >
            Study ahead anyway
          </button>
        )}
        {studyMode === 'all' && hasActiveFilters && (
          <button
            onClick={() => { setFreqFilter('all'); setPosFilter([]); }}
            className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Top controls bar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Study mode */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['srs', 'all'] as StudyMode[]).map(m => (
            <button
              key={m}
              onClick={() => setStudyMode(m)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                studyMode === m
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {m === 'srs' ? 'SRS Review' : 'Study All'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direction */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['gr-en', 'en-gr'] as Direction[]).map(d => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  direction === d
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {d === 'gr-en' ? 'Greek → English' : 'English → Greek'}
              </button>
            ))}
          </div>

          {/* Answer mode */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['flip', 'type'] as AnswerMode[]).map(m => (
              <button
                key={m}
                onClick={() => setAnswerMode(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  answerMode === m
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {m === 'flip' ? 'Flip' : 'Type'}
              </button>
            ))}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              hasActiveFilters
                ? 'border-primary text-primary bg-primary/5'
                : showFilters
                ? 'border-gray-300 text-text bg-gray-50'
                : 'border-gray-200 text-text-muted hover:border-gray-300'
            }`}
          >
            Filters{hasActiveFilters ? ' ●' : ''}
          </button>
        </div>
      </div>

      {/* ── Filter panel ──────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="bg-bg-card rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Frequency (occurrences in GNT)
            </p>
            <div className="flex flex-wrap gap-2">
              {(['all', '500+', '100-499', '50-99', '<50'] as FreqFilter[]).map(f => {
                const count = vocabulary.filter(w => matchFreq(w.frequency, f)).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFreqFilter(f)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      freqFilter === f
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-text-muted hover:border-primary/40 hover:text-text'
                    }`}
                  >
                    {f === 'all' ? 'All' : `${f}×`}{' '}
                    <span className={`text-xs ${freqFilter === f ? 'text-white/70' : 'text-text-muted'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Part of Speech
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_POS.map(pos => {
                const count = vocabulary.filter(w => w.partOfSpeech === pos).length;
                if (count === 0) return null;
                const active = posFilter.includes(pos);
                return (
                  <button
                    key={pos}
                    onClick={() =>
                      setPosFilter(prev =>
                        active ? prev.filter(p => p !== pos) : [...prev, pos],
                      )
                    }
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-text-muted hover:border-primary/40 hover:text-text'
                    }`}
                  >
                    {pos}{' '}
                    <span className={`text-xs ${active ? 'text-white/70' : 'text-text-muted'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-sm text-text-muted">
              <strong className="text-text">{filteredVocab.length}</strong> words match
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => { setFreqFilter('all'); setPosFilter([]); }}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="bg-bg-card rounded-xl border border-gray-200 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-text-muted">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {studyMode === 'srs' ? (
              <>
                <span>Due: <strong className="text-text">{dueCount}</strong></span>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span>New: <strong className="text-text">{newCount}</strong></span>
                <span className="hidden sm:inline text-gray-300">|</span>
              </>
            ) : (
              <>
                <span>Card: <strong className="text-text">{index + 1}/{queue.length}</strong></span>
                <span className="hidden sm:inline text-gray-300">|</span>
              </>
            )}
            <span>
              Today:{' '}
              <strong className="text-text">
                {Math.min(stats.cardsStudiedToday, STREAK_THRESHOLD)}/{STREAK_THRESHOLD}
              </strong>
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span>
              Streak: <strong className="text-text">{stats.streak}d</strong>
              {stats.cardsStudiedToday >= STREAK_THRESHOLD && (
                <span className="ml-1 text-accent text-xs">✓</span>
              )}
            </span>
            {accuracy !== null && (
              <>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span>Accuracy: <strong className="text-text">{accuracy}%</strong></span>
              </>
            )}
          </div>
          <span className="text-xs shrink-0">
            ✓ {sessionScore.known} · ✗ {sessionScore.learning}
          </span>
        </div>
      </div>

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div
        onClick={answerMode === 'flip' && !flipped ? handleFlip : undefined}
        className={`bg-bg-card rounded-xl shadow-lg border border-gray-100 px-4 py-6 sm:px-10 sm:py-8 text-center select-none min-h-[200px] sm:min-h-[220px] flex flex-col items-center justify-center transition-shadow ${
          answerMode === 'flip' && !flipped ? 'cursor-pointer active:shadow-lg hover:shadow-xl' : ''
        }`}
      >
        {/* Front side */}
        <p
          className="font-serif leading-tight"
          style={{
            fontSize: direction === 'gr-en' ? '2.8rem' : '1.6rem',
            color: direction === 'gr-en' ? 'var(--color-greek)' : 'inherit',
          }}
        >
          {front}
        </p>
        {direction === 'gr-en' && (
          <p className="text-text-muted text-sm mt-1">{card.partOfSpeech}</p>
        )}

        {/* Flip mode: reveal hint */}
        {answerMode === 'flip' && !flipped && (
          <p className="text-text-muted text-xs mt-6">
            <span className="sm:hidden">tap to reveal</span>
            <span className="hidden sm:inline">click or press space to reveal</span>
          </p>
        )}

        {/* Flip mode: back side */}
        {answerMode === 'flip' && flipped && (
          <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
            <p
              className="font-serif"
              style={{
                fontSize: direction === 'en-gr' ? '2.8rem' : '1.6rem',
                color: direction === 'en-gr' ? 'var(--color-greek)' : 'inherit',
              }}
            >
              {back}
            </p>
            <p className="text-text-muted text-sm mt-1">
              {direction === 'gr-en'
                ? `occurs ${card.frequency.toLocaleString()}× in GNT`
                : card.partOfSpeech}
            </p>
          </div>
        )}

        {/* Type mode: input */}
        {answerMode === 'type' && answerResult === null && (
          <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            <input
              ref={inputRef}
              type="text"
              value={typedAnswer}
              onChange={e => setTypedAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleTypeSubmit(); }}
              placeholder={
                direction === 'gr-en' ? 'Type the English gloss…' : 'Type the Greek word…'
              }
              className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-base sm:text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleTypeSubmit}
              className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light text-sm font-medium transition-colors"
            >
              Check
            </button>
          </div>
        )}

        {/* Type mode: result feedback */}
        {answerMode === 'type' && answerResult !== null && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg w-full max-w-sm text-center ${
              answerResult === 'correct'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {answerResult === 'correct' ? (
              <p className="text-green-700 font-medium">Correct!</p>
            ) : (
              <>
                <p className="text-red-700 font-medium">Not quite</p>
                <p className="text-text-muted text-sm mt-1">
                  Answer:{' '}
                  <span className="font-medium text-text">{expectedAnswer}</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      {answerMode === 'flip' && flipped && (
        <div className="flex gap-3 sm:gap-4 sm:justify-center">
          <button
            onClick={() => handleReview(false)}
            className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 active:bg-red-200 transition-colors font-medium"
          >
            ← Still Learning
          </button>
          <button
            onClick={() => handleReview(true)}
            className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 active:bg-green-200 transition-colors font-medium"
          >
            Got It →
          </button>
        </div>
      )}

      {answerMode === 'type' && answerResult !== null && (
        <div className="flex gap-3 sm:gap-4 sm:justify-center">
          {answerResult === 'incorrect' && (
            <button
              onClick={() => handleReview(false)}
              className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 active:bg-red-200 transition-colors font-medium"
            >
              ← Still Learning
            </button>
          )}
          <button
            onClick={() => handleReview(answerResult === 'correct')}
            className={`flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-lg transition-colors font-medium ${
              answerResult === 'correct'
                ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-200'
                : 'bg-gray-100 text-text hover:bg-gray-200 active:bg-gray-200'
            }`}
          >
            {answerResult === 'correct' ? 'Got It →' : 'Next →'}
          </button>
        </div>
      )}

      {/* ── Keyboard hints (desktop only) ────────────────────────────────── */}
      {answerMode === 'flip' && (
        <p className="hidden sm:block text-xs text-text-muted text-center">
          Keyboard:{' '}
          <kbd className="bg-gray-100 px-1 rounded">Space</kbd> flip ·{' '}
          <kbd className="bg-gray-100 px-1 rounded">→</kbd> got it ·{' '}
          <kbd className="bg-gray-100 px-1 rounded">←</kbd> still learning
        </p>
      )}
      {answerMode === 'type' && (
        <p className="hidden sm:block text-xs text-text-muted text-center">
          Keyboard: <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> check answer
        </p>
      )}

      {/* ── Footer controls ───────────────────────────────────────────────── */}
      <div className="flex justify-center gap-4 pt-1">
        <button
          onClick={startSession}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          Restart session
        </button>
        {studyMode === 'srs' && (
          <button
            onClick={() => {
              if (confirm('Reset all SRS progress? This cannot be undone.')) {
                setSrsStore({});
                saveSRSStore({});
                startSession();
              }
            }}
            className="text-sm text-text-muted hover:text-red-500 transition-colors"
          >
            Reset SRS
          </button>
        )}
      </div>
    </div>
  );
}
