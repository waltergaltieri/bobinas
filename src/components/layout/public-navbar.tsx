import Link from "next/link";
import { ClipboardList, LogIn, Search } from "lucide-react";

import { publicNavItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getRequestListCount } from "@/lib/data/purchase-requests";
import { getSiteSettings } from "@/lib/data/site-content";

export async function PublicNavbar() {
  const [profile, settings] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
  ]);
  const requestCount =
    profile?.role === "BUYER" ? await getRequestListCount(profile) : 0;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.businessName}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              settings.businessName.slice(0, 1)
            )}
          </span>
          <span>{settings.businessName}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {publicNavItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Buscar productos">
            <Link href="/productos">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
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
          <Button asChild size="sm">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Acceso
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
