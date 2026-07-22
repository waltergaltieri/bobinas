import { ProductAttributeFields } from "@/components/admin/product-attribute-fields";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PackageCheck } from "lucide-react";
import type {
  AdminAttributeWithOptions,
  AdminProduct,
} from "@/lib/data/catalog";

type CategoryOption = {
  id: string;
  name: string;
};

export function ProductFields({
  product,
  categories,
  attributes,
}: {
  product?: AdminProduct;
  categories: CategoryOption[];
  attributes: AdminAttributeWithOptions[];
}) {
  return (
    <>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-2">
        <Label>Nombre</Label>
        <Input name="name" defaultValue={product?.name ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label>Slug</Label>
        <Input name="slug" defaultValue={product?.slug ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Codigo interno</Label>
          <Input name="internalCode" defaultValue={product?.internalCode ?? ""} required />
        </div>
        <div className="grid gap-2">
          <Label>Codigo OEM</Label>
          <Input name="oemCode" defaultValue={product?.oemCode ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Marca</Label>
          <Input name="brand" defaultValue={product?.brand ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label>Modelo</Label>
          <Input name="model" defaultValue={product?.model ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Descripcion corta</Label>
        <Textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} />
      </div>
      <div className="grid gap-2">
        <Label>Descripcion larga</Label>
        <Textarea name="description" defaultValue={product?.description ?? ""} />
      </div>
      <input
        type="hidden"
        name="stockMode"
        value={product?.stockMode ?? "ON_REQUEST"}
      />
      <input
        type="hidden"
        name="stockQuantity"
        value={product?.stockQuantity ?? 0}
      />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-end">
        <div className="grid gap-2">
          <Label>Precio privado</Label>
          <Input
            name="price"
            inputMode="decimal"
            defaultValue={product?.price ?? "0.00"}
          />
        </div>
        <div
          role="note"
          className="flex gap-3 rounded-lg border bg-muted/30 p-3"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
            <PackageCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Disponibilidad a confirmar</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Los compradores pueden incluir este producto en una solicitud. El
              dueño confirma la disponibilidad cuando revisa el pedido.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Categoria principal</Label>
        <select
          name="mainCategoryId"
          defaultValue={product?.mainCategoryId ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sin categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="grid gap-2 rounded-lg border p-4">
        <legend className="px-1 text-sm font-semibold">Categorias secundarias</legend>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay categorias cargadas.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input
                  name="secondaryCategoryIds"
                  type="checkbox"
                  value={category.id}
                  defaultChecked={product?.secondaryCategoryIds.includes(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} />
          Activo
        </label>
        <label className="flex items-center gap-2">
          <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured} />
          Destacado
        </label>
      </div>
      <fieldset className="grid gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-semibold">Caracteristicas tecnicas</legend>
        <ProductAttributeFields
          attributes={attributes}
          values={product?.attributes ?? []}
        />
      </fieldset>
      <ProductImageUpload />
    </>
  );
}
