import { describe, expect, it } from "vitest";

import {
  addProductToList,
  buildPurchaseRequestSnapshot,
  updateListItemQuantity,
} from "./core";

const buyer = {
  id: "buyer-1",
  role: "BUYER" as const,
};

const publicUser = null;

const product = {
  id: "product-1",
  name: "Bobina Bosch 12V",
  internalCode: "BOB-12",
  price: "12500.00",
};

describe("purchase request list core", () => {
  it("blocks public users from adding products to the request list", () => {
    expect(() =>
      addProductToList({
        profile: publicUser,
        list: [],
        productId: product.id,
      }),
    ).toThrow("Solo compradores autorizados");
  });

  it("lets a buyer add a product and increases quantity when repeated", () => {
    const firstList = addProductToList({
      profile: buyer,
      list: [],
      productId: product.id,
    });
    const secondList = addProductToList({
      profile: buyer,
      list: firstList,
      productId: product.id,
    });

    expect(secondList).toEqual([{ productId: product.id, quantity: 2 }]);
  });

  it("rejects invalid quantities", () => {
    expect(() =>
      updateListItemQuantity({
        profile: buyer,
        list: [{ productId: product.id, quantity: 1 }],
        productId: product.id,
        quantity: 0,
      }),
    ).toThrow("La cantidad debe ser mayor a cero");
  });

  it("does not allow sending an empty request", () => {
    expect(() =>
      buildPurchaseRequestSnapshot({
        profile: buyer,
        items: [],
        buyerNotes: "",
      }),
    ).toThrow("Agrega al menos un producto");
  });

  it("stores price snapshots and creates a pending request", () => {
    const snapshot = buildPurchaseRequestSnapshot({
      profile: buyer,
      items: [
        {
          product,
          quantity: 2,
        },
      ],
      buyerNotes: "Consultar disponibilidad.",
    });

    expect(snapshot.status).toBe("PENDING");
    expect(snapshot.saleResult).toBe("UNKNOWN");
    expect(snapshot.estimatedTotal).toBe("25000.00");
    expect(snapshot.items[0]).toMatchObject({
      productId: product.id,
      productNameSnapshot: product.name,
      productCodeSnapshot: product.internalCode,
      unitPriceSnapshot: product.price,
      quantity: 2,
      subtotalSnapshot: "25000.00",
    });
  });
});
