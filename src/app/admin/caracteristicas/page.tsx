import {
  createAttributeAction,
  deactivateAttributeAction,
  updateAttributeAction,
} from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAttributesWithOptions } from "@/lib/data/catalog";

export default async function AdminAttributesPage() {
  const attributes = await getAttributesWithOptions();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nueva caracteristica</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            action={createAttributeAction}
            submitLabel="Guardar caracteristica"
          >
            <AttributeFields />
          </EntityForm>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Caracteristicas</h1>
          <p className="text-muted-foreground">
            Atributos normalizados para ficha tecnica y filtros del catalogo.
          </p>
        </div>

        {attributes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Todavia no hay caracteristicas cargadas.
            </CardContent>
          </Card>
        ) : (
          attributes.map((attribute) => (
            <Card key={attribute.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{attribute.type}</Badge>
                    {attribute.isFilterable ? <Badge>Filtro</Badge> : null}
                    {attribute.isVisible ? (
                      <Badge>Visible</Badge>
                    ) : (
                      <Badge variant="secondary">Oculta</Badge>
                    )}
                  </div>
                  <CardTitle>{attribute.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    /{attribute.slug} - Orden {attribute.sortOrder}
                  </p>
                </div>
                <form action={deactivateAttributeAction}>
                  <input type="hidden" name="id" value={attribute.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Desactivar
                  </Button>
                </form>
              </CardHeader>
              <CardContent>
                <EntityForm
                  action={updateAttributeAction}
                  submitLabel="Guardar cambios"
                >
                  <AttributeFields attribute={attribute} />
                </EntityForm>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AttributeFields({
  attribute,
}: {
  attribute?: Awaited<ReturnType<typeof getAttributesWithOptions>>[number];
}) {
  return (
    <>
      {attribute ? <input type="hidden" name="id" value={attribute.id} /> : null}
      <div className="grid gap-2">
        <Label>Nombre</Label>
        <Input name="name" defaultValue={attribute?.name ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label>Slug</Label>
        <Input name="slug" defaultValue={attribute?.slug ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <select
            name="type"
            defaultValue={attribute?.type ?? "TEXT"}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTISELECT"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Unidad</Label>
          <Input name="unit" defaultValue={attribute?.unit ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Opciones normalizadas</Label>
        <Textarea
          name="options"
          defaultValue={attribute?.options.map((option) => option.value).join("\n") ?? ""}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          Una opcion por linea. Obligatorio para SELECT y MULTISELECT.
        </p>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div className="grid gap-2">
          <Label>Orden</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={attribute?.sortOrder ?? 0}
          />
        </div>
        <div className="grid gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              name="isFilterable"
              type="checkbox"
              defaultChecked={attribute?.isFilterable ?? true}
            />
            Filtro
          </label>
          <label className="flex items-center gap-2">
            <input
              name="isVisible"
              type="checkbox"
              defaultChecked={attribute?.isVisible ?? true}
            />
            Visible
          </label>
        </div>
      </div>
    </>
  );
}
