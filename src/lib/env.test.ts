import { describe, expect, it } from "vitest";

import { readServerEnv, readSupabaseBrowserEnv } from "./env";

describe("environment helpers", () => {
  it("accepts the requested Supabase anon/service env names", () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    };

    expect(readSupabaseBrowserEnv(env)).toEqual({
      url: "https://example.supabase.co",
      key: "anon-key",
    });
    expect(readServerEnv(env).supabaseServiceRoleKey).toBe("service-role-key");
  });

  it("keeps compatibility with new Supabase publishable/secret keys", () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      SUPABASE_SECRET_KEY: "secret-key",
    };

    expect(readSupabaseBrowserEnv(env).key).toBe("publishable-key");
    expect(readServerEnv(env).supabaseServiceRoleKey).toBe("secret-key");
  });
});
