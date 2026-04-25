import { describe, it, expect, vi } from "vitest";
import { processPurchase } from "../functions/webhook/_core.js";

// Mock das dependências do core
vi.mock("../../config/products.js", () => ({
  default: {
    eduzz: { "123": { name: "Test Product", enchargeTag: "tag1" } }
  }
}));

describe("Core Logic", () => {
  const env = {
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn(async () => ({ trk: "trk_123", fbp: "fb.1.123", fbc: "fb.1.456" })),
          run: vi.fn(async () => ({ meta: { last_row_id: 1 } }))
        }))
      })),
      batch: vi.fn(async () => [])
    },
    DEFAULT_COUNTRY_CODE: "55"
  };

  const context = {
    waitUntil: vi.fn()
  };

  it("should enrich purchase with checkout data from D1", async () => {
    const parsed = {
      platform: "eduzz",
      trk: "trk_123",
      email: "test@ex.com",
      productId: "123",
      value: 100,
      currency: "BRL",
      items: []
    };

    const result = await processPurchase({ parsed, env, context });
    
    expect(result.eventId).toBeDefined();
    expect(env.DB.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM checkout_sessions"));
  });

  it("should generate a valid eventId", async () => {
    const parsed = { platform: "test", items: [] };
    const result = await processPurchase({ parsed, env, context });
    expect(result.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
