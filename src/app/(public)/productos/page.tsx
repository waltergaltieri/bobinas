import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import { CatalogSearchBox } from "@/components/catalog/catalog-search-box";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchTracker } from "@/components/tracking/search-tracker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getCatalogFilters,
  getCatalogProducts,
  getCatalogSearchSuggestions,
  type CatalogFilters,
} from "@/lib/data/catalog";
import { toCatalogProductCard } from "@/lib/data/product-presenter";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" },
  { value: "brand_asc", label: "Marca A-Z" },
] as const;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "PUBLIC";
  const [filters, suggestions] = await Promise.all([
    getCatalogFilters(),
    getCatalogSearchSuggestions("", { includeAll: true, limit: 80 }),
  ]);
  const page = Number(getParam(params.page) ?? "1");
  const selectedAttributes = Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => key.startsWith("attr_") && getParam(value))
      .map(([key, value]) => [key.replace("attr_", ""), getParam(value)]),
  );

  const catalog = await getCatalogProducts({
    role,
    search: getParam(params.q),
    category: getParam(params.category),
    brand: getParam(params.brand),
    model: getParam(params.model),
    sort: getSort(getParam(params.sort)),
    page,
    pageSize: 9,
    attributes: selectedAttributes,
  });
  const activeFilters = getActiveFilters(params, filters);
  const hasFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.models.length > 0 ||
    filters.attributes.some((attribute) => attribute.values.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SearchTracker
        query={getParam(params.q) ?? ""}
        filters={{
          category: getParam(params.category),
          brand: getParam(params.brand),
          model: getParam(params.model),
          sort: getParam(params.sort),
          ...selectedAttributes,
        }}
        resultsCount={catalog.total}
        sourcePath="/productos"
      />
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Productos</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Catalogo tecnico con busqueda por codigo, OEM, marca, modelo y
            caracteristicas normalizadas.
          </p>
        </div>
        <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
          {catalog.total} resultado{catalog.total === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <form className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="font-semibold">Filtros</h2>
            </div>
            <div className="grid gap-4">
              <CatalogSearchBox
                initialQuery={getParam(params.q)}
                suggestions={suggestions}
              />

              <SelectFilter
                id="category"
                label="Categoria"
                options={filters.categories}
                value={getParam(params.category)}
              />
              <SelectFilter
                id="brand"
                label="Marca"
                options={filters.brands}
                value={getParam(params.brand)}
              />
              <SelectFilter
                id="model"
                label="Modelo"
                options={filters.models}
                value={getParam(params.model)}
              />

              {filters.attributes.length === 0 ? (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Todavia no hay filtros tecnicos configurados.
                </p>
              ) : (
                filters.attributes.map((attribute) => (
                  <SelectFilter
                    key={attribute.id}
                    id={`attr_${attribute.slug}`}
                    label={`${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ""}`}
                    options={attribute.values}
                    value={getParam(params[`attr_${attribute.slug}`])}
                    emptyLabel="Todos"
                  />
                ))
              )}

              <SelectFilter
                id="sort"
                label="Orden"
                options={sortOptions}
                value={getParam(params.sort) ?? "featured"}
                emptyLabel={null}
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Aplicar
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/productos">Limpiar</Link>
                </Button>
              </div>
            </div>
          </form>
          {!hasFilters ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No hay categorias, marcas, modelos ni caracteristicas para filtrar.
            </p>
          ) : null}
        </aside>

        <section className="min-w-0 space-y-4">
          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
              {activeFilters.map((filter) => (
                <Link
                  key={`${filter.key}-${filter.value}`}
                  href={filter.href}
                  className="inline-flex max-w-full items-center gap-1 rounded-md border bg-background px-2.5 py-1 text-sm transition hover:border-primary/50"
                >
                  <span className="text-muted-foreground">{filter.label}</span>
                  <span className="max-w-[220px] truncate font-medium">
                    {filter.value}
                  </span>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
              <Button asChild variant="outline" size="sm">
                <Link href="/productos">Limpiar todo</Link>
              </Button>
            </div>
          ) : null}

          {catalog.products.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h2 className="text-lg font-semibold">Sin resultados</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                No encontramos productos con esos criterios. Probá ajustar la
                busqueda o quitar algun filtro.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={toCatalogProductCard(product, role)}
                />
              ))}
            </div>
          )}

          {catalog.pageCount > 1 ? (
            <nav className="mt-6 flex items-center justify-between gap-3">
              {catalog.page <= 1 ? (
                <Button variant="outline" disabled>
                  Anterior
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href={pageHref(params, catalog.page - 1)}>Anterior</Link>
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Pagina {catalog.page} de {catalog.pageCount}
              </span>
              {catalog.page >= catalog.pageCount ? (
                <Button variant="outline" disabled>
                  Siguiente
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href={pageHref(params, catalog.page + 1)}>Siguiente</Link>
                </Button>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function SelectFilter({
  id,
  label,
  options,
  value,
  emptyLabel = "Todas",
}: {
  id: string;
  label: string;
  options: readonly { value: string; label: string }[];
  value?: string;
  emptyLabel?: string | null;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={id}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {options.length === 0 ? (
          <option value="" disabled>
            Sin opciones
          </option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getActiveFilters(
  params: Record<string, string | string[] | undefined>,
  filters: CatalogFilters,
) {
  const chips: Array<{
    key: string;
    label: string;
    value: string;
    href: string;
  }> = [];
  const query = getParam(params.q);
  const category = getParam(params.category);
  const brand = getParam(params.brand);
  const model = getParam(params.model);

  if (query) {
    chips.push({
      key: "q",
      label: "Busqueda",
      value: query,
      href: removeParamHref(params, "q"),
    });
  }

  if (category) {
    chips.push({
      key: "category",
      label: "Categoria",
      value:
        filters.categories.find((option) => option.value === category)?.label ??
        category,
      href: removeParamHref(params, "category"),
    });
  }

  if (brand) {
    chips.push({
      key: "brand",
      label: "Marca",
      value: brand,
      href: removeParamHref(params, "brand"),
    });
  }

  if (model) {
    chips.push({
      key: "model",
      label: "Modelo",
      value: model,
      href: removeParamHref(params, "model"),
    });
  }

  for (const attribute of filters.attributes) {
    const key = `attr_${attribute.slug}`;
    const value = getParam(params[key]);

    if (!value) {
      continue;
    }

    chips.push({
      key,
      label: attribute.name,
      value,
      href: removeParamHref(params, key),
    });
  }

  return chips;
}

function getSort(value: string | undefined) {
  return sortOptions.some((option) => option.value === value)
    ? (value as (typeof sortOptions)[number]["value"])
    : "featured";
}

function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const normalized = getParam(value);
    if (normalized && key !== "page") {
      next.set(key, normalized);
    }
  }

  next.set("page", String(Math.max(page, 1)));
  return `/productos?${next.toString()}`;
}

function removeParamHref(
  params: Record<string, string | string[] | undefined>,
  keyToRemove: string,
) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const normalized = getParam(value);
    if (normalized && key !== keyToRemove && key !== "page") {
      next.set(key, normalized);
    }
  }

  const query = next.toString();
  return query ? `/productos?${query}` : "/productos";
}
