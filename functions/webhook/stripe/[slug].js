// -----------------------------------------------------------------------------
// Stripe webhook adapter.
//
// URL shape: /webhook/stripe/<STRIPE_WEBHOOK_SLUG>
//
// Platform specifics:
//   - Unique checkout identifier arrives as `body.data.object.metadata.trk`.
//   - Events handled: `checkout.session.completed`.
//   - Signature: Stripe-Signature (HMAC-SHA256).
// -----------------------------------------------------------------------------

import { processPurchase } from '../_core.js';
import { guardSlug, verifyStripeSignature } from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;

  const slugFailure = guardSlug(params.slug, env.STRIPE_WEBHOOK_SLUG);
  if (slugFailure) return slugFailure;

  const hmacFailure = await verifyStripeSignature(request, env.STRIPE_WEBHOOK_SECRET);
  if (hmacFailure) return hmacFailure;

  try {
    const rawPayload = await request.json();
    const eventType = rawPayload.type;
    const object = rawPayload.data?.object || {};

    // We primarily handle checkout.session.completed for purchases.
    // payment_intent.succeeded is also possible but doesn't always have metadata.
    if (eventType !== 'checkout.session.completed') {
      return new Response(
        JSON.stringify({ ok: true, skipped: 'unhandled event type', type: eventType }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stripe checkout session might have multiple line items.
    // We normalize to the first item for the top-level productId/productName,
    // but keep the full list in `items` for ROAS tracking.
    const lineItems = object.line_items?.data || [];
    const firstItem = lineItems[0] || {};

    const parsed = {
      platform: 'stripe',
      trk: object.metadata?.trk || '',
      email: object.customer_details?.email || object.customer_email || '',
      name: object.customer_details?.name || '',
      phone: object.customer_details?.phone || '',
      value: (object.amount_total || 0) / 100, // Stripe uses cents
      currency: (object.currency || 'usd').toUpperCase(),
      transactionId: object.id || '',
      productId: firstItem.price?.id || firstItem.price?.product || '',
      productName: firstItem.description || '',
      items: lineItems.map(it => ({
        productId: it.price?.id || it.price?.product || '',
        name: it.description || '',
        quantity: it.quantity || 1,
        price: {
          value: (it.amount_total || 0) / 100,
          currency: (it.currency || 'usd').toUpperCase(),
        }
      })),
      platformUtm: {
        utm_source: object.metadata?.utm_source || '',
        utm_medium: object.metadata?.utm_medium || '',
        utm_campaign: object.metadata?.utm_campaign || '',
        utm_content: object.metadata?.utm_content || '',
        utm_term: object.metadata?.utm_term || '',
      },
    };

    const result = await processPurchase({ parsed, env, context });

    return new Response(
      JSON.stringify({ ok: true, event_id: result.eventId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
