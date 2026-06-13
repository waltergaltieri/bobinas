import Link from "next/link";

import {
  createProductAction,
  deleteProductAction,
  deleteProductImageAction,
  duplicateProductAction,
  toggleProductAction,
  updateProductAction,
  updateProductImageAction,
} from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
import { ProductFields } from "@/components/admin/product-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminProducts,
  getAttributesWithOptions,
  getCategories,
} from "@/lib/data/catalog";

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    brand?: string;
    stockMode?: string;
    status?: "active" | "inactive" | "all";
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const [categories, products, attributes] = await Promise.all([
    getCategories(),
    getAdminProducts({
      search: params.q,
      categoryId: params.categoryId,
      brand: params.brand,
      stockMode: params.stockMode,
      status: params.status ?? "all",
    }),
    getAttributesWithOptions(),
  ]);
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Productos</h1>
        <p className="text-muted-foreground">
          Alta, edicion, stock, precios privados, categorias, imagenes y
          caracteristicas tecnicas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(150px,220px))_auto] lg:items-end">
            <div className="grid gap-2">
              <Label>Texto</Label>
              <Input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Nombre, codigo, OEM, marca"
              />
            </div>
            <SelectFilter
              name="categoryId"
              label="Categoria"
              value={params.categoryId}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
            <SelectFilter
              name="brand"
              label="Marca"
              value={params.brand}
              options={brands.map((brand) => ({ value: brand!, label: brand! }))}
            />
            <SelectFilter
              name="stockMode"
              label="Stock"
              value={params.stockMode}
              options={["TRACKED", "AVAILABLE", "ON_REQUEST", "OUT_OF_STOCK", "HIDDEN"].map(
                (mode) => ({ value: mode, label: mode }),
              )}
            />
            <SelectFilter
              name="status"
              label="Estado"
              value={params.status}
              options={[
                { value: "active", label: "Activos" },
                { value: "inactive", label: "Inactivos" },
                { value: "all", label: "Todos" },
              ]}
            />
            <div className="flex gap-2">
              <Button type="submit">Aplicar</Button>
              <Button asChild variant="outline">
                <Link href="/admin/productos">Limpiar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[460px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nuevo producto</CardTitle>
          </CardHeader>
          <CardContent>
            <EntityForm action={createProductAction} submitLabel="Guardar producto">
              <ProductFields categories={categories} attributes={attributes} />
            </EntityForm>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No hay productos que coincidan con los filtros aplicados.
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                      {product.isFeatured ? <Badge>Destacado</Badge> : null}
                      <Badge variant="outline">{product.stockMode}</Badge>
                    </div>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.internalCode} - {product.brand ?? "Sin marca"} - $
                      {product.price}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <form action={duplicateProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Duplicar
                      </Button>
                    </form>
                    <form action={toggleProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={String(product.isActive)}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        {product.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </form>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Soft delete
                      </Button>
                    </form>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 xl:grid-cols-[1fr_300px]">
                  <EntityForm action={updateProductAction} submitLabel="Guardar cambios">
                    <ProductFields
                      product={product}
                      categories={categories}
                      attributes={attributes}
                    />
                  </EntityForm>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Imagenes actuales</h3>
                    {product.images.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Sin imagenes asociadas.
                      </div>
                    ) : (
                      product.images.map((image) => (
                        <div key={image.id} className="rounded-lg border p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={image.altText ?? product.name}
                            className="mb-3 aspect-video w-full rounded-md object-cover"
                          />
                          <form action={updateProductImageAction} className="grid gap-2">
                            <input type="hidden" name="id" value={image.id} />
                            <input
                              type="hidden"
                              name="productId"
                              value={product.id}
                            />
                            <Label>Texto alternativo</Label>
                            <Input name="altText" defaultValue={image.altText ?? ""} />
                            <Label>Orden</Label>
                            <Input
                              name="sortOrder"
                              type="number"
                              min={0}
                              defaultValue={image.sortOrder}
                            />
                            <Button type="submit" variant="outline" size="sm">
                              Guardar imagen
                            </Button>
                          </form>
                          <form action={deleteProductImageAction} className="mt-2">
                            <input type="hidden" name="id" value={image.id} />
                            <input
                              type="hidden"
                              name="productId"
                              value={product.id}
                            />
                            <Button type="submit" variant="outline" size="sm">
                              Desvincular imagen
                            </Button>
                          </form>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Solo se desvincula de la base; no se borra fisicamente
                            de Cloudinary en esta fase.
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
