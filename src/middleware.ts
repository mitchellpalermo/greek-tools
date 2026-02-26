import { clerkMiddleware } from '@clerk/astro/server';

// Clerk middleware runs globally and populates Astro.locals.auth() on every request.
// Subscription enforcement happens at the individual page and API route level,
// not here — keeps middleware fast and stateless.
export const onRequest = clerkMiddleware();
