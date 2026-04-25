// -----------------------------------------------------------------------------
// Monetizze webhook adapter.
//
// URL shape: /webhook/monetizze/<MONETIZZE_WEBHOOK_SLUG>
//
// Platform specifics:
//   - Unique checkout identifier arrives as `body.chave_unica` ou via src/sck.
//   - Monetizze sends POST with form-data or JSON. This adapter handles JSON.
//   - Sale statuses that indicate a real paid purchase: 'Finalizada', 'Completa'.
// -----------------------------------------------------------------------------

import { processPurchase } from '../_core.js';
import { guardSlug } from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;

  const slugFailure = guardSlug(params.slug, env.MONETIZZE_WEBHOOK_SLUG);
  if (slugFailure) return slugFailure;

  // NOTE: Monetizze support for HMAC is optional/varying. 
  // For now, we rely on obscure-URL (slug) security.

  try {
    const body = await request.json();

    // Only process paid sales.
    const saleStatus = body.venda?.status || '';
    const isPaid = ['Finalizada', 'Completa'].includes(saleStatus);
    
    if (!isPaid) {
      return new Response(
        JSON.stringify({ ok: true, skipped: 'not paid', status: saleStatus }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const firstItem = body.produtos?.[0] || {};

    const parsed = {
      platform: 'monetizze',
      // Monetizze often uses 'src' or 'sck' for tracking parameters.
      // We check multiple common fields for the 'trk' identifier.
      trk: body.venda?.src || body.venda?.sck || body.venda?.chave_unica || '',
      email: body.comprador?.email || '',
      name: body.comprador?.nome || '',
      phone: body.comprador?.telefone || '',
      value: parseFloat(body.venda?.valorTotal) || 0,
      currency: 'BRL',
      transactionId: String(body.venda?.codigo || ''),
      productId: String(firstItem.codigo || ''),
      productName: firstItem.nome || '',
      items: (body.produtos || []).map(p => ({
        productId: String(p.codigo || ''),
        name: p.nome || '',
        price: { value: parseFloat(p.valor) || 0, currency: 'BRL' }
      })),
      platformUtm: {
        utm_source: body.venda?.utm_source || '',
        utm_medium: body.venda?.utm_medium || '',
        utm_campaign: body.venda?.utm_campaign || '',
        utm_content: body.venda?.utm_content || '',
        utm_term: body.venda?.utm_term || '',
      },
    };

    const result = await processPurchase({ parsed, env, context });

    return new Response(
      JSON.stringify({ ok: true, event_id: result.eventId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Monetizze webhook error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
