import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createProductAction } from "@/app/actions/catalog";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { Button } from "@/components/ui/button";
import { getAttributesWithOptions, getCategories } from "@/lib/data/catalog";

export default async function NewProductPage() {
  const [categories, attributes] = await Promise.all([
    getCategories(),
    getAttributesWithOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Anadir producto</h1>
          <p className="text-muted-foreground">
            Alta de producto, categorias, imagenes y caracteristicas tecnicas.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/productos">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      </div>

      <AdminProductEditor
        categories={categories}
        attributes={attributes}
        action={createProductAction}
        submitLabel="Guardar producto"
      />
    </div>
  );
}
