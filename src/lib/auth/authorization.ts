import type { ProfileRole } from "@/db/schema";

type MaybeRole = ProfileRole | null;

const buyerRoutes = ["/mi-pedido", "/mis-pedidos"];

export function canAccessRoute(role: MaybeRole, pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return role === "ADMIN";
  }

  if (buyerRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return role === "BUYER";
  }

  return true;
}

export function getDeniedRedirect(role: MaybeRole, allowedRoles: ProfileRole[]) {
  if (!role) {
    return "/login";
  }

  if (!allowedRoles.includes(role)) {
    return "/";
  }

  return null;
}
