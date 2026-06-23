import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminProductList } from "./admin-product-list";
import type { AdminProduct } from "@/lib/data/catalog";

const product: AdminProduct = {
  id: "product-1",
  name: "IB1217",
  slug: "ib1217",
  shortDescription: "Bosch 1004011217",
  description: "Inducido Bosch",
  internalCode: "01",
  oemCode: "1004011217",
  brand: "Bosch",
  model: "IB1217",
  price: "50000.00",
  stockMode: "ON_REQUEST",
  stockQuantity: 50,
  isFeatured: false,
  isActive: true,
  categoryName: "Impulsores",
  categorySlug: "impulsores",
  mainCategoryId: "category-1",
  imageUrl: "https://example.com/product.jpg",
  attributes: [
    {
      attributeId: "attribute-1",
      attributeName: "Voltaje",
      attributeSlug: "voltaje",
      type: "NUMBER",
      unit: "V",
      value: "12",
    },
  ],
  secondaryCategoryIds: [],
  images: [
    {
      id: "image-1",
      url: "https://example.com/product.jpg",
      publicId: "product",
      altText: "IB1217",
      sortOrder: 0,
    },
  ],
};

describe("AdminProductList", () => {
  it("renders products as a compact list by default without edit fields", () => {
    render(<AdminProductList products={[product]} searchParams={{}} />);

    expect(screen.getByRole("table", { name: "Productos" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Editar IB1217" })).toBeTruthy();
    expect(screen.queryByLabelText("Nombre")).toBeNull();
    expect(screen.queryByLabelText("Slug")).toBeNull();
  });

  it("renders a card view when requested", () => {
    render(<AdminProductList products={[product]} searchParams={{ view: "cards" }} />);

    expect(screen.getByTestId("admin-product-card-grid")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Editar IB1217" })).toBeTruthy();
  });
});
