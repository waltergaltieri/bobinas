import { createProductAction, toggleProductAction } from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  getAttributesWithOptions,
  getCategories,
  getPrivateProducts,
  type AdminAttributeWithOptions,
} from "@/lib/data/catalog";

export default async function AdminProductsPage() {
  const [categories, products, attributes] = await Promise.all([
    getCategories(),
    getPrivateProducts(),
    getAttributesWithOptions(),
  ]);

  return (
    <div className="grid gap-6 2xl:grid-cols-[460px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo producto</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={createProductAction} submitLabel="Guardar producto">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="internalCode">Codigo interno</Label>
                <Input id="internalCode" name="internalCode" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="oemCode">Codigo OEM</Label>
                <Input id="oemCode" name="oemCode" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortDescription">Descripcion corta</Label>
              <Textarea id="shortDescription" name="shortDescription" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion larga</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio privado</Label>
                <Input id="price" name="price" inputMode="decimal" defaultValue="0" />
              </div>
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Select name="stockMode" defaultValue="ON_REQUEST">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "TRACKED",
                      "AVAILABLE",
                      "ON_REQUEST",
                      "OUT_OF_STOCK",
                      "HIDDEN",
                    ].map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Categoria principal</Label>
              <Select name="mainCategoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input name="isActive" type="checkbox" defaultChecked />
                Activo
              </label>
              <label className="flex items-center gap-2">
                <input name="isFeatured" type="checkbox" />
                Destacado
              </label>
            </div>
            <div className="grid gap-3 rounded-lg border p-4">
              <div>
                <h3 className="text-sm font-semibold">Caracteristicas tecnicas</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Los valores se validan segun el tipo de caracteristica.
                </p>
              </div>
              {attributes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavia no hay caracteristicas cargadas.
                </p>
              ) : (
                attributes.map((attribute) => (
                  <AttributeField key={attribute.id} attribute={attribute} />
                ))
              )}
            </div>
          </EntityForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Precio privado</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Caracteristicas</TableHead>
                <TableHead className="text-right">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Todavia no hay productos cargados.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.internalCode}</TableCell>
                    <TableCell className="font-mono">${product.price}</TableCell>
                    <TableCell>{product.stockMode}</TableCell>
                    <TableCell className="max-w-[260px] text-sm text-muted-foreground">
                      {product.attributes.length === 0
                        ? "Sin caracteristicas"
                        : product.attributes
                            .map((attribute) => `${attribute.attributeName}: ${attribute.value}`)
                            .join(" · ")}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={toggleProductAction}>
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="isActive" value="true" />
                        <Button type="submit" variant="outline" size="sm">
                          Desactivar
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AttributeField({
  attribute,
}: {
  attribute: AdminAttributeWithOptions;
}) {
  const name = `attribute:${attribute.id}`;

  if (attribute.type === "SELECT") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={name}>{attribute.name}</Label>
        <select
          id={name}
          name={name}
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
        <div className="grid gap-2">
          {attribute.options.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin opciones configuradas.</p>
          ) : (
            attribute.options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <input name={name} type="checkbox" value={option.id} />
                {option.value}
              </label>
            ))
          )}
        </div>
      </fieldset>
    );
  }

  if (attribute.type === "BOOLEAN") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={name}>{attribute.name}</Label>
        <select
          id={name}
          name={name}
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
      <Label htmlFor={name}>
        {attribute.name}
        {attribute.unit ? ` (${attribute.unit})` : ""}
      </Label>
      <Input
        id={name}
        name={name}
        inputMode={attribute.type === "NUMBER" ? "decimal" : undefined}
      />
    </div>
  );
}
