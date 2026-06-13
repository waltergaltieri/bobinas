import { describe, expect, it } from "vitest";

import { getPrivateProducts, getPublicProducts } from "./catalog";

describe("catalog data access", () => {
  it("does not expose price in public products", async () => {
    const products = await getPublicProducts();

    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => !("price" in product))).toBe(true);
  });

  it("exposes price in private products", async () => {
    const products = await getPrivateProducts();

    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => "price" in product)).toBe(true);
  });
});
