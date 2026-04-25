// -----------------------------------------------------------------------------
// Shared helpers for webhook adapters.
//
// The webhook URL shape is `/webhook/<platform>/<slug>`, where `<slug>` is a
// 36-character UUID v4 (122 bits of entropy) generated per recipient during
// `deploy-stack` and stored as a Cloudflare secret. The adapter receives the
// slug via `context.params.slug` and compares it to the env var.
//
// This is obscure-URL authentication: unguessable to scanners, simple for
// non-dev recipients (no signing-secret pastes per platform). Platform-native
// signature verification (HMAC/hottok) is deliberately deferred to a
// post-launch `harden-tracking` Level 2 skill.
// -----------------------------------------------------------------------------

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Guards a webhook adapter on the per-platform URL slug.
//
// Returns a Response on failure (caller should return it directly):
//   - 500 if the env var is unset — a misconfigured deploy that should NOT
//     silently accept traffic
//   - 404 if the slug is missing or wrong — indistinguishable from the
//     route not existing, so scanners learn nothing
//
// Returns null on success (caller proceeds to read body + parse payload).
export function guardSlug(paramSlug, expectedSlug) {
  if (!expectedSlug) {
    return new Response(
      JSON.stringify({ error: 'webhook not configured on this instance' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (!paramSlug || !timingSafeEqual(paramSlug, expectedSlug)) {
    return new Response(
      JSON.stringify({ error: 'not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}

// Verifies the Hotmart X-Hotmart-Hottok header.
//
// Returns a 401 Response on failure, 500 if the secret is missing,
// or null on success.
export function verifyHotmartHottok(request, expectedHottok) {
  if (!expectedHottok) {
    return new Response(
      JSON.stringify({ error: 'HOTMART_HOTTOK not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const hottok = request.headers.get('X-Hotmart-Hottok');
  if (!hottok || !timingSafeEqual(hottok, expectedHottok)) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null;
}

// Verifies the Kiwify x-kiwify-signature header (HMAC-SHA1).
//
// Returns a 401 Response on failure, 500 if the secret is missing,
// or null on success.
export async function verifyKiwifySignature(request, secret) {
  return verifyHmacSignature(request, secret, {
    headerName: 'x-kiwify-signature',
    algorithm: 'SHA-1'
  });
}

// Verifies the Eduzz x-signature header (HMAC-SHA256).
//
// Returns a 401 Response on failure, 500 if the secret is missing,
// or null on success.
export async function verifyEduzzSignature(request, secret) {
  return verifyHmacSignature(request, secret, {
    headerName: 'x-signature',
    algorithm: 'SHA-256'
  });
}

// Generic HMAC signature verification helper.
async function verifyHmacSignature(request, secret, { headerName, algorithm }) {
  if (!secret) {
    return new Response(
      JSON.stringify({ error: 'webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const signature = request.headers.get(headerName);
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'unauthorized (missing signature)' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // We need the raw body as text for HMAC.
  const clonedRequest = request.clone();
  const bodyText = await clonedRequest.text();

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(bodyText);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData);
  const hashHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (!timingSafeEqual(signature, hashHex)) {
    return new Response(
      JSON.stringify({ error: 'unauthorized (invalid signature)' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null;
}
