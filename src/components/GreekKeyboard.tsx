import { useState, useRef, useCallback } from 'react';
import { GREEK_MAP, DIACRITIC_MAP, applyFinalSigma, processGreekKey } from '../lib/greek-input';

export default function GreekKeyboard() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { preventDefault, append } = processGreekKey(e.key, e.ctrlKey || e.metaKey);
    if (preventDefault) {
      e.preventDefault();
      if (append) setText(prev => prev + append);
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
          {Object.entries(DIACRITIC_MAP).map(([key, _]) => {
            const labels: Record<string, string> = {
              ')': 'smooth breathing ̓',
              '(': 'rough breathing ̔',
              '/': 'acute accent ́',
              '\\': 'grave accent ̀',
              '=': 'circumflex ͂',
              '|': 'iota subscript ͅ',
            };
            return (
              <div key={key} className="flex gap-2 items-center">
                <kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">{key}</kbd>
                <span className="text-text-muted text-xs">{labels[key]}</span>
              </div>
            );
          })}
          <div className="font-bold col-span-full mt-4 mb-1 text-text-muted uppercase tracking-wide text-xs">Punctuation</div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">?</kbd><span className="text-text-muted text-xs">Greek question mark (;)</span></div>
          <div className="flex gap-2 items-center"><kbd className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono text-primary">:</kbd><span className="text-text-muted text-xs">ano teleia (·)</span></div>
          <div className="col-span-full mt-2 text-text-muted italic text-xs">Final sigma (ς) is applied automatically at word boundaries.</div>
        </div>
      </details>
    </div>
  );
}
