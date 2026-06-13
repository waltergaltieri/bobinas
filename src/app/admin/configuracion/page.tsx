import { upsertSiteSettingsAction } from "@/app/actions/site-content";
import { EntityForm } from "@/components/admin/entity-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSiteSettings } from "@/lib/data/site-content";

export default async function SettingsAdminPage() {
  const settings = await getSiteSettings();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Configuracion del sitio</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm
            action={upsertSiteSettingsAction}
            submitLabel="Guardar configuracion"
          >
            <input type="hidden" name="id" value={settings.id} />
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked={settings.isActive} />
              Configuracion activa
            </label>
            <div className="grid gap-2">
              <Label>Nombre del negocio</Label>
              <Input name="businessName" defaultValue={settings.businessName} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Logo URL</Label>
                <Input name="logoUrl" defaultValue={settings.logoUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Logo public ID</Label>
                <Input name="logoPublicId" defaultValue={settings.logoPublicId ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>WhatsApp principal</Label>
                <Input name="whatsapp" defaultValue={settings.whatsapp ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input name="email" defaultValue={settings.email ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Telefono</Label>
                <Input name="phone" defaultValue={settings.phone ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Horarios</Label>
                <Input
                  name="businessHours"
                  defaultValue={settings.businessHours ?? ""}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Direccion</Label>
              <Input name="address" defaultValue={settings.address ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Instagram</Label>
                <Input name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Facebook</Label>
                <Input name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Texto institucional corto</Label>
              <Textarea
                name="institutionalText"
                defaultValue={settings.institutionalText ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label>Texto de footer</Label>
              <Textarea name="footerText" defaultValue={settings.footerText ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label>SEO title</Label>
              <Input name="seoTitle" defaultValue={settings.seoTitle ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label>SEO description</Label>
              <Textarea
                name="seoDescription"
                defaultValue={settings.seoDescription ?? ""}
              />
            </div>
          </EntityForm>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Vista rapida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Negocio</p>
            <p className="font-medium">{settings.businessName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">WhatsApp</p>
            <p>{settings.whatsapp ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p>{settings.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Institucional</p>
            <p className="text-muted-foreground">
              {settings.institutionalText ?? "Sin texto institucional."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
