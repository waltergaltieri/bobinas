import { describe, expect, it } from "vitest";

import {
  buildDuplicatedProductIdentity,
  canChangeAttributeType,
  isDuplicateSlug,
} from "./admin-catalog";

describe("admin catalog helpers", () => {
  it("builds a unique duplicate slug and internal code", () => {
    const result = buildDuplicatedProductIdentity({
      name: "Bobina Bosch 12V",
      slug: "bobina-bosch-12v",
      internalCode: "BOB-12",
      existingSlugs: ["bobina-bosch-12v", "bobina-bosch-12v-copia"],
      existingInternalCodes: ["BOB-12", "BOB-12-COPIA"],
    });

    expect(result.name).toBe("Bobina Bosch 12V copia");
    expect(result.slug).toBe("bobina-bosch-12v-copia-2");
    expect(result.internalCode).toBe("BOB-12-COPIA-2");
  });

  it("detects duplicate slugs while ignoring the current row", () => {
    const rows = [
      { id: "cat-1", slug: "bobinas" },
      { id: "cat-2", slug: "inducidos" },
    ];

    expect(isDuplicateSlug(rows, "bobinas")).toBe(true);
    expect(isDuplicateSlug(rows, "bobinas", "cat-1")).toBe(false);
  });

  it("blocks attribute type changes when values already exist", () => {
    expect(
      canChangeAttributeType({
        currentType: "NUMBER",
        nextType: "TEXT",
        assignedValuesCount: 2,
      }),
    ).toEqual({
      ok: false,
      error:
        "No se puede cambiar el tipo porque la caracteristica ya tiene valores asignados.",
    });
  });
});
