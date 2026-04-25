import { describe, it, expect, vi } from "vitest";
import { verifyEduzzSignature, verifyKiwifySignature, verifyHotmartHottok } from "../functions/webhook/_utils.js";

describe("Sprint 3 - Hardening (Signatures)", () => {
  const secret = "test_secret";

  describe("Eduzz HMAC-SHA256", () => {
    it("should fail if signature is invalid", async () => {
      const request = new Request("https://ex.com", {
        method: "POST",
        headers: { "x-signature": "wrong" },
        body: "payload"
      });
      const response = await verifyEduzzSignature(request, secret);
      expect(response.status).toBe(401);
    });
  });

  describe("Kiwify HMAC-SHA1", () => {
    it("should fail if signature is invalid", async () => {
      const request = new Request("https://ex.com", {
        method: "POST",
        headers: { "x-kiwify-signature": "wrong" },
        body: "payload"
      });
      const response = await verifyKiwifySignature(request, secret);
      expect(response.status).toBe(401);
    });
  });

  describe("Hotmart Hottok", () => {
    it("should verify hottok token correctly", async () => {
      const request = new Request("https://ex.com", {
        headers: { "X-Hotmart-Hottok": "TOKEN123" }
      });
      const result = await verifyHotmartHottok(request, "TOKEN123");
      expect(result).toBeNull(); // Success
    });

    it("should fail if hottok is wrong", async () => {
      const request = new Request("https://ex.com", {
        headers: { "X-Hotmart-Hottok": "WRONG" }
      });
      const response = await verifyHotmartHottok(request, "TOKEN123");
      expect(response.status).toBe(401);
    });
  });
});
