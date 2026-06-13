"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, hasDatabaseUrl } from "@/db";
import { homeSlides, popupSettings, siteSettings } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";

export type SiteContentActionState = {
  ok?: boolean;
  error?: string;
};

const emptyToNull = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text.length === 0 ? null : text;
};

const slideSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.preprocess(emptyToNull, z.string().url().nullable()),
  imagePublicId: z.preprocess(emptyToNull, z.string().nullable()),
  title: z.string().trim().min(2, "Ingresá un título."),
  subtitle: z.preprocess(emptyToNull, z.string().nullable()),
  buttonText: z.preprocess(emptyToNull, z.string().nullable()),
  buttonLink: z.preprocess(emptyToNull, z.string().nullable()),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

const popupSchema = z.object({
  id: z.preprocess(emptyToUndefined, z.string().optional()),
  isActive: z.boolean(),
  imageUrl: z.preprocess(emptyToNull, z.string().url().nullable()),
  imagePublicId: z.preprocess(emptyToNull, z.string().nullable()),
  title: z.preprocess(emptyToNull, z.string().nullable()),
  text: z.preprocess(emptyToNull, z.string().nullable()),
  buttonText: z.preprocess(emptyToNull, z.string().nullable()),
  buttonLink: z.preprocess(emptyToNull, z.string().nullable()),
  showOnce: z.boolean(),
  startsAt: z.preprocess(parseDateOrNull, z.date().nullable()),
  endsAt: z.preprocess(parseDateOrNull, z.date().nullable()),
});

const settingsSchema = z.object({
  id: z.preprocess(emptyToUndefined, z.string().optional()),
  businessName: z.string().trim().min(2, "Ingresá el nombre del negocio."),
  logoUrl: z.preprocess(emptyToNull, z.string().url().nullable()),
  logoPublicId: z.preprocess(emptyToNull, z.string().nullable()),
  whatsapp: z.preprocess(emptyToNull, z.string().nullable()),
  email: z.preprocess(emptyToNull, z.string().email().nullable()),
  phone: z.preprocess(emptyToNull, z.string().nullable()),
  address: z.preprocess(emptyToNull, z.string().nullable()),
  businessHours: z.preprocess(emptyToNull, z.string().nullable()),
  instagramUrl: z.preprocess(emptyToNull, z.string().url().nullable()),
  facebookUrl: z.preprocess(emptyToNull, z.string().url().nullable()),
  institutionalText: z.preprocess(emptyToNull, z.string().nullable()),
  footerText: z.preprocess(emptyToNull, z.string().nullable()),
  seoTitle: z.preprocess(emptyToNull, z.string().nullable()),
  seoDescription: z.preprocess(emptyToNull, z.string().nullable()),
  isActive: z.boolean(),
});

export async function createHomeSlideAction(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireRole(["ADMIN"]);
  const parsed = slideSchema.safeParse(readSlideForm(formData));

  if (!parsed.success) {
    return { error: formatError(parsed.error, "Revisá los datos del slide.") };
  }

  if (hasDatabaseUrl()) {
    await getDb().insert(homeSlides).values({
      imageUrl: parsed.data.imageUrl ?? "",
      imagePublicId: parsed.data.imagePublicId ?? "",
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      buttonText: parsed.data.buttonText,
      buttonLink: parsed.data.buttonLink,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });
  }

  revalidateContentPaths();
  return { ok: true };
}

export async function updateHomeSlideAction(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireRole(["ADMIN"]);
  const parsed = slideSchema.extend({ id: z.string().min(1) }).safeParse(
    readSlideForm(formData),
  );

  if (!parsed.success) {
    return { error: formatError(parsed.error, "Revisá los datos del slide.") };
  }

  if (hasDatabaseUrl()) {
    await getDb()
      .update(homeSlides)
      .set({
        imageUrl: parsed.data.imageUrl ?? "",
        imagePublicId: parsed.data.imagePublicId ?? "",
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        buttonText: parsed.data.buttonText,
        buttonLink: parsed.data.buttonLink,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(homeSlides.id, parsed.data.id));
  }

  revalidateContentPaths();
  return { ok: true };
}

export async function deleteHomeSlideAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = String(formData.get("id") ?? "");

  if (hasDatabaseUrl() && id) {
    await getDb().delete(homeSlides).where(eq(homeSlides.id, id));
  }

  revalidateContentPaths();
}

export async function upsertPopupSettingsAction(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireRole(["ADMIN"]);
  const parsed = popupSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    isActive: formData.get("isActive") === "on",
    imageUrl: formData.get("imageUrl"),
    imagePublicId: formData.get("imagePublicId"),
    title: formData.get("title"),
    text: formData.get("text"),
    buttonText: formData.get("buttonText"),
    buttonLink: formData.get("buttonLink"),
    showOnce: formData.get("showOnce") === "on",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return { error: formatError(parsed.error, "Revisá los datos del popup.") };
  }

  if (hasDatabaseUrl()) {
    const values = omitId(parsed.data);
    if (parsed.data.id) {
      await getDb()
        .update(popupSettings)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(popupSettings.id, parsed.data.id));
    } else {
      await getDb().insert(popupSettings).values(values);
    }
  }

  revalidateContentPaths();
  return { ok: true };
}

export async function upsertSiteSettingsAction(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireRole(["ADMIN"]);
  const parsed = settingsSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    businessName: formData.get("businessName"),
    logoUrl: formData.get("logoUrl"),
    logoPublicId: formData.get("logoPublicId"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    businessHours: formData.get("businessHours"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
    institutionalText: formData.get("institutionalText"),
    footerText: formData.get("footerText"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      error: formatError(parsed.error, "Revisá la configuración del sitio."),
    };
  }

  if (hasDatabaseUrl()) {
    const values = omitId(parsed.data);
    if (parsed.data.id) {
      await getDb()
        .update(siteSettings)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(siteSettings.id, parsed.data.id));
    } else {
      await getDb().insert(siteSettings).values(values);
    }
  }

  revalidateContentPaths();
  return { ok: true };
}

function readSlideForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? ""),
    imageUrl: formData.get("imageUrl"),
    imagePublicId: formData.get("imagePublicId"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    buttonText: formData.get("buttonText"),
    buttonLink: formData.get("buttonLink"),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: formData.get("isActive") === "on",
  };
}

function parseDateOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? new Date(text) : null;
}

function emptyToUndefined(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length === 0 ? undefined : text;
}

function omitId<T extends { id?: string }>(value: T) {
  const { id: _id, ...rest } = value;
  void _id;
  return rest;
}

function formatError(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message
    ? `${fallback} ${error.issues[0].message}`
    : fallback;
}

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/admin/home");
  revalidatePath("/admin/popup");
  revalidatePath("/admin/configuracion");
}
