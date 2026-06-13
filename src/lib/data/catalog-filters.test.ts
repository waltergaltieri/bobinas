import { describe, expect, it } from "vitest";

import {
  getCatalogFilters,
  getCatalogProducts,
  getProductDetail,
} from "./catalog";

describe("catalog filters", () => {
  it("searches by OEM code", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      search: "OEM-BOB-12",
    });

    expect(result.products.map((product) => product.slug)).toContain(
      "bobina-bosch-12v",
    );
    expect(result.products.every((product) => !("price" in product))).toBe(true);
  });

  it("filters by category, brand and model", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      category: "bobinas",
      brand: "Bosch",
      model: "12V",
    });

    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.slug).toBe("bobina-bosch-12v");
  });

  it("filters by normalized technical attributes", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      attributes: {
        voltaje: "12",
        "tipo-encastre": "Ficha rectangular",
      },
    });

    expect(result.products.map((product) => product.slug)).toEqual([
      "bobina-bosch-12v",
    ]);
  });

  it("returns filter values without duplicates", async () => {
    const filters = await getCatalogFilters();
    const brandValues = filters.brands.map((brand) => brand.value);
    const voltaje = filters.attributes.find((attribute) => attribute.slug === "voltaje");

    expect(brandValues).toEqual([...new Set(brandValues)]);
    expect(voltaje?.values.map((value) => value.value)).toContain("12");
  });

  it("keeps public detail free of price and private detail priced", async () => {
    const publicDetail = await getProductDetail("bobina-bosch-12v", "PUBLIC");
    const buyerDetail = await getProductDetail("bobina-bosch-12v", "BUYER");

    expect(publicDetail).not.toHaveProperty("price");
    expect(
      publicDetail?.relatedProducts.every((product) => !("price" in product)),
    ).toBe(true);
    expect(buyerDetail).toHaveProperty("price", "12500.00");
  });
});
