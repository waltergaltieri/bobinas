import { cookies } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import {
  productImages,
  products,
  profiles,
  purchaseRequestItems,
  purchaseRequests,
  type PurchaseRequestStatus,
  type SaleResult,
} from "@/db/schema";
import type { CurrentProfile } from "@/lib/auth/session";
import {
  buildPurchaseRequestSnapshot,
  type RequestListEntry,
  type SnapshotInputItem,
  type SnapshotProduct,
} from "@/lib/purchase-requests/core";
import {
  applyAdminRequestUpdate,
  type AdminRequestUpdateInput,
} from "@/lib/purchase-requests/admin-core";
import { sampleProducts, samplePurchaseRequests } from "./sample-data";

const ACTIVE_LIST_COOKIE = "bobinas_request_list";
const SUBMITTED_REQUESTS_COOKIE = "bobinas_submitted_requests";

type StoredActiveList = {
  buyerId: string;
  items: RequestListEntry[];
};

type StoredRequest = {
  id: string;
  buyerId: string;
  createdAt: string;
  status: "PENDING";
  saleResult: "UNKNOWN";
  estimatedTotal: string;
  buyerNotes: string;
  items: Array<{
    productId: string;
    productNameSnapshot: string;
    productCodeSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    subtotalSnapshot: string;
  }>;
};

export type RequestListItemView = {
  productId: string;
  slug: string;
  name: string;
  internalCode: string;
  brand: string | null;
  model: string | null;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
};

export type ActiveRequestListView = {
  items: RequestListItemView[];
  totalQuantity: number;
  estimatedTotal: string;
};

export type BuyerRequestSummary = {
  id: string;
  createdAt: Date;
  status: string;
  estimatedTotal: string;
  itemCount: number;
};

export type BuyerRequestDetail = BuyerRequestSummary & {
  buyerNotes: string | null;
  saleResult: string;
  items: Array<{
    productId: string | null;
    productNameSnapshot: string;
    productCodeSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    subtotalSnapshot: string;
  }>;
};

export type AdminPurchaseRequestFilters = {
  status?: PurchaseRequestStatus | "ALL";
  saleResult?: SaleResult | "ALL";
  buyerId?: string;
  date?: string;
  text?: string;
};

export type AdminPurchaseRequestSummary = {
  id: string;
  createdAt: Date;
  buyerId: string;
  buyerName: string;
  buyerCompanyName: string | null;
  buyerEmail: string;
  buyerPhone: string | null;
  status: PurchaseRequestStatus;
  saleResult: SaleResult;
  estimatedTotal: string;
  itemCount: number;
};

export type AdminPurchaseRequestDetail = AdminPurchaseRequestSummary & {
  updatedAt: Date;
  completedAt: Date | null;
  buyerNotes: string | null;
  adminNotes: string | null;
  saleResultNotes: string | null;
  buyer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string;
    phone: string | null;
  };
  items: Array<{
    productId: string | null;
    productNameSnapshot: string;
    productCodeSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    subtotalSnapshot: string;
    imageUrl: string | null;
    currentProductName: string | null;
  }>;
};

export type AdminRequestsDashboard = {
  pending: number;
  inReview: number;
  contacted: number;
  concreted: number;
  notConcreted: number;
  pendingEstimatedTotal: string;
  latest: AdminPurchaseRequestSummary[];
};

export async function getStoredRequestList(profile: CurrentProfile | null) {
  const stored = await readActiveListCookie();

  if (!profile || profile.role !== "BUYER" || stored.buyerId !== profile.id) {
    return [];
  }

  return sanitizeList(stored.items);
}

export async function setStoredRequestList(
  profile: CurrentProfile,
  items: RequestListEntry[],
) {
  const cookieStore = await cookies();
  cookieStore.set(
    ACTIVE_LIST_COOKIE,
    JSON.stringify({
      buyerId: profile.id,
      items: sanitizeList(items),
    } satisfies StoredActiveList),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  );
}

export async function clearStoredRequestList() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_LIST_COOKIE);
}

export async function getActiveRequestList(
  profile: CurrentProfile | null,
): Promise<ActiveRequestListView> {
  const storedItems = await getStoredRequestList(profile);
  const productsById = await getRequestProductsByIds(
    storedItems.map((item) => item.productId),
  );
  const items = storedItems
    .map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        internalCode: product.internalCode,
        brand: product.brand,
        model: product.model,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: formatMoney(Number(product.price) * item.quantity),
      };
    })
    .filter(Boolean) as RequestListItemView[];

  return {
    items,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    estimatedTotal: formatMoney(
      items.reduce((total, item) => total + Number(item.subtotal), 0),
    ),
  };
}

export async function getRequestListCount(profile: CurrentProfile | null) {
  const list = await getActiveRequestList(profile);
  return list.totalQuantity;
}

export async function getRequestProduct(productId: string) {
  const productsById = await getRequestProductsByIds([productId]);
  return productsById.get(productId) ?? null;
}

export async function createBuyerPurchaseRequest({
  profile,
  buyerNotes,
}: {
  profile: CurrentProfile;
  buyerNotes: string;
}) {
  const activeList = await getStoredRequestList(profile);
  const productsById = await getRequestProductsByIds(
    activeList.map((item) => item.productId),
  );
  const snapshotItems: SnapshotInputItem[] = activeList
    .map((item) => {
      const product = productsById.get(item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as SnapshotInputItem[];
  const snapshot = buildPurchaseRequestSnapshot({
    profile,
    items: snapshotItems,
    buyerNotes,
  });

  if (hasDatabaseUrl()) {
    const [created] = await getDb()
      .insert(purchaseRequests)
      .values({
        buyerId: profile.id,
        status: snapshot.status,
        estimatedTotal: snapshot.estimatedTotal,
        buyerNotes: snapshot.buyerNotes,
        saleResult: snapshot.saleResult,
      })
      .returning({ id: purchaseRequests.id });

    if (!created) {
      throw new Error("No se pudo crear la solicitud de pedido.");
    }

    await getDb().insert(purchaseRequestItems).values(
      snapshot.items.map((item) => ({
        purchaseRequestId: created.id,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productCodeSnapshot: item.productCodeSnapshot,
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        subtotalSnapshot: item.subtotalSnapshot,
      })),
    );

    await clearStoredRequestList();
    return created.id;
  }

  const storedRequests = await readSubmittedRequestsCookie();
  const id = `PED-${Date.now()}`;
  await writeSubmittedRequestsCookie([
    {
      id,
      buyerId: profile.id,
      createdAt: new Date().toISOString(),
      status: snapshot.status,
      saleResult: snapshot.saleResult,
      estimatedTotal: snapshot.estimatedTotal,
      buyerNotes: snapshot.buyerNotes,
      items: snapshot.items,
    },
    ...storedRequests,
  ]);
  await clearStoredRequestList();

  return id;
}

export async function getBuyerPurchaseRequests(
  profile: CurrentProfile,
): Promise<BuyerRequestSummary[]> {
  if (!hasDatabaseUrl()) {
    const stored = await readSubmittedRequestsCookie();
    return stored
      .filter((request) => request.buyerId === profile.id)
      .map((request) => ({
        id: request.id,
        createdAt: new Date(request.createdAt),
        status: request.status,
        estimatedTotal: request.estimatedTotal,
        itemCount: request.items.reduce((total, item) => total + item.quantity, 0),
      }));
  }

  const requestRows = await getDb()
    .select({
      id: purchaseRequests.id,
      createdAt: purchaseRequests.createdAt,
      status: purchaseRequests.status,
      estimatedTotal: purchaseRequests.estimatedTotal,
    })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.buyerId, profile.id))
    .orderBy(desc(purchaseRequests.createdAt));

  if (requestRows.length === 0) {
    return [];
  }

  const itemRows = await getDb()
    .select({
      purchaseRequestId: purchaseRequestItems.purchaseRequestId,
      quantity: purchaseRequestItems.quantity,
    })
    .from(purchaseRequestItems)
    .where(
      inArray(
        purchaseRequestItems.purchaseRequestId,
        requestRows.map((request) => request.id),
      ),
    );

  return requestRows.map((request) => ({
    ...request,
    itemCount: itemRows
      .filter((item) => item.purchaseRequestId === request.id)
      .reduce((total, item) => total + item.quantity, 0),
  }));
}

export async function getBuyerPurchaseRequestDetail(
  profile: CurrentProfile,
  id: string,
): Promise<BuyerRequestDetail | null> {
  if (!hasDatabaseUrl()) {
    const stored = await readSubmittedRequestsCookie();
    const request = stored.find(
      (item) => item.id === id && item.buyerId === profile.id,
    );

    if (!request) {
      return null;
    }

    return {
      id: request.id,
      createdAt: new Date(request.createdAt),
      status: request.status,
      saleResult: request.saleResult,
      estimatedTotal: request.estimatedTotal,
      buyerNotes: request.buyerNotes,
      itemCount: request.items.reduce((total, item) => total + item.quantity, 0),
      items: request.items.map((item) => ({
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productCodeSnapshot: item.productCodeSnapshot,
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        subtotalSnapshot: item.subtotalSnapshot,
      })),
    };
  }

  const [request] = await getDb()
    .select({
      id: purchaseRequests.id,
      createdAt: purchaseRequests.createdAt,
      status: purchaseRequests.status,
      saleResult: purchaseRequests.saleResult,
      estimatedTotal: purchaseRequests.estimatedTotal,
      buyerNotes: purchaseRequests.buyerNotes,
    })
    .from(purchaseRequests)
    .where(
      and(eq(purchaseRequests.id, id), eq(purchaseRequests.buyerId, profile.id)),
    );

  if (!request) {
    return null;
  }

  const items = await getDb()
    .select({
      productId: purchaseRequestItems.productId,
      productNameSnapshot: purchaseRequestItems.productNameSnapshot,
      productCodeSnapshot: purchaseRequestItems.productCodeSnapshot,
      unitPriceSnapshot: purchaseRequestItems.unitPriceSnapshot,
      quantity: purchaseRequestItems.quantity,
      subtotalSnapshot: purchaseRequestItems.subtotalSnapshot,
    })
    .from(purchaseRequestItems)
    .where(eq(purchaseRequestItems.purchaseRequestId, request.id));

  return {
    ...request,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    items,
  };
}

export async function getAdminPurchaseRequests(
  filters: AdminPurchaseRequestFilters = {},
): Promise<AdminPurchaseRequestSummary[]> {
  const summaries = hasDatabaseUrl()
    ? await getDbAdminPurchaseRequests()
    : getSampleAdminPurchaseRequests();

  return applyAdminFilters(summaries, filters).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function getAdminPurchaseRequestDetail(
  id: string,
): Promise<AdminPurchaseRequestDetail | null> {
  if (!hasDatabaseUrl()) {
    const request = samplePurchaseRequests.find((item) => item.id === id);

    if (!request) {
      return null;
    }

    return sampleRequestToAdminDetail(request);
  }

  const [request] = await getDb()
    .select({
      id: purchaseRequests.id,
      createdAt: purchaseRequests.createdAt,
      updatedAt: purchaseRequests.updatedAt,
      completedAt: purchaseRequests.completedAt,
      status: purchaseRequests.status,
      saleResult: purchaseRequests.saleResult,
      estimatedTotal: purchaseRequests.estimatedTotal,
      buyerNotes: purchaseRequests.buyerNotes,
      adminNotes: purchaseRequests.adminNotes,
      saleResultNotes: purchaseRequests.saleResultNotes,
      buyerId: profiles.id,
      buyerName: profiles.name,
      buyerCompanyName: profiles.companyName,
      buyerEmail: profiles.email,
      buyerPhone: profiles.phone,
    })
    .from(purchaseRequests)
    .innerJoin(profiles, eq(profiles.id, purchaseRequests.buyerId))
    .where(eq(purchaseRequests.id, id));

  if (!request) {
    return null;
  }

  const itemRows = await getDb()
    .select({
      productId: purchaseRequestItems.productId,
      productNameSnapshot: purchaseRequestItems.productNameSnapshot,
      productCodeSnapshot: purchaseRequestItems.productCodeSnapshot,
      unitPriceSnapshot: purchaseRequestItems.unitPriceSnapshot,
      quantity: purchaseRequestItems.quantity,
      subtotalSnapshot: purchaseRequestItems.subtotalSnapshot,
      imageUrl: productImages.url,
      currentProductName: products.name,
    })
    .from(purchaseRequestItems)
    .leftJoin(products, eq(products.id, purchaseRequestItems.productId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(purchaseRequestItems.purchaseRequestId, id));

  const items = uniqueItemsBySnapshot(itemRows);

  return {
    id: request.id,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt,
    buyerId: request.buyerId,
    buyerName: request.buyerName,
    buyerCompanyName: request.buyerCompanyName,
    buyerEmail: request.buyerEmail,
    buyerPhone: request.buyerPhone,
    status: request.status,
    saleResult: request.saleResult,
    estimatedTotal: request.estimatedTotal,
    buyerNotes: request.buyerNotes,
    adminNotes: request.adminNotes,
    saleResultNotes: request.saleResultNotes,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    buyer: {
      id: request.buyerId,
      name: request.buyerName,
      companyName: request.buyerCompanyName,
      email: request.buyerEmail,
      phone: request.buyerPhone,
    },
    items,
  };
}

export async function updateAdminPurchaseRequest(
  id: string,
  input: AdminRequestUpdateInput,
) {
  const current = await getAdminPurchaseRequestDetail(id);

  if (!current) {
    throw new Error("No se encontro el pedido.");
  }

  const updated = applyAdminRequestUpdate({
    profile: { id: "admin", role: "ADMIN" },
    request: current,
    input,
  });

  if (!hasDatabaseUrl()) {
    return updated;
  }

  await getDb()
    .update(purchaseRequests)
    .set({
      status: updated.status,
      saleResult: updated.saleResult,
      adminNotes: updated.adminNotes,
      saleResultNotes: updated.saleResultNotes,
      completedAt: updated.completedAt,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, id));

  return updated;
}

export async function getAdminRequestsDashboard(): Promise<AdminRequestsDashboard> {
  const requests = await getAdminPurchaseRequests();
  const pending = requests.filter((request) => request.status === "PENDING");

  return {
    pending: pending.length,
    inReview: requests.filter((request) => request.status === "IN_REVIEW").length,
    contacted: requests.filter((request) => request.status === "CONTACTED").length,
    concreted: requests.filter(
      (request) =>
        request.status === "COMPLETED" || request.saleResult === "CONCRETED",
    ).length,
    notConcreted: requests.filter(
      (request) =>
        request.status === "NOT_COMPLETED" ||
        request.saleResult === "NOT_CONCRETED",
    ).length,
    pendingEstimatedTotal: formatMoney(
      pending.reduce((total, request) => total + Number(request.estimatedTotal), 0),
    ),
    latest: requests.slice(0, 5),
  };
}

async function getRequestProductsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  const map = new Map<string, SnapshotProduct & {
    slug: string;
    brand: string | null;
    model: string | null;
    imageUrl: string | null;
  }>();

  if (uniqueIds.length === 0) {
    return map;
  }

  if (!hasDatabaseUrl()) {
    for (const product of sampleProducts) {
      if (uniqueIds.includes(product.id) && product.isActive) {
        map.set(product.id, {
          id: product.id,
          slug: product.slug,
          name: product.name,
          internalCode: product.internalCode,
          brand: product.brand,
          model: product.model,
          imageUrl: product.imageUrl,
          price: product.price ?? "0.00",
        });
      }
    }

    return map;
  }

  const rows = await getDb()
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      internalCode: products.internalCode,
      brand: products.brand,
      model: products.model,
      price: products.price,
      imageUrl: productImages.url,
    })
    .from(products)
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(and(inArray(products.id, uniqueIds), eq(products.isActive, true)));

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        slug: row.slug,
        name: row.name,
        internalCode: row.internalCode,
        brand: row.brand,
        model: row.model,
        imageUrl: row.imageUrl,
        price: row.price,
      });
    }
  }

  return map;
}

async function getDbAdminPurchaseRequests() {
  const requestRows = await getDb()
    .select({
      id: purchaseRequests.id,
      createdAt: purchaseRequests.createdAt,
      buyerId: profiles.id,
      buyerName: profiles.name,
      buyerCompanyName: profiles.companyName,
      buyerEmail: profiles.email,
      buyerPhone: profiles.phone,
      status: purchaseRequests.status,
      saleResult: purchaseRequests.saleResult,
      estimatedTotal: purchaseRequests.estimatedTotal,
    })
    .from(purchaseRequests)
    .innerJoin(profiles, eq(profiles.id, purchaseRequests.buyerId))
    .orderBy(desc(purchaseRequests.createdAt));

  if (requestRows.length === 0) {
    return [];
  }

  const itemRows = await getDb()
    .select({
      purchaseRequestId: purchaseRequestItems.purchaseRequestId,
      quantity: purchaseRequestItems.quantity,
    })
    .from(purchaseRequestItems)
    .where(
      inArray(
        purchaseRequestItems.purchaseRequestId,
        requestRows.map((request) => request.id),
      ),
    );

  return requestRows.map((request) => ({
    ...request,
    itemCount: itemRows
      .filter((item) => item.purchaseRequestId === request.id)
      .reduce((total, item) => total + item.quantity, 0),
  }));
}

function getSampleAdminPurchaseRequests(): AdminPurchaseRequestSummary[] {
  return samplePurchaseRequests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    buyerId: request.buyerId,
    buyerName: request.buyer.name,
    buyerCompanyName: request.buyer.companyName,
    buyerEmail: request.buyer.email,
    buyerPhone: request.buyer.phone,
    status: request.status,
    saleResult: request.saleResult,
    estimatedTotal: request.estimatedTotal,
    itemCount: request.items.reduce((total, item) => total + item.quantity, 0),
  }));
}

function sampleRequestToAdminDetail(
  request: (typeof samplePurchaseRequests)[number],
): AdminPurchaseRequestDetail {
  const items = request.items.map((item) => {
    const product = sampleProducts.find((candidate) => candidate.id === item.productId);

    return {
      ...item,
      imageUrl: product?.imageUrl ?? null,
      currentProductName: product?.name ?? null,
    };
  });

  return {
    id: request.id,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt,
    buyerId: request.buyerId,
    buyerName: request.buyer.name,
    buyerCompanyName: request.buyer.companyName,
    buyerEmail: request.buyer.email,
    buyerPhone: request.buyer.phone,
    status: request.status,
    saleResult: request.saleResult,
    estimatedTotal: request.estimatedTotal,
    buyerNotes: request.buyerNotes,
    adminNotes: request.adminNotes,
    saleResultNotes: request.saleResultNotes,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    buyer: {
      id: request.buyer.id,
      name: request.buyer.name,
      companyName: request.buyer.companyName,
      email: request.buyer.email,
      phone: request.buyer.phone,
    },
    items,
  };
}

function applyAdminFilters(
  requests: AdminPurchaseRequestSummary[],
  filters: AdminPurchaseRequestFilters,
) {
  const text = normalize(filters.text);
  const date = filters.date;

  return requests.filter((request) => {
    if (filters.status && filters.status !== "ALL" && request.status !== filters.status) {
      return false;
    }

    if (
      filters.saleResult &&
      filters.saleResult !== "ALL" &&
      request.saleResult !== filters.saleResult
    ) {
      return false;
    }

    if (filters.buyerId && request.buyerId !== filters.buyerId) {
      return false;
    }

    if (date && request.createdAt.toISOString().slice(0, 10) !== date) {
      return false;
    }

    if (
      text &&
      ![
        request.id,
        request.buyerName,
        request.buyerCompanyName,
        request.buyerEmail,
        request.buyerPhone,
      ]
        .filter(Boolean)
        .some((value) => normalize(value).includes(text))
    ) {
      return false;
    }

    return true;
  });
}

function uniqueItemsBySnapshot(
  rows: Array<{
    productId: string | null;
    productNameSnapshot: string;
    productCodeSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    subtotalSnapshot: string;
    imageUrl: string | null;
    currentProductName: string | null;
  }>,
) {
  const byKey = new Map<string, (typeof rows)[number]>();

  for (const row of rows) {
    const key = `${row.productId ?? "no-product"}:${row.productCodeSnapshot}:${row.productNameSnapshot}`;
    if (!byKey.has(key)) {
      byKey.set(key, row);
    }
  }

  return [...byKey.values()];
}

async function readActiveListCookie(): Promise<StoredActiveList> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACTIVE_LIST_COOKIE)?.value;

  if (!raw) {
    return { buyerId: "", items: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredActiveList;
    return {
      buyerId: typeof parsed.buyerId === "string" ? parsed.buyerId : "",
      items: sanitizeList(parsed.items),
    };
  } catch {
    return { buyerId: "", items: [] };
  }
}

async function readSubmittedRequestsCookie(): Promise<StoredRequest[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SUBMITTED_REQUESTS_COOKIE)?.value;

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSubmittedRequestsCookie(requests: StoredRequest[]) {
  const cookieStore = await cookies();
  cookieStore.set(SUBMITTED_REQUESTS_COOKIE, JSON.stringify(requests.slice(0, 20)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

function sanitizeList(items: RequestListEntry[] | undefined) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      productId: String(item.productId ?? ""),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        item.productId.length > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
    .slice(0, 50);
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}
