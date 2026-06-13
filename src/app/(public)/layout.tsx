import type { ReactNode } from "react";
import Link from "next/link";

import { PublicNavbar } from "@/components/layout/public-navbar";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { getSiteSettings } from "@/lib/data/site-content";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
          <div className="space-y-3">
            <p className="font-medium text-foreground">{settings.businessName}</p>
            <p>{settings.footerText ?? settings.institutionalText}</p>
            {settings.businessHours ? <p>{settings.businessHours}</p> : null}
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Catalogo</p>
            <Link className="block hover:text-foreground" href="/productos">
              Productos
            </Link>
            <Link className="block hover:text-foreground" href="/contacto">
              Contacto
            </Link>
            <Link className="block hover:text-foreground" href="/login">
              Acceso compradores
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Contacto</p>
            {settings.whatsapp ? <p>WhatsApp: {settings.whatsapp}</p> : null}
            {settings.email ? <p>Email: {settings.email}</p> : null}
            {settings.address ? <p>{settings.address}</p> : null}
            <WhatsappButton phone={settings.whatsapp} />
          </div>
        </div>
      </footer>
      <WhatsappButton phone={settings.whatsapp} floating />
    </>
  );
}
