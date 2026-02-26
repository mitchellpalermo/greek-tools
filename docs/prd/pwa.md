# PRD: Progressive Web App (PWA)

## Overview

Make greek.tools installable as a Progressive Web Application (PWA) with offline support for the tools that don't require a network. Enables students to use the site on their phone in class, on transit, or anywhere connectivity is unreliable.

---

## Status

**Not started.**

## LOE

**Small** (2–3 days)

---

## Goals

- Allow students to install greek.tools as a native-like app on iOS, Android, or desktop
- Support offline use for Flashcards, Grammar Reference, and Transliteration (static content)
- Keep implementation simple using Astro's first-class PWA tooling

---

## Features

### 1. Installable App Manifest

A `manifest.json` with the metadata needed for browser install prompts.

**Content:**
- `name`: "Greek Tools"
- `short_name`: "greek.tools"
- `theme_color`: matches `--color-primary` from the site CSS
- `background_color`: white
- `display`: `standalone`
- App icons at 192×192 and 512×512 (PNG, matching the site's aesthetic)
- `start_url`: `/`

### 2. Service Worker with Offline Cache

Cache static assets and key pages so the core tools work without a network connection.

**Caching strategy:**

| Resource | Strategy |
|---|---|
| App shell (HTML, CSS, JS, fonts) | Cache-first (precached at install) |
| Grammar reference page | Cache-first (precached) |
| Flashcard vocabulary data (`vocabulary.ts` bundle) | Cache-first (precached) |
| MorphGNT per-book JSON files | Network-first, cache fallback |
| Daily Verse page | Network-first, cache fallback |

**Offline behavior:**
- Flashcards, Grammar Reference, Transliteration, and Greek Keyboard: fully available offline
- GNT Reader: shows previously loaded books from cache; displays "You're offline — previously loaded books may still work" for uncached books
- Daily Verse: shows cached verse from last visit if network is unavailable

### 3. App Shell Caching

The site layout, navigation, fonts, and CSS are always cached so the app loads instantly on repeat visits regardless of network speed.

---

## Technical Notes

- **Tooling:** `@vite-pwa/astro` — Astro's official PWA integration, wraps Workbox. Handles service worker generation, manifest injection, and precaching automatically based on the Vite build output.
- **Configuration:** Add `@vite-pwa/astro` to `astro.config.mjs` with:
  - `registerType: 'autoUpdate'` — silently updates the service worker when a new version is deployed
  - `workbox.globPatterns` to precache HTML, CSS, JS, fonts, and key data files
  - `workbox.runtimeCaching` rules for MorphGNT JSON files (network-first with a 30-day cache)
- **MorphGNT files:** These are large (~500 KB per book uncompressed); only cache books the user has opened (runtime caching). Do not precache all 27 books at install.
- **iOS considerations:** iOS Safari requires the manifest and service worker for Add to Home Screen. No special handling needed beyond standard manifest fields; Workbox covers the rest.
- **Update UX:** When a new version is available, show a subtle "Update available — reload to apply" banner rather than forcing a reload.

---

## Out of Scope

- Push notifications
- Background sync
- Offline data creation or editing (e.g., creating custom decks while offline)

---

## Open Questions

- Should the install prompt be surfaced explicitly in the UI (e.g., a "Install App" button), or rely entirely on the browser's native install prompt?
- How should the site handle the case where a user's SRS data grows large enough that `localStorage` limits become a concern on mobile?
