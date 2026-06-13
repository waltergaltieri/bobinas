import { describe, expect, it } from "vitest";

import { canAccessRoute, getDeniedRedirect } from "./authorization";

describe("route authorization", () => {
  it("requires ADMIN for admin routes", () => {
    expect(canAccessRoute(null, "/admin")).toBe(false);
    expect(canAccessRoute("BUYER", "/admin/productos")).toBe(false);
    expect(canAccessRoute("BUYER", "/admin/pedidos")).toBe(false);
    expect(canAccessRoute("BUYER", "/admin/home")).toBe(false);
    expect(canAccessRoute("BUYER", "/admin/popup")).toBe(false);
    expect(canAccessRoute("BUYER", "/admin/configuracion")).toBe(false);
    expect(canAccessRoute(null, "/admin/popup")).toBe(false);
    expect(canAccessRoute(null, "/admin/pedidos/123")).toBe(false);
    expect(canAccessRoute("ADMIN", "/admin/home")).toBe(true);
    expect(canAccessRoute("ADMIN", "/admin/pedidos/123")).toBe(true);
    expect(canAccessRoute("ADMIN", "/admin/productos")).toBe(true);
  });

  it("requires a logged-in buyer or admin for buyer routes", () => {
    expect(canAccessRoute(null, "/mi-pedido")).toBe(false);
    expect(canAccessRoute("BUYER", "/mi-pedido")).toBe(true);
    expect(canAccessRoute("BUYER", "/mis-pedidos/123")).toBe(true);
    expect(canAccessRoute("ADMIN", "/mis-pedidos")).toBe(false);
  });

  it("redirects anonymous users to login and buyers away from admin", () => {
    expect(getDeniedRedirect(null, ["ADMIN"])).toBe("/login");
    expect(getDeniedRedirect("BUYER", ["ADMIN"])).toBe("/");
  });
});
