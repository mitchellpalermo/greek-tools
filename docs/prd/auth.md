# PRD: User Authentication

## Overview

User accounts for greek.tools, required to gate the paid Parsing Drills feature. Authentication is handled by Clerk, which provides email/password and social login out of the box, with first-class Cloudflare Workers and Astro support.

---

## Status

**Not started.** Planned for implementation alongside Parsing Drills and Subscriptions.

## LOE

**Small (1–2 days)** as a standalone concern; bundled with billing infrastructure in the Parsing Drills build.

---

## Goals

- Enable user identity so subscription status can be persisted and enforced
- Keep the sign-up flow as lightweight as possible — students should not need an account until they hit a paid feature
- Use a proven hosted solution (Clerk) rather than building auth from scratch

---

## Provider

**Clerk** (`@clerk/astro`) — chosen for:
- First-class Astro and Cloudflare Workers integration
- Built-in UI components (sign-in, sign-up, user button) that match the site's style via CSS variables
- Generous free tier (10,000 MAUs)
- JWT-based session management via `Astro.locals.auth()` in server-side routes and middleware

---

## Features

### 1. Sign In / Sign Up

Students create an account to unlock paid features.

**Supported methods (Clerk defaults):**
- Email + password
- Google OAuth (one-click sign-in)

**Behavior:**
- Sign-in/sign-up UI provided by Clerk's prebuilt components, styled to match the site
- After authentication, Clerk sets a session cookie; Astro middleware validates it on every request
- Unauthenticated users who visit `/drills` are automatically redirected to Clerk's sign-in page and returned to `/drills` after completing auth

### 2. User Button in Nav

A small user avatar/button in the top-right of the navigation bar when signed in.

**Behavior:**
- Shows Clerk's `<UserButton>` component — displays avatar, sign-out, and account management
- When not signed in: shows "Sign in" link
- Clicking "Sign in" from any page opens Clerk's sign-in modal or redirect

### 3. Session Management

**Behavior:**
- Sessions persist across browser restarts (Clerk manages cookie expiry)
- JWT validated server-side via Clerk middleware on every protected route and API call
- No custom session tokens or cookies are managed by the application code

---

## Technical Design

### Middleware

```ts
// src/middleware.ts
import { clerkMiddleware } from '@clerk/astro/server';
export const onRequest = clerkMiddleware();
```

Clerk middleware runs globally and populates `Astro.locals.auth()` on every request. Subscription-gated pages call `auth.protect()` to redirect unauthenticated users.

### Server-Side Auth Check

In any Astro page or API route:
```ts
const { userId } = Astro.locals.auth();
// userId is null if not signed in, a Clerk user ID string if signed in
```

### Astro Config

```js
import clerk from '@clerk/astro';
// integrations: [react(), clerk()]
```

### Environment Variables

| Variable | Where |
|---|---|
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Public (safe to expose to browser) |
| `CLERK_SECRET_KEY` | Wrangler secret (never exposed) |

---

## Out of Scope

- Custom auth UI (Clerk's prebuilt components are used throughout)
- Multi-factor authentication configuration (Clerk supports it; not enabled by default)
- Organization or team accounts
- Admin dashboard (Clerk dashboard used for user management)

---

## Open Questions

- Should sign-in be a full redirect to Clerk's hosted page, or a modal overlay? Clerk supports both — redirect is simpler and the safer default.
