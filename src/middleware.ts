import { clerkMiddleware } from '@clerk/astro/server';
import { defineMiddleware } from 'astro/middleware';

// Clerk middleware runs globally and populates Astro.locals.auth() on every request.
// Subscription enforcement happens at the individual page and API route level,
// not here — keeps middleware fast and stateless.

// In local dev without valid Clerk keys (e.g. PUBLIC_CLERK_PUBLISHABLE_KEY is a
// placeholder), skip Clerk entirely so `astro dev` doesn't error on every request.
const hasValidClerkKey =
  import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') &&
  import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';

export const onRequest =
  import.meta.env.DEV && !hasValidClerkKey
    ? defineMiddleware((_ctx, next) => next()) // no-op — dev without Clerk keys
    : clerkMiddleware();
