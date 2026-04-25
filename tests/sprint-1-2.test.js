import { describe, it, expect, vi } from "vitest";
import { onRequestPost as tiktokAdapter } from "../functions/webhook/tiktok/[slug].js";

// Mock do core para testar apenas o mapeamento do adapter
vi.mock("../functions/webhook/_core.js", () => ({
  processPurchase: vi.fn(async () => ({ eventId: "tiktok-uuid" }))
}));

vi.mock("../functions/webhook/_utils.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    guardSlug: vi.fn(() => null)
  };
});

describe("Sprints 1 & 2 - Platforms", () => {
  describe("TikTok Adapter", () => {
    it("should parse TikTok Events API payload correctly", async () => {
      const body = {
        event: "CompletePayment",
        event_id: "tt_123",
        properties: {
          value: 50,
          currency: "BRL"
        },
        user: {
          email: "test@tt.com"
        }
      };

      const env = { TIKTOK_WEBHOOK_SLUG: "tt-slug" };
      const request = new Request("https://ex.com/webhook/tiktok/tt-slug", {
        method: "POST",
        body: JSON.stringify(body)
      });

      const response = await tiktokAdapter({ request, env, params: { slug: "tt-slug" } });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.event_id).toBe("tiktok-uuid");
    });
  });
});
