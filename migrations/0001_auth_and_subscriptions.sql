-- greek-tools D1 schema
-- Run with: wrangler d1 execute greek-tools-db --file=migrations/0001_auth_and_subscriptions.sql

-- One row per Clerk user.
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,   -- Clerk user ID (e.g. "user_abc123")
  email      TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- One row per Stripe subscription.
-- A user can have at most one active subscription at a time.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   TEXT PRIMARY KEY,  -- Stripe subscription ID
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id   TEXT NOT NULL,
  status               TEXT NOT NULL,     -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  price_id             TEXT NOT NULL DEFAULT '',
  current_period_end   INTEGER NOT NULL,  -- Unix timestamp — checked on every request
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_customer ON subscriptions(stripe_customer_id);

-- One row per parsing drill attempt (for analytics and rate limiting).
CREATE TABLE IF NOT EXISTS drill_sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lemma      TEXT NOT NULL,
  pos        TEXT NOT NULL,
  parsing    TEXT NOT NULL,
  correct    INTEGER NOT NULL DEFAULT 0,  -- 0 = wrong, 1 = correct
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_drills_user ON drill_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drills_user_date ON drill_sessions(user_id, created_at);
