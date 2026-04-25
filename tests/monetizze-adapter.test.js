import { describe, it, expect, vi } from "vitest";
import { onRequestPost } from "../functions/webhook/monetizze/[slug].js";

vi.mock("../functions/webhook/_core.js", () => ({
  processPurchase: vi.fn(async ({ parsed }) => ({ eventId: "test-uuid-monetizze" }))
}));

vi.mock("../functions/webhook/_utils.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    guardSlug: vi.fn(() => null)
  };
});

describe("Monetizze Adapter", () => {
  const env = {
    MONETIZZE_WEBHOOK_SLUG: "mon-slug"
  };

  it("should parse paid sales correctly", async () => {
    const body = {
      venda: {
        codigo: "12345",
        status: "Finalizada",
        valorTotal: "97.00",
        src: "trk_monetizze",
        utm_source: "google"
      },
      comprador: {
        email: "mon@test.com",
        nome: "Monetizze User",
        telefone: "11988888888"
      },
      produtos: [
        { codigo: "p1", nome: "Produto Mon", valor: "97.00" }
      ]
    };

    const request = new Request("https://ex.com/webhook/monetizze/mon-slug", {
      method: "POST",
      body: JSON.stringify(body)
    });

    const response = await onRequestPost({ request, env, params: { slug: "mon-slug" } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.event_id).toBe("test-uuid-monetizze");
  });

  it("should skip non-paid sales", async () => {
    const body = { venda: { status: "Aguardando Pagamento" } };
    const request = new Request("https://ex.com/webhook/monetizze/mon-slug", {
      method: "POST",
      body: JSON.stringify(body)
    });

    const response = await onRequestPost({ request, env, params: { slug: "mon-slug" } });
    const json = await response.json();

    expect(json.skipped).toBe("not paid");
  });
});
