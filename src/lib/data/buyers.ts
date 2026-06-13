import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import { profiles } from "@/db/schema";
import { getAdminPurchaseRequests } from "@/lib/data/purchase-requests";
import { sampleBuyerProfile } from "@/lib/data/sample-data";
import { normalizeBuyerEmail } from "@/lib/validations/buyers";

export type BuyerSummary = {
  id: string;
  authUserId: string;
  name: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  cuit: string | null;
  address: string | null;
  isActive: boolean;
  internalNotes: string | null;
};

export type BuyerDetail = BuyerSummary & {
  requests: Awaited<ReturnType<typeof getAdminPurchaseRequests>>;
};

export async function getBuyers({
  search,
  includeInactive = true,
}: {
  search?: string;
  includeInactive?: boolean;
} = {}): Promise<BuyerSummary[]> {
  if (!hasDatabaseUrl()) {
    return filterSampleBuyers(search);
  }

  const normalizedSearch = search?.trim();
  const filters: SQL[] = [];

  if (!includeInactive) {
    filters.push(eq(profiles.isActive, true));
  }

  if (normalizedSearch) {
    const value = `%${normalizedSearch}%`;
    const textFilter = or(
      ilike(profiles.name, value),
      ilike(profiles.companyName, value),
      ilike(profiles.email, value),
      ilike(profiles.phone, value),
    );

    if (textFilter) {
      filters.push(textFilter);
    }
  }

  const query = getDb()
    .select({
      id: profiles.id,
      authUserId: profiles.authUserId,
      name: profiles.name,
      companyName: profiles.companyName,
      email: profiles.email,
      phone: profiles.phone,
      cuit: profiles.cuit,
      address: profiles.address,
      isActive: profiles.isActive,
      internalNotes: profiles.internalNotes,
    })
    .from(profiles)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(profiles.name));

  return query;
}

export async function getBuyerById(id: string): Promise<BuyerDetail | null> {
  if (!hasDatabaseUrl()) {
    const buyer = filterSampleBuyers().find((item) => item.id === id);

    if (!buyer) {
      return null;
    }

    return {
      ...buyer,
      requests: await getAdminPurchaseRequests({ buyerId: buyer.id }),
    };
  }

  const [buyer] = await getDb()
    .select({
      id: profiles.id,
      authUserId: profiles.authUserId,
      name: profiles.name,
      companyName: profiles.companyName,
      email: profiles.email,
      phone: profiles.phone,
      cuit: profiles.cuit,
      address: profiles.address,
      isActive: profiles.isActive,
      internalNotes: profiles.internalNotes,
    })
    .from(profiles)
    .where(eq(profiles.id, id));

  if (!buyer) {
    return null;
  }

  return {
    ...buyer,
    requests: await getAdminPurchaseRequests({ buyerId: buyer.id }),
  };
}

export async function buyerEmailExists(email: string, currentId?: string) {
  if (!hasDatabaseUrl()) {
    const normalized = normalizeBuyerEmail(email);
    return filterSampleBuyers().some(
      (buyer) => buyer.id !== currentId && normalizeBuyerEmail(buyer.email) === normalized,
    );
  }

  const [existing] = await getDb()
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, normalizeBuyerEmail(email)))
    .limit(1);

  return Boolean(existing && existing.id !== currentId);
}

function filterSampleBuyers(search?: string) {
  const buyer: BuyerSummary = {
    id: sampleBuyerProfile.id,
    authUserId: sampleBuyerProfile.authUserId,
    name: sampleBuyerProfile.name,
    companyName: sampleBuyerProfile.companyName,
    email: sampleBuyerProfile.email,
    phone: sampleBuyerProfile.phone,
    cuit: null,
    address: null,
    isActive: true,
    internalNotes: "Comprador demo para trabajar sin DATABASE_URL.",
  };
  const normalized = search?.trim().toLowerCase();

  if (!normalized) {
    return [buyer];
  }

  return [buyer].filter((item) =>
    [item.name, item.companyName, item.email, item.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}
