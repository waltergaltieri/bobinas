import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CatalogProductCard } from "@/lib/data/product-presenter";
import { ProductCard } from "./product-card";

const product: CatalogProductCard = {
  id: "product-1",
  name: "Bobina Bosch 12V",
  slug: "bobina-bosch-12v",
  internalCode: "BOB-12",
  oemCode: "OEM-12",
  brand: "Bosch",
  model: "12V",
  categoryName: "Encendido",
  categorySlug: "encendido",
  shortDescription: "Bobina para encendido",
  price: "12500.00",
  stockMode: "AVAILABLE",
  imageUrl: null,
  highlightedAttributes: [],
  primaryAction: "add_to_request",
};

describe("ProductCard", () => {
  it("shows a confirmation message instead of the internal stock mode", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText("Disponibilidad a confirmar")).toBeTruthy();
    expect(screen.queryByText(/AVAILABLE/)).toBeNull();
    expect(
      screen.getByRole("button", { name: /Agregar al pedido/ }),
    ).toBeTruthy();
  });
});
