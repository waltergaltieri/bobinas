import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryAction,
  updateCategoryAction,
} from "@/app/actions/catalog";
import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminCategories } from "@/lib/data/catalog";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nueva categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={createCategoryAction} submitLabel="Guardar categoria">
            <CategoryFields categories={categories} />
          </EntityForm>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Categorias</h1>
          <p className="text-muted-foreground">
            Organizacion del catalogo, imagenes, destacadas y jerarquia.
          </p>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Todavia no hay categorias cargadas.
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                    {category.isFeatured ? <Badge>Destacada</Badge> : null}
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    /{category.slug} - Orden {category.sortOrder}
                  </p>
                </div>
                <div className="flex gap-2">
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
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Soft delete
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[180px_1fr]">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted text-sm text-muted-foreground">
                  {category.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Sin imagen"
                  )}
                </div>
                <EntityForm
                  action={updateCategoryAction}
                  submitLabel="Guardar cambios"
                >
                  <CategoryFields category={category} categories={categories} />
                </EntityForm>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryFields({
  category,
  categories,
}: {
  category?: Awaited<ReturnType<typeof getAdminCategories>>[number];
  categories: Awaited<ReturnType<typeof getAdminCategories>>;
}) {
  return (
    <>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-2">
        <Label>Nombre</Label>
        <Input name="name" defaultValue={category?.name ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label>Slug</Label>
        <Input name="slug" defaultValue={category?.slug ?? ""} />
      </div>
      <div className="grid gap-2">
        <Label>Descripcion</Label>
        <Textarea name="description" defaultValue={category?.description ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Cloudinary URL</Label>
          <Input name="imageUrl" defaultValue={category?.imageUrl ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label>Cloudinary public ID</Label>
          <Input name="imagePublicId" defaultValue={category?.imagePublicId ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <div className="grid gap-2">
          <Label>Categoria padre</Label>
          <select
            name="parentId"
            defaultValue={category?.parentId ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sin padre</option>
            {categories
              .filter((candidate) => candidate.id !== category?.id)
              .map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Orden</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={category?.sortOrder ?? 0}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={category?.isActive ?? true} />
          Activa
        </label>
        <label className="flex items-center gap-2">
          <input name="isFeatured" type="checkbox" defaultChecked={category?.isFeatured} />
          Destacada
        </label>
      </div>
    </>
  );
}
