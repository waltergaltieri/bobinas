"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import type { ActionState } from "@/app/actions/catalog";
import { getDb, hasDatabaseUrl } from "@/db";
import { profiles } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { buyerEmailExists } from "@/lib/data/buyers";
import { toSafeMutationError } from "@/lib/db/errors";
import {
  createSupabaseAdminClient,
  hasSupabaseAdminEnv,
} from "@/lib/supabase/admin";
import { readServerEnv } from "@/lib/env";
import { buyerSchema } from "@/lib/validations/buyers";

const idSchema = z.uuid();

export async function createBuyerAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  if (!hasDatabaseUrl()) {
    return { error: "Configura DATABASE_URL para crear compradores." };
  }

  if (!hasSupabaseAdminEnv()) {
    return {
      error:
        "Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para crear el usuario Auth.",
    };
  }

  const parsed = parseBuyerForm(formData);

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisa el comprador.") };
  }

  if (await buyerEmailExists(parsed.data.email)) {
    return { error: "Ya existe un comprador con ese email." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const temporaryPassword = `${randomUUID()}A1!`;
    const { data, error } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: parsed.data.name,
        company_name: parsed.data.companyName,
      },
    });

    if (error || !data.user) {
      return { error: error?.message ?? "No se pudo crear el usuario Auth." };
    }

    await getDb().insert(profiles).values({
      authUserId: data.user.id,
      role: "BUYER",
      name: parsed.data.name,
      companyName: parsed.data.companyName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      cuit: parsed.data.cuit,
      address: parsed.data.address,
      isActive: parsed.data.isActive,
      internalNotes: parsed.data.internalNotes,
    });

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${readServerEnv().siteUrl ?? ""}/login`,
    });

    revalidateBuyerPaths();
    return { ok: true };
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }
}

export async function updateBuyerAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  if (!hasDatabaseUrl()) {
    return { error: "Configura DATABASE_URL para editar compradores." };
  }

  const id = idSchema.safeParse(formData.get("id"));
  const parsed = parseBuyerForm(formData);

  if (!id.success) {
    return { error: "Comprador invalido." };
  }

  if (!parsed.success) {
    return { error: formatValidationError(parsed.error, "Revisa el comprador.") };
  }

  if (await buyerEmailExists(parsed.data.email, id.data)) {
    return { error: "Ya existe otro comprador con ese email." };
  }

  try {
    await getDb()
      .update(profiles)
      .set({
        name: parsed.data.name,
        companyName: parsed.data.companyName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        cuit: parsed.data.cuit,
        address: parsed.data.address,
        isActive: parsed.data.isActive,
        internalNotes: parsed.data.internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id.data));

    revalidateBuyerPaths(id.data);
    return { ok: true };
  } catch (error) {
    return { error: toSafeMutationError(error) };
  }
}

export async function toggleBuyerAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  if (!hasDatabaseUrl()) {
    return;
  }

  const id = idSchema.parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  await getDb()
    .update(profiles)
    .set({ isActive: !isActive, updatedAt: new Date() })
    .where(eq(profiles.id, id));

  revalidateBuyerPaths(id);
}

export async function resetBuyerPasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  if (!hasSupabaseAdminEnv()) {
    return { error: "Configura las credenciales server-side de Supabase." };
  }

  const email = z.email().safeParse(String(formData.get("email") ?? ""));

  if (!email.success) {
    return { error: "Email invalido." };
  }

  const { error } = await createSupabaseAdminClient().auth.resetPasswordForEmail(
    email.data,
    {
      redirectTo: `${readServerEnv().siteUrl ?? ""}/login`,
    },
  );

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}

function parseBuyerForm(formData: FormData) {
  return buyerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    cuit: String(formData.get("cuit") ?? ""),
    address: String(formData.get("address") ?? ""),
    isActive: formData.get("isActive") === "on",
    internalNotes: String(formData.get("internalNotes") ?? ""),
  });
}

function formatValidationError(error: z.ZodError, fallback: string) {
  const firstMessage = error.issues[0]?.message;
  return firstMessage ? `${fallback} ${firstMessage}` : fallback;
}

function revalidateBuyerPaths(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/compradores");
  if (id) {
    revalidatePath(`/admin/compradores/${id}`);
  }
}
