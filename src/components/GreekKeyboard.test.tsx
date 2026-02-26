import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GreekKeyboard from './GreekKeyboard';

// ─── helpers ───────────────────────────────────────────────────────────────

function getTextarea(): HTMLTextAreaElement {
  return screen.getByRole('textbox') as HTMLTextAreaElement;
}

function typeKey(textarea: HTMLTextAreaElement, key: string): void {
  fireEvent.keyDown(textarea, { key });
}

// ─── rendering ─────────────────────────────────────────────────────────────

describe('GreekKeyboard', () => {
  beforeEach(() => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  });

  it('renders the textarea with a placeholder', () => {
    render(<GreekKeyboard />);
    const textarea = getTextarea();
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('typing'));
  });

  it('renders Copy to Clipboard button', () => {
    render(<GreekKeyboard />);
    expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it('renders Clear button', () => {
    render(<GreekKeyboard />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  // ─── letter mapping ──────────────────────────────────────────────────────

  describe('letter key mappings', () => {
    it.each([
      // 's' is excluded: sigma at end-of-input becomes ς via final sigma.
      // That behavior is covered in the "final sigma conversion" section.
      ['a', 'α'], ['b', 'β'], ['g', 'γ'], ['d', 'δ'], ['e', 'ε'],
      ['z', 'ζ'], ['h', 'η'], ['q', 'θ'], ['i', 'ι'], ['k', 'κ'],
      ['l', 'λ'], ['m', 'μ'], ['n', 'ν'], ['c', 'ξ'], ['o', 'ο'],
      ['p', 'π'], ['r', 'ρ'], ['w', 'ω'], ['t', 'τ'],
      ['u', 'υ'], ['f', 'φ'], ['x', 'χ'], ['y', 'ψ'],
    ])('key %s produces %s', (key, expected) => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, key);
      expect(textarea.value).toContain(expected);
    });

    it.each([
      ['A', 'Α'], ['B', 'Β'], ['G', 'Γ'], ['D', 'Δ'], ['E', 'Ε'],
      ['K', 'Κ'], ['L', 'Λ'], ['M', 'Μ'], ['N', 'Ν'], ['P', 'Π'],
      ['T', 'Τ'], ['S', 'Σ'],
    ])('uppercase key %s produces %s', (key, expected) => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), key);
      expect(getTextarea().value).toContain(expected);
    });
  });

  // ─── diacritical marks ───────────────────────────────────────────────────

  describe('diacritical key mappings', () => {
    it('key ) appends smooth breathing', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), ')');
      expect(getTextarea().value).toContain('\u0313');
    });

    it('key ( appends rough breathing', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '(');
      expect(getTextarea().value).toContain('\u0314');
    });

    it('key / appends acute accent', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '/');
      expect(getTextarea().value).toContain('\u0301');
    });

    it('key \\ appends grave accent', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '\\');
      expect(getTextarea().value).toContain('\u0300');
    });

    it('key = appends circumflex', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '=');
      expect(getTextarea().value).toContain('\u0342');
    });

    it('key | appends iota subscript', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '|');
      expect(getTextarea().value).toContain('\u0345');
    });
  });

  // ─── punctuation ─────────────────────────────────────────────────────────

  describe('punctuation key mappings', () => {
    it('key : produces ano teleia (·)', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), ':');
      expect(getTextarea().value).toContain('·');
    });

    it('key ? produces Greek question mark (;)', () => {
      render(<GreekKeyboard />);
      typeKey(getTextarea(), '?');
      expect(getTextarea().value).toContain(';');
    });
  });

  // ─── ctrl/cmd passthrough ─────────────────────────────────────────────────

  describe('ctrl/cmd passthrough', () => {
    it('does not intercept ctrl+a (select all)', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      // ctrl+a should not produce 'α'
      fireEvent.keyDown(textarea, { key: 'a', ctrlKey: true });
      expect(textarea.value).toBe('');
    });

    it('does not intercept cmd+c (copy)', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      fireEvent.keyDown(textarea, { key: 'c', metaKey: true });
      expect(textarea.value).toBe('');
    });
  });

  // ─── final sigma ──────────────────────────────────────────────────────────

  describe('final sigma conversion', () => {
    it('converts σ to ς at end of input', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, 's');
      // At end of string, σ should become ς
      expect(textarea.value).toBe('ς');
    });

    it('keeps σ as σ in the middle of a word', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, 's');
      typeKey(textarea, 'a');
      // 'sa' → 'σα', σ is mid-word so stays σ
      expect(textarea.value).toContain('σ');
      expect(textarea.value).not.toMatch(/^ς/);
    });

    it('converts σ to ς before a space', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, 's');
      // Simulate a space being typed via onChange (space isn't intercepted)
      fireEvent.change(textarea, { target: { value: 'σ ' } });
      expect(textarea.value).toBe('ς ');
    });
  });

  // ─── clear button ─────────────────────────────────────────────────────────

  describe('Clear button', () => {
    it('clears text from the textarea', () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, 'a');
      expect(textarea.value).not.toBe('');

      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      expect(textarea.value).toBe('');
    });
  });

  // ─── copy button ──────────────────────────────────────────────────────────

  describe('Copy to Clipboard button', () => {
    it('calls navigator.clipboard.writeText with current text', async () => {
      render(<GreekKeyboard />);
      const textarea = getTextarea();
      typeKey(textarea, 'a');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }));
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('α'));
    });

    it('shows "✓ Copied!" feedback after click', async () => {
      render(<GreekKeyboard />);
      fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }));
      expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });
});
