import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { HomePopup } from "@/components/site/home-popup";
import { WhatsappButton } from "@/components/site/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicHomeContent } from "@/lib/data/site-content";
import { toCatalogProductCard } from "@/lib/data/product-presenter";

export default async function HomePage() {
  const content = await getPublicHomeContent("PUBLIC");
  const hero = content.slides[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-zinc-950 text-white">
        {hero?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.imageUrl}
            alt={hero.title}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-zinc-950/25" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div className="space-y-6">
            <Badge className="bg-white text-zinc-950 hover:bg-white">
              Catalogo tecnico sin precios publicos
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                {hero?.title ??
                  `${content.settings.businessName}: repuestos automotores para consulta profesional`}
              </h1>
              <p className="max-w-2xl text-lg text-zinc-200">
                {hero?.subtitle ??
                  "Busqueda por codigo, marca, modelo y caracteristicas normalizadas para compradores autorizados y publico general."}
              </p>
            </div>

            <form
              action="/productos"
              className="grid max-w-2xl gap-3 rounded-md bg-white p-2 text-zinc-950 shadow-sm sm:grid-cols-[1fr_auto]"
            >
              <label className="sr-only" htmlFor="home-search">
                Buscar productos
              </label>
              <Input
                id="home-search"
                name="q"
                placeholder="Buscar por nombre, codigo, OEM, marca o modelo"
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={hero?.buttonLink ?? "/productos"}>
                  {hero?.buttonText ?? "Ver catalogo"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white hover:bg-white hover:text-zinc-950"
              >
                <Link href="/login">Acceso compradores</Link>
              </Button>
            </div>
          </div>

          <div className="self-end rounded-md border border-white/20 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-emerald-300" />
              <div>
                <h2 className="font-semibold">Operacion comercial privada</h2>
                <p className="mt-2 text-sm text-zinc-200">
                  El publico consulta el catalogo sin valores. Los compradores
                  autorizados acceden con sesion para ver precios y armar
                  solicitudes de pedido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {content.slides.length > 1 ? (
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 md:grid-cols-3">
            {content.slides.slice(1, 4).map((slide) => (
              <Link
                key={slide.id}
                href={slide.buttonLink ?? "/productos"}
                className="flex min-h-24 gap-3 rounded-md border bg-background p-3 transition hover:border-primary/40"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{slide.title}</p>
                  {slide.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {slide.subtitle}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Categorias destacadas</h2>
            <p className="text-sm text-muted-foreground">
              Familias principales del catalogo tecnico.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.featuredCategories.length === 0 ? (
            <p className="rounded-md border bg-card p-5 text-sm text-muted-foreground md:col-span-2 lg:col-span-4">
              Todavia no hay categorias destacadas.
            </p>
          ) : (
            content.featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="rounded-md border bg-card p-5 transition hover:border-primary/40"
              >
                <h3 className="font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.description ?? "Repuestos seleccionados."}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              {content.settings.businessName}
            </div>
            <h2 className="text-2xl font-semibold">Atencion tecnica y comercial</h2>
            <p className="text-muted-foreground">
              {content.settings.institutionalText ??
                "Catalogo de repuestos automotores con revision manual de disponibilidad, condiciones y entrega."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border bg-background p-5">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">Consultas publicas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Envianos el codigo o aplicacion y el equipo responde por los
                canales configurados.
              </p>
              <div className="mt-4">
                <WhatsappButton phone={content.settings.whatsapp} />
              </div>
            </div>
            <div className="rounded-md border bg-background p-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">Compradores autorizados</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Acceso privado a precios y lista de pedido, con seguimiento
                posterior del equipo administrativo.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/login">Ingresar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Productos destacados</h2>
            <p className="text-sm text-muted-foreground">
              Vista publica sin precios ni acciones privadas.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/productos">Ver catalogo</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.featuredProducts.length === 0 ? (
            <p className="rounded-md border bg-card p-5 text-sm text-muted-foreground md:col-span-3">
              Todavia no hay productos destacados.
            </p>
          ) : (
            content.featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={toCatalogProductCard(product, "PUBLIC")}
              />
            ))
          )}
        </div>
      </section>

      <HomePopup popup={content.popup} />
    </div>
  );
}
