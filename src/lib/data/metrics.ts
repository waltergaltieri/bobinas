import { and, desc, eq, inArray } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import {
  products,
  profiles,
  productViews,
  purchaseRequestItems,
  requestEvents,
  searchLogs,
  type PurchaseRequestStatus,
  type SaleResult,
} from "@/db/schema";
import {
  getAdminPurchaseRequests,
  getAdminRequestsDashboard,
} from "@/lib/data/purchase-requests";
import { sampleProducts, samplePurchaseRequests } from "@/lib/data/sample-data";

export type ProductViewInput = {
  productId: string;
  productName: string;
  createdAt: Date;
};

export type SearchInput = {
  query: string;
  resultsCount: number;
  createdAt: Date;
};

export type RequestedProductInput = {
  productId: string | null;
  productName: string;
  quantity: number;
};

export type ProductViewMetric = {
  productId: string;
  productName: string;
  count: number;
};

export type SearchMetric = {
  query: string;
  count: number;
  totalResults: number;
  averageResults: number;
};

export type RequestedProductMetric = {
  productId: string | null;
  productName: string;
  quantity: number;
};

export type RecentActivityItem = {
  id: string;
  label: string;
  detail: string;
  createdAt: Date;
};

export type AdminUsageMetrics = {
  summary: {
    productsActive: number;
    buyersActive: number;
    pendingRequests: number;
    inReviewRequests: number;
    contactedRequests: number;
    concretedRequests: number;
    notConcretedRequests: number;
    pendingEstimatedTotal: string;
  };
  topViewedProducts: ProductViewMetric[];
  frequentSearches: SearchMetric[];
  topRequestedProducts: RequestedProductMetric[];
  requestStatusCounts: Array<{ status: PurchaseRequestStatus; count: number }>;
  saleResultCounts: Array<{ result: SaleResult; count: number }>;
  recentActivity: RecentActivityItem[];
};

export function aggregateProductViews(
  rows: ProductViewInput[],
): ProductViewMetric[] {
  const grouped = new Map<string, ProductViewMetric>();

  for (const row of rows) {
    const current = grouped.get(row.productId) ?? {
      productId: row.productId,
      productName: row.productName,
      count: 0,
    };
    current.count += 1;
    grouped.set(row.productId, current);
  }

  return [...grouped.values()].sort(
    (a, b) => b.count - a.count || a.productName.localeCompare(b.productName),
  );
}

export function aggregateSearchTerms(rows: SearchInput[]): SearchMetric[] {
  const grouped = new Map<string, { count: number; totalResults: number }>();

  for (const row of rows) {
    const query = normalize(row.query);
    if (!query) {
      continue;
    }

    const current = grouped.get(query) ?? { count: 0, totalResults: 0 };
    current.count += 1;
    current.totalResults += row.resultsCount;
    grouped.set(query, current);
  }

  return [...grouped.entries()]
    .map(([query, value]) => ({
      query,
      count: value.count,
      totalResults: value.totalResults,
      averageResults: value.totalResults / value.count,
    }))
    .sort((a, b) => b.count - a.count || a.query.localeCompare(b.query));
}

export function aggregateRequestedProducts(
  rows: RequestedProductInput[],
): RequestedProductMetric[] {
  const grouped = new Map<string, RequestedProductMetric>();

  for (const row of rows) {
    const key = row.productId ?? row.productName;
    const current = grouped.get(key) ?? {
      productId: row.productId,
      productName: row.productName,
      quantity: 0,
    };
    current.quantity += row.quantity;
    grouped.set(key, current);
  }

  return [...grouped.values()].sort(
    (a, b) => b.quantity - a.quantity || a.productName.localeCompare(b.productName),
  );
}

export async function getAdminUsageMetrics(): Promise<AdminUsageMetrics> {
  if (!hasDatabaseUrl()) {
    return buildFallbackUsageMetrics();
  }

  const [
    requestMetrics,
    allRequests,
    activeProducts,
    buyers,
    viewRows,
    searchRows,
    itemRows,
  ] =
    await Promise.all([
      getAdminRequestsDashboard(),
      getAdminPurchaseRequests(),
      getDb()
        .select({ id: products.id })
        .from(products)
        .where(eq(products.isActive, true)),
      getDb()
        .select({ id: profiles.id })
        .from(profiles)
        .where(and(eq(profiles.role, "BUYER"), eq(profiles.isActive, true))),
      getDb()
        .select({
          productId: productViews.productId,
          productName: products.name,
          createdAt: productViews.createdAt,
        })
        .from(productViews)
        .innerJoin(products, eq(products.id, productViews.productId))
        .orderBy(desc(productViews.createdAt))
        .limit(500),
      getDb()
        .select({
          query: searchLogs.query,
          resultsCount: searchLogs.resultsCount,
          createdAt: searchLogs.createdAt,
        })
        .from(searchLogs)
        .orderBy(desc(searchLogs.createdAt))
        .limit(500),
      getDb()
        .select({
          productId: purchaseRequestItems.productId,
          productName: purchaseRequestItems.productNameSnapshot,
          quantity: purchaseRequestItems.quantity,
        })
        .from(purchaseRequestItems)
        .limit(500),
    ]);

  const recentEvents = await getRecentDbActivity();

  return {
    summary: {
      productsActive: activeProducts.length,
      buyersActive: buyers.length,
      pendingRequests: requestMetrics.pending,
      inReviewRequests: requestMetrics.inReview,
      contactedRequests: requestMetrics.contacted,
      concretedRequests: requestMetrics.concreted,
      notConcretedRequests: requestMetrics.notConcreted,
      pendingEstimatedTotal: requestMetrics.pendingEstimatedTotal,
    },
    topViewedProducts: aggregateProductViews(viewRows).slice(0, 8),
    frequentSearches: aggregateSearchTerms(searchRows).slice(0, 8),
    topRequestedProducts: aggregateRequestedProducts(itemRows).slice(0, 8),
    requestStatusCounts: countStatuses(allRequests),
    saleResultCounts: countSaleResults(allRequests),
    recentActivity: recentEvents,
  };
}

export function buildFallbackUsageMetrics(): AdminUsageMetrics {
  const sampleRequests = samplePurchaseRequests as Array<
    Omit<(typeof samplePurchaseRequests)[number], "status" | "saleResult"> & {
      status: PurchaseRequestStatus;
      saleResult: SaleResult;
    }
  >;
  const viewRows = sampleProducts.flatMap((product, index) =>
    Array.from({ length: Math.max(1, sampleProducts.length - index) }).map(() => ({
      productId: product.id,
      productName: product.name,
      createdAt: new Date(),
    })),
  );
  const searchRows = [
    { query: "bobina", resultsCount: 1, createdAt: new Date() },
    { query: "inducido", resultsCount: 1, createdAt: new Date() },
    { query: "bobina", resultsCount: 1, createdAt: new Date() },
  ];
  const requestedRows = sampleRequests.flatMap((request) =>
    request.items.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      quantity: item.quantity,
    })),
  );
  const pending = sampleRequests.filter(
    (request) => request.status === "PENDING",
  );

  return {
    summary: {
      productsActive: sampleProducts.filter((product) => product.isActive).length,
      buyersActive: 1,
      pendingRequests: pending.length,
      inReviewRequests: sampleRequests.filter(
        (request) => request.status === "IN_REVIEW",
      ).length,
      contactedRequests: sampleRequests.filter(
        (request) => request.status === "CONTACTED",
      ).length,
      concretedRequests: sampleRequests.filter(
        (request) =>
          request.status === "COMPLETED" || request.saleResult === "CONCRETED",
      ).length,
      notConcretedRequests: sampleRequests.filter(
        (request) =>
          request.status === "NOT_COMPLETED" ||
          request.saleResult === "NOT_CONCRETED",
      ).length,
      pendingEstimatedTotal: formatMoney(
        pending.reduce((total, request) => total + Number(request.estimatedTotal), 0),
      ),
    },
    topViewedProducts: aggregateProductViews(viewRows),
    frequentSearches: aggregateSearchTerms(searchRows),
    topRequestedProducts: aggregateRequestedProducts(requestedRows),
    requestStatusCounts: countStatuses(sampleRequests),
    saleResultCounts: countSaleResults(sampleRequests),
    recentActivity: sampleRequests.slice(0, 5).map((request) => ({
      id: request.id,
      label: "Pedido recibido",
      detail: `${request.buyer.name} - $${request.estimatedTotal}`,
      createdAt: request.createdAt,
    })),
  };
}

async function getRecentDbActivity(): Promise<RecentActivityItem[]> {
  const events = await getDb()
    .select({
      id: requestEvents.id,
      eventType: requestEvents.eventType,
      productId: requestEvents.productId,
      requestId: requestEvents.purchaseRequestId,
      createdAt: requestEvents.createdAt,
    })
    .from(requestEvents)
    .orderBy(desc(requestEvents.createdAt))
    .limit(10);
  const productIds = events
    .map((event) => event.productId)
    .filter(Boolean) as string[];
  const productRows =
    productIds.length > 0
      ? await getDb()
          .select({ id: products.id, name: products.name })
          .from(products)
          .where(inArray(products.id, productIds))
      : [];

  return events.map((event) => {
    const productName = productRows.find((product) => product.id === event.productId)?.name;
    return {
      id: event.id,
      label: getEventLabel(event.eventType),
      detail: productName ?? event.requestId ?? "Actividad de pedido",
      createdAt: event.createdAt,
    };
  });
}

function countStatuses<T extends { status: PurchaseRequestStatus }>(rows: T[]) {
  const grouped = new Map<PurchaseRequestStatus, number>();
  for (const row of rows) {
    grouped.set(row.status, (grouped.get(row.status) ?? 0) + 1);
  }
  return [...grouped.entries()].map(([status, count]) => ({ status, count }));
}

function countSaleResults<T extends { saleResult: SaleResult }>(rows: T[]) {
  const grouped = new Map<SaleResult, number>();
  for (const row of rows) {
    grouped.set(row.saleResult, (grouped.get(row.saleResult) ?? 0) + 1);
  }
  return [...grouped.entries()].map(([result, count]) => ({ result, count }));
}

function getEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    ADD_ITEM: "Producto agregado al pedido",
    UPDATE_QUANTITY: "Cantidad modificada",
    REMOVE_ITEM: "Producto eliminado del pedido",
    SUBMIT_REQUEST: "Pedido enviado",
  };
  return labels[eventType] ?? eventType;
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function formatMoney(value: number) {
  return value.toFixed(2);
}
