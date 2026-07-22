import { describe, expect, it } from "vitest";

import { validateProductPublication } from "./product-review";

describe("validateProductPublication", () => {
  it("allows keeping an incomplete product inactive", () => {
    expect(
      validateProductPublication({
        nextIsActive: false,
        reviewStatus: "PENDING",
        price: "0.00",
        imageCount: 0,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects activating a product that is pending review", () => {
    expect(
      validateProductPublication({
        nextIsActive: true,
        reviewStatus: "PENDING",
        price: "1500.00",
        imageCount: 1,
      }),
    ).toEqual({
      ok: false,
      error: "Aproba la revision del producto antes de activarlo.",
    });
  });

  it("rejects activating a product without a positive price", () => {
    expect(
      validateProductPublication({
        nextIsActive: true,
        reviewStatus: "APPROVED",
        price: "0.00",
        imageCount: 1,
      }),
    ).toEqual({
      ok: false,
      error: "Carga un precio mayor a cero antes de activar el producto.",
    });
  });

  it("rejects activating a product without an image", () => {
    expect(
      validateProductPublication({
        nextIsActive: true,
        reviewStatus: "APPROVED",
        price: "1500.00",
        imageCount: 0,
      }),
    ).toEqual({
      ok: false,
      error: "Carga al menos una imagen antes de activar el producto.",
    });
  });

  it("allows activating an approved product with price and image", () => {
    expect(
      validateProductPublication({
        nextIsActive: true,
        reviewStatus: "APPROVED",
        price: "1500.00",
        imageCount: 1,
      }),
    ).toEqual({ ok: true });
  });
});
