import { useState, useRef, useCallback } from 'react';

// Beta-code style mapping: English key → Greek character
const GREEK_MAP: Record<string, string> = {
  a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ',
  i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π',
  r: 'ρ', s: 'σ', w: 'ω', t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ',
  // Uppercase
  A: 'Α', B: 'Β', G: 'Γ', D: 'Δ', E: 'Ε', Z: 'Ζ', H: 'Η', Q: 'Θ',
  I: 'Ι', K: 'Κ', L: 'Λ', M: 'Μ', N: 'Ν', C: 'Ξ', O: 'Ο', P: 'Π',
  R: 'Ρ', S: 'Σ', W: 'Ω', T: 'Τ', U: 'Υ', F: 'Φ', X: 'Χ', Y: 'Ψ',
};

// Diacritical combining characters
const SMOOTH_BREATHING = '\u0313';   // ̓
const ROUGH_BREATHING = '\u0314';    // ̔
const ACUTE = '\u0301';              // ́
const GRAVE = '\u0300';              // ̀
const CIRCUMFLEX = '\u0342';         // ͂
const IOTA_SUB = '\u0345';           // ͅ

// Final sigma: σ at end of word becomes ς
function applyFinalSigma(text: string): string {
  return text.replace(/σ(?=[\s.,;·!?\-—""''"\n\r]|$)/g, 'ς');
}

export default function GreekKeyboard() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow ctrl/cmd shortcuts
    if (e.ctrlKey || e.metaKey) return;

    const key = e.key;

    // Diacritical modifiers (type after the vowel)
    let diacritic: string | null = null;
    switch (key) {
      case ')': diacritic = SMOOTH_BREATHING; break;
      case '(': diacritic = ROUGH_BREATHING; break;
      case '/': diacritic = ACUTE; break;
      case '\\': diacritic = GRAVE; break;
      case '=': diacritic = CIRCUMFLEX; break;
      case '|': diacritic = IOTA_SUB; break;
    }

    if (diacritic) {
      e.preventDefault();
      setText(prev => prev + diacritic);
      return;
    }

    // Greek letter mapping
    const greek = GREEK_MAP[key];
    if (greek) {
      e.preventDefault();
      setText(prev => prev + greek);
      return;
    }

    // Period key → Greek ano teleia (·) with shift
    if (key === ':') {
      e.preventDefault();
      setText(prev => prev + '·');
      return;
    }

    // Question mark → Greek question mark (;)
    if (key === '?') {
      e.preventDefault();
      setText(prev => prev + ';');
      return;
    }
  }, []);

  const displayText = applyFinalSigma(text);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      <textarea
        ref={textareaRef}
        value={displayText}
        onKeyDown={handleKeyDown}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing in English to produce Greek text..."
        className="w-full h-48 p-4 text-2xl font-serif rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none resize-y"
        style={{ color: 'var(--color-greek)', fontFamily: 'serif' }}
        spellCheck={false}
        autoFocus
      />

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleClear}
          className="px-5 py-2 bg-gray-200 text-text rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Clear
        </button>
      </div>

      <details className="bg-bg-card rounded-lg border border-gray-200 p-4">
        <summary className="font-semibold cursor-pointer text-primary">Key Mappings Reference</summary>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 text-sm">
          <div className="font-bold col-span-full mt-2 mb-1 text-text-muted">Letters</div>
          {Object.entries(GREEK_MAP).filter(([k]) => k === k.toLowerCase()).map(([eng, grk]) => (
            <div key={eng} className="flex gap-2">
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{eng}</kbd>
              <span>→</span>
              <span className="font-serif text-lg" style={{ color: 'var(--color-greek)' }}>{grk}</span>
            </div>
          ))}
          <div className="font-bold col-span-full mt-4 mb-1 text-text-muted">Diacritics (type after the vowel)</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">)</kbd> → smooth breathing ̓</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">(</kbd> → rough breathing ̔</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">/</kbd> → acute accent ́</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">\</kbd> → grave accent ̀</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">=</kbd> → circumflex ͂</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">|</kbd> → iota subscript ͅ</div>
          <div className="font-bold col-span-full mt-4 mb-1 text-text-muted">Punctuation</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">?</kbd> → Greek question mark (;)</div>
          <div><kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">:</kbd> → ano teleia (·)</div>
          <div className="col-span-full mt-2 text-text-muted italic">Final sigma (ς) is applied automatically at word boundaries.</div>
        </div>
      </details>
    </div>
  );
}
