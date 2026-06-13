import { describe, expect, it } from "vitest";

import { buyerSchema, normalizeBuyerEmail } from "./buyers";

describe("buyer validations", () => {
  it("accepts a valid buyer profile", () => {
    const result = buyerSchema.safeParse({
      name: "Taller Norte",
      companyName: "Taller Norte SRL",
      email: " Compras@TallerNorte.test ",
      phone: "+5491123456789",
      cuit: "30-12345678-9",
      address: "Av. Repuestos 123",
      isActive: true,
      internalNotes: "Cliente frecuente",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("compras@tallernorte.test");
  });

  it("rejects invalid buyer emails", () => {
    const result = buyerSchema.safeParse({
      name: "Taller Norte",
      companyName: "Taller Norte SRL",
      email: "no-es-email",
      phone: "",
      cuit: "",
      address: "",
      isActive: true,
      internalNotes: "",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes buyer emails before duplicate checks", () => {
    expect(normalizeBuyerEmail(" Compras@TallerNorte.test ")).toBe(
      "compras@tallernorte.test",
    );
  });
});
