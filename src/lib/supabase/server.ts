import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { hasSupabaseBrowserEnv, readSupabaseBrowserEnv } from "@/lib/env";

export function hasSupabaseEnv() {
  return hasSupabaseBrowserEnv();
}

export async function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase environment variables are required.");
  }

  const cookieStore = await cookies();

  const env = readSupabaseBrowserEnv();

  return createServerClient(env.url!, env.key!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. The proxy refreshes them.
          }
        },
      },
    });
}
