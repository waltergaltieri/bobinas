import { describe, expect, it } from "vitest";

import { toCatalogProductCard } from "./product-presenter";

const product = {
  id: "product-1",
  name: "Bobina Bosch 12V",
  slug: "bobina-bosch-12v",
  internalCode: "BOB-12",
  brand: "Bosch",
  model: "12V",
  price: "12500.00",
  stockMode: "AVAILABLE",
  imageUrl: "https://res.cloudinary.com/demo/image/upload/bobina.webp",
  attributes: [
    {
      attributeName: "Voltaje",
      value: "12",
      unit: "V",
    },
    {
      attributeName: "Tipo de encastre",
      value: "Ficha rectangular",
      unit: null,
    },
  ],
};

describe("toCatalogProductCard", () => {
  it("never exposes price or request actions to public visitors", () => {
    const card = toCatalogProductCard(product, "PUBLIC");

    expect(card).not.toHaveProperty("price");
    expect(card.primaryAction).toBe("consult");
  });

  it("exposes price and request actions to buyers", () => {
    const card = toCatalogProductCard(product, "BUYER");

    expect(card.price).toBe("12500.00");
    expect(card.primaryAction).toBe("add_to_request");
  });

  it("keeps technical attributes visible in product cards", () => {
    const card = toCatalogProductCard(product, "PUBLIC");

    expect(card.highlightedAttributes).toEqual([
      { label: "Voltaje", value: "12 V" },
      { label: "Tipo de encastre", value: "Ficha rectangular" },
    ]);
    expect(card).not.toHaveProperty("price");
  });
});
