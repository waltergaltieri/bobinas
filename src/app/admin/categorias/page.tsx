import {
  createCategoryAction,
  toggleCategoryAction,
} from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/lib/data/catalog";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nueva categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={createCategoryAction} submitLabel="Guardar categoria">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="auto si queda vacio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Cloudinary URL</Label>
              <Input id="imageUrl" name="imageUrl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imagePublicId">Cloudinary public ID</Label>
              <Input id="imagePublicId" name="imagePublicId" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked />
              Activa
            </label>
          </EntityForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Todavia no hay categorias cargadas.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      {category.isActive ? "Activa" : "Inactiva"}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={toggleCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={String(category.isActive)}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          {category.isActive ? "Desactivar" : "Activar"}
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
