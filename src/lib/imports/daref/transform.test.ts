import { describe, expect, it } from "vitest";

import snapshot from "../../../../data/imports/daref/catalogo-daref-maestro.json";
import { buildDarefImportPlan } from "./transform";

describe("buildDarefImportPlan", () => {
  it("builds the complete historical batch with all product families", () => {
    const plan = buildDarefImportPlan(snapshot);

    expect(plan.products).toHaveLength(422);
    expect(plan.categories.map((category) => category.slug)).toEqual([
      "inducidos",
      "rotores",
      "estatores",
    ]);
    expect(
      plan.products.reduce<Record<string, number>>((counts, product) => {
        counts[product.mainCategorySlug] =
          (counts[product.mainCategorySlug] ?? 0) + 1;
        return counts;
      }, {}),
    ).toEqual({ inducidos: 221, rotores: 111, estatores: 90 });
  });

  it("creates every normalized characteristic needed by the three families", () => {
    const plan = buildDarefImportPlan(snapshot);

    expect(plan.attributes).toEqual([
      expect.objectContaining({ slug: "voltaje", type: "NUMBER", unit: "V" }),
      expect.objectContaining({ slug: "amperaje", type: "NUMBER", unit: "A" }),
      expect.objectContaining({ slug: "estrias", type: "NUMBER" }),
      expect.objectContaining({ slug: "largo-total", type: "NUMBER", unit: "mm" }),
      expect.objectContaining({
        slug: "diametro-interno",
        type: "NUMBER",
        unit: "mm",
      }),
      expect.objectContaining({ slug: "aplicacion", type: "TEXT" }),
      expect.objectContaining({
        slug: "sistema-aplicacion",
        type: "MULTISELECT",
      }),
      expect.objectContaining({ slug: "otros-atributos", type: "MULTISELECT" }),
    ]);
  });

  it("maps product fields, technical values, image identity and pending defaults", () => {
    const plan = buildDarefImportPlan(snapshot);
    const product = plan.products.find((item) => item.internalCode === "20020");

    expect(product).toMatchObject({
      name: "Inducido Bosch para Ford Cargo - 20020",
      slug: "inducido-bosch-para-ford-cargo-20020",
      brand: "DAREF",
      mainCategorySlug: "inducidos",
      price: "0.00",
      stockMode: "ON_REQUEST",
      stockQuantity: 0,
      isActive: false,
      isFeatured: false,
      reviewStatus: "PENDING",
      image: {
        publicId: "bobinas/catalogo-daref/20020",
      },
    });
    expect(product?.attributeValues).toEqual(
      expect.arrayContaining([
        { attributeSlug: "voltaje", kind: "number", value: "24" },
        {
          attributeSlug: "aplicacion",
          kind: "text",
          value: "Ford Cargo",
        },
        {
          attributeSlug: "sistema-aplicacion",
          kind: "option",
          value: "Bosch",
        },
      ]),
    );
  });

  it("splits multi-value system brands and literal other attributes", () => {
    const plan = buildDarefImportPlan(snapshot);
    const systemProduct = plan.products.find(
      (item) => item.internalCode === "20136",
    );
    const otherProduct = plan.products.find((item) => item.internalCode === "C337");

    expect(
      systemProduct?.attributeValues
        .filter((value) => value.attributeSlug === "sistema-aplicacion")
        .map((value) => value.value),
    ).toEqual(["Prestolite", "Hitachi", "Indiel"]);
    expect(
      otherProduct?.attributeValues
        .filter((value) => value.attributeSlug === "otros-atributos")
        .map((value) => value.value),
    ).toEqual(["con ventilador interno", "ventilador interno", "D 89"]);
  });

  it("rejects duplicate codes before planning writes", () => {
    const duplicate = structuredClone(snapshot);
    duplicate.products.push(structuredClone(duplicate.products[0]));

    expect(() => buildDarefImportPlan(duplicate)).toThrow(
      "Codigo DAREF duplicado: 20020",
    );
  });

  it("rejects malformed technical JSON even when dedicated columns exist", () => {
    const malformed = structuredClone(snapshot);
    malformed.products[0].atributos_tecnicos_json = "{malformado";

    expect(() => buildDarefImportPlan(malformed)).toThrow(
      "JSON tecnico invalido para 20020",
    );
  });
});
