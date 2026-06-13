import Link from "next/link";
import { MessageCircle, PackagePlus } from "lucide-react";

import { addToRequestAction } from "@/app/actions/purchase-requests";
import type { CatalogProductCard } from "@/lib/data/product-presenter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductCard({ product }: { product: CatalogProductCard }) {
  const isPrivate = product.primaryAction === "add_to_request";

  return (
    <Card className="flex h-full overflow-hidden">
      <div className="flex w-full flex-col">
        <CardHeader className="space-y-3">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border bg-muted text-sm text-muted-foreground">
            {product.imageUrl ? (
              // Cloudinary URLs are stored externally and rendered without Next image config in this phase.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              "Sin imagen"
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.internalCode}</Badge>
              {product.categoryName ? (
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {product.categoryName}
                </span>
              ) : null}
            </div>
            <Link
              href={`/productos/${product.slug}`}
              className="block text-base font-semibold leading-tight hover:underline"
            >
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {[product.brand, product.model].filter(Boolean).join(" · ") ||
                "Repuesto"}
            </p>
            {product.oemCode ? (
              <p className="text-xs text-muted-foreground">OEM {product.oemCode}</p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="mt-auto space-y-2">
          {isPrivate ? (
            <>
              <p className="font-mono text-xl font-semibold">${product.price}</p>
              <p className="text-xs text-muted-foreground">Stock: {product.stockMode}</p>
            </>
          ) : null}
        </CardContent>
        <CardFooter>
          {isPrivate ? (
            <form action={addToRequestAction} className="w-full">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="redirectTo" value="/mi-pedido" />
              <Button type="submit" className="w-full">
                <PackagePlus className="h-4 w-4" />
                Agregar al pedido
              </Button>
            </form>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href="/contacto">
                <MessageCircle className="h-4 w-4" />
                Consultar
              </Link>
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
