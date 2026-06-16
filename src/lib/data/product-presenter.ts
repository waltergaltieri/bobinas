import type { AttributeType, ProfileRole, StockMode } from "@/db/schema";

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
  attributes?: Array<{
    attributeId?: string;
    attributeName: string;
    attributeSlug?: string;
    type?: AttributeType;
    value: string;
    unit: string | null;
  }>;
};

type PublicCatalogProductCard = Omit<ProductCardSource, "price"> & {
  primaryAction: "consult";
  highlightedAttributes: HighlightedAttribute[];
};

type PrivateCatalogProductCard = ProductCardSource & {
  price: string;
  primaryAction: "add_to_request";
  highlightedAttributes: HighlightedAttribute[];
};

type HighlightedAttribute = {
  label: string;
  value: string;
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
    highlightedAttributes: getHighlightedAttributes(product),
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

function getHighlightedAttributes(product: ProductCardSource): HighlightedAttribute[] {
  return (product.attributes ?? []).slice(0, 4).map((attribute) => ({
    label: attribute.attributeName,
    value: [attribute.value, attribute.unit].filter(Boolean).join(" "),
  }));
}
