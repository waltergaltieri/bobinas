import { createBrowserClient } from "@supabase/ssr";

import { readSupabaseBrowserEnv } from "@/lib/env";

export function createClient() {
  const env = readSupabaseBrowserEnv();
  return createBrowserClient(env.url!, env.key!);
}
