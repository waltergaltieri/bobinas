import type { ProfileRole, StockMode } from "@/db/schema";

type ViewerRole = ProfileRole | "PUBLIC";

export type ProductCardSource = {
  id: string;
  name: string;
  slug: string;
  internalCode: string;
  oemCode?: string | null;
  brand: string | null;
  model: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  shortDescription?: string | null;
  price?: string;
  stockMode: StockMode;
  imageUrl: string | null;
};

type PublicCatalogProductCard = Omit<ProductCardSource, "price"> & {
  primaryAction: "consult";
};

type PrivateCatalogProductCard = ProductCardSource & {
  price: string;
  primaryAction: "add_to_request";
};

export type CatalogProductCard =
  | PublicCatalogProductCard
  | PrivateCatalogProductCard;

export function toCatalogProductCard(
  product: ProductCardSource,
  role: ViewerRole,
): CatalogProductCard {
  const base = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    internalCode: product.internalCode,
    oemCode: product.oemCode ?? null,
    brand: product.brand,
    model: product.model,
    categoryName: product.categoryName ?? null,
    categorySlug: product.categorySlug ?? null,
    shortDescription: product.shortDescription ?? null,
    stockMode: product.stockMode,
    imageUrl: product.imageUrl,
  };

  if (role === "ADMIN" || role === "BUYER") {
    return {
      ...base,
      price: product.price ?? "0.00",
      primaryAction: "add_to_request",
    };
  }

  return {
    ...base,
    primaryAction: "consult",
  };
}
