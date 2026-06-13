"use client";

import { useEffect } from "react";

export function ProductViewTracker({
  productId,
  sourcePath,
}: {
  productId: string;
  sourcePath: string;
}) {
  useEffect(() => {
    const payload = JSON.stringify({ productId, sourcePath });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/product-view",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }

    void fetch("/api/track/product-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [productId, sourcePath]);

  return null;
}
