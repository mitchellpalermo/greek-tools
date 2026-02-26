import type { DrillWord } from '../data/morphgnt-drill-pool';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The JSON object Claude returns for a challenge.
 */
export interface ChallengeResponse {
  word: string;
  lemma: string;
  gloss: string;
  pos: string;
  parsing: string;
}

/**
 * The user's selection during a parsing drill.
 * Only the fields relevant to the POS are checked.
 */
export interface ParseSelection {
  // Nominals and participles
  case?: string;   // N G D A V
  number?: string; // S P
  gender?: string; // M F N
  // Finite verbs and participles
  tense?: string;  // P I F A X Y
  voice?: string;  // A M P
  mood?: string;   // I D S O N P
  person?: string; // 1 2 3
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

/**
 * Build the system + user message for the challenge selection prompt.
 * We pass Claude a sample of real MorphGNT words and ask it to pick the best
 * one for an intermediate student — no fabrication of Greek forms possible.
 */
export function buildChallengePrompt(candidates: DrillWord[]): {
  system: string;
  user: string;
} {
  const system = [
    'You are a Greek morphology tutor. Your task is to select the single best',
    'parsing challenge from a list of real Greek New Testament words.',
    '',
    'Rules:',
    '- Return ONLY valid JSON, no prose, no markdown fences.',
    '- The JSON must match exactly: { "word": string, "lemma": string,',
    '  "gloss": string, "pos": string, "parsing": string }',
    '- Do not invent or modify any Greek form. Use the exact word, lemma, pos,',
    '  and parsing from the input list.',
    '- Provide a concise 1-4 word English gloss for the lemma.',
    '- Prefer words that test a non-obvious morphological feature.',
    '- Avoid particles, conjunctions, prepositions, and adverbs.',
  ].join('\n');

  const wordList = candidates
    .map((w, i) => `${i + 1}. word="${w.word}" lemma="${w.lemma}" pos="${w.pos}" parsing="${w.parsing}"`)
    .join('\n');

  const user = [
    'Select ONE word from this list that makes a good parsing challenge for an',
    'intermediate Greek student (knows paradigms but still makes errors).',
    'Prefer nouns, adjectives, finite verbs, infinitives, or participles.',
    '',
    wordList,
    '',
    'Return only the JSON object — nothing else.',
  ].join('\n');

  return { system, user };
}

/**
 * Build the user message for the streaming explanation prompt.
 */
export function buildExplanationPrompt(opts: {
  word: string;
  lemma: string;
  correctParse: string;
  studentParse: string;
  pos: string;
}): string {
  return [
    `The Greek word is "${opts.word}" (lemma: ${opts.lemma}, POS: ${opts.pos}).`,
    `Correct parse: ${opts.correctParse}`,
    `Student parsed it as: ${opts.studentParse}`,
    '',
    'In 3–5 sentences explain: which morphological features (endings, augment,',
    'reduplication, stem changes) indicate the correct parse, and where the',
    'student likely went wrong. Be specific and pedagogically helpful.',
    'Plain text only — no markdown, no lists, no headers.',
  ].join('\n');
}

// ─── Response parser ──────────────────────────────────────────────────────────

/**
 * Parse and validate Claude's raw text response for a challenge.
 * Strips markdown code fences if Claude added them despite instructions.
 * Returns null if the response cannot be parsed or is missing required fields.
 */
export function parseChallengeResponse(raw: string): ChallengeResponse | null {
  // Strip optional markdown code fences (```json ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const obj = parsed as Record<string, unknown>;
  const { word, lemma, gloss, pos, parsing } = obj;

  if (
    typeof word !== 'string' || !word ||
    typeof lemma !== 'string' || !lemma ||
    typeof gloss !== 'string' || !gloss ||
    typeof pos !== 'string' || !pos ||
    typeof parsing !== 'string' || parsing.length !== 8
  ) {
    return null;
  }

  return { word, lemma, gloss, pos, parsing };
}

// ─── Answer checker ───────────────────────────────────────────────────────────

/**
 * MorphGNT 8-character parse code positions:
 *   [0] person     1 2 3 -
 *   [1] tense      P I F A X Y -
 *   [2] voice      A M P -
 *   [3] mood       I D S O N P -
 *   [4] case       N G D A V -
 *   [5] number     S P -
 *   [6] gender     M F N -
 *   [7] degree     C S -
 *
 * POS codes that indicate nominal inflection:
 *   N- A- RA RP RR RD RI RX
 */
const NOMINAL_POS = new Set(['N-', 'A-', 'RA', 'RP', 'RR', 'RD', 'RI', 'RX']);

/**
 * Check whether the student's ParseSelection matches the challenge's parse code.
 *
 * @param challenge  The challenge returned by Claude (contains pos + parsing)
 * @param selection  The student's selected morphological categories
 * @returns true if all required positions match
 */
export function checkAnswer(
  challenge: Pick<ChallengeResponse, 'pos' | 'parsing'>,
  selection: ParseSelection,
): boolean {
  const p = challenge.parsing;
  const pos = challenge.pos;

  if (pos === 'V-') {
    const mood = p[3];

    if (mood === 'N') {
      // Infinitive: check tense [1] + voice [2]
      return selection.tense === p[1] && selection.voice === p[2];
    }

    if (mood === 'P') {
      // Participle: check tense [1] + voice [2] + case [4] + number [5] + gender [6]
      return (
        selection.tense === p[1] &&
        selection.voice === p[2] &&
        selection.case === p[4] &&
        selection.number === p[5] &&
        selection.gender === p[6]
      );
    }

    // Finite verb: check person [0] + tense [1] + voice [2] + mood [3] + number [5]
    return (
      selection.person === p[0] &&
      selection.tense === p[1] &&
      selection.voice === p[2] &&
      selection.mood === p[3] &&
      selection.number === p[5]
    );
  }

  if (NOMINAL_POS.has(pos)) {
    // Nominal: check case [4] + number [5] + gender [6]
    return (
      selection.case === p[4] &&
      selection.number === p[5] &&
      selection.gender === p[6]
    );
  }

  // Unsupported POS — treat as incorrect
  return false;
}
