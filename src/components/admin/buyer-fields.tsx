import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BuyerFields({
  buyer,
}: {
  buyer?: {
    id?: string;
    name: string;
    companyName: string | null;
    email: string;
    phone: string | null;
    cuit: string | null;
    address: string | null;
    isActive: boolean;
    internalNotes: string | null;
  };
}) {
  return (
    <>
      {buyer?.id ? <input type="hidden" name="id" value={buyer.id} /> : null}
      <div className="grid gap-2">
        <Label>Nombre</Label>
        <Input name="name" defaultValue={buyer?.name ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label>Empresa</Label>
        <Input name="companyName" defaultValue={buyer?.companyName ?? ""} />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input name="email" type="email" defaultValue={buyer?.email ?? ""} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Telefono</Label>
          <Input name="phone" defaultValue={buyer?.phone ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label>CUIT</Label>
          <Input name="cuit" defaultValue={buyer?.cuit ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Direccion</Label>
        <Input name="address" defaultValue={buyer?.address ?? ""} />
      </div>
      <div className="grid gap-2">
        <Label>Notas internas</Label>
        <Textarea
          name="internalNotes"
          defaultValue={buyer?.internalNotes ?? ""}
          rows={4}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={buyer?.isActive ?? true} />
        Comprador activo
      </label>
    </>
  );
}
