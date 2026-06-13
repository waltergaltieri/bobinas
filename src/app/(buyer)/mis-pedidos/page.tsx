import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { getBuyerPurchaseRequests } from "@/lib/data/purchase-requests";

type MyRequestsPageProps = {
  searchParams: Promise<{ mensaje?: string; id?: string }>;
};

export default async function MyRequestsPage({
  searchParams,
}: MyRequestsPageProps) {
  const [{ mensaje, id }, profile] = await Promise.all([
    searchParams,
    getCurrentProfile(),
  ]);
  const requests = profile ? await getBuyerPurchaseRequests(profile) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Mis pedidos</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Historial de solicitudes enviadas para revisión comercial.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/mi-pedido">Ver lista actual</Link>
        </Button>
      </div>

      {mensaje === "pedido-enviado" ? (
        <Alert className="mb-6">
          <AlertDescription>
            Pedido enviado correctamente{id ? ` (${id})` : ""}.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="grid gap-4 rounded-lg border border-dashed p-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
              <div>
                <h2 className="font-semibold">Todavia no hay pedidos enviados</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuando envies una solicitud, va a aparecer en este historial.
                </p>
              </div>
              <Button asChild className="mx-auto w-fit">
                <Link href="/productos">Ir al catalogo</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total estimado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>{request.itemCount}</TableCell>
                    <TableCell className="font-mono">
                      ${request.estimatedTotal}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/mis-pedidos/${request.id}`}>Ver detalle</Link>
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
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
