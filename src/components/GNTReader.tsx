import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  type MorphWord, type MorphBook, type BookMeta,
  fetchBook, fetchBooks, formatParse, splitWordPunct,
  saveLastPassage,
} from '../data/morphgnt';
import { vocabulary } from '../data/vocabulary';
import { getStudiedLemmas } from '../data/srs';

// ─── Vocabulary lookup ────────────────────────────────────────────────────────

interface VocabEntry { gloss: string; frequency: number }

function buildVocabLookup(): Map<string, VocabEntry> {
  const map = new Map<string, VocabEntry>();
  for (const w of vocabulary) {
    for (const form of w.greek.split(', ')) {
      map.set(form.trim(), { gloss: w.gloss, frequency: w.frequency });
    }
  }
  return map;
}

const vocabLookup = buildVocabLookup();

// ─── URL helpers ──────────────────────────────────────────────────────────────

function parseRef(ref: string): { book: string; chapter: number; verse?: number } {
  const parts = ref.split('.');
  const book = parts[0] || 'JHN';
  const chapter = parseInt(parts[1] ?? '1', 10) || 1;
  const verse = parts[2] ? parseInt(parts[2], 10) || undefined : undefined;
  return { book, chapter, verse };
}

function getUrlRef(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('ref');
}

function setUrlRef(book: string, chapter: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('ref', `${book}.${chapter}`);
  history.replaceState(null, '', url.toString());
}

// ─── WordPopup ────────────────────────────────────────────────────────────────

interface ActiveWord { word: MorphWord; rect: DOMRect }

function WordPopup({ active, onClose }: { active: ActiveWord; onClose: () => void }) {
  const { word, rect } = active;
  const vocab = vocabLookup.get(word.lemma);
  const parse = formatParse(word.pos, word.parsing);

  // Position: below the word, kept within viewport
  const top = rect.bottom + window.scrollY + 6;
  const left = Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 288 - 8));

  // Dismiss on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Dismiss on scroll (popup would visually drift from word)
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('scroll', handler, { passive: true, once: true });
    return () => window.removeEventListener('scroll', handler);
  }, [onClose]);

  const popup = (
    <div
      role="dialog"
      aria-label={`Word info: ${word.lemma}`}
      style={{ position: 'absolute', top, left, zIndex: 50, width: 272 }}
      className="bg-bg-card border border-gray-200 rounded-xl shadow-xl p-4 text-sm"
      // Stop clicks inside from bubbling to the overlay
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="font-serif text-2xl leading-tight"
          style={{ color: 'var(--color-greek)' }}
        >
          {word.lemma}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text transition-colors mt-1 text-xs"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {vocab ? (
        <p className="text-text mb-1">{vocab.gloss}</p>
      ) : (
        <p className="text-text-muted italic mb-1">gloss not available</p>
      )}

      <p className="text-text-muted text-xs">{parse}</p>

      {vocab && (
        <p className="text-text-muted text-xs mt-1">
          {vocab.frequency.toLocaleString()}× in GNT
        </p>
      )}

      <a
        href="/flashcards"
        className="mt-3 block text-center text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
      >
        Study in Flashcards →
      </a>
    </div>
  );

  return createPortal(popup, document.body);
}

// ─── WordToken ────────────────────────────────────────────────────────────────

function WordToken({
  word,
  showGloss,
  studied,
  onActivate,
}: {
  word: MorphWord;
  showGloss: boolean;
  studied: boolean;
  onActivate: (word: MorphWord, rect: DOMRect) => void;
}) {
  const [wordText, punct] = splitWordPunct(word.text);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (spanRef.current) onActivate(word, spanRef.current.getBoundingClientRect());
  }, [word, onActivate]);

  return (
    // inline-flex column so gloss stacks below the word without breaking flow
    <span
      className="inline-flex flex-col items-center"
      style={{ verticalAlign: 'top', marginRight: '0.25em' }}
    >
      <span className="flex items-baseline">
        <span
          ref={spanRef}
          onClick={handleClick}
          className={`font-serif cursor-pointer rounded px-0.5 hover:bg-accent/10 transition-colors ${
            studied ? 'underline decoration-accent/60 decoration-dotted underline-offset-2' : ''
          }`}
          style={{
            fontSize: '1.35rem',
            lineHeight: '1.6',
            color: 'var(--color-greek)',
            // Remove 300ms tap delay on touch devices; browser handles scroll vs tap discrimination
            touchAction: 'manipulation',
          }}
        >
          {wordText}
        </span>
        {punct && (
          <span className="text-text" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            {punct}
          </span>
        )}
      </span>

      {showGloss && (
        <span className="text-text-muted" style={{ fontSize: '0.62rem', lineHeight: 1.2, maxWidth: '5rem', textAlign: 'center' }}>
          {vocabLookup.get(word.lemma)?.gloss?.split(',')[0] ?? word.lemma}
        </span>
      )}
    </span>
  );
}

// ─── VerseDisplay ─────────────────────────────────────────────────────────────

function VerseDisplay({
  verseNum,
  words,
  showGlosses,
  studiedLemmas,
  activeWord,
  onActivate,
}: {
  verseNum: number;
  words: MorphWord[];
  showGlosses: boolean;
  studiedLemmas: Set<string>;
  activeWord: MorphWord | null;
  onActivate: (word: MorphWord, rect: DOMRect) => void;
}) {
  return (
    <span id={`verse-${verseNum}`} className="inline">
      <sup className="text-text-muted text-xs font-normal select-none mr-0.5 relative top-0">
        {verseNum}
      </sup>
      {words.map((word, i) => (
        <WordToken
          key={i}
          word={word}
          showGloss={showGlosses}
          studied={studiedLemmas.has(word.lemma)}
          onActivate={onActivate}
        />
      ))}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GNTReader() {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [book, setBook] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [bookData, setBookData] = useState<MorphBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
  const [showGlosses, setShowGlosses] = useState(false);
  const [studiedLemmas] = useState<Set<string>>(() => {
    try { return getStudiedLemmas(); } catch { return new Set(); }
  });

  // Load book list once on mount; also read initial passage from URL
  useEffect(() => {
    fetchBooks()
      .then(list => { setBooks(list); })
      .catch(() => { /* books.json not yet built; list will be empty */ });

    const ref = getUrlRef();
    if (ref) {
      const { book: b, chapter: ch } = parseRef(ref);
      setBook(b);
      setChapter(ch);
    }
  }, []);

  // Fetch book data whenever book changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBookData(null);

    fetchBook(book)
      .then(data => { if (!cancelled) { setBookData(data); setLoading(false); } })
      .catch(err => {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [book]);

  // Update URL and save history whenever passage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUrlRef(book, chapter);
    saveLastPassage(`${book}.${chapter}`);
  }, [book, chapter]);

  // Scroll to verse anchor on initial load if ref includes verse
  const didScrollRef = useRef(false);
  useEffect(() => {
    if (!bookData || didScrollRef.current) return;
    const ref = getUrlRef();
    if (!ref) return;
    const { verse } = parseRef(ref);
    if (verse) {
      const el = document.getElementById(`verse-${verse}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        didScrollRef.current = true;
      }
    }
  }, [bookData]);

  // Reset scroll flag when chapter changes
  useEffect(() => { didScrollRef.current = false; }, [book, chapter]);

  const handleActivate = useCallback((word: MorphWord, rect: DOMRect) => {
    setActiveWord(prev =>
      prev?.word === word ? null : { word, rect },
    );
  }, []);

  const handleClosePopup = useCallback(() => setActiveWord(null), []);

  const currentBook = books.find(b => b.code === book);
  const chapterCount = currentBook?.chapters ?? 0;
  const chapterVerses = bookData?.[String(chapter)] ?? {};
  const verseNums = Object.keys(chapterVerses)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    // Overlay click closes popup
    <div onClick={handleClosePopup}>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-3 mb-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Book selector */}
        <select
          value={book}
          onChange={e => { setBook(e.target.value); setChapter(1); }}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-bg-card focus:border-primary focus:outline-none"
        >
          {books.length === 0 ? (
            <option value={book}>{book}</option>
          ) : (
            books.map(b => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))
          )}
        </select>

        {/* Chapter selector */}
        <select
          value={chapter}
          onChange={e => setChapter(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-bg-card focus:border-primary focus:outline-none"
        >
          {chapterCount === 0 ? (
            <option value={chapter}>Chapter {chapter}</option>
          ) : (
            Array.from({ length: chapterCount }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Chapter {n}</option>
            ))
          )}
        </select>

        {/* Chapter navigation arrows */}
        <div className="flex gap-1">
          <button
            onClick={e => { e.stopPropagation(); setChapter(c => Math.max(1, c - 1)); }}
            disabled={chapter <= 1}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous chapter"
          >
            ←
          </button>
          <button
            onClick={e => { e.stopPropagation(); setChapter(c => chapterCount ? Math.min(chapterCount, c + 1) : c + 1); }}
            disabled={chapterCount > 0 && chapter >= chapterCount}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next chapter"
          >
            →
          </button>
        </div>

        {/* Gloss toggle */}
        <button
          onClick={e => { e.stopPropagation(); setShowGlosses(g => !g); }}
          className={`ml-auto px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            showGlosses
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 text-text-muted hover:border-gray-300 hover:text-text'
          }`}
        >
          {showGlosses ? 'Hide glosses' : 'Show glosses'}
        </button>
      </div>

      {/* ── Chapter heading ────────────────────────────────────────────────── */}
      {currentBook && (
        <h2 className="text-text-muted text-sm font-medium mb-4 select-none">
          {currentBook.name} {chapter}
        </h2>
      )}

      {/* ── Text area ─────────────────────────────────────────────────────── */}
      {loading && (
        <p className="text-text-muted text-center py-16">Loading…</p>
      )}

      {error && (
        <div className="text-center py-16 space-y-3">
          <p className="text-red-600 text-sm">
            Could not load {book}: {error}
          </p>
          <p className="text-text-muted text-xs">
            Run <code className="bg-gray-100 px-1 rounded">pnpm run build:data</code> to generate the data files.
          </p>
        </div>
      )}

      {!loading && !error && bookData && (
        <div
          className="leading-relaxed max-w-2xl"
          style={{ wordSpacing: showGlosses ? '0.3em' : undefined }}
        >
          {verseNums.map(v => (
            <VerseDisplay
              key={v}
              verseNum={v}
              words={chapterVerses[String(v)] ?? []}
              showGlosses={showGlosses}
              studiedLemmas={studiedLemmas}
              activeWord={activeWord?.word ?? null}
              onActivate={handleActivate}
            />
          ))}
        </div>
      )}

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      {!loading && !error && bookData && studiedLemmas.size > 0 && (
        <p className="text-text-muted text-xs mt-6 select-none">
          <span className="underline decoration-accent/60 decoration-dotted underline-offset-2">dotted underline</span>
          {' '}= word you've studied in Flashcards
        </p>
      )}

      {/* ── Word popup ────────────────────────────────────────────────────── */}
      {activeWord && (
        <WordPopup active={activeWord} onClose={handleClosePopup} />
      )}
    </div>
  );
}
