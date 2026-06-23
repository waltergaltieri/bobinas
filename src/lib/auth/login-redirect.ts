import type { ProfileRole } from "@/db/schema";

type LoginProfile = {
  role: ProfileRole;
} | null;

export function getLoginRedirect(profile: LoginProfile) {
  if (profile?.role === "ADMIN") {
    return "/admin";
  }

  if (profile?.role === "BUYER") {
    return "/mi-pedido";
  }

  return "/productos";
}
