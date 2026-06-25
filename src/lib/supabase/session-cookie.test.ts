import { describe, expect, it } from "vitest";

import { hasSupabaseAuthCookie } from "./session-cookie";

describe("hasSupabaseAuthCookie", () => {
  it("detects Supabase auth cookies", () => {
    expect(
      hasSupabaseAuthCookie([
        { name: "sb-project-ref-auth-token" },
        { name: "theme" },
      ]),
    ).toBe(true);
  });

  it("detects chunked Supabase auth cookies", () => {
    expect(hasSupabaseAuthCookie([{ name: "sb-project-ref-auth-token.0" }])).toBe(
      true,
    );
  });

  it("ignores unrelated Supabase cookies", () => {
    expect(
      hasSupabaseAuthCookie([
        { name: "sb-project-ref-code-verifier" },
        { name: "theme" },
      ]),
    ).toBe(false);
  });
});

