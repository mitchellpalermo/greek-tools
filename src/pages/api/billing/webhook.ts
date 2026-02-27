import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { upsertUser, upsertSubscription } from '../../../lib/subscription';

export const prerender = false;

/**
 * POST /api/billing/webhook
 *
 * Handles Stripe webhook events to keep subscription data in D1 in sync.
 *
 * Events handled:
 *   checkout.session.completed          — upsert user row
 *   customer.subscription.created       — upsert subscription row
 *   customer.subscription.updated       — upsert subscription row
 *   customer.subscription.deleted       — set status = 'canceled'
 *
 * IMPORTANT: reads raw body text BEFORE any JSON parsing for signature verification.
 * Uses stripe.webhooks.constructEventAsync (Web Crypto API) — Cloudflare-compatible.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // Must read raw body before parsing — Stripe verifies the exact bytes
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const db = env.DB;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId) break;

        const email =
          session.customer_details?.email ??
          session.customer_email ??
          '';

        await upsertUser(db, userId, email);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.clerk_user_id;
        if (!userId) break;

        // Ensure user row exists (in case checkout event was missed)
        await upsertUser(db, userId, '');

        const item = sub.items.data[0];
        await upsertSubscription(db, {
          subscriptionId: sub.id,
          userId,
          customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          priceId: item?.price.id ?? '',
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.clerk_user_id;
        if (!userId) break;

        await db
          .prepare(
            `UPDATE subscriptions SET status = 'canceled', updated_at = unixepoch()
             WHERE id = ?`,
          )
          .bind(sub.id)
          .run();
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return new Response('Internal error processing webhook', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
