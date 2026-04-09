# greek-tools — Claude Code Guide

## Project Overview

Greek vocabulary and grammar tools for New Testament Greek study. Built with Astro 5 + React 19, deployed to Cloudflare Pages. Routes are file-based under `src/pages/`; interactive features are React islands.

Key routes: `/` (home), `/flashcards`, `/quiz`, `/paradigms`, `/grammar`, `/parse`, `/parse/gnt`, `/reader`, `/daily`, `/keyboard`.

## Tech Stack

- **Framework:** Astro 5 + React 19 (islands architecture)
- **Styling:** Tailwind CSS v4
- **Runtime:** Cloudflare Pages (edge)
- **Analytics:** PostHog (see `docs/adr/001-analytics-posthog.md`)
- **Package manager:** pnpm

## Project Structure

```
src/
  components/     # React islands
  components/grammar/  # Grammar paradigm sub-components
  data/           # Domain data modules (vocabulary, grammar, SRS, etc.)
  lib/            # Pure logic (greek-input, paradigm-quiz, verb-parse, etc.)
  pages/          # Astro routes
  layouts/        # Astro layouts
  test/           # Shared test setup
scripts/          # Build-time data scripts (morphgnt, vocabulary)
public/           # Static assets and pre-built data files
e2e/              # Playwright end-to-end tests
docs/adr/         # Architecture Decision Records
```

## Commands

```bash
pnpm dev            # Start dev server at localhost:4321
pnpm build          # Build (runs data scripts first)
pnpm lint           # Biome lint check
pnpm lint:fix       # Biome lint + auto-fix
pnpm format         # Biome format (write)
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest (watch mode)
pnpm test:run       # Vitest (single run)
pnpm test:coverage  # Coverage report (must stay ≥ thresholds)
pnpm test:e2e       # Playwright e2e tests
```

## Code Style

Enforced by Biome (`biome.json`):

- Single quotes, 2-space indent, 100-char line width, trailing commas
- `noUnusedImports` and `noUnusedVariables` are errors
- `noExplicitAny` and `noConsole` are warnings (off in test files)
- `useExhaustiveDependencies` (React hooks) is a warning

Run `pnpm lint:fix` before committing. The pre-commit hook runs lint-staged automatically.

## Testing

Framework: Vitest + React Testing Library for unit/integration; Playwright for e2e.

### Coverage thresholds (enforced by `vitest run --coverage`)

| Metric     | Threshold |
|------------|-----------|
| Lines      | 90%       |
| Functions  | 90%       |
| Statements | 90%       |
| Branches   | 80%       |

Branches are at 80% (not 90%) due to defensive null-coalescing paths in grammar data types that are unreachable with valid production data.

### Test conventions

- Co-locate tests: `src/lib/foo.test.ts` next to `src/lib/foo.ts`
- Use `describe` blocks for grouping related cases
- Prefer `@testing-library/user-event` over `fireEvent` for simulated user interactions
- Test behavior, not implementation — avoid testing internal state directly
- Mock `localStorage` is pre-configured in `src/test/setup.ts`

### Currently excluded from coverage (TODO: add tests)

These components are excluded from coverage thresholds but should be tested:

- `src/components/GrammarReference.tsx`
- `src/components/DailyVerse.tsx`
- `src/components/GNTReader.tsx`
- `src/components/GreekText.tsx`
- `src/components/Transliteration.tsx`
- `src/data/morphgnt.ts`
- `src/lib/transliteration.ts`

When adding tests for these, remove them from the `coverage.exclude` list in `vitest.config.ts`.

### Writing new tests

Target 90% coverage on all new code. For new features, use the Kent Dodds Testing Trophy as a guide: favor integration tests over unit tests where possible.

## Task Tracking

Features are tracked as GitHub Issues (see `docs/adr/002-github-issues-for-task-tracking.md`). Use `/fix-issue <N>` to implement an issue. Always use `closes #N` in commit messages to auto-close on merge.

Issue template is at `.github/ISSUE_TEMPLATE/feature.md`.

## Greek Domain Notes

- Greek input uses a Beta Code–style mapping (`src/lib/greek-input.ts`): ASCII keys produce Greek characters
- Word-final σ is automatically converted to ς (`applyFinalSigma`)
- Morphological data comes from MorphGNT, pre-processed by `scripts/build-morphgnt.mjs` into `public/data/`
- Vocabulary data is pre-processed by `scripts/build-vocabulary.mjs`
- SRS (Spaced Repetition System) state is persisted in `localStorage` via `src/data/srs.ts`

## Architecture Decisions

See `docs/adr/` for recorded decisions:
- `001-analytics-posthog.md` — why PostHog over alternatives
- `002-github-issues-for-task-tracking.md` — why GitHub Issues replaced PRDs
