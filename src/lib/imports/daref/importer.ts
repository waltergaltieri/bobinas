import type { ProductReviewStatus } from "@/db/schema";

import type { DarefImportPlan, PlannedProduct } from "./types";

export type ExistingDarefProduct = {
  id: string;
  internalCode: string;
  reviewStatus: ProductReviewStatus;
  source: string | null;
};

export type UploadedDarefImage = {
  url: string;
  publicId: string;
};

export type DarefImportInspection = {
  existingProducts: ExistingDarefProduct[];
  attributeTypeConflicts: string[];
};

export type DarefImportPersistence = {
  inspect(plan: DarefImportPlan): Promise<DarefImportInspection>;
  backup(codes: string[]): Promise<unknown>;
  apply(input: {
    plan: DarefImportPlan;
    products: PlannedProduct[];
    images: Map<string, UploadedDarefImage>;
  }): Promise<void>;
};

export type DarefImageStorage = {
  upload(image: PlannedProduct["image"]): Promise<UploadedDarefImage>;
};

export type DarefImportReport = {
  mode: "dry-run" | "apply";
  importBatch: string;
  total: number;
  creates: number;
  updates: number;
  skips: number;
  imageUploads: number;
  imageFailures: number;
  skippedCodes: string[];
  errors: Array<{
    code: string;
    stage: "image";
    message: string;
  }>;
};

export async function runDarefImport({
  plan,
  apply,
  persistence,
  imageStorage,
  concurrency = 4,
}: {
  plan: DarefImportPlan;
  apply: boolean;
  persistence: DarefImportPersistence;
  imageStorage: DarefImageStorage;
  concurrency?: number;
}) {
  const inspection = await persistence.inspect(plan);
  if (inspection.attributeTypeConflicts.length > 0) {
    throw new Error(
      `Conflictos de caracteristicas: ${inspection.attributeTypeConflicts.join(", ")}`,
    );
  }

  const existingByCode = new Map(
    inspection.existingProducts.map((product) => [product.internalCode, product]),
  );
  const creates: PlannedProduct[] = [];
  const updates: PlannedProduct[] = [];
  const skippedCodes: string[] = [];
  const conflictCodes: string[] = [];

  for (const product of plan.products) {
    const existing = existingByCode.get(product.internalCode);
    if (!existing) {
      creates.push(product);
      continue;
    }

    if (existing.source !== product.source.name) {
      conflictCodes.push(product.internalCode);
      continue;
    }

    if (existing.reviewStatus === "PENDING") {
      updates.push(product);
    } else {
      skippedCodes.push(product.internalCode);
    }
  }

  if (conflictCodes.length > 0) {
    throw new Error(`Conflictos de codigo: ${conflictCodes.join(", ")}`);
  }

  const report: DarefImportReport = {
    mode: apply ? "apply" : "dry-run",
    importBatch: plan.importBatch,
    total: plan.products.length,
    creates: creates.length,
    updates: updates.length,
    skips: skippedCodes.length,
    imageUploads: 0,
    imageFailures: 0,
    skippedCodes,
    errors: [],
  };

  if (!apply) {
    return { report, backup: null };
  }

  const targetProducts = [...creates, ...updates];
  const backup = await persistence.backup(targetProducts.map((product) => product.internalCode));
  const images = new Map<string, UploadedDarefImage>();

  await mapWithConcurrency(targetProducts, concurrency, async (product) => {
    try {
      const uploaded = await imageStorage.upload(product.image);
      images.set(product.internalCode, uploaded);
      report.imageUploads += 1;
    } catch (error) {
      report.imageFailures += 1;
      report.errors.push({
        code: product.internalCode,
        stage: "image",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await persistence.apply({ plan, products: targetProducts, images });

  return { report, backup };
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  const workerCount = Math.max(1, Math.min(Math.floor(concurrency), items.length));
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }),
  );
}
