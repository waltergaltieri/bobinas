"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  productCategories,
  productAttributeValues,
  productImages,
  products,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { buildDuplicatedProductIdentity } from "@/lib/data/admin-catalog";
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
    isFeatured: formData.get("isFeatured") === "on",
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

export async function updateCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const id = idSchema.safeParse(formData.get("id"));
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
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!id.success) {
    return { error: "Categoria invalida." };
  }

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisa los datos de la categoria.") };
  }

  try {
    await getDb()
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, id.data));
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    revalidatePath("/productos");
    return { ok: true };
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }
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

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));

  await getDb()
    .update(categories)
    .set({ isActive: false, isFeatured: false, updatedAt: new Date() })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/productos");
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

export async function updateAttributeAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const id = idSchema.safeParse(formData.get("id"));
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

  if (!id.success) {
    return { error: "Caracteristica invalida." };
  }

  if (!parsed.success) {
    return {
      error: formatValidationError(
        parsed.error,
        "Revisa los datos de la caracteristica.",
      ),
    };
  }

  try {
    const [current] = await getDb()
      .select({ type: attributes.type })
      .from(attributes)
      .where(eq(attributes.id, id.data));
    const existingValues = await getDb()
      .select({ id: productAttributeValues.id })
      .from(productAttributeValues)
      .where(eq(productAttributeValues.attributeId, id.data));

    if (
      current &&
      current.type !== parsed.data.type &&
      existingValues.length > 0
    ) {
      return {
        error:
          "No se puede cambiar el tipo porque la caracteristica ya tiene valores asignados.",
      };
    }

    await getDb()
      .update(attributes)
      .set({
        name: parsed.data.name,
        slug: parsed.data.slug,
        type: parsed.data.type,
        unit: parsed.data.unit,
        isFilterable: parsed.data.isFilterable,
        isVisible: parsed.data.isVisible,
        sortOrder: parsed.data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(attributes.id, id.data));

    await getDb()
      .delete(attributeOptions)
      .where(eq(attributeOptions.attributeId, id.data));

    if (parsed.data.options.length > 0) {
      await getDb().insert(attributeOptions).values(
        parsed.data.options.map((value, index) => ({
          attributeId: id.data,
          value,
          sortOrder: index,
        })),
      );
    }

    revalidatePath("/admin/caracteristicas");
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { ok: true };
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }
}

export async function deactivateAttributeAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));

  await getDb()
    .update(attributes)
    .set({ isFilterable: false, isVisible: false, updatedAt: new Date() })
    .where(eq(attributes.id, id));

  revalidatePath("/admin/caracteristicas");
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
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

    if (created) {
      await replaceSecondaryCategories(created.id, formData);
      await insertProductImages(created.id, formData);
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }

  return { ok: true };
}

export async function updateProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const id = idSchema.safeParse(formData.get("id"));
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
    stockQuantity: formData.get("stockQuantity") ?? "",
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!id.success) {
    return { error: "Producto invalido." };
  }

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisa los datos del producto.") };
  }

  try {
    const attributeValues = await parseProductAttributeValues(formData);
    await getDb()
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(products.id, id.data));

    await getDb()
      .delete(productAttributeValues)
      .where(eq(productAttributeValues.productId, id.data));

    if (attributeValues.length > 0) {
      await getDb().insert(productAttributeValues).values(
        attributeValues.map((value) => ({
          ...value,
          productId: id.data,
        })),
      );
    }

    await replaceSecondaryCategories(id.data, formData);
    await insertProductImages(id.data, formData);

    revalidateProductPaths(id.data, parsed.data.slug);
    return { ok: true };
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }
}

export async function duplicateProductAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));

  const [product] = await getDb().select().from(products).where(eq(products.id, id));
  if (!product) {
    return;
  }

  const existing = await getDb().select({
    slug: products.slug,
    internalCode: products.internalCode,
  }).from(products);
  const identity = buildDuplicatedProductIdentity({
    name: product.name,
    slug: product.slug,
    internalCode: product.internalCode,
    existingSlugs: existing.map((item) => item.slug),
    existingInternalCodes: existing.map((item) => item.internalCode),
  });

  const [created] = await getDb()
    .insert(products)
    .values({
      name: identity.name,
      slug: identity.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      brand: product.brand,
      model: product.model,
      internalCode: identity.internalCode,
      oemCode: product.oemCode,
      mainCategoryId: product.mainCategoryId,
      price: product.price,
      stockMode: product.stockMode,
      stockQuantity: product.stockQuantity,
      isActive: false,
      isFeatured: false,
    })
    .returning({ id: products.id });

  if (created) {
    const [secondaryRows, attributeRows, imageRows] = await Promise.all([
      getDb().select().from(productCategories).where(eq(productCategories.productId, id)),
      getDb()
        .select()
        .from(productAttributeValues)
        .where(eq(productAttributeValues.productId, id)),
      getDb().select().from(productImages).where(eq(productImages.productId, id)),
    ]);

    if (secondaryRows.length > 0) {
      await getDb().insert(productCategories).values(
        secondaryRows.map((row) => ({
          productId: created.id,
          categoryId: row.categoryId,
        })),
      );
    }

    if (attributeRows.length > 0) {
      await getDb().insert(productAttributeValues).values(
        attributeRows.map((row) => ({
          attributeId: row.attributeId,
          valueText: row.valueText,
          valueNumber: row.valueNumber,
          valueBoolean: row.valueBoolean,
          optionId: row.optionId,
          productId: created.id,
        })),
      );
    }

    if (imageRows.length > 0) {
      await getDb().insert(productImages).values(
        imageRows.map((row) => ({
          url: row.url,
          publicId: row.publicId,
          altText: row.altText,
          sortOrder: row.sortOrder,
          productId: created.id,
        })),
      );
    }
  }

  revalidatePath("/admin/productos");
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

export async function deleteProductAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));

  await getDb()
    .update(products)
    .set({ isActive: false, isFeatured: false, updatedAt: new Date() })
    .where(eq(products.id, id));

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function updateProductImageAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));
  const productId = idSchema.parse(formData.get("productId"));

  await getDb()
    .update(productImages)
    .set({
      altText: String(formData.get("altText") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    })
    .where(eq(productImages.id, id));

  revalidateProductPaths(productId);
}

export async function deleteProductImageAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = idSchema.parse(formData.get("id"));
  const productId = idSchema.parse(formData.get("productId"));

  await getDb().delete(productImages).where(eq(productImages.id, id));
  revalidateProductPaths(productId);
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

async function replaceSecondaryCategories(productId: string, formData: FormData) {
  const categoryIds = formData
    .getAll("secondaryCategoryIds")
    .map((value) => String(value))
    .filter((value) => idSchema.safeParse(value).success);

  await getDb()
    .delete(productCategories)
    .where(eq(productCategories.productId, productId));

  if (categoryIds.length > 0) {
    await getDb().insert(productCategories).values(
      [...new Set(categoryIds)].map((categoryId) => ({
        productId,
        categoryId,
      })),
    );
  }
}

async function insertProductImages(productId: string, formData: FormData) {
  const urls = formData.getAll("imageUrl").map((value) => String(value).trim());
  const publicIds = formData
    .getAll("imagePublicId")
    .map((value) => String(value).trim());
  const altTexts = formData.getAll("imageAltText").map((value) => String(value));

  const images = urls
    .map((url, index) => ({
      productId,
      url,
      publicId: publicIds[index] ?? "",
      altText: altTexts[index] ?? "",
      sortOrder: index,
    }))
    .filter((image) => image.url && image.publicId);

  if (images.length > 0) {
    await getDb().insert(productImages).values(images);
  }
}

function revalidateProductPaths(productId: string, slug?: string) {
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/productos/[slug]", "page");
  if (slug) {
    revalidatePath(`/productos/${slug}`);
  }
}
