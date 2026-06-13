import { describe, expect, it } from "vitest";

import {
  aggregateProductViews,
  aggregateRequestedProducts,
  aggregateSearchTerms,
  buildFallbackUsageMetrics,
} from "./metrics";

describe("admin usage metrics", () => {
  it("aggregates product views by product", () => {
    const result = aggregateProductViews([
      { productId: "p1", productName: "Bobina", createdAt: new Date() },
      { productId: "p1", productName: "Bobina", createdAt: new Date() },
      { productId: "p2", productName: "Inducido", createdAt: new Date() },
    ]);

    expect(result).toEqual([
      { productId: "p1", productName: "Bobina", count: 2 },
      { productId: "p2", productName: "Inducido", count: 1 },
    ]);
  });

  it("groups searches without logging empty terms", () => {
    const result = aggregateSearchTerms([
      { query: " bobina ", resultsCount: 3, createdAt: new Date() },
      { query: "Bobina", resultsCount: 2, createdAt: new Date() },
      { query: "", resultsCount: 9, createdAt: new Date() },
    ]);

    expect(result).toEqual([
      { query: "bobina", count: 2, totalResults: 5, averageResults: 2.5 },
    ]);
  });

  it("aggregates requested products by quantity", () => {
    const result = aggregateRequestedProducts([
      { productId: "p1", productName: "Bobina", quantity: 2 },
      { productId: "p1", productName: "Bobina", quantity: 3 },
      { productId: "p2", productName: "Inducido", quantity: 1 },
    ]);

    expect(result).toEqual([
      { productId: "p1", productName: "Bobina", quantity: 5 },
      { productId: "p2", productName: "Inducido", quantity: 1 },
    ]);
  });

  it("builds useful fallback metrics without a database", () => {
    const metrics = buildFallbackUsageMetrics();

    expect(metrics.summary.productsActive).toBeGreaterThan(0);
    expect(metrics.topViewedProducts.length).toBeGreaterThan(0);
    expect(metrics.frequentSearches.length).toBeGreaterThan(0);
    expect(metrics.recentActivity.length).toBeGreaterThan(0);
  });
});
