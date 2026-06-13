"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  productAttributeValues,
  products,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { toSafeMutationError } from "@/lib/db/errors";
import {
  attributeSchema,
  categorySchema,
  productSchema,
} from "@/lib/validations/catalog";
import { slugify } from "@/lib/slugify";

export type ActionState = {
  ok?: boolean;
  error?: string;
};

const idSchema = z.uuid();

export async function createCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "");
  const parsed = categorySchema.safeParse({
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    imagePublicId: String(formData.get("imagePublicId") ?? ""),
    parentId: String(formData.get("parentId") ?? ""),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisá los datos de la categoría.") };
  }

  try {
    await getDb().insert(categories).values(parsed.data);
    revalidatePath("/admin/categorias");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof ProductAttributeValidationError) {
      return { error: error.message };
    }
    return { error: toSafeMutationError(error) };
  }

  return { ok: true };
}

export async function toggleCategoryAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  await getDb()
    .update(categories)
    .set({ isActive: !isActive, updatedAt: new Date() })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categorias");
}

export async function createAttributeAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "");
  const options = String(formData.get("options") ?? "")
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);
  const parsed = attributeSchema.safeParse({
    name,
    slug: String(formData.get("slug") || slugify(name)),
    type: formData.get("type"),
    unit: String(formData.get("unit") ?? ""),
    isFilterable: formData.get("isFilterable") === "on",
    isVisible: formData.get("isVisible") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
    options,
  });

  if (!parsed.success) {
    return {
      error: formatValidationError(
        parsed.error,
        "Revisá los datos de la característica.",
      ),
    };
  }

  try {
    const [created] = await getDb()
      .insert(attributes)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        type: parsed.data.type,
        unit: parsed.data.unit,
        isFilterable: parsed.data.isFilterable,
        isVisible: parsed.data.isVisible,
        sortOrder: parsed.data.sortOrder,
      })
      .returning({ id: attributes.id });

    if (created && parsed.data.options.length > 0) {
      await getDb().insert(attributeOptions).values(
        parsed.data.options.map((value, index) => ({
          attributeId: created.id,
          value,
          sortOrder: index,
        })),
      );
    }

    revalidatePath("/admin/caracteristicas");
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }

  return { ok: true };
}

export async function createProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "");
  const parsed = productSchema.safeParse({
    name,
    slug: String(formData.get("slug") || slugify(name)),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    internalCode: String(formData.get("internalCode") ?? ""),
    oemCode: String(formData.get("oemCode") ?? ""),
    mainCategoryId: String(formData.get("mainCategoryId") ?? ""),
    price: String(formData.get("price") ?? "0"),
    stockMode: formData.get("stockMode"),
    stockQuantity: formData.get("stockQuantity") ?? 0,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisá los datos del producto.") };
  }

  try {
    const attributeValues = await parseProductAttributeValues(formData);
    const [created] = await getDb()
      .insert(products)
      .values(parsed.data)
      .returning({ id: products.id });

    if (created && attributeValues.length > 0) {
      await getDb().insert(productAttributeValues).values(
        attributeValues.map((value) => ({
          ...value,
          productId: created.id,
        })),
      );
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }

  return { ok: true };
}

export async function toggleProductAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  await getDb()
    .update(products)
    .set({ isActive: !isActive, updatedAt: new Date() })
    .where(eq(products.id, id));

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

function formatValidationError(error: z.ZodError, fallback: string) {
  const firstMessage = error.issues[0]?.message;
  return firstMessage ? `${fallback} ${firstMessage}` : fallback;
}

class ProductAttributeValidationError extends Error {}

async function parseProductAttributeValues(formData: FormData) {
  const [attributeRows, optionRows] = await Promise.all([
    getDb()
      .select({
        id: attributes.id,
        name: attributes.name,
        type: attributes.type,
      })
      .from(attributes),
    getDb()
      .select({
        id: attributeOptions.id,
        attributeId: attributeOptions.attributeId,
      })
      .from(attributeOptions),
  ]);
  const values: Array<{
    productId: string;
    attributeId: string;
    valueText?: string;
    valueNumber?: string;
    valueBoolean?: boolean;
    optionId?: string;
  }> = [];

  for (const attribute of attributeRows) {
    const fieldName = `attribute:${attribute.id}`;
    const rawValues = formData
      .getAll(fieldName)
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (rawValues.length === 0) {
      continue;
    }

    const allowedOptions = optionRows
      .filter((option) => option.attributeId === attribute.id)
      .map((option) => option.id);

    if (attribute.type === "NUMBER") {
      const value = rawValues[0];
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        throw new ProductAttributeValidationError(
          `${attribute.name}: ingresa un numero valido.`,
        );
      }
      values.push({
        productId: "",
        attributeId: attribute.id,
        valueNumber: value,
      });
      continue;
    }

    if (attribute.type === "BOOLEAN") {
      const value = rawValues[0];
      if (value !== "true" && value !== "false") {
        throw new ProductAttributeValidationError(
          `${attribute.name}: selecciona Si o No.`,
        );
      }
      values.push({
        productId: "",
        attributeId: attribute.id,
        valueBoolean: value === "true",
      });
      continue;
    }

    if (attribute.type === "SELECT") {
      const optionId = rawValues[0];
      if (!allowedOptions.includes(optionId)) {
        throw new ProductAttributeValidationError(
          `${attribute.name}: selecciona una opcion valida.`,
        );
      }
      values.push({
        productId: "",
        attributeId: attribute.id,
        optionId,
      });
      continue;
    }

    if (attribute.type === "MULTISELECT") {
      for (const optionId of rawValues) {
        if (!allowedOptions.includes(optionId)) {
          throw new ProductAttributeValidationError(
            `${attribute.name}: selecciona opciones validas.`,
          );
        }
        values.push({
          productId: "",
          attributeId: attribute.id,
          optionId,
        });
      }
      continue;
    }

    values.push({
      productId: "",
      attributeId: attribute.id,
      valueText: rawValues[0],
    });
  }

  return values;
}
