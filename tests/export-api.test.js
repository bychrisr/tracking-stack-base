import { describe, it, expect, vi } from "vitest";
import { onRequestGet } from "../functions/api/export.js";

describe("Export API", () => {
  const env = {
    DASH_KEY: "secret-key",
    DB: {
      prepare: vi.fn(() => ({
        all: vi.fn(async () => ({
          results: [
            { id: 1, email: "test@ex.com", value: 100 },
            { id: 2, email: "other@ex.com", value: 50 }
          ]
        }))
      }))
    }
  };

  it("should return 401 if key is invalid", async () => {
    const request = new Request("https://ex.com/api/export?table=leads&key=wrong");
    const response = await onRequestGet({ request, env });
    expect(response.status).toBe(401);
  });

  it("should export CSV correctly", async () => {
    const request = new Request("https://ex.com/api/export?table=purchases&key=secret-key");
    const response = await onRequestGet({ request, env });
    
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    
    const text = await response.text();
    expect(text).toContain("id,email,value");
    expect(text).toContain("1,test@ex.com,100");
    expect(text).toContain("2,other@ex.com,50");
  });
});
