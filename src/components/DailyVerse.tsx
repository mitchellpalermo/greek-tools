import { useState, useEffect, useCallback } from 'react';
import { type MorphWord, type MorphVerse, fetchBook } from '../data/morphgnt';
import {
  getTodayVerse,
  markReadToday,
  loadStreakData,
  type DailyStreakData,
} from '../data/dailyVerses';
import { getStudiedLemmas } from '../data/srs';
import { type ActiveWord, WordPopup, WordToken } from './GreekText';

export default function DailyVerse() {
  const verseRef = getTodayVerse();

  const [verse, setVerse] = useState<MorphVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
  const [showGlosses, setShowGlosses] = useState(false);
  const [streakData, setStreakData] = useState<DailyStreakData>({ streak: 0, lastReadDate: '' });
  const [studiedLemmas] = useState<Set<string>>(() => {
    try { return getStudiedLemmas(); } catch { return new Set(); }
  });

  // Fetch verse + mark as read on mount
  useEffect(() => {
    fetchBook(verseRef.book)
      .then(data => {
        const words = data[String(verseRef.chapter)]?.[String(verseRef.verse)] ?? [];
        setVerse(words);
        setLoading(false);
      })
      .catch(err => {
        setError((err as Error).message);
        setLoading(false);
      });

    // Marking as read is the only requirement for streak — just opening the page counts
    const updated = markReadToday();
    setStreakData(updated);
  }, []);

  // On mount, also load existing streak to show immediately before markReadToday resolves
  useEffect(() => {
    try { setStreakData(loadStreakData()); } catch { /* ignore */ }
  }, []);

  const handleActivate = useCallback((word: MorphWord, rect: DOMRect) => {
    setActiveWord(prev => prev?.word === word ? null : { word, rect });
  }, []);

  const handleClosePopup = useCallback(() => setActiveWord(null), []);

  return (
    <div onClick={handleClosePopup}>

      {/* ── Streak counter ─────────────────────────────────────────────────── */}
      {streakData.streak > 0 && (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
          style={{ background: '#FEF3C7', color: '#92400E' }}
        >
          <span aria-hidden="true">🔥</span>
          {streakData.streak === 1
            ? '1-day streak — keep it going!'
            : `${streakData.streak}-day streak`}
        </div>
      )}

      {/* ── Verse card ─────────────────────────────────────────────────────── */}
      <div className="bg-bg-card rounded-2xl shadow-sm border border-white p-8 mb-4">

        {loading && (
          <p className="text-text-muted text-center py-10">Loading…</p>
        )}

        {error && (
          <div className="text-center py-10 space-y-2">
            <p className="text-red-600 text-sm">Could not load verse: {error}</p>
            <p className="text-text-muted text-xs">
              Run <code className="bg-gray-100 px-1 rounded">pnpm run build:data</code> to generate the MorphGNT data files.
            </p>
          </div>
        )}

        {!loading && !error && verse && (
          <>
            {/* Greek text */}
            <div
              className="flex flex-wrap mb-6"
              style={{ gap: '0 0', lineHeight: '2' }}
              onClick={e => e.stopPropagation()}
            >
              {verse.map((word, i) => (
                <WordToken
                  key={i}
                  word={word}
                  showGloss={showGlosses}
                  studied={studiedLemmas.has(word.lemma)}
                  onActivate={handleActivate}
                />
              ))}
            </div>

            {/* Reference + controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100">
              <p
                className="text-sm font-semibold italic"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-greek)' }}
              >
                — {verseRef.displayRef}
              </p>

              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowGlosses(g => !g)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    showGlosses
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text'
                  }`}
                >
                  {showGlosses ? 'Hide glosses' : 'Show glosses'}
                </button>
                <a
                  href={`/reader?ref=${verseRef.book}.${verseRef.chapter}.${verseRef.verse}`}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-text-muted hover:border-gray-300 hover:text-text transition-colors"
                >
                  Open chapter →
                </a>
              </div>
            </div>

            {/* Known-word legend */}
            {studiedLemmas.size > 0 && (
              <p className="text-text-muted text-xs mt-4 select-none">
                <span className="underline decoration-accent/60 decoration-dotted underline-offset-2">
                  dotted underline
                </span>
                {' '}= word you've studied in Flashcards
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Word popup ─────────────────────────────────────────────────────── */}
      {activeWord && <WordPopup active={activeWord} onClose={handleClosePopup} />}
    </div>
  );
}
