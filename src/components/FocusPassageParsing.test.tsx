import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusPassage } from '../data/focusPassages';
import { loadParseHistoryStore } from '../data/focusPassages';
import FocusPassageParsing from './FocusPassageParsing';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const passage: FocusPassage = {
  id: 'test-passage',
  book: 'REV',
  startChapter: 1,
  startVerse: 1,
  endChapter: 1,
  endVerse: 11,
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Verb fixtures must be hoisted so they're available inside vi.mock() factories,
// which are moved to the top of the file by Vitest's transformer.
const { VERB_1, VERB_2 } = vi.hoisted(() => ({
  VERB_1: {
    type: 'finite' as const,
    form: 'λύω',
    lemma: 'λύω',
    verseRef: 'Rev. 1:1',
    verseWords: [{ text: 'λύω', lemma: 'λύω', pos: 'V-', parsing: '1PAI-S--' }],
    wordIndex: 0,
    tense: 'present' as const,
    voice: 'active' as const,
    mood: 'indicative' as const,
    person: '1st' as const,
    number: 'singular' as const,
  },
  VERB_2: {
    type: 'finite' as const,
    form: 'λύεις',
    lemma: 'λύω',
    verseRef: 'Rev. 1:2',
    verseWords: [{ text: 'λύεις', lemma: 'λύω', pos: 'V-', parsing: '2PAI-S--' }],
    wordIndex: 0,
    tense: 'present' as const,
    voice: 'active' as const,
    mood: 'indicative' as const,
    person: '2nd' as const,
    number: 'singular' as const,
  },
}));

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock('../data/morphgnt', async (importActual) => {
  const actual = await importActual<typeof import('../data/morphgnt')>();
  return {
    ...actual,
    fetchBook: vi.fn().mockResolvedValue({}),
    fetchBooks: vi.fn().mockResolvedValue([{ code: 'REV', name: 'Revelation', chapters: 22 }]),
  };
});

vi.mock('../lib/gnt-parse', async (importActual) => {
  const actual = await importActual<typeof import('../lib/gnt-parse')>();
  return {
    ...actual,
    extractVerbsMultiChapter: vi.fn().mockReturnValue([VERB_1, VERB_2]),
    // Return all items regardless of requested count
    sampleVerbs: vi.fn().mockImplementation((items: unknown[]) => items),
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSelectForLabel(labelText: string): HTMLSelectElement {
  const label = screen.getByText(labelText, { selector: 'label' });
  return label.closest('div')!.querySelector('select') as HTMLSelectElement;
}

async function answerFiniteVerb(
  user: ReturnType<typeof userEvent.setup>,
  tense: string,
  voice: string,
  mood: string,
  person: string,
  number: string,
) {
  await user.selectOptions(getSelectForLabel('Tense'), tense);
  await user.selectOptions(getSelectForLabel('Voice'), voice);
  await user.selectOptions(getSelectForLabel('Mood'), mood);
  // Person and Number appear conditionally after a finite mood is selected
  await user.selectOptions(getSelectForLabel('Person'), person);
  await user.selectOptions(getSelectForLabel('Number'), number);
  await user.click(screen.getByRole('button', { name: /submit/i }));
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FocusPassageParsing — parse history recording', () => {
  it('records each verb result immediately after Next, before the session completes', async () => {
    const user = userEvent.setup();
    render(<FocusPassageParsing passage={passage} bookName="Revelation" />);

    await waitFor(() =>
      expect(screen.getByText('2 verb forms in this passage')).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /start parsing/i }));

    // Answer verb 1 correctly: present active indicative 1st singular
    await answerFiniteVerb(user, 'present', 'active', 'indicative', '1st', 'singular');
    // Advance past feedback — verb 2 is still unanswered
    await user.click(screen.getByRole('button', { name: /next form/i }));

    // History must be persisted at this point, mid-session
    expect(loadParseHistoryStore()['test-passage']).toEqual({ correct: 1, total: 1 });
  });

  it('accumulates correct and incorrect results across a completed session', async () => {
    const user = userEvent.setup();
    render(<FocusPassageParsing passage={passage} bookName="Revelation" />);

    await waitFor(() =>
      expect(screen.getByText('2 verb forms in this passage')).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /start parsing/i }));

    // Verb 1: correct answer
    await answerFiniteVerb(user, 'present', 'active', 'indicative', '1st', 'singular');
    await user.click(screen.getByRole('button', { name: /next form/i }));

    // Verb 2: wrong tense (aorist instead of present)
    await answerFiniteVerb(user, 'aorist', 'active', 'indicative', '2nd', 'singular');
    await user.click(screen.getByRole('button', { name: /see results/i }));

    expect(loadParseHistoryStore()['test-passage']).toEqual({ correct: 1, total: 2 });
  });
});
