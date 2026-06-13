import type { ProfileRole } from "@/db/schema";

export type RequestListProfile = {
  id: string;
  role: ProfileRole;
} | null;

export type RequestListEntry = {
  productId: string;
  quantity: number;
};

export type SnapshotProduct = {
  id: string;
  name: string;
  internalCode: string;
  price: string;
};

export type SnapshotInputItem = {
  product: SnapshotProduct;
  quantity: number;
};

export class PurchaseRequestError extends Error {}

export function addProductToList({
  profile,
  list,
  productId,
}: {
  profile: RequestListProfile;
  list: RequestListEntry[];
  productId: string;
}) {
  assertBuyer(profile);
  const existing = list.find((item) => item.productId === productId);

  if (existing) {
    return list.map((item) =>
      item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [...list, { productId, quantity: 1 }];
}

export function updateListItemQuantity({
  profile,
  list,
  productId,
  quantity,
}: {
  profile: RequestListProfile;
  list: RequestListEntry[];
  productId: string;
  quantity: number;
}) {
  assertBuyer(profile);
  assertQuantity(quantity);

  return list.map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
}

export function removeProductFromList({
  profile,
  list,
  productId,
}: {
  profile: RequestListProfile;
  list: RequestListEntry[];
  productId: string;
}) {
  assertBuyer(profile);
  return list.filter((item) => item.productId !== productId);
}

export function buildPurchaseRequestSnapshot({
  profile,
  items,
  buyerNotes,
}: {
  profile: RequestListProfile;
  items: SnapshotInputItem[];
  buyerNotes: string;
}) {
  assertBuyer(profile);

  if (items.length === 0) {
    throw new PurchaseRequestError("Agrega al menos un producto al pedido.");
  }

  const snapshotItems = items.map(({ product, quantity }) => {
    assertQuantity(quantity);
    const subtotalSnapshot = multiplyMoney(product.price, quantity);

    return {
      productId: product.id,
      productNameSnapshot: product.name,
      productCodeSnapshot: product.internalCode,
      unitPriceSnapshot: formatMoney(product.price),
      quantity,
      subtotalSnapshot,
    };
  });

  return {
    buyerId: profile.id,
    status: "PENDING" as const,
    saleResult: "UNKNOWN" as const,
    buyerNotes,
    estimatedTotal: formatMoney(
      snapshotItems.reduce(
        (total, item) => total + Number(item.subtotalSnapshot),
        0,
      ),
    ),
    items: snapshotItems,
  };
}

export function assertBuyer(profile: RequestListProfile): asserts profile is {
  id: string;
  role: "BUYER";
} {
  if (!profile || profile.role !== "BUYER") {
    throw new PurchaseRequestError("Solo compradores autorizados pueden gestionar pedidos.");
  }
}

function assertQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new PurchaseRequestError("La cantidad debe ser mayor a cero.");
  }
}

function multiplyMoney(value: string, quantity: number) {
  return formatMoney(Number(value) * quantity);
}

function formatMoney(value: string | number) {
  return Number(value).toFixed(2);
}
