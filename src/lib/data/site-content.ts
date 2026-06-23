import { asc, desc, eq } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import {
  homeSlides,
  popupSettings,
  siteSettings,
  type ProfileRole,
} from "@/db/schema";
import { getCatalogProducts, getCategories } from "./catalog";
import {
  sampleHomeSlides,
  samplePopupSettings,
  sampleSiteSettings,
} from "./sample-data";

type ViewerRole = ProfileRole | "PUBLIC";

export type SiteSettingsView = {
  id: string;
  businessName: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  businessHours: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  institutionalText: string | null;
  footerText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
};

export type HomeSlideView = {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type PopupSettingsView = {
  id: string;
  isActive: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  title: string | null;
  text: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  showOnce: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export async function getPublicHomeContent(role: ViewerRole = "PUBLIC") {
  const [settings, slides, popup, categories, productResult] = await Promise.all([
    getSiteSettings(),
    getHomeSlides({ activeOnly: true }),
    getPublicPopupSettings(),
    getCategories(),
    getCatalogProducts({ role, sort: "featured", pageSize: 6 }),
  ]);

  return {
    settings,
    slides,
    popup,
    featuredCategories: categories
      .filter((category) => "isFeatured" in category ? Boolean(category.isFeatured) : true)
      .slice(0, 4),
    featuredProducts: productResult.products.slice(0, 6),
  };
}

export async function getSiteSettings(): Promise<SiteSettingsView> {
  if (!hasDatabaseUrl()) {
    return sampleSiteSettings;
  }

  try {
    const [settings] = await getDb()
      .select({
        id: siteSettings.id,
        businessName: siteSettings.businessName,
        logoUrl: siteSettings.logoUrl,
        logoPublicId: siteSettings.logoPublicId,
        whatsapp: siteSettings.whatsapp,
        email: siteSettings.email,
        phone: siteSettings.phone,
        address: siteSettings.address,
        businessHours: siteSettings.businessHours,
        instagramUrl: siteSettings.instagramUrl,
        facebookUrl: siteSettings.facebookUrl,
        institutionalText: siteSettings.institutionalText,
        footerText: siteSettings.footerText,
        seoTitle: siteSettings.seoTitle,
        seoDescription: siteSettings.seoDescription,
        isActive: siteSettings.isActive,
      })
      .from(siteSettings)
      .where(eq(siteSettings.isActive, true))
      .orderBy(desc(siteSettings.updatedAt))
      .limit(1);

    return settings ?? sampleSiteSettings;
  } catch {
    return sampleSiteSettings;
  }
}

export async function getHomeSlides({
  activeOnly,
}: {
  activeOnly: boolean;
}): Promise<HomeSlideView[]> {
  if (!hasDatabaseUrl()) {
    return sampleHomeSlides
      .filter((slide) => !activeOnly || slide.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const rows = await getDb()
      .select({
        id: homeSlides.id,
        imageUrl: homeSlides.imageUrl,
        imagePublicId: homeSlides.imagePublicId,
        title: homeSlides.title,
        subtitle: homeSlides.subtitle,
        buttonText: homeSlides.buttonText,
        buttonLink: homeSlides.buttonLink,
        sortOrder: homeSlides.sortOrder,
        isActive: homeSlides.isActive,
      })
      .from(homeSlides)
      .orderBy(asc(homeSlides.sortOrder), asc(homeSlides.title));

    return rows.filter((slide) => !activeOnly || slide.isActive);
  } catch {
    return sampleHomeSlides
      .filter((slide) => !activeOnly || slide.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function getPublicPopupSettings(now = new Date()) {
  const popup = await getAdminPopupSettings();
  return shouldDisplayPopup(popup, now) ? popup : null;
}

export async function getAdminPopupSettings(): Promise<PopupSettingsView> {
  if (!hasDatabaseUrl()) {
    return samplePopupSettings;
  }

  try {
    const [popup] = await getDb()
      .select({
        id: popupSettings.id,
        isActive: popupSettings.isActive,
        imageUrl: popupSettings.imageUrl,
        imagePublicId: popupSettings.imagePublicId,
        title: popupSettings.title,
        text: popupSettings.text,
        buttonText: popupSettings.buttonText,
        buttonLink: popupSettings.buttonLink,
        showOnce: popupSettings.showOnce,
        startsAt: popupSettings.startsAt,
        endsAt: popupSettings.endsAt,
      })
      .from(popupSettings)
      .orderBy(desc(popupSettings.updatedAt))
      .limit(1);

    return popup ?? samplePopupSettings;
  } catch {
    return samplePopupSettings;
  }
}

export function shouldDisplayPopup(
  popup: Pick<PopupSettingsView, "isActive" | "startsAt" | "endsAt">,
  now = new Date(),
) {
  if (!popup.isActive) {
    return false;
  }

  if (popup.startsAt && popup.startsAt > now) {
    return false;
  }

  if (popup.endsAt && popup.endsAt < now) {
    return false;
  }

  return true;
}

export function buildWhatsappLink({
  phone,
  message,
}: {
  phone: string | null | undefined;
  message: string;
}) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${digits}?${params.toString()}`;
}
