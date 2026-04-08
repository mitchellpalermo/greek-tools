/**
 * Tests for src/components/Flashcards.tsx
 *
 * Focuses on the frequency preset selector introduced in issue #48:
 * - Preset buttons are visible in the deck setup area
 * - Each preset correctly scopes the deck to the frequency band
 * - Presets are combinable with the POS filter
 * - Active preset is reflected in the filter badge
 * - Default preset is "Top 100" (500+ occurrences)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Flashcards, { FREQ_PRESETS, DEFAULT_FREQ_PRESET } from './Flashcards';
import { vocabulary } from '../data/vocabulary';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('posthog-js', () => ({
  default: { capture: vi.fn(), init: vi.fn(), identify: vi.fn() },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderFlashcards() {
  return render(<Flashcards />);
}

function getPresetButton(label: string) {
  // Preset buttons are in the preset row; find by accessible name (label text)
  return screen.getByRole('button', { name: new RegExp(label, 'i') });
}

function getFiltersToggle() {
  return screen.getByRole('button', { name: /toggle filters/i });
}

// ─── FREQ_PRESETS constant ────────────────────────────────────────────────────

describe('FREQ_PRESETS', () => {
  it('exports five presets: All, Top 100, 101–300, 301–500, 500+', () => {
    const labels = FREQ_PRESETS.map(p => p.label);
    expect(labels).toEqual(['All', 'Top 100', '101–300', '301–500', '500+']);
  });

  it('maps preset labels to the correct FreqFilter values', () => {
    expect(FREQ_PRESETS.find(p => p.label === 'All')!.filter).toBe('all');
    expect(FREQ_PRESETS.find(p => p.label === 'Top 100')!.filter).toBe('500+');
    expect(FREQ_PRESETS.find(p => p.label === '101–300')!.filter).toBe('100-499');
    expect(FREQ_PRESETS.find(p => p.label === '301–500')!.filter).toBe('50-99');
    expect(FREQ_PRESETS.find(p => p.label === '500+')!.filter).toBe('<50');
  });

  it('DEFAULT_FREQ_PRESET is Top 100 (500+ occurrences)', () => {
    expect(DEFAULT_FREQ_PRESET.label).toBe('Top 100');
    expect(DEFAULT_FREQ_PRESET.filter).toBe('500+');
  });
});

// ─── Preset selector visibility ───────────────────────────────────────────────

describe('Preset selector', () => {
  it('renders all five preset buttons', () => {
    renderFlashcards();
    for (const preset of FREQ_PRESETS) {
      // Use a broad regex that matches the label text
      const buttons = screen.getAllByRole('button', {
        name: new RegExp(preset.label.replace('+', '\\+').replace('–', '–'), 'i'),
      });
      expect(buttons.length).toBeGreaterThan(0);
    }
  });

  it('shows a "Preset" label', () => {
    renderFlashcards();
    expect(screen.getByText(/^preset$/i)).toBeInTheDocument();
  });

  it('marks the default preset (Top 100) as active via aria-pressed', () => {
    renderFlashcards();
    // Find all preset buttons and check aria-pressed
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const topBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.includes('Top 100'),
    );
    expect(topBtn).toBeDefined();
    expect(topBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks non-active presets as aria-pressed=false', () => {
    renderFlashcards();
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    );
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

// ─── Default preset ───────────────────────────────────────────────────────────

describe('Default preset behavior', () => {
  it('initializes with Top 100 preset active', () => {
    renderFlashcards();
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const buttons = within(presetSection).getAllByRole('button');
    const active = buttons.filter(b => b.getAttribute('aria-pressed') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toContain('Top 100');
  });

  it('filter badge shows Top 100 preset by default', () => {
    renderFlashcards();
    const badge = getFiltersToggle();
    expect(badge.textContent).toContain('Top 100');
  });
});

// ─── Preset selection ─────────────────────────────────────────────────────────

describe('Selecting a preset', () => {
  it('activates the clicked preset and deactivates others', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;

    await act(async () => { await user.click(allBtn); });

    expect(allBtn).toHaveAttribute('aria-pressed', 'true');

    const topBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.includes('Top 100'),
    )!;
    expect(topBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('filter badge updates to show the selected preset name', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const midBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.includes('101–300'),
    )!;

    await act(async () => { await user.click(midBtn); });

    const badge = getFiltersToggle();
    expect(badge.textContent).toContain('101–300');
  });

  it('filter badge shows "Filters" when All preset is selected', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;

    await act(async () => { await user.click(allBtn); });

    const badge = getFiltersToggle();
    expect(badge.textContent).toMatch(/^filters$/i);
  });
});

// ─── Frequency band scoping ───────────────────────────────────────────────────

describe('Frequency band scoping', () => {
  it('Top 100 preset scopes to words with 500+ occurrences', () => {
    const expected = vocabulary.filter(w => w.frequency >= 500).length;
    // 500+ band should have some words
    expect(expected).toBeGreaterThan(0);
    // The count rendered next to the preset button should match
    renderFlashcards();
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const topBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.includes('Top 100'),
    )!;
    expect(topBtn.textContent).toContain(`(${expected})`);
  });

  it('101–300 preset shows count for 100–499 occurrences band', () => {
    const expected = vocabulary.filter(w => w.frequency >= 100 && w.frequency < 500).length;
    renderFlashcards();
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const btn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.includes('101–300'),
    )!;
    expect(btn.textContent).toContain(`(${expected})`);
  });

  it('All preset does not show a word count', () => {
    renderFlashcards();
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;
    expect(allBtn.textContent).not.toMatch(/\(\d+\)/);
  });
});

// ─── Combinability with POS filter ────────────────────────────────────────────

describe('Combinability with POS filter', () => {
  async function openFilters(user: ReturnType<typeof userEvent.setup>) {
    await act(async () => {
      await user.click(getFiltersToggle());
    });
  }

  it('POS filter remains active when changing preset', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    // Open filters panel
    await openFilters(user);

    // Click a POS filter (noun)
    const nounBtn = screen.getByRole('button', { name: /^noun/i });
    await act(async () => { await user.click(nounBtn); });

    // Change preset to All
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;
    await act(async () => { await user.click(allBtn); });

    // Noun POS button should still be active
    const nounBtnAfter = screen.getByRole('button', { name: /^noun/i });
    expect(nounBtnAfter).toHaveClass('bg-grape');
  });

  it('filter badge shows ● when both preset and POS filter are active', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    await openFilters(user);
    const nounBtn = screen.getByRole('button', { name: /^noun/i });
    await act(async () => { await user.click(nounBtn); });

    const badge = getFiltersToggle();
    expect(badge.textContent).toContain('●');
    expect(badge.textContent).toContain('Top 100'); // preset still active
  });

  it('filter badge shows ● with "Filters" when only POS filter is active', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    // First switch to All preset
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;
    await act(async () => { await user.click(allBtn); });

    // Open filters and select a POS
    await openFilters(user);
    const nounBtn = screen.getByRole('button', { name: /^noun/i });
    await act(async () => { await user.click(nounBtn); });

    const badge = getFiltersToggle();
    expect(badge.textContent).toMatch(/filters.*●/i);
  });
});

// ─── Reset behavior ───────────────────────────────────────────────────────────

describe('Reset behavior', () => {
  it('clear filters resets to All preset', async () => {
    const user = userEvent.setup();
    renderFlashcards();

    // Open filter panel
    await act(async () => { await user.click(getFiltersToggle()); });

    // Clear filters button should be visible (Top 100 is active by default)
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    await act(async () => { await user.click(clearBtn); });

    // Preset should now be All
    const presetSection = screen.getByText(/^preset$/i).parentElement!;
    const allBtn = within(presetSection).getAllByRole('button').find(
      b => b.textContent?.trim() === 'All',
    )!;
    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
