import type { ReactNode } from "react";

import { PublicNavbar } from "@/components/layout/public-navbar";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  await requireRole(["BUYER"]);

  return (
    <>
      <PublicNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
