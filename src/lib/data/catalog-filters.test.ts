import { describe, expect, it } from "vitest";

import {
  getCatalogSearchSuggestions,
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

  it("searches technical codes without separators", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      search: "BOB12",
    });

    expect(result.products.map((product) => product.slug)).toContain(
      "bobina-bosch-12v",
    );
  });

  it("searches by combined brand, voltage and fitment tokens", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      search: "bosch 12 rectangular",
    });

    expect(result.products.map((product) => product.slug)).toEqual([
      "bobina-bosch-12v",
    ]);
  });

  it("searches by normalized technical attribute names and values", async () => {
    const splineResult = await getCatalogProducts({
      role: "PUBLIC",
      search: "estrias 10",
    });
    const applicationResult = await getCatalogProducts({
      role: "PUBLIC",
      search: "aplicacion pesada",
    });

    expect(splineResult.products.map((product) => product.slug)).toEqual([
      "inducido-valeo-reforzado",
    ]);
    expect(applicationResult.products.map((product) => product.slug)).toEqual([
      "inducido-valeo-reforzado",
    ]);
  });

  it("filters by category, brand and model", async () => {
    const result = await getCatalogProducts({
      role: "PUBLIC",
      category: "solenoides",
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

  it("returns autocomplete suggestions from codes, products and filters", async () => {
    const suggestions = await getCatalogSearchSuggestions("bob");
    const labels = suggestions.map((suggestion) => suggestion.label);

    expect(labels).toContain("BOB-12");
    expect(labels).toContain("Bobina Bosch 12V");
    expect(suggestions.every((suggestion) => !("price" in suggestion))).toBe(true);
  });

  it("returns autocomplete suggestions from product categories", async () => {
    const suggestions = await getCatalogSearchSuggestions("sol");
    const labels = suggestions.map((suggestion) => suggestion.label);

    expect(labels).toContain("Solenoides");
    expect(suggestions.every((suggestion) => !("price" in suggestion))).toBe(true);
  });

  it("returns attribute autocomplete suggestions without prices", async () => {
    const suggestions = await getCatalogSearchSuggestions("rectangular");

    expect(suggestions).toContainEqual(
      expect.objectContaining({
        type: "attribute",
        label: "Ficha rectangular",
        params: { "attr_tipo-encastre": "Ficha rectangular" },
      }),
    );
    expect(suggestions.every((suggestion) => !("price" in suggestion))).toBe(true);
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
