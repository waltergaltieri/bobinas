import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { updateAdminPurchaseRequestAction } from "@/app/actions/admin-purchase-requests";
import { CommercialResultBadge, RequestStatusBadge } from "@/components/admin/request-badges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { purchaseRequestStatusEnum, saleResultEnum } from "@/db/schema";
import { getAdminPurchaseRequestDetail } from "@/lib/data/purchase-requests";
import {
  getCommercialResultLabel,
  getRequestStatusLabel,
} from "@/lib/purchase-requests/admin-core";

type AdminRequestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mensaje?: string }>;
};

export default async function AdminRequestDetailPage({
  params,
  searchParams,
}: AdminRequestDetailPageProps) {
  const [{ id }, { mensaje }] = await Promise.all([params, searchParams]);
  const request = await getAdminPurchaseRequestDetail(id);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{request.id}</p>
          <h1 className="text-3xl font-semibold">Detalle del pedido</h1>
          <p className="text-muted-foreground">
            Recibido el {formatDate(request.createdAt)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {request.buyer.phone ? (
            <Button asChild variant="outline">
              <a
                href={getWhatsappHref(request.buyer.phone, request.id)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Contactar por WhatsApp
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin/pedidos">Volver</Link>
          </Button>
        </div>
      </div>

      {mensaje === "pedido-actualizado" ? (
        <Alert>
          <AlertDescription>Pedido actualizado correctamente.</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Estado" value={<RequestStatusBadge status={request.status} />} />
        <Metric
          label="Resultado comercial"
          value={<CommercialResultBadge result={request.saleResult} />}
        />
        <Metric label="Productos" value={request.itemCount} />
        <Metric label="Total estimado" value={`$${request.estimatedTotal}`} mono />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos solicitados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Precio snapshot</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items.map((item) => (
                    <TableRow key={`${item.productId}-${item.productCodeSnapshot}`}>
                      <TableCell>
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-[11px] text-muted-foreground">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.productNameSnapshot}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "Sin imagen"
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {item.productNameSnapshot}
                            </div>
                            {item.currentProductName &&
                            item.currentProductName !== item.productNameSnapshot ? (
                              <p className="text-xs text-muted-foreground">
                                Actual: {item.currentProductName}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.productCodeSnapshot}</TableCell>
                      <TableCell className="font-mono">
                        ${item.unitPriceSnapshot}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-mono">
                        ${item.subtotalSnapshot}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones del comprador</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
              {request.buyerNotes || "Sin observaciones."}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprador</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Info label="Nombre" value={request.buyer.name} />
              <Info label="Empresa" value={request.buyer.companyName ?? "-"} />
              <Info label="Email" value={request.buyer.email} />
              <Info label="Telefono" value={request.buyer.phone ?? "-"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguimiento admin</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateAdminPurchaseRequestAction} className="grid gap-4">
                <input type="hidden" name="id" value={request.id} />
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={request.status}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {purchaseRequestStatusEnum.enumValues.map((status) => (
                      <option key={status} value={status}>
                        {getRequestStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saleResult">Resultado comercial</Label>
                  <select
                    id="saleResult"
                    name="saleResult"
                    defaultValue={request.saleResult}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {saleResultEnum.enumValues.map((result) => (
                      <option key={result} value={result}>
                        {getCommercialResultLabel(result)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminNotes">Notas internas</Label>
                  <Textarea
                    id="adminNotes"
                    name="adminNotes"
                    defaultValue={request.adminNotes ?? ""}
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="saleResultNotes">
                    Nota de resultado comercial
                  </Label>
                  <Textarea
                    id="saleResultNotes"
                    name="saleResultNotes"
                    defaultValue={request.saleResultNotes ?? ""}
                    rows={3}
                  />
                </div>
                <Button type="submit">Guardar seguimiento</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Info label="Recibido" value={formatDate(request.createdAt)} />
              <Info label="Actualizado" value={formatDate(request.updatedAt)} />
              <Info
                label="Cierre"
                value={request.completedAt ? formatDate(request.completedAt) : "-"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className={mono ? "font-mono text-xl font-semibold" : ""}>
        {value}
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function getWhatsappHref(phone: string, id: string) {
  const digits = phone.replace(/\D/g, "");
  const text = `Hola, te contacto por el pedido #${id}. Ya lo estamos revisando para confirmar disponibilidad, condiciones y entrega.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
