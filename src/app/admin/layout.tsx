import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <div>
            <p className="text-sm text-muted-foreground">Panel administrativo</p>
            <p className="font-medium">{profile.name}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
