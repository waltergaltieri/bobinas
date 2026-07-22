import Link from "next/link";
import { Plus } from "lucide-react";

import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductAction,
} from "@/app/actions/catalog";
import { AdminProductList } from "@/components/admin/admin-product-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminProducts, getCategories } from "@/lib/data/catalog";

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    brand?: string;
    status?: "active" | "inactive" | "all";
    reviewStatus?: "PENDING" | "APPROVED" | "REJECTED" | "all";
    view?: "list" | "cards";
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getAdminProducts({
      search: params.q,
      categoryId: params.categoryId,
      brand: params.brand,
      status: params.status ?? "all",
      reviewStatus: params.reviewStatus ?? "all",
    }),
  ]);
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Productos</h1>
            <p className="text-muted-foreground">
              Administra la informacion, los precios privados, las categorias, las
              imagenes y las caracteristicas tecnicas.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="size-4" />
              Anadir producto
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(140px,200px))_auto] lg:items-end">
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
              name="reviewStatus"
              label="Revision"
              value={params.reviewStatus}
              options={[
                { value: "PENDING", label: "Pendientes" },
                { value: "APPROVED", label: "Aprobados" },
                { value: "REJECTED", label: "Rechazados" },
                { value: "all", label: "Todos" },
              ]}
            />
            <SelectFilter
              name="brand"
              label="Marca"
              value={params.brand}
              options={brands.map((brand) => ({ value: brand!, label: brand! }))}
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

      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center text-sm text-muted-foreground">
              <span>No hay productos que coincidan con los filtros aplicados.</span>
              <Button asChild>
                <Link href="/admin/productos/nuevo">
                  <Plus className="size-4" />
                  Anadir producto
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AdminProductList
            products={products}
            searchParams={params}
            duplicateAction={duplicateProductAction}
            toggleAction={toggleProductAction}
            deleteAction={deleteProductAction}
          />
        )}
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
