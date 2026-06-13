import { createClient } from "@supabase/supabase-js";

import { readServerEnv } from "@/lib/env";

export function hasSupabaseAdminEnv() {
  const env = readServerEnv();
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function createSupabaseAdminClient() {
  const env = readServerEnv();

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Supabase admin environment variables are required.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
