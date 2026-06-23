import { describe, expect, it } from "vitest";

import { getLoginRedirect } from "./login-redirect";

describe("login redirect", () => {
  it("sends each role to the expected authenticated area", () => {
    expect(getLoginRedirect(null)).toBe("/productos");
    expect(getLoginRedirect({ role: "BUYER" })).toBe("/mi-pedido");
    expect(getLoginRedirect({ role: "ADMIN" })).toBe("/admin");
  });
});
