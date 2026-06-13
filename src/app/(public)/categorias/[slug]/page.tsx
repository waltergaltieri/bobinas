import { ProductCard } from "@/components/catalog/product-card";
import { getCatalogProducts } from "@/lib/data/catalog";
import { toCatalogProductCard } from "@/lib/data/product-presenter";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getCatalogProducts({ role: "PUBLIC", category: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold">Categoria: {slug}</h1>
      <p className="mt-2 text-muted-foreground">
        Listado inicial preparado para filtrar por categoria real.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catalog.products.length === 0 ? (
          <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            Todavia no hay productos publicados en esta categoria.
          </p>
        ) : (
          catalog.products.map((product) => (
            <ProductCard
              key={product.id}
              product={toCatalogProductCard(product, "PUBLIC")}
            />
          ))
        )}
      </div>
    </div>
  );
}
