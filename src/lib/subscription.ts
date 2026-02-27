import { ACTIVE_SUBSCRIPTION_STATUSES } from './constants';

export interface SubscriptionRow {
  status: string;
  current_period_end: number;
}

/**
 * Returns true if `userId` has an active (or trialing) subscription that has
 * not yet expired. Checks the most recently inserted row for the user.
 *
 * @param db  Cloudflare D1 database binding
 * @param userId  Clerk user ID (e.g. "user_abc123")
 */
export async function hasActiveSubscription(
  db: D1Database,
  userId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT status, current_period_end
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY rowid DESC
       LIMIT 1`,
    )
    .bind(userId)
    .first<SubscriptionRow>();

  if (!row) return false;

  const now = Math.floor(Date.now() / 1000);
  return (
    (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(row.status) &&
    row.current_period_end > now
  );
}

/**
 * Returns the number of drill_sessions rows created by `userId` today (UTC).
 * Used for rate-limiting Claude API calls.
 *
 * @param db  D1 database binding
 * @param userId  Clerk user ID
 * @param type  'challenge' counts all rows; 'explanation' counts rows where parsing = '__explain__'
 */
export async function getDailyUsageCount(
  db: D1Database,
  userId: string,
  type: 'challenge' | 'explanation',
): Promise<number> {
  // UTC midnight for today as a Unix timestamp
  const nowSec = Math.floor(Date.now() / 1000);
  const startOfDay = nowSec - (nowSec % 86400);

  const query =
    type === 'explanation'
      ? `SELECT COUNT(*) as cnt FROM drill_sessions
         WHERE user_id = ? AND parsing = '__explain__' AND created_at >= ?`
      : `SELECT COUNT(*) as cnt FROM drill_sessions
         WHERE user_id = ? AND parsing != '__explain__' AND created_at >= ?`;

  const row = await db
    .prepare(query)
    .bind(userId, startOfDay)
    .first<{ cnt: number }>();

  return row?.cnt ?? 0;
}

/**
 * Upsert a user row in the `users` table. Called when a Stripe checkout
 * session completes so we always have a matching user record before inserting
 * a subscription row.
 */
export async function upsertUser(
  db: D1Database,
  userId: string,
  email: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, email) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email`,
    )
    .bind(userId, email)
    .run();
}

/**
 * Upsert a subscription row from a Stripe subscription object.
 */
export async function upsertSubscription(
  db: D1Database,
  opts: {
    subscriptionId: string;
    userId: string;
    customerId: string;
    status: string;
    priceId: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO subscriptions
         (id, user_id, stripe_customer_id, status, price_id, current_period_end, cancel_at_period_end, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
       ON CONFLICT(id) DO UPDATE SET
         status = excluded.status,
         price_id = excluded.price_id,
         current_period_end = excluded.current_period_end,
         cancel_at_period_end = excluded.cancel_at_period_end,
         updated_at = unixepoch()`,
    )
    .bind(
      opts.subscriptionId,
      opts.userId,
      opts.customerId,
      opts.status,
      opts.priceId,
      opts.currentPeriodEnd,
      opts.cancelAtPeriodEnd ? 1 : 0,
    )
    .run();
}
