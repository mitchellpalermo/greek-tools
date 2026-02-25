import { useState, useMemo, useCallback, useEffect } from 'react';
import { vocabulary, type VocabWord } from '../data/vocabulary';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Direction = 'greek-to-english' | 'english-to-greek';

export default function Flashcards() {
  const [direction, setDirection] = useState<Direction>('greek-to-english');
  const [cards, setCards] = useState<VocabWord[]>(() => shuffle(vocabulary));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ known: 0, learning: 0 });

  const card = cards[index];

  const handleFlip = useCallback(() => setFlipped(f => !f), []);

  const handleKnown = useCallback(() => {
    setScore(s => ({ ...s, known: s.known + 1 }));
    advance();
  }, [index, cards.length]);

  const handleLearning = useCallback(() => {
    setScore(s => ({ ...s, learning: s.learning + 1 }));
    advance();
  }, [index, cards.length]);

  function advance() {
    setFlipped(false);
    if (index + 1 < cards.length) {
      setIndex(i => i + 1);
    } else {
      // Reshuffle
      setCards(shuffle(vocabulary));
      setIndex(0);
    }
  }

  const handleReset = () => {
    setCards(shuffle(vocabulary));
    setIndex(0);
    setFlipped(false);
    setScore({ known: 0, learning: 0 });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleFlip(); }
      if (e.key === 'ArrowRight' && flipped) handleKnown();
      if (e.key === 'ArrowLeft' && flipped) handleLearning();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, handleFlip, handleKnown, handleLearning]);

  const front = direction === 'greek-to-english' ? card.greek : card.gloss;
  const back = direction === 'greek-to-english' ? card.gloss : card.greek;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setDirection('greek-to-english')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === 'greek-to-english' ? 'bg-primary text-white' : 'bg-gray-200 text-text'}`}
          >
            Greek → English
          </button>
          <button
            onClick={() => setDirection('english-to-greek')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === 'english-to-greek' ? 'bg-primary text-white' : 'bg-gray-200 text-text'}`}
          >
            English → Greek
          </button>
        </div>
        <div className="text-sm text-text-muted">
          Card {index + 1} of {cards.length} &nbsp;|&nbsp;
          ✓ {score.known} &nbsp; ✗ {score.learning}
        </div>
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className="bg-bg-card rounded-xl shadow-lg border border-gray-100 p-12 text-center cursor-pointer select-none min-h-[250px] flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
      >
        {!flipped ? (
          <>
            <p className={`text-4xl font-serif mb-3 ${direction === 'greek-to-english' ? '' : ''}`}
               style={direction === 'greek-to-english' ? { color: 'var(--color-greek)' } : {}}>
              {front}
            </p>
            <p className="text-text-muted text-sm">
              {direction === 'greek-to-english' ? card.partOfSpeech : ''}
            </p>
            <p className="text-text-muted text-xs mt-4">click or press space to reveal</p>
          </>
        ) : (
          <>
            <p className="text-sm text-text-muted mb-2">{direction === 'greek-to-english' ? card.greek : card.gloss}</p>
            <p className={`text-3xl font-serif mb-2`}
               style={direction === 'english-to-greek' ? { color: 'var(--color-greek)' } : {}}>
              {back}
            </p>
            <p className="text-text-muted text-sm">{card.partOfSpeech} — occurs {card.frequency}× in GNT</p>
          </>
        )}
      </div>

      {/* Action buttons (shown when flipped) */}
      {flipped && (
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLearning}
            className="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            ← Still Learning
          </button>
          <button
            onClick={handleKnown}
            className="px-6 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
          >
            Got It →
          </button>
        </div>
      )}

      <div className="text-center">
        <button onClick={handleReset} className="text-sm text-text-muted hover:text-primary transition-colors">
          Shuffle & Reset
        </button>
      </div>

      <p className="text-xs text-text-muted text-center">
        Keyboard: <kbd className="bg-gray-100 px-1 rounded">Space</kbd> flip · <kbd className="bg-gray-100 px-1 rounded">→</kbd> got it · <kbd className="bg-gray-100 px-1 rounded">←</kbd> still learning
      </p>
    </div>
  );
}
