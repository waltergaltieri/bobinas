import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import { profiles, type ProfileRole } from "@/db/schema";
import { getDeniedRedirect } from "@/lib/auth/authorization";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { hasSupabaseAuthCookie } from "@/lib/supabase/session-cookie";
import { cookies } from "next/headers";

const AUTH_LOOKUP_TIMEOUT_MS = 1500;

export type CurrentProfile = {
  id: string;
  authUserId: string;
  role: ProfileRole;
  name: string;
  email: string;
  companyName: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!hasSupabaseEnv() || !hasDatabaseUrl()) {
    return null;
  }

  const cookieStore = await cookies();
  if (!hasSupabaseAuthCookie(cookieStore.getAll())) {
    return null;
  }

  try {
    const supabase = await createClient();
    const claimsResult = await settleWithin(
      supabase.auth.getClaims(),
      AUTH_LOOKUP_TIMEOUT_MS,
    );

    if (!claimsResult || claimsResult.error || !claimsResult.data?.claims?.sub) {
      return null;
    }

    const profileRows = await settleWithin(
      getDb()
        .select({
          id: profiles.id,
          authUserId: profiles.authUserId,
          role: profiles.role,
          name: profiles.name,
          email: profiles.email,
          companyName: profiles.companyName,
        })
        .from(profiles)
        .where(eq(profiles.authUserId, claimsResult.data.claims.sub)),
      AUTH_LOOKUP_TIMEOUT_MS,
    );

    const [profile] = profileRows ?? [];
    return profile ?? null;
  } catch {
    return null;
  }
}

export async function requireRole(roles: ProfileRole[]) {
  const profile = await getCurrentProfile();
  const deniedRedirect = getDeniedRedirect(profile?.role ?? null, roles);

  if (deniedRedirect) {
    redirect(deniedRedirect);
  }

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

async function settleWithin<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const guardedPromise = promise.catch(() => null);
  const timeoutPromise = new Promise<null>((resolve) => {
    timeout = setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    return await Promise.race([guardedPromise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
