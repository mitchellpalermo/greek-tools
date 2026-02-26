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
        className="w-full h-48 p-4 text-2xl rounded-xl border-2 border-indigo-100 focus:border-primary focus:outline-none resize-y bg-bg-card shadow-sm"
        style={{ color: 'var(--color-greek)', fontFamily: 'var(--font-greek)' }}
        spellCheck={false}
        autoFocus
      />

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-semibold shadow-sm"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleClear}
          className="px-5 py-2 bg-bg-card text-text-muted border border-gray-200 rounded-lg hover:border-gray-300 hover:text-text transition-colors font-medium"
        >
          Clear
        </button>
      </div>

      <details className="bg-bg-card rounded-xl border border-indigo-100 p-4 shadow-sm">
        <summary className="font-semibold cursor-pointer text-primary">Key Mappings Reference</summary>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 text-sm">
          <div className="font-bold col-span-full mt-2 mb-1 text-text-muted uppercase tracking-wide text-xs">Letters</div>
          {Object.entries(GREEK_MAP).filter(([k]) => k === k.toLowerCase()).map(([eng, grk]) => (
            <div key={eng} className="flex gap-2 items-center">
              <kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">{eng}</kbd>
              <span className="text-text-muted">→</span>
              <span className="text-lg" style={{ color: 'var(--color-greek)', fontFamily: 'var(--font-greek)' }}>{grk}</span>
            </div>
          ))}
          <div className="font-bold col-span-full mt-4 mb-1 text-text-muted uppercase tracking-wide text-xs">Diacritics (type after the vowel)</div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">)</kbd><span className="text-text-muted text-xs">smooth breathing ̓</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">(</kbd><span className="text-text-muted text-xs">rough breathing ̔</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">/</kbd><span className="text-text-muted text-xs">acute accent ́</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">\</kbd><span className="text-text-muted text-xs">grave accent ̀</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">=</kbd><span className="text-text-muted text-xs">circumflex ͂</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">|</kbd><span className="text-text-muted text-xs">iota subscript ͅ</span></div>
          <div className="font-bold col-span-full mt-4 mb-1 text-text-muted uppercase tracking-wide text-xs">Punctuation</div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">?</kbd><span className="text-text-muted text-xs">Greek question mark (;)</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">:</kbd><span className="text-text-muted text-xs">ano teleia (·)</span></div>
          <div className="col-span-full mt-2 text-text-muted italic text-xs">Final sigma (ς) is applied automatically at word boundaries.</div>
        </div>
      </details>
    </div>
  );
}
