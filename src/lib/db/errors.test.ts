import { describe, expect, it } from "vitest";

import { toSafeMutationError } from "./errors";

describe("toSafeMutationError", () => {
  it("returns a controlled message for unique constraint failures", () => {
    const error = { code: "23505", constraint_name: "categories_slug_idx" };

    expect(toSafeMutationError(error)).toBe(
      "Ya existe un registro con ese slug o codigo.",
    );
  });

  it("does not expose raw database errors", () => {
    const error = new Error("password=secret db stack trace");

    expect(toSafeMutationError(error)).toBe(
      "No se pudo guardar. Revisá los datos e intentá nuevamente.",
    );
  });
});
