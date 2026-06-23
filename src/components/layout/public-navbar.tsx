import Link from "next/link";
import { ClipboardList, LayoutDashboard, LogIn, Search } from "lucide-react";

import { publicNavItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, type CurrentProfile } from "@/lib/auth/session";
import { getRequestListCount } from "@/lib/data/purchase-requests";
import { getSiteSettings } from "@/lib/data/site-content";

type NavbarProfile = Pick<CurrentProfile, "role"> | null;

export function getPublicNavbarActions(profile: NavbarProfile) {
  return {
    showAccess: !profile,
    showAdminPanel: profile?.role === "ADMIN",
    showPedido: profile?.role === "BUYER",
  };
}

export async function PublicNavbar() {
  const [profile, settings] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
  ]);
  const actions = getPublicNavbarActions(profile);
  const requestCount =
    actions.showPedido && profile ? await getRequestListCount(profile) : 0;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#c7c6ca] bg-[#fdf8f8]">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-8 xl:px-12">
        <Link href="/" className="flex items-center gap-3 font-mono text-lg font-black uppercase text-[#1a1a1b]">
          <span className="flex h-9 w-9 items-center justify-center border-2 border-[#1a1a1b] bg-[#1a1a1b] text-sm text-white">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.businessName}
                className="h-full w-full object-cover"
              />
            ) : (
              settings.businessName.slice(0, 1)
            )}
          </span>
          <span>
            {settings.businessName}
            <span className="text-[#b87333]">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent pb-1 font-mono text-xs font-black uppercase text-[#46474a] transition hover:border-[#b87333] hover:text-[#1a1a1b]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <form action="/productos" className="hidden items-center border border-[#c7c6ca] bg-[#f1edec] px-3 py-1 lg:flex">
            <Search className="mr-2 h-3.5 w-3.5 text-[#76777b]" />
            <input
              name="q"
              className="w-40 border-0 bg-transparent p-0 font-mono text-xs uppercase outline-none placeholder:text-[#76777b] focus:ring-0"
              placeholder="Buscar codigo..."
            />
          </form>
          {actions.showPedido ? (
            <Button asChild variant="outline" size="sm" className="hidden border-[#1a1a1b] font-mono text-xs uppercase sm:inline-flex">
              <Link href="/mi-pedido">
                <ClipboardList className="h-4 w-4" />
                Mi pedido
                {requestCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[11px] leading-none text-primary-foreground">
                    {requestCount}
                  </span>
                ) : null}
              </Link>
            </Button>
          ) : null}
          {actions.showAdminPanel ? (
            <Button asChild size="sm" className="rounded-none border-b-2 border-[#b87333] bg-[#1a1a1b] font-mono text-xs font-black uppercase text-white hover:bg-[#b87333]">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Panel
              </Link>
            </Button>
          ) : null}
          {actions.showAccess ? (
            <Button asChild size="sm" className="rounded-none border-b-2 border-[#b87333] bg-[#1a1a1b] font-mono text-xs font-black uppercase text-white hover:bg-[#b87333]">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Acceso
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
