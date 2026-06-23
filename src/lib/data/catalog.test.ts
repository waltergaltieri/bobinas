import { describe, expect, it } from "vitest";

import { getAdminProduct, getPrivateProducts, getPublicProducts } from "./catalog";

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

  it("returns a single admin product by id with editable fields", async () => {
    const product = await getAdminProduct("55555555-5555-4555-8555-555555555555");

    expect(product).toMatchObject({
      name: "Bobina Bosch 12V",
      price: "12500.00",
      isActive: true,
    });
  });
});
