import { describe, expect, it } from "vitest";

import {
  buildSupabaseAttributeValueRows,
  buildSupabaseProductRows,
  chunkItems,
} from "./supabase-persistence";
import type { PlannedProduct } from "./types";

const product: PlannedProduct = {
  name: "Inducido DAREF 100",
  slug: "inducido-daref-100",
  shortDescription: "Inducido de prueba",
  description: "Descripción",
  brand: "DAREF",
  model: null,
  internalCode: "100",
  oemCode: "OEM-100",
  mainCategorySlug: "inducidos",
  price: "0.00",
  stockMode: "ON_REQUEST",
  stockQuantity: 0,
  isActive: false,
  isFeatured: false,
  reviewStatus: "PENDING",
  reviewNotes: "Revisar",
  image: {
    sourceUrl: "https://example.com/100.jpg",
    publicId: "bobinas/catalogo-daref/100",
    altText: "Inducido DAREF 100",
  },
  attributeValues: [
    { attributeSlug: "voltaje", kind: "number", value: "12" },
    { attributeSlug: "aplicacion", kind: "text", value: "Ford" },
    { attributeSlug: "sistema-aplicacion", kind: "option", value: "Bosch" },
  ],
  source: {
    name: "DAREF",
    url: "https://example.com/100",
    externalId: "100",
    modifiedAt: "2026-07-22T00:00:00.000Z",
    importBatch: "DAREF-2026-07-22",
    requiresReview: true,
  },
};

describe("Supabase DAREF persistence helpers", () => {
  it("forces imported products to remain inactive and pending", () => {
    expect(
      buildSupabaseProductRows([product], new Map([["inducidos", "cat-1"]])),
    ).toEqual([
      expect.objectContaining({
        internal_code: "100",
        main_category_id: "cat-1",
        price: "0.00",
        stock_mode: "ON_REQUEST",
        stock_quantity: 0,
        is_active: false,
        is_featured: false,
        review_status: "PENDING",
        reviewed_at: null,
      }),
    ]);
  });

  it("normalizes number, text and option characteristic values", () => {
    expect(
      buildSupabaseAttributeValueRows(
        [product],
        new Map([["100", "product-1"]]),
        new Map([
          ["voltaje", "attribute-1"],
          ["aplicacion", "attribute-2"],
          ["sistema-aplicacion", "attribute-3"],
        ]),
        new Map([["attribute-3\u0000bosch", "option-1"]]),
      ),
    ).toEqual([
      expect.objectContaining({
        product_id: "product-1",
        attribute_id: "attribute-1",
        value_number: "12",
      }),
      expect.objectContaining({
        product_id: "product-1",
        attribute_id: "attribute-2",
        value_text: "Ford",
      }),
      expect.objectContaining({
        product_id: "product-1",
        attribute_id: "attribute-3",
        option_id: "option-1",
      }),
    ]);
  });

  it("chunks large writes without dropping rows", () => {
    expect(chunkItems([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
