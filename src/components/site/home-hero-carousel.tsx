/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type HeroSlide = {
  eyebrow: string;
  kicker: string;
  title: string;
  accent: string;
  body: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  image: string;
  imageAlt: string;
  specLabel: string;
  sideLabel: string;
};

export const HOME_HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Engineering standard v2.0",
    kicker: "Precision mecanica en cada componente",
    title: "Catalogo tecnico de repuestos automotores",
    accent: "repuestos",
    body: "Suministro especializado de motores de arranque, inducidos y componentes electricos de alta performance. Busqueda por parametros OEM y especificaciones dimensionales.",
    primaryCta: {
      label: "Explorar catalogo",
      href: "/productos",
    },
    secondaryCta: {
      label: "Soporte tecnico",
      href: "/contacto",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbVxZmf4VUhFWzCaUBn3jBm3NnrW3xt-pvoArpyKsfUM3wzprKhfa8f9tVfWJrVfOH8mmBaDIfDnCDWo_6AnQlLONvJgrRY-WN2p5CYi1Yia_Xijf8m8ou4BfGqp1_vYuJKVBrW3I6wNCnunjnE0miJETxL90_0Nx7CG3tHJ09UjSoidRov-sNIOElBiRg5gEGK_ZJwiWuwJdIntkt5m8OwpgSwMtDqo2PPyxBNWNeypyq2IQOV3X6NEPBGwv_p6K1ADuLyyKyUqo",
    imageAlt: "Componente electromecanico industrial",
    specLabel: "Assembly area // 04",
    sideLabel: "Tolerance < 0.01mm",
  },
  {
    eyebrow: "Marca especializada",
    kicker: "Atencion para talleres y distribuidores",
    title: "Especialistas en repuestos electricos automotores",
    accent: "repuestos electricos",
    body: "Trabajamos con componentes para arranque, carga y sistemas electricos, con atencion tecnica para que encuentres la aplicacion correcta.",
    primaryCta: {
      label: "Conocer categorias",
      href: "/productos",
    },
    secondaryCta: {
      label: "Hablar con un asesor",
      href: "/contacto",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWBpL4VJFiE4HKZBrwG9PbsFsmQJv_BruhuFIkrJyX7gfY_Ij6HStK19xebTwy55H6BLQxBK64rjmBcRMeUM14dAiBmst-7C4GroChwxMptfkcfqOVZdxxSMaSNMbvQqRQyHKGGOo6JbyTRmw4Ml2x6Nz42BA6IhJJDfMcyQ6AhSj0zcN0gpumVybzqLEpkqebamBeDBvOijxiQwna8B8g5fQ-yy1mp5UnZPkCErhEsQ6cTw2JxQlXBySa25OEPMF9rDxusJrC3HA",
    imageAlt: "Portaescobillas y piezas electricas automotor",
    specLabel: "Brand trust // 24",
    sideLabel: "Aplicacion validada",
  },
  {
    eyebrow: "Solucion comercial",
    kicker: "Catalogo preparado para clientes autorizados",
    title: "Tenemos el repuesto que tu cliente necesita",
    accent: "repuesto",
    body: "Un catalogo preparado para talleres, distribuidores y compradores autorizados. Busqueda rapida, referencias tecnicas y solicitudes de pedido con seguimiento comercial.",
    primaryCta: {
      label: "Buscar repuestos",
      href: "/productos",
    },
    secondaryCta: {
      label: "Acceso clientes",
      href: "/login",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2OTSLey_R1_qjxReFmnv-kQohjF0d_l-ypS6dh-U99-IcBgm9VDR8OYwaS7gXcPevhd-UXX1hV_-j3iAgu80WchKfOP0PbYSxwfSbkuVLrDXGMqCz62lYGfaPPfYg3FRzpiHuLKB5w5rEdRp8ghgjsIIG1F38c1SQ7FUXHLLQisMTTNg_nWLoSef5DpHCSh107nBGVODgqTVQi5_z-UcfQCEZxhYGB-MxVRdQKuK6cLdw6aW33SjJMPZXQ-1EqgS7-3GC7gqGIm8",
    imageAlt: "Solenoide automotor para sistemas de arranque",
    specLabel: "Pedido flow // 03",
    sideLabel: "Seguimiento comercial",
  },
];

const AUTOPLAY_MS = 6500;

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => nextIndex(current));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, []);

  const activeSlide = HOME_HERO_SLIDES[activeIndex];

  function showPreviousSlide() {
    setActiveIndex((current) =>
      current === 0 ? HOME_HERO_SLIDES.length - 1 : current - 1,
    );
  }

  function showNextSlide() {
    setActiveIndex((current) => nextIndex(current));
  }

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden border-b-8 border-[#b87333] bg-[#1a1a1b]">
      <div className="absolute inset-0 z-0">
        {HOME_HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.title}
            alt={slide.imageAlt}
            className={[
              "absolute inset-0 h-full w-full object-cover opacity-0 mix-blend-luminosity transition-opacity duration-700",
              activeIndex === index ? "opacity-60" : "",
            ].join(" ")}
            src={slide.image}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1b] via-[#1a1a1b]/70 to-transparent" />
      </div>
      <div className="blueprint-grid absolute inset-0 z-10 opacity-20" />
      <div className="blueprint-subgrid absolute inset-0 z-10 opacity-10" />

      <div className="relative z-20 mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-8 xl:px-12">
        <div className="max-w-4xl">
          <div className="mb-8 inline-flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="bg-[#b87333] px-3 py-1 font-mono text-xs font-bold uppercase text-white">
                {activeSlide.eyebrow}
              </span>
              <div className="h-px w-24 bg-[#b87333]/40" />
            </div>
            <p className="font-mono text-sm font-black uppercase text-[#b87333]">
              {activeSlide.kicker}
            </p>
          </div>

          <h1 className="mb-10 max-w-full text-[40px] font-black uppercase leading-none text-white drop-shadow-2xl sm:max-w-4xl sm:text-5xl lg:text-6xl">
            {renderTitle(activeSlide)}
          </h1>

          <div className="mb-12 flex flex-col items-start gap-8 md:flex-row">
            <div className="hidden h-24 w-1.5 bg-[#b87333] md:block" />
            <p className="max-w-lg text-base font-medium uppercase leading-relaxed text-white/80">
              {activeSlide.body}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={activeSlide.primaryCta.href}
              className="group flex items-center gap-4 bg-white px-10 py-5 font-mono text-xs font-black uppercase text-[#1a1a1b] transition hover:bg-[#b87333] hover:text-white sm:px-12"
            >
              {activeSlide.primaryCta.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-2" />
            </Link>
            <Link
              href={activeSlide.secondaryCta.href}
              className="border-2 border-white/30 px-10 py-5 font-mono text-xs font-black uppercase text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              {activeSlide.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-4 right-4 z-30 mx-auto flex max-w-[1600px] items-center justify-between gap-4 sm:left-8 sm:right-8 xl:left-12 xl:right-12">
        <div className="flex items-center gap-2">
          {HOME_HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Mostrar slide ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={[
                "h-2.5 border border-[#b87333] transition-all",
                activeIndex === index
                  ? "w-12 bg-[#b87333]"
                  : "w-8 bg-transparent hover:bg-[#b87333]/40",
              ].join(" ")}
            />
          ))}
          <span className="ml-3 font-mono text-[10px] font-black uppercase text-[#b87333]">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(HOME_HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={showPreviousSlide}
            className="flex h-11 w-11 items-center justify-center border border-white/30 text-white transition hover:border-[#b87333] hover:bg-[#b87333]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Slide siguiente"
            onClick={showNextSlide}
            className="flex h-11 w-11 items-center justify-center border border-white/30 text-white transition hover:border-[#b87333] hover:bg-[#b87333]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="dimension-line absolute bottom-20 right-12 hidden h-32 w-64 border-y border-[#b87333] lg:block xl:right-48">
        <span className="absolute bottom-2 right-3 font-mono text-[10px] uppercase text-[#b87333]">
          {activeSlide.specLabel}
        </span>
      </div>
      <div className="absolute right-6 top-1/4 hidden h-64 w-px border-y border-[#b87333] xl:block">
        <div className="h-full w-px bg-[#b87333]/40" />
        <span className="absolute left-3 top-1/2 origin-left rotate-90 whitespace-nowrap font-mono text-[10px] uppercase text-[#b87333]">
          {activeSlide.sideLabel}
        </span>
      </div>
    </section>
  );
}

function nextIndex(current: number) {
  return current === HOME_HERO_SLIDES.length - 1 ? 0 : current + 1;
}

function renderTitle(slide: HeroSlide) {
  const accentIndex = slide.title.indexOf(slide.accent);

  if (accentIndex === -1) {
    return slide.title;
  }

  const beforeAccent = slide.title.slice(0, accentIndex).trimEnd();
  const afterAccent = slide.title
    .slice(accentIndex + slide.accent.length)
    .trimStart();

  return (
    <>
      {beforeAccent} <br />
      <span className="text-[#b87333]">{slide.accent}</span>
      {afterAccent ? (
        <>
          {" "}
          <br />
          {afterAccent}
        </>
      ) : null}
    </>
  );
}
