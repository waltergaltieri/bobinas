import Link from "next/link";
import { notFound } from "next/navigation";

import {
  resetBuyerPasswordAction,
  updateBuyerAction,
} from "@/app/actions/buyers";
import { BuyerFields } from "@/components/admin/buyer-fields";
import { EntityForm } from "@/components/admin/entity-form";
import { CommercialResultBadge, RequestStatusBadge } from "@/components/admin/request-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBuyerById } from "@/lib/data/buyers";

type BuyerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const { id } = await params;
  const buyer = await getBuyerById(id);

  if (!buyer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={buyer.isActive ? "default" : "secondary"}>
              {buyer.isActive ? "Activo" : "Inactivo"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">{buyer.id}</span>
          </div>
          <h1 className="text-3xl font-semibold">{buyer.name}</h1>
          <p className="text-muted-foreground">
            {buyer.companyName ?? "Comprador sin empresa registrada"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/compradores">Volver</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar comprador</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm action={updateBuyerAction} submitLabel="Guardar comprador">
                <BuyerFields buyer={buyer} />
              </EntityForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceso privado</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityForm
                action={resetBuyerPasswordAction}
                submitLabel="Enviar recuperacion de acceso"
              >
                <input type="hidden" name="email" value={buyer.email} />
                <p className="text-sm text-muted-foreground">
                  Supabase enviara un correo de recuperacion/cambio de contrasena
                  al email del comprador si el proyecto tiene email configurado.
                </p>
              </EntityForm>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos comerciales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <Info label="Email" value={buyer.email} />
              <Info label="Telefono" value={buyer.phone ?? "-"} />
              <Info label="CUIT" value={buyer.cuit ?? "-"} />
              <Info label="Direccion" value={buyer.address ?? "-"} />
              <div className="md:col-span-2">
                <Info label="Notas internas" value={buyer.internalNotes ?? "-"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos asociados</CardTitle>
            </CardHeader>
            <CardContent>
              {buyer.requests.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Este comprador todavia no tiene pedidos registrados.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Total estimado</TableHead>
                      <TableHead className="text-right">Detalle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buyer.requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">
                          {request.id}
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <CommercialResultBadge result={request.saleResult} />
                        </TableCell>
                        <TableCell className="font-mono">
                          ${request.estimatedTotal}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/pedidos/${request.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line font-medium">{value}</p>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
