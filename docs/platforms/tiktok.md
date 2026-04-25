# TikTok

TikTok is a destination for purchase events via the TikTok Events API and can also act as a sales platform source via its adapter.

## Identity

- **Webhook endpoint**: `/webhook/tiktok/<TIKTOK_WEBHOOK_SLUG>`
- **Adapter file**: `functions/webhook/tiktok/[slug].js`
- **TikTok Events API Endpoint**: `https://business-api.tiktok.com/open_api/v1.3/event/track/`
- **Dashboard URL for pixel config**: business.tiktok.com → Events Manager → Web Pixel.

## Endpoint security — obscure URL

The full endpoint is `/webhook/tiktok/<slug>` where `<slug>` is a 36-character UUID v4 stored as `env.TIKTOK_WEBHOOK_SLUG`. A request to `/webhook/tiktok/<any wrong slug>` returns 404.

## The `trk` field

- **Webhook payload path**: `body.trk` or `body.external_id`.
- **Character-set**: TikTok preserves full 36-char UUIDs.

## Payload shape (Adapter)

The adapter expects a JSON payload. If you are using TikTok Shop or a custom integration, map your fields to these:

| Normalized field | Payload path |
|---|---|
| `trk` | `body.trk` (fallback `body.external_id`) |
| `email` | `body.email` |
| `phone` | `body.phone` |
| `value` | `body.value` (fallback `body.price`) |
| `currency` | `body.currency` (else `'BRL'`) |
| `transactionId` | `body.transaction_id` (fallback `body.event_id`) |
| `productId` | `body.product_id` |
| `productName` | `body.product_name` |

## Events API Integration (Destination)

The stack automatically sends every purchase received by any adapter to TikTok if the following environment variables are set:

- `TIKTOK_PIXEL_ID`
- `TIKTOK_EVENTS_API_TOKEN`

The event sent is `CompletePayment`.

## Verification test

1. Configure `TIKTOK_WEBHOOK_SLUG` and `TIKTOK_PIXEL_ID` / `TIKTOK_EVENTS_API_TOKEN`.
2. Send a test POST to your endpoint:
   ```bash
   curl -X POST https://<your-project>.pages.dev/webhook/tiktok/<slug> \
     -H "Content-Type: application/json" \
     -d '{"trk": "test-uuid", "value": 10.0, "currency": "BRL", "email": "test@example.com"}'
   ```
3. Check `purchase_log` in D1:
   ```bash
   wrangler d1 execute <db> --remote --command "SELECT transaction_id, tiktok_response_ok FROM purchase_log ORDER BY created_at DESC LIMIT 1"
   ```
