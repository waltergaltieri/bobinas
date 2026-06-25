import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { readSupabaseBrowserEnv } from "@/lib/env";
import { hasSupabaseAuthCookie } from "@/lib/supabase/session-cookie";

const SESSION_REFRESH_TIMEOUT_MS = 1500;

export async function updateSession(request: NextRequest) {
  const env = readSupabaseBrowserEnv();

  if (!env.url || !env.key || !hasSupabaseAuthCookie(request.cookies.getAll())) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.url,
    env.key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await settleWithin(supabase.auth.getClaims(), SESSION_REFRESH_TIMEOUT_MS);

  return response;
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
