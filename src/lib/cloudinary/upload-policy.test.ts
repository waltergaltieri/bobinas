import { describe, expect, it } from "vitest";

import { validateImageUpload } from "./upload-policy";

describe("validateImageUpload", () => {
  it("accepts allowed image types under the size limit", () => {
    expect(
      validateImageUpload({
        type: "image/webp",
        size: 500_000,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects unsupported file types", () => {
    expect(
      validateImageUpload({
        type: "image/svg+xml",
        size: 10_000,
      }),
    ).toEqual({
      ok: false,
      error: "Formato no permitido. Usá JPG, PNG o WebP.",
    });
  });

  it("rejects files over the maximum size", () => {
    expect(
      validateImageUpload({
        type: "image/jpeg",
        size: 6 * 1024 * 1024,
      }),
    ).toEqual({
      ok: false,
      error: "La imagen no puede superar 5 MB.",
    });
  });
});
