import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

/**
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout session for the monthly subscription and returns
 * the redirect URL. The client JS redirects to Stripe's hosted checkout page.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { userId } = locals.auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = locals.runtime.env;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  // Get the user's email from Clerk auth metadata if available
  let customerEmail: string | undefined;
  try {
    const authObject = locals.auth();
    // sessionClaims may carry the email set in Clerk JWT template
    const claims = authObject.sessionClaims as Record<string, unknown> | null;
    if (claims?.email && typeof claims.email === 'string') {
      customerEmail = claims.email;
    }
  } catch {
    // Not critical — Stripe will ask for email on checkout page
  }

  // Determine origin for success/cancel redirect URLs
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: customerEmail,
      client_reference_id: userId, // passed back in checkout.session.completed webhook
      success_url: `${origin}/drills?checkout=success`,
      cancel_url: `${origin}/drills?checkout=cancel`,
      subscription_data: {
        metadata: { clerk_user_id: userId },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
