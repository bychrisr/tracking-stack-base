// -----------------------------------------------------------------------------
// TikTok webhook adapter.
//
// URL shape: /webhook/tiktok/<TIKTOK_WEBHOOK_SLUG>
// The per-recipient UUID stored in env.TIKTOK_WEBHOOK_SLUG gates the endpoint.
//
// Platform specifics:
//   - Expects TikTok Events API compatible payload or normalized shape.
//   - Dispatches to _core.js for fan-out to Meta, GA4, Google Ads, and TikTok.
// -----------------------------------------------------------------------------

import { processPurchase } from '../_core.js';
import { guardSlug } from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;

  const slugFailure = guardSlug(params.slug, env.TIKTOK_WEBHOOK_SLUG);
  if (slugFailure) return slugFailure;

  try {
    const body = await request.json();

    // Map TikTok / Generic payload to normalized shape
    const parsed = {
      platform: 'tiktok',
      trk: body.trk || body.external_id || '',
      email: body.email || '',
      name: body.name || '',
      phone: body.phone || '',
      value: parseFloat(body.value || body.price || 0),
      currency: body.currency || 'BRL',
      transactionId: body.transaction_id || body.event_id || '',
      productId: String(body.product_id || ''),
      productName: body.product_name || '',
      items: body.items || [],
      platformUtm: {
        utm_source: body.utm_source || '',
        utm_medium: body.utm_medium || '',
        utm_campaign: body.utm_campaign || '',
        utm_content: body.utm_content || '',
        utm_term: body.utm_term || '',
      },
    };

    const result = await processPurchase({ parsed, env, context });

    return new Response(
      JSON.stringify({ ok: true, event_id: result.eventId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('TikTok webhook error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
