import { ProductImageUpload } from "@/components/admin/product-image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>Precio privado</Label>
          <Input
            name="price"
            inputMode="decimal"
            defaultValue={product?.price ?? "0.00"}
          />
        </div>
        <div className="grid gap-2">
          <Label>Stock</Label>
          <select
            name="stockMode"
            defaultValue={product?.stockMode ?? "ON_REQUEST"}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["TRACKED", "AVAILABLE", "ON_REQUEST", "OUT_OF_STOCK", "HIDDEN"].map(
              (mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ),
            )}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Cantidad</Label>
          <Input
            name="stockQuantity"
            type="number"
            min={0}
            defaultValue={product?.stockQuantity ?? ""}
          />
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
        {attributes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavia no hay caracteristicas cargadas.
          </p>
        ) : (
          attributes.map((attribute) => (
            <AttributeField key={attribute.id} attribute={attribute} product={product} />
          ))
        )}
      </fieldset>
      <ProductImageUpload />
    </>
  );
}

function AttributeField({
  attribute,
  product,
}: {
  attribute: AdminAttributeWithOptions;
  product?: AdminProduct;
}) {
  const name = `attribute:${attribute.id}`;
  const currentValues =
    product?.attributes
      .filter((value) => value.attributeId === attribute.id)
      .map((value) => value.value) ?? [];
  const firstValue = currentValues[0] ?? "";

  if (attribute.type === "SELECT") {
    return (
      <div className="grid gap-2">
        <Label>{attribute.name}</Label>
        <select
          name={name}
          defaultValue={
            attribute.options.find((option) => option.value === firstValue)?.id ?? ""
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sin valor</option>
          {attribute.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (attribute.type === "MULTISELECT") {
    return (
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">{attribute.name}</legend>
        {attribute.options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              name={name}
              type="checkbox"
              value={option.id}
              defaultChecked={currentValues.includes(option.value)}
            />
            {option.value}
          </label>
        ))}
      </fieldset>
    );
  }

  if (attribute.type === "BOOLEAN") {
    return (
      <div className="grid gap-2">
        <Label>{attribute.name}</Label>
        <select
          name={name}
          defaultValue={firstValue}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Sin valor</option>
          <option value="true">Si</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label>
        {attribute.name}
        {attribute.unit ? ` (${attribute.unit})` : ""}
      </Label>
      <Input
        name={name}
        defaultValue={firstValue}
        inputMode={attribute.type === "NUMBER" ? "decimal" : undefined}
      />
    </div>
  );
}
