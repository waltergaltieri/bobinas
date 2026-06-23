import { describe, expect, it } from "vitest";

import { getPublicNavbarActions } from "./public-navbar";

describe("public navbar actions", () => {
  it("shows pedido access only for logged-in buyers", () => {
    expect(getPublicNavbarActions(null)).toEqual({
      showAccess: true,
      showAdminPanel: false,
      showPedido: false,
    });

    expect(getPublicNavbarActions({ role: "BUYER" })).toEqual({
      showAccess: false,
      showAdminPanel: false,
      showPedido: true,
    });

    expect(getPublicNavbarActions({ role: "ADMIN" })).toEqual({
      showAccess: false,
      showAdminPanel: true,
      showPedido: false,
    });
  });
});
