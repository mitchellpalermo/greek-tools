# PRD: Daily Dose of Greek Integration

## Overview

Integrate the [Daily Dose of Greek](https://dailydoseofgreek.com) verse-of-the-day into the existing Daily Verse Reader. Daily Dose analyzes a single verse from the Greek New Testament (GNT) each day with a short video walkthrough. This feature fetches their current verse via the WordPress REST API and displays it in the daily reader, with a link out to the Daily Dose video analysis.

---

## Goals

- Align the daily reading with a well-known Greek pedagogy resource so students can read the verse first, then watch the analysis
- Provide a "watch the analysis" call-to-action that links to the Daily Dose video for that day's verse
- Maintain the existing daily reader experience (word popups, glosses, streak tracking, vocabulary crossover) — the only change is *which* verse is shown and the addition of the Daily Dose link

---

## Status

**Complete.** All features implemented: `fetchDailyDoseVerse()` in `src/data/dailyDose.ts` with reference parsing, sessionStorage caching, and 5s timeout; `DailyVerse.tsx` updated to resolve Daily Dose verse first with curated-list fallback; "Watch the analysis" link shown when Daily Dose is active. 19 tests in `dailyDose.test.ts`.

---

## Priority

Medium

---

## Data Source

Daily Dose of Greek is a WordPress site. Their REST API exposes the most recent Scripture Passage post:

```
GET https://dailydoseofgreek.com/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&categories=5
```

Response shape (relevant fields):

```json
[
  {
    "date": "2026-03-10T00:30:12",
    "title": { "rendered": "Matthew 19:28" },
    "slug": "matthew-19-28",
    "link": "https://dailydoseofgreek.com/scripture-passage/matthew-19-28/"
  }
]
```

- `title.rendered` — the verse reference in human-readable format (e.g., `"Matthew 19:28"`, `"1 Corinthians 15:3"`)
- `link` — URL to the Daily Dose page with the embedded video analysis
- `categories=5` filters to Scripture Passage posts only (excludes song mnemonics and other post types)

---

## Features

### 1. Fetch Today's Daily Dose Verse

On page load, fetch the latest Scripture Passage post from the Daily Dose WordPress REST API and parse the verse reference from `title.rendered`.

**Behavior:**

- Client-side `fetch()` call on mount (same pattern as the existing `fetchBook()` call)
- Parse the human-readable reference (e.g., `"Matthew 19:28"`) into a `DailyVerseRef` — book code, chapter, verse, and displayRef
- A new `parseDailyDoseRef(title: string): DailyVerseRef | null` function handles the mapping from human-readable book names (e.g., `"1 Corinthians"`) to MorphGNT book codes (e.g., `'1CO'`)
- Cache the fetched verse in `sessionStorage` (keyed by date) so repeat visits on the same day don't re-fetch

### 2. Verse Display (Unchanged)

Once the Daily Dose verse reference is resolved, the existing verse display pipeline handles everything:

- Fetch the MorphGNT book data via `fetchBook()`
- Render Greek text with `WordToken` components
- Word popup on click (lemma, parse, gloss, frequency)
- Show/Hide glosses toggle
- Vocabulary crossover (dotted underline for studied words)
- "Open chapter" link to the GNT Reader

No changes needed to the rendering layer — it already accepts any `DailyVerseRef`.

### 3. Daily Dose Link

Add a "Watch the analysis" link that opens the Daily Dose video page for today's verse.

**Behavior:**

- Displayed below the verse reference, next to the existing "Open chapter" link
- Opens in a new tab (`target="_blank"`)
- Uses the `link` field from the API response (e.g., `https://dailydoseofgreek.com/scripture-passage/matthew-19-28/`)
- Visually distinguished from the "Open chapter" link (e.g., accent color or small icon) to signal it's an external resource
- Hidden when falling back to the curated list (since the curated verse won't have a corresponding Daily Dose page)

### 4. Fallback to Curated List

If the Daily Dose API is unavailable, fall back to the existing curated verse list.

**Behavior:**

- If the fetch fails (network error, non-200 response, timeout), silently fall back to `getTodayVerse()` from the curated list
- If the API response can't be parsed (missing title, unrecognized book name), fall back the same way
- No error message shown to the user — the daily reader just works with the curated verse instead
- The Daily Dose link is hidden in fallback mode
- Timeout: abort the fetch after 5 seconds

### 5. Streak Tracking (Unchanged)

The reading streak continues to work exactly as before — opening the `/daily` page counts as a read regardless of whether the verse came from Daily Dose or the curated list.

---

## Technical Notes

### Reference Parsing

The `title.rendered` field uses full English book names. A lookup map is needed to convert these to MorphGNT 3-letter codes:

| Daily Dose format | MorphGNT code |
|---|---|
| `Matthew` | `MAT` |
| `Mark` | `MRK` |
| `Luke` | `LUK` |
| `John` | `JHN` |
| `Acts` | `ACT` |
| `Romans` | `ROM` |
| `1 Corinthians` | `1CO` |
| `2 Corinthians` | `2CO` |
| `Galatians` | `GAL` |
| `Ephesians` | `EPH` |
| `Philippians` | `PHP` |
| `Colossians` | `COL` |
| `1 Thessalonians` | `1TH` |
| `2 Thessalonians` | `2TH` |
| `1 Timothy` | `1TI` |
| `2 Timothy` | `2TI` |
| `Titus` | `TIT` |
| `Philemon` | `PHM` |
| `Hebrews` | `HEB` |
| `James` | `JAS` |
| `1 Peter` | `1PE` |
| `2 Peter` | `2PE` |
| `1 John` | `1JN` |
| `2 John` | `2JN` |
| `3 John` | `3JN` |
| `Jude` | `JUD` |
| `Revelation` | `REV` |

The parser should handle edge cases:
- Verse ranges in the title (e.g., `"Romans 8:38-39"`) — use the first verse
- Unexpected formats — return `null` and trigger fallback

### CORS

Confirmed: cross-origin fetch works without issues. Tested from `example.com` against the Daily Dose REST API — returns `200` with valid JSON. No proxy needed.

### File Changes

| File | Change |
|---|---|
| `src/data/dailyDose.ts` | **New.** `fetchDailyDoseVerse()`, `parseDailyDoseRef()`, book-name lookup map, sessionStorage caching |
| `src/data/dailyDose.test.ts` | **New.** Tests for reference parsing (all 27 books, verse ranges, malformed input) and fetch/fallback logic |
| `src/components/DailyVerse.tsx` | **Modified.** Call `fetchDailyDoseVerse()` on mount; pass Daily Dose link URL to the template; fall back to `getTodayVerse()` on failure |

---

## Out of Scope

- Embedding the Daily Dose video directly (copyright/licensing concerns; linking out is sufficient)
- Showing the Daily Dose verse for past days (API only exposes the most recent post reliably)
- Replacing the curated verse list entirely — it remains as the fallback
- User preference to choose between Daily Dose and curated list
- Fetching multiple verses or the full Daily Dose post body

---

## Decisions

- **Client-side fetch over build-time:** The verse changes daily and the site is statically built. A client-side fetch on page load is the simplest approach and avoids needing scheduled rebuilds.
- **sessionStorage cache:** Prevents redundant API calls on repeat visits within the same browser session. Keyed by date string so it auto-invalidates the next day.
- **Silent fallback:** Users shouldn't see an error if the Daily Dose API is down — the curated list provides a seamless backup experience.
- **No RSS feed:** The REST API returns structured JSON with category filtering, which is cleaner to parse than RSS XML.
