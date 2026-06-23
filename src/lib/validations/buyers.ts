import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export function normalizeBuyerEmail(email: string) {
  return email.trim().toLowerCase();
}

export const buyerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre."),
  companyName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .pipe(z.email("Ingresa un email valido."))
    .transform(normalizeBuyerEmail),
  phone: z.string().trim().optional(),
  cuit: z.string().trim().optional(),
  address: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
  internalNotes: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export const createBuyerSchema = buyerSchema.extend({
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export type BuyerInput = z.infer<typeof buyerSchema>;
export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
