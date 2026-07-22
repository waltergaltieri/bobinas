export type ProductReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export function validateProductPublication({
  nextIsActive,
  reviewStatus,
  price,
  imageCount,
}: {
  nextIsActive: boolean;
  reviewStatus: ProductReviewStatus;
  price: string | number;
  imageCount: number;
}) {
  if (!nextIsActive) {
    return { ok: true as const };
  }

  if (reviewStatus !== "APPROVED") {
    return {
      ok: false as const,
      error: "Aproba la revision del producto antes de activarlo.",
    };
  }

  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return {
      ok: false as const,
      error: "Carga un precio mayor a cero antes de activar el producto.",
    };
  }

  if (imageCount < 1) {
    return {
      ok: false as const,
      error: "Carga al menos una imagen antes de activar el producto.",
    };
  }

  return { ok: true as const };
}
