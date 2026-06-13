import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, PackagePlus } from "lucide-react";

import { addToRequestAction } from "@/app/actions/purchase-requests";
import { ProductCard } from "@/components/catalog/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentProfile } from "@/lib/auth/session";
import { getProductDetail } from "@/lib/data/catalog";
import { toCatalogProductCard } from "@/lib/data/product-presenter";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "PUBLIC";
  const product = await getProductDetail(slug, role);

  if (!product) {
    notFound();
  }

  const isPrivate = role === "ADMIN" || role === "BUYER";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="space-y-3">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm text-muted-foreground">
            {product.images[0]?.url ? (
              // Cloudinary URLs are stored externally and rendered without Next image config in this phase.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "Sin imagen"
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((image) => (
                <div
                  key={image.id}
                  className="aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.internalCode}</Badge>
              {product.categoryName ? <Badge>{product.categoryName}</Badge> : null}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <p className="mt-2 text-muted-foreground">
                {[product.brand, product.model].filter(Boolean).join(" · ") ||
                  "Repuesto automotor"}
              </p>
            </div>
            {product.shortDescription ? (
              <p className="text-base text-muted-foreground">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <Info label="Codigo interno" value={product.internalCode} />
            <Info label="Codigo OEM" value={product.oemCode ?? "-"} />
            <Info label="Marca" value={product.brand ?? "-"} />
            <Info label="Modelo" value={product.model ?? "-"} />
          </div>

          {isPrivate && "price" in product ? (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Precio autorizado</p>
              <p className="mt-1 font-mono text-3xl font-semibold">
                ${product.price}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stock: {product.stockMode}
              </p>
              <form action={addToRequestAction} className="mt-4">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="redirectTo" value="/mi-pedido" />
                <Button type="submit">
                  <PackagePlus className="h-4 w-4" />
                  Agregar al pedido
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href="/contacto">
                <MessageCircle className="h-4 w-4" />
                Consultar
              </Link>
            </Button>
          )}
        </section>
      </div>

      <Separator className="my-8" />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="text-xl font-semibold">Descripcion</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {product.description || "Este producto todavia no tiene descripcion ampliada."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Caracteristicas tecnicas</h2>
          {product.attributes.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Todavia no hay caracteristicas tecnicas cargadas para este producto.
            </p>
          ) : (
            <dl className="mt-3 divide-y rounded-lg border">
              {product.attributes.map((attribute) => (
                <div
                  key={`${attribute.attributeId}-${attribute.value}`}
                  className="grid gap-1 p-3 sm:grid-cols-[180px_1fr]"
                >
                  <dt className="text-sm font-medium">{attribute.attributeName}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {attribute.value}
                    {attribute.unit ? ` ${attribute.unit}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Productos relacionados</h2>
            <p className="text-sm text-muted-foreground">
              Alternativas de la misma familia cuando estan disponibles.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/productos">Volver al catalogo</Link>
          </Button>
        </div>
        {product.relatedProducts.length === 0 ? (
          <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            No hay productos relacionados cargados por ahora.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={toCatalogProductCard(related, role)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
