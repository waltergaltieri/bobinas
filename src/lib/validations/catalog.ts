import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const nonNegativeDecimal = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Debe ser un numero positivo con hasta 2 decimales.");

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre."),
  slug: z.string().trim().min(2, "Ingresá un slug."),
  description: z.string().optional(),
  imageUrl: z.preprocess(emptyToUndefined, z.url().optional()),
  imagePublicId: z.preprocess(emptyToUndefined, z.string().optional()),
  parentId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const attributeSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresá un nombre."),
    slug: z.string().trim().min(2, "Ingresá un slug."),
    type: z.enum(["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTISELECT"]),
    unit: z.string().optional(),
    isFilterable: z.coerce.boolean().default(false),
    isVisible: z.coerce.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0),
    options: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((value, ctx) => {
    if (
      (value.type === "SELECT" || value.type === "MULTISELECT") &&
      value.options.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Las caracteristicas SELECT necesitan opciones normalizadas.",
        path: ["options"],
      });
    }
  });

export const productSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre."),
  slug: z.string().trim().min(2, "Ingresá un slug."),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  internalCode: z.string().trim().min(1, "Ingresá un codigo interno."),
  oemCode: z.string().optional(),
  mainCategoryId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  price: nonNegativeDecimal,
  stockMode: z.enum([
    "TRACKED",
    "AVAILABLE",
    "ON_REQUEST",
    "OUT_OF_STOCK",
    "HIDDEN",
  ]),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.email("Ingresá un email valido."),
  password: z.string().min(6, "Ingresá la contraseña."),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type AttributeInput = z.infer<typeof attributeSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
