import Link from "next/link";
import { Copy, Eye, LayoutGrid, List, Pencil, Power, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProduct } from "@/lib/data/catalog";
import { validateProductPublication } from "@/lib/catalog/product-review";
import { cn } from "@/lib/utils";

type ProductListAction = (formData: FormData) => void | Promise<void>;

type AdminProductListProps = {
  products: AdminProduct[];
  searchParams: Record<string, string | undefined>;
  duplicateAction?: ProductListAction;
  toggleAction?: ProductListAction;
  deleteAction?: ProductListAction;
};

export function AdminProductList({
  products,
  searchParams,
  duplicateAction,
  toggleAction,
  deleteAction,
}: AdminProductListProps) {
  const view = searchParams.view === "cards" ? "cards" : "list";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} producto{products.length === 1 ? "" : "s"} encontrados
        </p>
        <div className="inline-flex w-fit rounded-lg border bg-background p-1">
          <Button
            asChild
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-md"
          >
            <Link href={productsHref(searchParams, "list")}>
              <List className="size-4" />
              Lista
            </Link>
          </Button>
          <Button
            asChild
            variant={view === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-md"
          >
            <Link href={productsHref(searchParams, "cards")}>
              <LayoutGrid className="size-4" />
              Tarjetas
            </Link>
          </Button>
        </div>
      </div>

      {view === "cards" ? (
        <div
          data-testid="admin-product-card-grid"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              duplicateAction={duplicateAction}
              toggleAction={toggleAction}
              deleteAction={deleteAction}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table aria-label="Productos">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="w-[260px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <ProductThumb product={product} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          <StatusBadges product={product} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {[product.internalCode, product.brand, product.model]
                            .filter(Boolean)
                            .join(" - ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.categoryName ?? "Sin categoria"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${product.price}
                    </TableCell>
                    <TableCell>
                      <ProductActions
                        product={product}
                        duplicateAction={duplicateAction}
                        toggleAction={toggleAction}
                        deleteAction={deleteAction}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProductCard({
  product,
  duplicateAction,
  toggleAction,
  deleteAction,
}: {
  product: AdminProduct;
  duplicateAction?: ProductListAction;
  toggleAction?: ProductListAction;
  deleteAction?: ProductListAction;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-3 p-3">
        <div className="grid grid-cols-[92px_1fr] gap-3">
          <ProductThumb product={product} className="size-[92px]" />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadges product={product} />
            </div>
            <div>
              <h3 className="truncate font-semibold">{product.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {[product.internalCode, product.brand, product.model]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-2 text-xs">
          <ProductMeta label="Categoria" value={product.categoryName ?? "Sin categoria"} />
          <ProductMeta label="Precio" value={`$${product.price}`} align="right" />
        </div>
        <ProductActions
          product={product}
          duplicateAction={duplicateAction}
          toggleAction={toggleAction}
          deleteAction={deleteAction}
        />
      </CardContent>
    </Card>
  );
}

function ProductThumb({
  product,
  className,
}: {
  product: AdminProduct;
  className?: string;
}) {
  const image = product.images[0]?.url ?? product.imageUrl;

  if (!image) {
    return (
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground",
          className,
        )}
      >
        Sin
      </div>
    );
  }

  return (
    <div className={cn("relative size-12 overflow-hidden rounded-md border", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={product.images[0]?.altText ?? product.name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function StatusBadges({ product }: { product: AdminProduct }) {
  const reviewLabels = {
    PENDING: "Pendiente de revision",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
  } as const;

  return (
    <>
      <Badge variant={product.isActive ? "default" : "secondary"}>
        {product.isActive ? "Activo" : "Inactivo"}
      </Badge>
      <Badge variant={product.reviewStatus === "APPROVED" ? "outline" : "secondary"}>
        {reviewLabels[product.reviewStatus]}
      </Badge>
      {product.isFeatured ? <Badge>Destacado</Badge> : null}
    </>
  );
}

function ProductMeta({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <p className="text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}

function ProductActions({
  product,
  duplicateAction,
  toggleAction,
  deleteAction,
}: {
  product: AdminProduct;
  duplicateAction?: ProductListAction;
  toggleAction?: ProductListAction;
  deleteAction?: ProductListAction;
}) {
  const publication = validateProductPublication({
    nextIsActive: true,
    reviewStatus: product.reviewStatus,
    price: product.price,
    imageCount: product.images.length,
  });
  const activationBlocked = !product.isActive && !publication.ok;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button asChild variant="outline" size="sm">
        <Link href={`/productos/${product.slug}`} target="_blank">
          <Eye className="size-4" />
          Ver
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href={`/admin/productos/${product.id}`} aria-label={`Editar ${product.name}`}>
          <Pencil className="size-4" />
          Editar
        </Link>
      </Button>
      <form action={duplicateAction}>
        <input type="hidden" name="id" value={product.id} />
        <Button type="submit" variant="outline" size="icon-sm" title="Duplicar">
          <Copy className="size-4" />
        </Button>
      </form>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="isActive" value={String(product.isActive)} />
        <Button
          type="submit"
          variant="outline"
          size="icon-sm"
          disabled={activationBlocked}
          title={
            product.isActive
              ? "Desactivar"
              : activationBlocked
                ? "Completa la revision antes de activar"
                : "Activar"
          }
        >
          <Power className="size-4" />
        </Button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={product.id} />
        <Button type="submit" variant="outline" size="icon-sm" title="Soft delete">
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function productsHref(
  searchParams: Record<string, string | undefined>,
  view: "list" | "cards",
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key !== "view" && value) {
      params.set(key, value);
    }
  }

  if (view === "cards") {
    params.set("view", "cards");
  }

  const query = params.toString();
  return query ? `/admin/productos?${query}` : "/admin/productos";
}
