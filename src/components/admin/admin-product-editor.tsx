import { EntityForm } from "@/components/admin/entity-form";
import { ProductFields } from "@/components/admin/product-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/app/actions/catalog";
import type {
  AdminAttributeWithOptions,
  AdminProduct,
} from "@/lib/data/catalog";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductMutationAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type ProductImageAction = (formData: FormData) => void | Promise<void>;

export function AdminProductEditor({
  product,
  categories,
  attributes,
  action,
  submitLabel,
  updateImageAction,
  deleteImageAction,
}: {
  product?: AdminProduct;
  categories: CategoryOption[];
  attributes: AdminAttributeWithOptions[];
  action: ProductMutationAction;
  submitLabel: string;
  updateImageAction?: ProductImageAction;
  deleteImageAction?: ProductImageAction;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={action} submitLabel={submitLabel}>
            <ProductFields
              product={product}
              categories={categories}
              attributes={attributes}
            />
          </EntityForm>
        </CardContent>
      </Card>

      {product ? (
        <Card>
          <CardHeader>
            <CardTitle>Imagenes actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              product={product}
              updateImageAction={updateImageAction}
              deleteImageAction={deleteImageAction}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ProductImageManager({
  product,
  updateImageAction,
  deleteImageAction,
}: {
  product: AdminProduct;
  updateImageAction?: ProductImageAction;
  deleteImageAction?: ProductImageAction;
}) {
  if (product.images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Sin imagenes asociadas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {product.images.map((image) => (
        <div key={image.id} className="rounded-lg border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            className="mb-3 aspect-video w-full rounded-md object-cover"
          />
          <form action={updateImageAction} className="grid gap-2">
            <input type="hidden" name="id" value={image.id} />
            <input type="hidden" name="productId" value={product.id} />
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
          <form action={deleteImageAction} className="mt-2">
            <input type="hidden" name="id" value={image.id} />
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit" variant="outline" size="sm">
              Desvincular imagen
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Solo se desvincula de la base; no se borra fisicamente de Cloudinary en
            esta fase.
          </p>
        </div>
      ))}
    </div>
  );
}
