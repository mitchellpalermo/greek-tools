import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasActiveSubscription,
  getDailyUsageCount,
  upsertUser,
  upsertSubscription,
} from './subscription';

// ─── D1 mock helpers ──────────────────────────────────────────────────────────

function makeD1(firstResult: unknown, runResult: unknown = { success: true }) {
  const stmt = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(firstResult),
    run: vi.fn().mockResolvedValue(runResult),
  };
  return {
    prepare: vi.fn().mockReturnValue(stmt),
    _stmt: stmt,
  } as unknown as D1Database & { _stmt: typeof stmt };
}

// ─── hasActiveSubscription ────────────────────────────────────────────────────

describe('hasActiveSubscription', () => {
  it('returns true for active subscription not yet expired', async () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const db = makeD1({ status: 'active', current_period_end: future });
    expect(await hasActiveSubscription(db, 'user_1')).toBe(true);
  });

  it('returns true for trialing subscription not yet expired', async () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const db = makeD1({ status: 'trialing', current_period_end: future });
    expect(await hasActiveSubscription(db, 'user_1')).toBe(true);
  });

  it('returns false when subscription is expired', async () => {
    const past = Math.floor(Date.now() / 1000) - 1;
    const db = makeD1({ status: 'active', current_period_end: past });
    expect(await hasActiveSubscription(db, 'user_1')).toBe(false);
  });

  it('returns false for canceled status', async () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const db = makeD1({ status: 'canceled', current_period_end: future });
    expect(await hasActiveSubscription(db, 'user_1')).toBe(false);
  });

  it('returns false for past_due status', async () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    const db = makeD1({ status: 'past_due', current_period_end: future });
    expect(await hasActiveSubscription(db, 'user_1')).toBe(false);
  });

  it('returns false when no subscription row exists', async () => {
    const db = makeD1(null);
    expect(await hasActiveSubscription(db, 'user_1')).toBe(false);
  });

  it('queries with correct user_id binding', async () => {
    const db = makeD1(null);
    await hasActiveSubscription(db, 'user_abc');
    expect(db._stmt.bind).toHaveBeenCalledWith('user_abc');
  });
});

// ─── getDailyUsageCount ───────────────────────────────────────────────────────

describe('getDailyUsageCount', () => {
  it('returns count for challenge type', async () => {
    const db = makeD1({ cnt: 12 });
    const result = await getDailyUsageCount(db, 'user_1', 'challenge');
    expect(result).toBe(12);
  });

  it('returns count for explanation type', async () => {
    const db = makeD1({ cnt: 5 });
    const result = await getDailyUsageCount(db, 'user_1', 'explanation');
    expect(result).toBe(5);
  });

  it('returns 0 when row is null', async () => {
    const db = makeD1(null);
    const result = await getDailyUsageCount(db, 'user_1', 'challenge');
    expect(result).toBe(0);
  });

  it('explanation query includes __explain__ filter', async () => {
    const db = makeD1({ cnt: 0 });
    await getDailyUsageCount(db, 'user_1', 'explanation');
    const sql = (db.prepare as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(sql).toContain('__explain__');
  });

  it('challenge query excludes __explain__ rows', async () => {
    const db = makeD1({ cnt: 0 });
    await getDailyUsageCount(db, 'user_1', 'challenge');
    const sql = (db.prepare as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(sql).toContain("!= '__explain__'");
  });
});

// ─── upsertUser ───────────────────────────────────────────────────────────────

describe('upsertUser', () => {
  it('calls run on the prepared statement', async () => {
    const db = makeD1(null);
    await upsertUser(db, 'user_1', 'test@example.com');
    expect(db._stmt.run).toHaveBeenCalled();
  });

  it('binds userId and email', async () => {
    const db = makeD1(null);
    await upsertUser(db, 'user_1', 'test@example.com');
    expect(db._stmt.bind).toHaveBeenCalledWith('user_1', 'test@example.com');
  });
});

// ─── upsertSubscription ───────────────────────────────────────────────────────

describe('upsertSubscription', () => {
  const opts = {
    subscriptionId: 'sub_123',
    userId: 'user_1',
    customerId: 'cus_456',
    status: 'active',
    priceId: 'price_789',
    currentPeriodEnd: 9999999999,
    cancelAtPeriodEnd: false,
  };

  it('calls run on the prepared statement', async () => {
    const db = makeD1(null);
    await upsertSubscription(db, opts);
    expect(db._stmt.run).toHaveBeenCalled();
  });

  it('converts cancelAtPeriodEnd boolean to 0/1', async () => {
    const db = makeD1(null);
    await upsertSubscription(db, { ...opts, cancelAtPeriodEnd: true });
    const bindArgs = (db._stmt.bind as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(bindArgs[bindArgs.length - 1]).toBe(1);

    const db2 = makeD1(null);
    await upsertSubscription(db2, { ...opts, cancelAtPeriodEnd: false });
    const bindArgs2 = (db2._stmt.bind as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(bindArgs2[bindArgs2.length - 1]).toBe(0);
  });
});
