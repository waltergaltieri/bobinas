import { describe, expect, it } from "vitest";

import snapshot from "../../../../data/imports/daref/catalogo-daref-maestro.json";
import { buildDarefImportPlan } from "./transform";
import { runDarefImport } from "./importer";
import type {
  DarefImportPersistence,
  DarefImageStorage,
  ExistingDarefProduct,
} from "./importer";

function buildFakes(existingProducts: ExistingDarefProduct[] = []) {
  const calls = {
    backups: 0,
    applies: 0,
    uploads: [] as string[],
    appliedCodes: [] as string[],
  };
  const persistence: DarefImportPersistence = {
    async inspect() {
      return { existingProducts, attributeTypeConflicts: [] };
    },
    async backup() {
      calls.backups += 1;
      return { existingProducts };
    },
    async apply({ products }) {
      calls.applies += 1;
      calls.appliedCodes = products.map((product) => product.internalCode);
    },
  };
  const imageStorage: DarefImageStorage = {
    async upload(image) {
      calls.uploads.push(image.publicId);
      return {
        url: `https://res.cloudinary.com/test/image/upload/${image.publicId}.jpg`,
        publicId: image.publicId,
      };
    },
  };
  return { calls, persistence, imageStorage };
}

describe("runDarefImport", () => {
  it("performs a dry-run without backups, uploads or database writes", async () => {
    const plan = buildDarefImportPlan(snapshot);
    const fakes = buildFakes();

    const result = await runDarefImport({
      plan,
      apply: false,
      persistence: fakes.persistence,
      imageStorage: fakes.imageStorage,
    });

    expect(result.report).toMatchObject({
      mode: "dry-run",
      total: 422,
      creates: 422,
      updates: 0,
      skips: 0,
      imageUploads: 0,
      imageFailures: 0,
    });
    expect(fakes.calls).toMatchObject({ backups: 0, applies: 0, uploads: [] });
  });

  it("aborts when a code belongs to a product from another source", async () => {
    const plan = buildDarefImportPlan(snapshot);
    const fakes = buildFakes([
      {
        id: "existing-id",
        internalCode: "20020",
        reviewStatus: "APPROVED",
        source: null,
      },
    ]);

    await expect(
      runDarefImport({
        plan,
        apply: true,
        persistence: fakes.persistence,
        imageStorage: fakes.imageStorage,
      }),
    ).rejects.toThrow("Conflictos de codigo: 20020");
    expect(fakes.calls.applies).toBe(0);
  });

  it("updates pending DAREF rows and protects reviewed rows", async () => {
    const plan = buildDarefImportPlan(snapshot);
    const fakes = buildFakes([
      {
        id: "pending-id",
        internalCode: "20020",
        reviewStatus: "PENDING",
        source: "Casa Medina - catálogo público DAREF",
      },
      {
        id: "approved-id",
        internalCode: "20021",
        reviewStatus: "APPROVED",
        source: "Casa Medina - catálogo público DAREF",
      },
    ]);

    const result = await runDarefImport({
      plan,
      apply: true,
      persistence: fakes.persistence,
      imageStorage: fakes.imageStorage,
      concurrency: 8,
    });

    expect(result.report).toMatchObject({
      creates: 420,
      updates: 1,
      skips: 1,
      imageUploads: 421,
      imageFailures: 0,
    });
    expect(result.report.skippedCodes).toEqual(["20021"]);
    expect(fakes.calls.backups).toBe(1);
    expect(fakes.calls.applies).toBe(1);
    expect(fakes.calls.appliedCodes).toContain("20020");
    expect(fakes.calls.appliedCodes).not.toContain("20021");
  });

  it("continues the database load when an individual image fails", async () => {
    const plan = buildDarefImportPlan(snapshot);
    plan.products = plan.products.slice(0, 2);
    const fakes = buildFakes();
    fakes.imageStorage.upload = async (image) => {
      if (image.publicId.endsWith("20020")) throw new Error("remote fetch failed");
      return {
        url: `https://res.cloudinary.com/test/image/upload/${image.publicId}.jpg`,
        publicId: image.publicId,
      };
    };

    const result = await runDarefImport({
      plan,
      apply: true,
      persistence: fakes.persistence,
      imageStorage: fakes.imageStorage,
    });

    expect(result.report.imageUploads).toBe(1);
    expect(result.report.imageFailures).toBe(1);
    expect(result.report.errors).toEqual([
      expect.objectContaining({ code: "20020", stage: "image" }),
    ]);
    expect(fakes.calls.appliedCodes).toEqual(["20020", "20021"]);
  });

  it("aborts before external writes when an attribute type conflicts", async () => {
    const plan = buildDarefImportPlan(snapshot);
    const fakes = buildFakes();
    fakes.persistence.inspect = async () => ({
      existingProducts: [],
      attributeTypeConflicts: ["aplicacion: SELECT != TEXT"],
    });

    await expect(
      runDarefImport({
        plan,
        apply: true,
        persistence: fakes.persistence,
        imageStorage: fakes.imageStorage,
      }),
    ).rejects.toThrow("Conflictos de caracteristicas: aplicacion: SELECT != TEXT");
    expect(fakes.calls.uploads).toEqual([]);
  });
});
