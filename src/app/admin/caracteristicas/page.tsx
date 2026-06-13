import { createAttributeAction } from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
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
import { getAttributes } from "@/lib/data/catalog";

export default async function AdminAttributesPage() {
  const attributes = await getAttributes();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nueva caracteristica</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            action={createAttributeAction}
            submitLabel="Guardar caracteristica"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select name="type" defaultValue="TEXT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["TEXT", "NUMBER", "BOOLEAN", "SELECT", "MULTISELECT"].map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unidad</Label>
              <Input id="unit" name="unit" placeholder="V, mm, A" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="options">Opciones normalizadas</Label>
              <Textarea
                id="options"
                name="options"
                placeholder="Una opcion por linea para SELECT o MULTISELECT"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input name="isFilterable" type="checkbox" defaultChecked />
                Filtro
              </label>
              <label className="flex items-center gap-2">
                <input name="isVisible" type="checkbox" defaultChecked />
                Visible
              </label>
            </div>
          </EntityForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caracteristicas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Filtro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Todavia no hay caracteristicas cargadas.
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attribute) => (
                  <TableRow key={attribute.id}>
                    <TableCell className="font-medium">{attribute.name}</TableCell>
                    <TableCell>{attribute.type}</TableCell>
                    <TableCell>{attribute.unit ?? "-"}</TableCell>
                    <TableCell>{attribute.isFilterable ? "Si" : "No"}</TableCell>
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
