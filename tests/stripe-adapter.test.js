import { describe, it, expect, vi } from "vitest";
import { onRequestPost } from "../functions/webhook/stripe/[slug].js";

// Mock processPurchase since we want to test the adapter's mapping logic
vi.mock("../functions/webhook/_core.js", () => ({
  processPurchase: vi.fn(async ({ parsed }) => ({ eventId: "test-uuid" }))
}));

describe("Stripe Adapter", () => {
  const env = {
    STRIPE_WEBHOOK_SLUG: "test-slug",
    STRIPE_WEBHOOK_SECRET: "test-secret"
  };

  it("should parse checkout.session.completed correctly", async () => {
    const body = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 15000, // $150.00
          currency: "usd",
          customer_details: {
            email: "test@example.com",
            name: "Test User",
            phone: "+5511999999999"
          },
          metadata: {
            trk: "trk_12345",
            utm_source: "meta"
          },
          line_items: {
            data: [
              {
                description: "Test Product",
                amount_total: 15000,
                currency: "usd",
                quantity: 1,
                price: { id: "price_abc", product: "prod_xyz" }
              }
            ]
          }
        }
      }
    };

    // To skip signature verification in this unit test, we can mock verifyStripeSignature
    // or provide a valid one. Let's mock the internal utils.
    vi.mock("../functions/webhook/_utils.js", async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        verifyStripeSignature: vi.fn(async () => null),
        guardSlug: vi.fn(() => null)
      };
    });

    const request = new Request("https://ex.com/webhook/stripe/test-slug", {
      method: "POST",
      body: JSON.stringify(body)
    });

    const response = await onRequestPost({ request, env, params: { slug: "test-slug" } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.event_id).toBe("test-uuid");
  });

  it("should skip unhandled event types", async () => {
    const body = { type: "payment_intent.created", data: { object: {} } };
    const request = new Request("https://ex.com/webhook/stripe/test-slug", {
      method: "POST",
      body: JSON.stringify(body)
    });

    const response = await onRequestPost({ request, env, params: { slug: "test-slug" } });
    const json = await response.json();

    expect(json.skipped).toBe("unhandled event type");
  });
});
