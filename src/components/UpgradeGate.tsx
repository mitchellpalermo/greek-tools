import { useState } from 'react';

/**
 * UpgradeGate
 *
 * Shown when the user is authenticated but has no active subscription.
 * Calls /api/billing/checkout on click and redirects to Stripe Checkout.
 */
export default function UpgradeGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Failed to start checkout. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
        style={{ background: 'var(--color-grape-light, #F5F3FF)', color: 'var(--color-grape, #7C3AED)' }}
      >
        α
      </div>

      <h1
        className="text-3xl font-extrabold mb-3"
        style={{ color: 'var(--color-primary)' }}
      >
        Parsing Drills
      </h1>

      <p className="text-text-muted mb-2 leading-relaxed">
        Practice morphological parsing with real Greek New Testament words.
        AI-powered challenges adapt to your level with instant feedback and
        detailed explanations.
      </p>

      <div
        className="rounded-xl p-4 mb-8 text-sm"
        style={{ background: '#F5F3FF', color: '#5B21B6' }}
      >
        <p className="font-semibold mb-1">What you get with a subscription:</p>
        <ul className="text-left space-y-1 mt-2">
          <li>✓ Unlimited parsing drills from the Greek New Testament</li>
          <li>✓ AI explanations for every answer (correct or wrong)</li>
          <li>✓ Covers nouns, adjectives, verbs, infinitives, and participles</li>
          <li>✓ Supports all future premium features</li>
        </ul>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-grape, #7C3AED)' }}
      >
        {loading ? 'Redirecting to checkout…' : 'Subscribe for $5 / month'}
      </button>

      {error && (
        <p className="mt-4 text-sm" style={{ color: 'var(--color-coral, #F43F5E)' }}>
          {error}
        </p>
      )}

      <p className="text-xs text-text-muted mt-4">
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
  );
}
