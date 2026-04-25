import { describe, it, expect, vi } from "vitest";
import { verifyStripeSignature, timingSafeEqual } from "../functions/webhook/_utils.js";

describe("Webhook Utils", () => {
  describe("timingSafeEqual", () => {
    it("should return true for equal strings", () => {
      expect(timingSafeEqual("abc", "abc")).toBe(true);
    });

    it("should return false for different strings", () => {
      expect(timingSafeEqual("abc", "abd")).toBe(false);
    });

    it("should return false for different lengths", () => {
      expect(timingSafeEqual("abc", "abcd")).toBe(false);
    });
  });

  describe("verifyStripeSignature", () => {
    const secret = "whsec_test_secret";
    
    it("should fail if secret is missing", async () => {
      const request = new Request("https://ex.com", { method: "POST" });
      const response = await verifyStripeSignature(request, null);
      expect(response.status).toBe(500);
    });

    it("should fail if signature header is missing", async () => {
      const request = new Request("https://ex.com", { method: "POST" });
      const response = await verifyStripeSignature(request, secret);
      expect(response.status).toBe(401);
    });

    it("should fail for invalid signature", async () => {
      const body = JSON.stringify({ id: "evt_123" });
      const timestamp = Math.floor(Date.now() / 1000);
      const header = `t=${timestamp},v1=invalid_sig`;
      
      const request = new Request("https://ex.com", {
        method: "POST",
        headers: { "Stripe-Signature": header },
        body
      });

      const response = await verifyStripeSignature(request, secret);
      expect(response.status).toBe(401);
    });

    it("should fail for expired timestamp", async () => {
      const body = JSON.stringify({ id: "evt_123" });
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 min ago
      
      // Calculate valid HMAC for the old timestamp
      const signedPayload = `${oldTimestamp}.${body}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
      const sigHex = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const header = `t=${oldTimestamp},v1=${sigHex}`;
      
      const request = new Request("https://ex.com", {
        method: "POST",
        headers: { "Stripe-Signature": header },
        body
      });

      const response = await verifyStripeSignature(request, secret);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain("timestamp out of range");
    });
  });
});
