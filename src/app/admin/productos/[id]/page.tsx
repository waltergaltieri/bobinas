import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  deleteProductImageAction,
  updateProductAction,
  updateProductImageAction,
} from "@/app/actions/catalog";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { Button } from "@/components/ui/button";
import {
  getAdminProduct,
  getAttributesWithOptions,
  getCategories,
} from "@/lib/data/catalog";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;
  const [product, categories, attributes] = await Promise.all([
    getAdminProduct(id),
    getCategories(),
    getAttributesWithOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Editar producto</h1>
          <p className="text-muted-foreground">
            {product.name} - {product.internalCode}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/productos">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/productos/${product.slug}`} target="_blank">
              <ExternalLink className="size-4" />
              Ver publico
            </Link>
          </Button>
        </div>
      </div>

      <AdminProductEditor
        product={product}
        categories={categories}
        attributes={attributes}
        action={updateProductAction}
        submitLabel="Guardar cambios"
        updateImageAction={updateProductImageAction}
        deleteImageAction={deleteProductImageAction}
      />
    </div>
  );
}
