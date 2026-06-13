import Link from "next/link";
import { notFound } from "next/navigation";

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
import { getCurrentProfile } from "@/lib/auth/session";
import { getBuyerPurchaseRequestDetail } from "@/lib/data/purchase-requests";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, getCurrentProfile()]);
  const request = profile
    ? await getBuyerPurchaseRequestDetail(profile, id)
    : null;

  if (!request) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{request.id}</p>
          <h1 className="text-3xl font-semibold">Detalle del pedido</h1>
          <p className="mt-2 text-muted-foreground">
            Solicitud enviada el {formatDate(request.createdAt)}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/mis-pedidos">Volver al historial</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado</CardTitle>
          </CardHeader>
          <CardContent>{request.status}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Productos</CardTitle>
          </CardHeader>
          <CardContent>{request.itemCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total estimado</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xl font-semibold">
            ${request.estimatedTotal}
          </CardContent>
        </Card>
      </div>

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
                  <TableCell className="font-medium">
                    {item.productNameSnapshot}
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
          {request.buyerNotes || "Sin observaciones."}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
