import { describe, it, expect, vi } from "vitest";
import retentionPolicy from "../functions/scripts/retention-policy.js";
import webhookHealth from "../functions/scripts/webhook-health.js";

describe("Cron Scripts", () => {
  describe("Retention Policy", () => {
    it("should execute batch delete on D1", async () => {
      const batchMock = vi.fn(async () => [
        { meta: { changes: 10 } },
        { meta: { changes: 5 } }
      ]);
      const env = {
        DB: {
          prepare: vi.fn(() => ({ bind: vi.fn(() => "stmt") })),
          batch: batchMock
        },
        RETENTION_DAYS: "30"
      };

      await retentionPolicy.scheduled({}, env, {});
      expect(batchMock).toHaveBeenCalled();
    });
  });

  describe("Webhook Health", () => {
    it("should not alert if there is no traffic", async () => {
      const firstMock = vi.fn(async () => ({ count: 0 }));
      const env = {
        DB: {
          prepare: vi.fn(() => ({ bind: vi.fn(() => ({ first: firstMock })) }))
        }
      };

      // Mock console.log to check output
      const logSpy = vi.spyOn(console, "log");
      await webhookHealth.scheduled({}, env, {});
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("No traffic"));
    });

    it("should alert if traffic exists but 0 purchases", async () => {
      const firstMock = vi.fn()
        .mockResolvedValueOnce({ count: 100 }) // sessions
        .mockResolvedValueOnce({ count: 0 });  // purchases
      
      const fetchMock = vi.fn(async () => ({ ok: true }));
      global.fetch = fetchMock;

      const env = {
        DB: {
          prepare: vi.fn(() => ({ bind: vi.fn(() => ({ first: firstMock })) }))
        },
        ADMIN_EMAIL: "admin@test.com",
        BASE_URL: "https://test.com"
      };

      await webhookHealth.scheduled({}, env, {});
      expect(fetchMock).toHaveBeenCalledWith("https://api.mailchannels.net/tx/v1/send", expect.anything());
    });
  });
});
