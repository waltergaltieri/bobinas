"use client";

import { useEffect } from "react";

export function SearchTracker({
  query,
  filters,
  resultsCount,
  sourcePath,
}: {
  query: string;
  filters: Record<string, string | undefined>;
  resultsCount: number;
  sourcePath: string;
}) {
  useEffect(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    if (!query.trim() && !hasFilters) {
      return;
    }

    const payload = JSON.stringify({
      query,
      filters,
      resultsCount,
      sourcePath,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/search",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/track/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [query, filters, resultsCount, sourcePath]);

  return null;
}
