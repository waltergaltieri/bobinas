import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import { profiles, type ProfileRole } from "@/db/schema";
import { getDeniedRedirect } from "@/lib/auth/authorization";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const [profile] = await getDb()
    .select({
      id: profiles.id,
      authUserId: profiles.authUserId,
      role: profiles.role,
      name: profiles.name,
      email: profiles.email,
      companyName: profiles.companyName,
    })
    .from(profiles)
    .where(eq(profiles.authUserId, data.claims.sub));

  if (!profile) {
    return null;
  }

  return profile;
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
