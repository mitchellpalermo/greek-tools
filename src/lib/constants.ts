/**
 * Rate-limiting constants for Claude API usage.
 * These caps keep worst-case cost well below monthly subscription revenue (~$5/mo).
 *
 * Cost estimate at limits:
 *   50 challenges/day × ~300 tokens × 30 days × $3/MTok  ≈ $0.14/user/month
 *   25 explanations/day × ~600 tokens × 30 days × $3/MTok ≈ $0.13/user/month
 *   Total worst case: ~$0.27/user/month vs $5 subscription revenue
 */

/** Maximum Claude challenge requests per user per calendar day (UTC). */
export const DAILY_CHALLENGE_LIMIT = 50;

/** Maximum Claude explanation requests per user per calendar day (UTC). */
export const DAILY_EXPLANATION_LIMIT = 25;

/** Hard cap on tokens Claude may return for a challenge response. */
export const CHALLENGE_MAX_TOKENS = 256;

/** Hard cap on tokens Claude may return for a streaming explanation. */
export const EXPLANATION_MAX_TOKENS = 600;

/** Number of words sampled from the drill pool and sent to Claude per challenge request. */
export const DRILL_POOL_SAMPLE_SIZE = 20;

/** Stripe subscription statuses that grant feature access. */
export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;
