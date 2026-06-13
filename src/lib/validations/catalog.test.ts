import { describe, expect, it } from "vitest";

import {
  attributeSchema,
  categorySchema,
  productSchema,
} from "./catalog";

describe("catalog validations", () => {
  it("rejects categories without a name", () => {
    const result = categorySchema.safeParse({
      name: "",
      slug: "sin-nombre",
      description: "",
      imageUrl: "",
      imagePublicId: "",
      parentId: "",
      sortOrder: 0,
      isActive: true,
    });

    expect(result.success).toBe(false);
  });

  it("rejects attributes without a type", () => {
    const result = attributeSchema.safeParse({
      name: "Voltaje",
      slug: "voltaje",
      unit: "V",
      isFilterable: true,
      isVisible: true,
      sortOrder: 0,
      options: [],
    });

    expect(result.success).toBe(false);
  });

  it("requires normalized attribute values for selectable attributes", () => {
    const result = attributeSchema.safeParse({
      name: "Tipo de encastre",
      slug: "tipo-de-encastre",
      type: "SELECT",
      unit: "",
      isFilterable: true,
      isVisible: true,
      sortOrder: 1,
      options: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts categories with Cloudinary image metadata only", () => {
    const result = categorySchema.safeParse({
      name: "Bobinas",
      slug: "bobinas",
      description: "Bobinas de encendido y repuestos asociados",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/bobinas.webp",
      imagePublicId: "catalogo/categorias/bobinas",
      parentId: "",
      sortOrder: 1,
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("requires private product price to be a non-negative number", () => {
    const result = productSchema.safeParse({
      name: "Inducido completo",
      slug: "inducido-completo",
      shortDescription: "Inducido para alternador",
      description: "",
      brand: "Bosch",
      model: "",
      internalCode: "IND-001",
      oemCode: "",
      mainCategoryId: "category-1",
      price: "-1",
      stockMode: "AVAILABLE",
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects products without a name", () => {
    const result = productSchema.safeParse({
      name: "",
      slug: "sin-nombre",
      shortDescription: "",
      description: "",
      brand: "Bosch",
      model: "",
      internalCode: "IND-001",
      oemCode: "",
      mainCategoryId: "category-1",
      price: "10",
      stockMode: "AVAILABLE",
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    });

    expect(result.success).toBe(false);
  });

  it("requires stock quantity when stock mode is tracked", () => {
    const result = productSchema.safeParse({
      name: "Plaqueta reguladora",
      slug: "plaqueta-reguladora",
      shortDescription: "",
      description: "",
      brand: "Magneti Marelli",
      model: "",
      internalCode: "PLA-001",
      oemCode: "",
      mainCategoryId: "",
      price: "10",
      stockMode: "TRACKED",
      stockQuantity: "",
      isActive: true,
      isFeatured: false,
    });

    expect(result.success).toBe(false);
  });
});
