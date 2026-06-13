import { upsertPopupSettingsAction } from "@/app/actions/site-content";
import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminPopupSettings, shouldDisplayPopup } from "@/lib/data/site-content";

export default async function PopupAdminPage() {
  const popup = await getAdminPopupSettings();
  const visibleNow = shouldDisplayPopup(popup);

  return (
    <div className="grid gap-6 xl:grid-cols-[480px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Popup configurable</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={upsertPopupSettingsAction} submitLabel="Guardar popup">
            <input type="hidden" name="id" value={popup.id} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input name="isActive" type="checkbox" defaultChecked={popup.isActive} />
                Activo
              </label>
              <label className="flex items-center gap-2">
                <input name="showOnce" type="checkbox" defaultChecked={popup.showOnce} />
                Mostrar una vez
              </label>
            </div>
            <div className="grid gap-2">
              <Label>Titulo</Label>
              <Input name="title" defaultValue={popup.title ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label>Texto</Label>
              <Textarea name="text" defaultValue={popup.text ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Imagen URL</Label>
                <Input name="imageUrl" defaultValue={popup.imageUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Cloudinary public ID</Label>
                <Input name="imagePublicId" defaultValue={popup.imagePublicId ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Texto de boton</Label>
                <Input name="buttonText" defaultValue={popup.buttonText ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Link de boton</Label>
                <Input name="buttonLink" defaultValue={popup.buttonLink ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Inicio</Label>
                <Input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(popup.startsAt)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Fin</Label>
                <Input
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(popup.endsAt)}
                />
              </div>
            </div>
          </EntityForm>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Popup</h1>
          <p className="text-muted-foreground">
            Mensaje temporal para comunicar novedades sin bloquear la navegación.
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Preview</CardTitle>
            <Badge variant={visibleNow ? "default" : "secondary"}>
              {visibleNow ? "Visible ahora" : "No visible ahora"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="max-w-md rounded-lg border bg-card p-5">
              {popup.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={popup.imageUrl}
                  alt={popup.title ?? "Popup"}
                  className="mb-4 aspect-video w-full rounded-md object-cover"
                />
              ) : null}
              <h2 className="text-xl font-semibold">
                {popup.title || "Titulo del popup"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {popup.text || "Texto del mensaje."}
              </p>
              {popup.buttonText ? (
                <p className="mt-4 text-sm font-medium">{popup.buttonText}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function toDateTimeInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}
