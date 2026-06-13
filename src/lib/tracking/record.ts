import { and, eq, gt } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import { productViews, requestEvents, searchLogs } from "@/db/schema";
import type { CurrentProfile } from "@/lib/auth/session";

export async function recordProductView({
  productId,
  profile,
  sessionId,
  sourcePath,
}: {
  productId: string;
  profile: CurrentProfile | null;
  sessionId: string;
  sourcePath?: string;
}) {
  if (!hasDatabaseUrl()) {
    return;
  }

  try {
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const duplicate = await getDb()
      .select({ id: productViews.id })
      .from(productViews)
      .where(
        and(
          eq(productViews.productId, productId),
          profile
            ? eq(productViews.userId, profile.id)
            : eq(productViews.sessionId, sessionId),
          gt(productViews.createdAt, since),
        ),
      )
      .limit(1);

    if (duplicate.length > 0) {
      return;
    }

    await getDb().insert(productViews).values({
      productId,
      userId: profile?.id,
      sessionId: profile ? undefined : sessionId,
      userRole: profile?.role ?? "PUBLIC",
      sourcePath,
    });
  } catch {
    return;
  }
}

export async function recordSearch({
  query,
  filters,
  resultsCount,
  profile,
  sessionId,
  sourcePath,
}: {
  query: string;
  filters?: Record<string, string | undefined>;
  resultsCount: number;
  profile: CurrentProfile | null;
  sessionId: string;
  sourcePath?: string;
}) {
  if (!hasDatabaseUrl()) {
    return;
  }

  const normalizedQuery = query.trim();
  const hasFilters = Object.values(filters ?? {}).some(Boolean);
  if (!normalizedQuery && !hasFilters) {
    return;
  }

  try {
    await getDb().insert(searchLogs).values({
      query: normalizedQuery || "(filtros)",
      userId: profile?.id,
      sessionId: profile ? undefined : sessionId,
      filtersJson: filters ? JSON.stringify(filters) : undefined,
      sourcePath,
      resultsCount,
    });
  } catch {
    return;
  }
}

export async function recordRequestEvent({
  eventType,
  buyerId,
  productId,
  purchaseRequestId,
  quantity,
  sessionId,
  sourcePath,
}: {
  eventType: "ADD_ITEM" | "UPDATE_QUANTITY" | "REMOVE_ITEM" | "SUBMIT_REQUEST";
  buyerId?: string;
  productId?: string;
  purchaseRequestId?: string;
  quantity?: number;
  sessionId?: string;
  sourcePath?: string;
}) {
  if (!hasDatabaseUrl()) {
    return;
  }

  try {
    await getDb().insert(requestEvents).values({
      eventType,
      buyerId,
      productId,
      purchaseRequestId,
      quantity,
      sessionId,
      sourcePath,
    });
  } catch {
    return;
  }
}
