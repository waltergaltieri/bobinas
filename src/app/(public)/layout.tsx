import type { ReactNode } from "react";
import Link from "next/link";
import { Cpu, MapPin, Phone, Terminal } from "lucide-react";

import { PublicNavbar } from "@/components/layout/public-navbar";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { getSiteSettings } from "@/lib/data/site-content";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#76777b] bg-[#1a1a1b] px-4 py-12 text-white sm:px-8 xl:px-12">
        <div className="mx-auto grid max-w-[1600px] gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <p className="font-mono text-xl font-black uppercase">
              {settings.businessName}
              <span className="text-[#b87333]">.</span>
            </p>
            <p className="max-w-xs text-xs uppercase leading-relaxed text-white/60">
              {settings.footerText ??
                settings.institutionalText ??
                "Especialistas en componentes electricos automotores industriales. Precision tecnica bajo normativas internacionales."}
            </p>
            <p className="border-t border-white/10 pt-4 font-mono text-[10px] font-bold uppercase text-[#b87333]">
              SYS_VER: 2.0.44-STABLE
            </p>
          </div>
          <div className="space-y-2">
            <p className="mb-6 font-mono text-xs font-black uppercase text-[#b87333]">Navegacion</p>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/">
              {"// Inicio"}
            </Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/productos">
              {"// Productos"}
            </Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/contacto">
              {"// Contacto"}
            </Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/login">
              {"// Acceso"}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="mb-6 font-mono text-xs font-black uppercase text-[#b87333]">Soporte</p>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/productos">Fichas OEM</Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/productos">Catalogo tecnico</Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/mi-pedido">Lista de pedido</Link>
            <Link className="block font-mono text-xs uppercase text-white/70 hover:text-white" href="/contacto">Soporte directo</Link>
          </div>
          <div className="space-y-5">
            <p className="mb-6 font-mono text-xs font-black uppercase text-[#b87333]">Contacto</p>
            <p className="flex items-start gap-3 font-mono text-xs font-bold uppercase text-white/80">
              <MapPin className="h-4 w-4 shrink-0 text-[#b87333]" />
              {settings.address ?? "Sector industrial norte, Buenos Aires, AR"}
            </p>
            <p className="flex items-center gap-3 font-mono text-xs font-bold uppercase text-white/80">
              <Phone className="h-4 w-4 text-[#b87333]" />
              {settings.whatsapp ?? settings.phone ?? "+54 11 4455-6677"}
            </p>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-[1600px] flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="font-mono text-[10px] uppercase text-white/30">
            © 2026 {settings.businessName} Industrial. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-white/25">
            <Terminal className="h-4 w-4 hover:text-[#b87333]" />
            <Cpu className="h-4 w-4 hover:text-[#b87333]" />
          </div>
        </div>
      </footer>
      <WhatsappButton phone={settings.whatsapp} floating />
    </>
  );
}
