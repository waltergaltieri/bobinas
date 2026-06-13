import {
  createHomeSlideAction,
  deleteHomeSlideAction,
  updateHomeSlideAction,
} from "@/app/actions/site-content";
import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getHomeSlides } from "@/lib/data/site-content";

export default async function HomeAdminPage() {
  const slides = await getHomeSlides({ activeOnly: false });

  return (
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo slide</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={createHomeSlideAction} submitLabel="Crear slide">
            <SlideFields />
          </EntityForm>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Home</h1>
          <p className="text-muted-foreground">
            Carrusel principal visible en la portada publica.
          </p>
        </div>

        {slides.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Todavia no hay slides cargados.
            </CardContent>
          </Card>
        ) : (
          slides.map((slide) => (
            <Card key={slide.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{slide.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Orden {slide.sortOrder}
                  </p>
                </div>
                <Badge variant={slide.isActive ? "default" : "secondary"}>
                  {slide.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[240px_1fr]">
                <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-md border bg-muted text-sm text-muted-foreground">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Sin imagen"
                  )}
                </div>
                <EntityForm action={updateHomeSlideAction} submitLabel="Guardar cambios">
                  <input type="hidden" name="id" value={slide.id} />
                  <SlideFields slide={slide} />
                </EntityForm>
                <form action={deleteHomeSlideAction} className="lg:col-start-2">
                  <input type="hidden" name="id" value={slide.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Eliminar slide
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function SlideFields({
  slide,
}: {
  slide?: {
    imageUrl: string;
    imagePublicId: string;
    title: string;
    subtitle: string | null;
    buttonText: string | null;
    buttonLink: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={slide ? `title-${slide.title}` : "title"}>Titulo</Label>
        <Input name="title" defaultValue={slide?.title} required />
      </div>
      <div className="grid gap-2">
        <Label>Subtitulo</Label>
        <Textarea name="subtitle" defaultValue={slide?.subtitle ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Imagen URL</Label>
          <Input name="imageUrl" defaultValue={slide?.imageUrl ?? ""} required />
        </div>
        <div className="grid gap-2">
          <Label>Cloudinary public ID</Label>
          <Input
            name="imagePublicId"
            defaultValue={slide?.imagePublicId ?? ""}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Texto de boton</Label>
          <Input name="buttonText" defaultValue={slide?.buttonText ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label>Link de boton</Label>
          <Input name="buttonLink" defaultValue={slide?.buttonLink ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div className="grid gap-2">
          <Label>Orden</Label>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={slide?.sortOrder ?? 0}
          />
        </div>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input name="isActive" type="checkbox" defaultChecked={slide?.isActive ?? true} />
          Activo
        </label>
      </div>
    </>
  );
}
