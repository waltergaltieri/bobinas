import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AdminProduct } from "@/lib/data/catalog";
import { ProductFields } from "./product-fields";

const existingProduct: AdminProduct = {
  id: "product-1",
  name: "Bobina Bosch 12V",
  slug: "bobina-bosch-12v",
  shortDescription: "Bobina para encendido",
  description: "Bobina de encendido Bosch",
  internalCode: "BOB-12",
  oemCode: "OEM-12",
  brand: "Bosch",
  model: "12V",
  price: "12500.00",
  stockMode: "TRACKED",
  stockQuantity: 7,
  isFeatured: false,
  isActive: true,
  reviewStatus: "PENDING",
  reviewNotes: "Verificar precio.",
  reviewedAt: null,
  categoryName: "Encendido",
  categorySlug: "encendido",
  mainCategoryId: "category-1",
  imageUrl: null,
  attributes: [],
  secondaryCategoryIds: [],
  images: [],
};

describe("ProductFields", () => {
  it("uses simple internal defaults without exposing stock controls for new products", () => {
    const { container } = render(
      <ProductFields product={undefined} categories={[]} attributes={[]} />,
    );

    expect(screen.getByText("Disponibilidad a confirmar")).toBeTruthy();
    expect(container.querySelector('select[name="stockMode"]')).toBeNull();
    expect(
      container.querySelector('input[name="stockQuantity"][type="number"]'),
    ).toBeNull();
    expect(
      (container.querySelector('input[name="stockMode"]') as HTMLInputElement)
        .value,
    ).toBe("ON_REQUEST");
    expect(
      (container.querySelector('input[name="stockQuantity"]') as HTMLInputElement)
        .value,
    ).toBe("0");
  });

  it("preserves existing internal stock values when editing", () => {
    const { container } = render(
      <ProductFields product={existingProduct} categories={[]} attributes={[]} />,
    );

    expect(
      (container.querySelector('input[name="stockMode"]') as HTMLInputElement)
        .value,
    ).toBe("TRACKED");
    expect(
      (container.querySelector('input[name="stockQuantity"]') as HTMLInputElement)
        .value,
    ).toBe("7");
    expect(
      (container.querySelector('select[name="reviewStatus"]') as HTMLSelectElement)
        .value,
    ).toBe("PENDING");
    expect(
      (container.querySelector('textarea[name="reviewNotes"]') as HTMLTextAreaElement)
        .value,
    ).toBe("Verificar precio.");
  });
});
