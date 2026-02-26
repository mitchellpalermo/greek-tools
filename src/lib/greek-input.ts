/**
 * Shared Greek keyboard input utilities.
 *
 * Used by GreekKeyboard (standalone input tool) and ParadigmQuiz (cell inputs).
 * Implements a Beta Code–style mapping: English keys produce Greek characters.
 */

// ---------------------------------------------------------------------------
// Key mappings
// ---------------------------------------------------------------------------

/** Beta Code–style mapping from ASCII key to Greek letter. */
export const GREEK_MAP: Record<string, string> = {
  a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ',
  i: 'ι', k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π',
  r: 'ρ', s: 'σ', w: 'ω', t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ',
  // Uppercase
  A: 'Α', B: 'Β', G: 'Γ', D: 'Δ', E: 'Ε', Z: 'Ζ', H: 'Η', Q: 'Θ',
  I: 'Ι', K: 'Κ', L: 'Λ', M: 'Μ', N: 'Ν', C: 'Ξ', O: 'Ο', P: 'Π',
  R: 'Ρ', S: 'Σ', W: 'Ω', T: 'Τ', U: 'Υ', F: 'Φ', X: 'Χ', Y: 'Ψ',
};

/** Mapping from ASCII symbol key to Greek combining diacritical character. */
export const DIACRITIC_MAP: Record<string, string> = {
  ')':  '\u0313', // smooth breathing  ̓
  '(':  '\u0314', // rough breathing   ̔
  '/':  '\u0301', // acute accent      ́
  '\\': '\u0300', // grave accent      ̀
  '=':  '\u0342', // circumflex        ͂
  '|':  '\u0345', // iota subscript    ͅ
};

// ---------------------------------------------------------------------------
// Text transforms
// ---------------------------------------------------------------------------

/**
 * Convert word-final σ to the final-sigma variant ς.
 * Applied before display; the raw state may still contain σ.
 */
export function applyFinalSigma(text: string): string {
  return text.replace(/σ(?=[\s.,;·!?\-—""''"\n\r]|$)/g, 'ς');
}

// ---------------------------------------------------------------------------
// Answer comparison
// ---------------------------------------------------------------------------

/**
 * Normalize an answer string for comparison:
 * - Strip the optional movable-nu notation `(ν)` and trim.
 * - Apply Unicode NFC normalization.
 */
export function normalizeAnswer(s: string): string {
  return s.replace(/\(ν\)/g, '').trim().normalize('NFC');
}

/**
 * Strip all combining diacritical marks (breathings, accents, iota subscript)
 * so we can compare base consonants/vowels independently from their accents.
 */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
}

export type AnswerResult = 'correct' | 'accent-only' | 'wrong';

/**
 * Grade a user's input against the correct answer for a paradigm cell.
 *
 * - 'correct'      — exact match (after normalizing movable nu and NFC)
 * - 'accent-only'  — consonants/vowels match but accentuation is wrong
 * - 'wrong'        — substantively different form
 *
 * Final sigma is applied to the user input before comparison.
 * Forms with `(ν)` accept both the short form and the ν-included form.
 */
export function checkAnswer(userInput: string, correctAnswer: string): AnswerResult {
  const user = normalizeAnswer(applyFinalSigma(userInput.trim()));
  const correct = normalizeAnswer(correctAnswer);
  // Also accept the ν-present variant, e.g. "λύουσιν" for "λύουσι(ν)"
  const correctWithNu = correctAnswer.replace(/\(ν\)/g, 'ν').trim().normalize('NFC');

  if (user === correct || user === correctWithNu) return 'correct';
  if (stripDiacritics(user) === stripDiacritics(correct)) return 'accent-only';
  return 'wrong';
}

// ---------------------------------------------------------------------------
// Keyboard event handler
// ---------------------------------------------------------------------------

/**
 * Process a `keydown` event on a Greek input element.
 *
 * @param key          The `event.key` value.
 * @param ctrlOrMeta   Whether Ctrl or Meta (Cmd) is held — skip Greek mapping.
 * @returns An object describing what to do:
 *   - `preventDefault`: true if the event should be suppressed.
 *   - `append`: a string to append to raw state, or null if no action.
 */
export function processGreekKey(
  key: string,
  ctrlOrMeta: boolean,
): { preventDefault: boolean; append: string | null } {
  if (ctrlOrMeta) return { preventDefault: false, append: null };

  const diacritic = DIACRITIC_MAP[key];
  if (diacritic) return { preventDefault: true, append: diacritic };

  const greek = GREEK_MAP[key];
  if (greek) return { preventDefault: true, append: greek };

  if (key === ':') return { preventDefault: true, append: '·' };
  if (key === '?') return { preventDefault: true, append: ';' };

  return { preventDefault: false, append: null };
}
