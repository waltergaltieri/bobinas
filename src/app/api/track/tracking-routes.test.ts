import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const recordProductView = vi.fn();
const recordSearch = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getCurrentProfile: vi.fn(async () => null),
}));

vi.mock("@/lib/tracking/record", () => ({
  recordProductView,
  recordSearch,
}));

describe("tracking route handlers", () => {
  beforeEach(() => {
    recordProductView.mockClear();
    recordSearch.mockClear();
  });

  it("records product views without blocking the response", async () => {
    const { POST } = await import("./product-view/route");
    const productId = "00000000-0000-4000-8000-000000000001";
    const request = new NextRequest("http://localhost/api/track/product-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId,
        sourcePath: "/productos/bobina",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain(
      "bobinas_tracking_session",
    );
    expect(recordProductView).toHaveBeenCalledWith(
      expect.objectContaining({
        productId,
        profile: null,
        sourcePath: "/productos/bobina",
        sessionId: expect.any(String),
      }),
    );
  });

  it("records catalog searches with filters and result count", async () => {
    const { POST } = await import("./search/route");
    const request = new NextRequest("http://localhost/api/track/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: "bobina",
        filters: { category: "encendido" },
        resultsCount: 4,
        sourcePath: "/productos",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(recordSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "bobina",
        filters: { category: "encendido" },
        resultsCount: 4,
        profile: null,
        sourcePath: "/productos",
        sessionId: expect.any(String),
      }),
    );
  });
});
