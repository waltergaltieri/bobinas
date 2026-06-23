/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Grid3X3,
  Link2,
  LockKeyhole,
  LogIn,
  type LucideIcon,
  MessageCircle,
  Plus,
  SearchCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { HomeHeroCarousel } from "@/components/site/home-hero-carousel";
import { HomePopup } from "@/components/site/home-popup";
import { buildWhatsappLink, getPublicHomeContent } from "@/lib/data/site-content";

const categories = [
  {
    section: "01",
    name: "Portaescobillas",
    units: "240+",
    href: "/productos?category=portaescobillas",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWBpL4VJFiE4HKZBrwG9PbsFsmQJv_BruhuFIkrJyX7gfY_Ij6HStK19xebTwy55H6BLQxBK64rjmBcRMeUM14dAiBmst-7C4GroChwxMptfkcfqOVZdxxSMaSNMbvQqRQyHKGGOo6JbyTRmw4Ml2x6Nz42BA6IhJJDfMcyQ6AhSj0zcN0gpumVybzqLEpkqebamBeDBvOijxiQwna8B8g5fQ-yy1mp5UnZPkCErhEsQ6cTw2JxQlXBySa25OEPMF9rDxusJrC3HA",
  },
  {
    section: "02",
    name: "Solenoides",
    units: "512+",
    href: "/productos?category=solenoides",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2OTSLey_R1_qjxReFmnv-kQohjF0d_l-ypS6dh-U99-IcBgm9VDR8OYwaS7gXcPevhd-UXX1hV_-j3iAgu80WchKfOP0PbYSxwfSbkuVLrDXGMqCz62lYGfaPPfYg3FRzpiHuLKB5w5rEdRp8ghgjsIIG1F38c1SQ7FUXHLLQisMTTNg_nWLoSef5DpHCSh107nBGVODgqTVQi5_z-UcfQCEZxhYGB-MxVRdQKuK6cLdw6aW33SjJMPZXQ-1EqgS7-3GC7gqGIm8",
  },
  {
    section: "03",
    name: "Impulsores",
    units: "185+",
    href: "/productos?category=impulsores",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFS9MxLd7GFyZg2SdMWcbhmg13Sox9i8gLuO4O1eOIauYu6Vf9soPVuxI8fnWnWv-_robFlXMk5vBGOOBweXcPkPvU27NxUmI23r7FR9Pcz7_7vu6imV_y55RF9konrTSLAJzR4_qbAZcW1W-V9KN_zqrN67NcySY2tlmvbnm6VcAyQdX_og2C2KK0ImXi8eIJcYKRt0FQlgrGQ39djcTD2_7zdqji4U23pLGCVj0JbM_-11142aldK2NvIgbCkUXo5zEHf3j0qZQ",
  },
  {
    section: "04",
    name: "Inducidos",
    units: "320+",
    href: "/productos?category=inducidos",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5O_etnuKNAtJDsNHStn3vHTPrCB6XF0y0i57Wn1JhMbOzSxe-kZQYSOrH6apzahLCrbEpp8jN2Y44tN0OzyYvD91ZeZdZXBXaioSJYS5ReOTfak6n_FLfKa-ojrE0NTr5Wbx1aaYTPdJXRl8RuXjNzTruWzJ-gtyRG1RraXNOusdPbCXUQ-E3j2rPcql1u16tSXzgFwHRuBDVFbJ2qi_oa0RNYn8kmGY3oK_AYWhGW7DJXEBst0p28D57FOVV5dD4RyQdvTWOPRc",
  },
  {
    section: "05",
    name: "Alternadores",
    units: "95+",
    href: "/productos?category=alternadores",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqUn2Mbga1nn6RwmwPglUE7bQO_EepB3EyZkh3tWvVacDF_yvwuzmMaSiqmAfNDdWhIPhSw-6ZzjjEY5Djh-3hqQ7srS3KhWw9ACevIiHpUTK2x_8owf_IF7F4i2EOOuZunYoCMZWsPZ05CeIySZC1mYMrKHvv1I8EBriZxVW8mg2MBA3VB2yOr3YfMsb9FDaZZ0sl_mpMHvXkntd_pzRbNp_7VCJpX9AEeYPpaP3hj97SpynaBVTh_xcdF405-i0duWWNo4BKn8c",
  },
  {
    section: "06",
    name: "Arranques",
    units: "140+",
    href: "/productos?category=arranques",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHY4Stq26S4U1OsmIpILv2_TwbT0OxHBahy-4jeftPXNFYJGtx-yF5SbKJTvtDzUi3N2KVZhS9EaCwAySmB0wDKjWa-EHMXHsZhnEw0k21jmA1KRfndtq8u59aH73jLBLS1x24r-BAje2nAtdWS_FkBQtAK-NXMqVBb1ji89EyrT780iU12tYgGK_yJyxIKSeBZmhybGkn_zN9bxgxskyNeXp10OSjYMrxMu2_m52oTRD6UukXSHxRifxXCrqx8Cu-B0T7PJLGDE8",
  },
];

const showcaseProducts = [
  {
    badge: "OEM GRADE",
    tag: "24V",
    name: "Solenoide Bosch 24V",
    code: "ES-2409-B",
    label: "APP",
    value: "Scania / Volvo",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDh3zshV0-F5rIg0uQhZE1NDkWFTEswzvr1ZH7vx3y30XhrAdRpIrqouOe6htDBAENGMT7TjR2PidWKPR7V_AxdfyM_2_l3UkIVpzdRZl3TJc_GJgSi1_E_JGpdfLMEYCRtIbw8T5bajm6gupoIBQ249S4WMImbTXvebp4GGqFwoySGxghMQaHrXJqz4VzhmhwF7PW8wFeZJ3LXBKgi_OxccdNFqojsCvB_E2pDCySYF9st-SED8RpAgU_kgBEGhWPNJP0WT38ksvQ",
  },
  {
    badge: "HEAVY DUTY",
    name: "Alt Cummins 120A",
    code: "ES-8831-C",
    label: "SPEC",
    value: "12V / 120A",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDN9alfk7mVmBfJ80DAf1fm10QAug3hyXv48D3KH9jy9HQkpFDh9JPDlgnQSSwg5CMSfNeoOH-RKqlk6HfQsN9JpZ9tJTCdO8pclf2WH6IDs5B0tZIe1NT3jQagL6Pn0U01lMrPcyTSIy918DwgUp6AfDjq4GGWGbhPjTNxrvZtNsu30wNV4sZ0zn1wnh4HHglOLkVcWgNsMi1jMX08t6xHUh-YmAkkEQ9BtI_AEQirmKJcE81nnton2PmzcAXJT2URzBI5XQcw3A4",
  },
  {
    badge: "CERTIFIED",
    name: "Inducido Ranger 10D",
    code: "ES-4501-F",
    label: "TYPE",
    value: "10 Splines",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-M8ufFszO0fQN713MsOMJaCL9D-j4tgtT5xkE1MQ00A30D_S3XGgzJQ1R140_oIOjwLlJW-FM9laiucgiPU3zi2YmPqwEQtQTdfgWldhX80-SCksxU2HgaZN-EvNp8nN_aCuC8-OSFjo3MwKmCGg7978Jm7r7INOWliQeiU8pFnFCkTXmx_VEA4GDOGmWb4CzdMO5L4iPHTwXxskVUbeSFBGksOTX3sP9N79siCaMsotZjrSfHsp2aj6w6wFx9Nvv1lVnmyU00gI",
  },
  {
    badge: "FAST-FIT",
    name: "Impulsor Hilux 9z",
    code: "ES-1200-T",
    label: "DIR",
    value: "CW Rotation",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwEo4NesDm2WsIXr5OpllWrlWHawk-berxS4ZIE3qRduTAyr1LTFxwnmMSmJwtWxbHFYDpDiOjL2hI7uq1kgEc3uSFH_IVC0PVPRtVpzBNfm1ob7W0EQq-VarBcqvc0xdZDvo38q7f5eHhVTyjs-nXzBG_S33-VteJdiHWIFhsNj1--jAUpdm-iOGQaU_zAMVtDOxHyeY9x5aVX-Gckimzti4yC2OMu-lCAk5LwLuU0kiZEsbgzU-cZTKs8JPveMI7GDYAe4g5Qyg",
  },
];

const featureItems = [
  {
    icon: Boxes,
    ref: "LOG-01",
    title: "Amplitud de stock",
    text: "Inventario gestionado de referencias para flota pesada y liviana.",
  },
  {
    icon: SearchCheck,
    ref: "DAT-99",
    title: "Busqueda tecnica",
    text: "Cruce de datos por codigo OEM, fabricante y medidas nominales.",
  },
  {
    icon: Wrench,
    ref: "ENG-SUP",
    title: "Asesoria de ingenieria",
    text: "Soporte directo para validar compatibilidad en aplicaciones criticas.",
  },
];

export const categoryOverlayClassName =
  "relative z-10 flex h-full w-full flex-col justify-between bg-white/20 p-6 transition duration-500 group-hover:bg-[#1a1a1b]/90 group-hover:text-white group-hover:backdrop-blur-sm lg:p-8";

export const categoryImageClassName =
  "absolute inset-0 h-full w-full object-contain p-10 opacity-90 mix-blend-multiply contrast-110 transition duration-700 group-hover:scale-110 group-hover:blur-[2px] group-hover:opacity-25 sm:p-12";

export default async function HomePage() {
  const content = await getPublicHomeContent("PUBLIC");
  const whatsappHref = buildWhatsappLink({
    phone: content.settings.whatsapp,
    message: "Hola, necesito soporte tecnico para identificar un repuesto.",
  });

  return (
    <div className="bg-[#f7f3f2] text-[#1a1a1b]">
      <HomeHeroCarousel />

      <section className="relative overflow-hidden border-b-2 border-[#c7c6ca] bg-white text-[#1a1a1b]">
        <div className="blueprint-subgrid absolute inset-0 opacity-5" />
        <div className="relative z-10 mx-auto grid max-w-[1600px] divide-y-2 divide-[#c7c6ca] px-4 sm:px-8 md:grid-cols-3 md:divide-x-2 md:divide-y-0 xl:px-12">
          {featureItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.ref} className="group flex flex-col gap-6 p-8 transition hover:bg-[#f7f3f2] lg:p-12">
                <div className="flex items-start justify-between">
                  <Icon className="h-9 w-9 text-[#b87333] transition group-hover:scale-110" />
                  <span className="font-mono text-[10px] uppercase text-[#76777b]/50">
                    Ref: {item.ref}
                  </span>
                </div>
                <div>
                  <h2 className="mb-3 text-xl font-black uppercase">{item.title}</h2>
                  <p className="text-sm uppercase leading-relaxed text-[#46474a]">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="blueprint-grid relative overflow-hidden bg-[#f7f3f2] py-20 sm:py-24">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="border-l-8 border-[#b87333] pl-6">
              <h2 className="text-3xl font-black uppercase text-[#1a1a1b]">
                Categorias tecnicas
              </h2>
              <p className="mt-3 font-mono text-xs uppercase text-[#b87333]">
                Sistemas electricos de potencia
              </p>
            </div>
            <div className="border border-[#c7c6ca] bg-white px-4 py-1 font-mono text-[11px] uppercase text-[#1a1a1b]/40">
              System integrity check: 100% OK // Updated 2026
            </div>
          </div>

          <div className="grid border-2 border-[#1a1a1b] bg-white shadow-[16px_16px_0_0_rgba(26,26,27,0.05)] md:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.section}
                href={category.href}
                className={[
                  "group relative flex h-80 overflow-hidden bg-white transition hover:z-20 lg:h-[400px]",
                  index % 3 !== 2 ? "md:border-r-2 md:border-[#1a1a1b]" : "",
                  index < 3 ? "border-b-2 border-[#1a1a1b]" : "",
                ].join(" ")}
              >
                <div className={categoryOverlayClassName}>
                  <div>
                    <span className="mb-2 block font-mono text-xs font-black uppercase text-[#b87333]">
                      {"//"} Section {category.section}
                    </span>
                    <h3 className="text-xl font-black uppercase transition group-hover:translate-x-2">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-[10px] uppercase opacity-60">
                      Technical units: {category.units}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#b87333] transition group-hover:translate-x-2" />
                  </div>
                </div>
                <img
                  alt={category.name}
                  className={categoryImageClassName}
                  src={category.image}
                />
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex gap-4">
              <div className="h-2 w-32 bg-[#1a1a1b]" />
              <div className="h-2 w-8 bg-[#b87333]" />
            </div>
            <Link
              href="/productos"
              className="flex items-center gap-3 border-2 border-[#1a1a1b] px-10 py-4 font-mono text-xs font-black uppercase text-[#1a1a1b] transition hover:border-[#b87333] hover:bg-[#b87333] hover:text-white"
            >
              Explorar todas las categorias
              <Grid3X3 className="h-4 w-4" />
            </Link>
            <div className="dimension-line relative hidden h-px w-48 border-t border-[#1a1a1b]/20 md:block">
              <span className="absolute right-4 top-2 font-mono text-[10px] uppercase text-[#1a1a1b]/40">
                Cat. range
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-4 border-[#1a1a1b] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-black uppercase text-[#1a1a1b]">
                Destacados del mes
              </h2>
              <p className="mt-2 font-mono text-xs uppercase text-[#b87333]">
                Technical specifications guaranteed
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden text-right font-mono text-[10px] uppercase leading-tight text-[#76777b] lg:block">
                Current inventory status:
                <br />
                <span className="font-bold text-[#b87333]">
                  Operational - high level
                </span>
              </div>
              <Link
                href="/productos"
                className="border-b-4 border-[#b87333] pb-2 font-mono text-xs font-black uppercase text-[#1a1a1b] hover:text-[#b87333]"
              >
                Ver todo el catalogo
              </Link>
            </div>
          </div>

          <div className="grid border-2 border-[#1a1a1b] md:grid-cols-4 md:divide-x-2 md:divide-[#1a1a1b]">
            {showcaseProducts.map((product, index) => (
              <Link
                key={product.code}
                href={`/productos?q=${encodeURIComponent(product.code)}`}
                className={[
                  "group relative flex flex-col border-b-2 border-[#1a1a1b] md:border-b-0",
                  index % 2 === 0 ? "bg-[#f1edec]" : "bg-white",
                ].join(" ")}
              >
                <div className="relative flex h-64 items-center justify-center overflow-hidden border-b-2 border-[#1a1a1b] bg-white p-8">
                  <img
                    alt={product.name}
                    className="max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110"
                    src={product.image}
                  />
                  <div className="absolute left-2 top-2 flex gap-1">
                    <span className="bg-[#b87333] px-2 py-0.5 text-[9px] font-black uppercase text-white">
                      {product.badge}
                    </span>
                    {product.tag ? (
                      <span className="bg-[#1a1a1b] px-2 py-0.5 text-[9px] font-black uppercase text-white">
                        {product.tag}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="grow p-8">
                  <h3 className="mb-6 text-xl font-black uppercase leading-tight text-[#1a1a1b]">
                    {product.name}
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    <SpecLine label="Code" value={product.code} />
                    <SpecLine label={product.label} value={product.value} />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center bg-[#1a1a1b] text-white transition group-hover:bg-[#b87333]">
                  <Plus className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="blueprint-grid relative overflow-hidden bg-[#1a1a1b] py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="mx-auto flex max-w-5xl flex-col border-4 border-[#b87333] bg-[#1a1a1b] shadow-[20px_20px_0_0_rgba(184,115,51,0.2)] md:flex-row">
            <div className="relative overflow-hidden border-white/10 p-8 md:w-1/2 md:border-r lg:p-16">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-2 border-[#b87333]/10" />
              <div className="relative z-10 mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-[#b87333]">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase leading-tight text-white">
                  Portal de clientes mayoristas
                </h2>
              </div>
              <p className="relative z-10 mb-10 text-base uppercase leading-relaxed text-white/60">
                Acceso exclusivo para distribuidores autorizados. Consulte stock,
                descargue fichas tecnicas OEM y gestione sus solicitudes de
                pedido con seguimiento comercial.
              </p>
              <div className="relative z-10 flex flex-col gap-4">
                <PortalLine icon={LockKeyhole} text="Secure AES-256 connection active" />
                <PortalLine icon={Link2} text="Direct logistics API established" />
              </div>
            </div>
            <div className="relative flex flex-col items-center justify-center bg-[#242426] p-8 md:w-1/2 lg:p-16">
              <Link
                href="/login"
                className="group flex w-full items-center justify-center gap-6 bg-[#b87333] py-6 font-mono text-xl font-black uppercase text-white transition hover:bg-white hover:text-[#1a1a1b]"
              >
                Ingresar
                <LogIn className="h-5 w-5 transition group-hover:translate-x-2" />
              </Link>
              <div className="mt-12 text-center">
                <p className="mb-4 font-mono text-[11px] uppercase text-white/30">
                  ¿Aun no es cliente?
                </p>
                <Link
                  href="/contacto"
                  className="text-sm font-black uppercase text-[#b87333] underline-offset-8 hover:underline"
                >
                  Solicitar alta comercial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blueprint-subgrid relative overflow-hidden bg-[#b87333]">
        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col items-stretch justify-between px-4 sm:px-8 md:flex-row xl:px-12">
          <div className="py-14 md:w-2/3 md:border-r-2 md:border-white/20 md:pr-12">
            <h2 className="text-3xl font-black uppercase text-white">
              Asesoramiento tecnico directo
            </h2>
            <p className="mt-4 text-base font-bold uppercase text-white/90">
              ¿No encuentra la aplicacion correcta? Nuestro equipo lo asiste en
              tiempo real.
            </p>
          </div>
          <div className="flex items-center justify-center py-10 md:w-1/3 md:py-0">
            <Link
              href={whatsappHref ?? "/contacto"}
              className="group flex items-center gap-6 bg-[#1a1a1b] px-10 py-7 text-xl font-black uppercase text-white transition hover:bg-white hover:text-[#b87333]"
            >
              <MessageCircle className="h-8 w-8 transition group-hover:rotate-12" />
              Consultar por WhatsApp
            </Link>
          </div>
        </div>
      </section>

      <HomePopup popup={content.popup} />
    </div>
  );
}

function SpecLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#1a1a1b]/10 pb-1">
      <span className="text-[10px] font-bold uppercase text-[#b87333]">
        {label}:
      </span>
      <span className="font-black text-[#1a1a1b]">{value}</span>
    </div>
  );
}

function PortalLine({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase text-[#b87333]">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}
