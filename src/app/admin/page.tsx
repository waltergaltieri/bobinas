import Link from "next/link";

import { CommercialResultBadge, RequestStatusBadge } from "@/components/admin/request-badges";
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
import { getAdminMetrics } from "@/lib/data/catalog";
import { getAdminRequestsDashboard } from "@/lib/data/purchase-requests";

export default async function AdminPage() {
  const [metrics, requestMetrics] = await Promise.all([
    getAdminMetrics(),
    getAdminRequestsDashboard(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Panel</h1>
          <p className="text-muted-foreground">
            Estado del catalogo y seguimiento comercial de pedidos recibidos.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/pedidos">Ver pedidos</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Productos activos", metrics.products],
          ["Categorias", metrics.categories],
          ["Caracteristicas", metrics.attributes],
          ["Pendientes", requestMetrics.pending],
        ].map(([label, value]) => (
          <MetricCard key={label} label={String(label)} value={String(value)} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="En revision" value={requestMetrics.inReview} />
        <MetricCard label="Contactados" value={requestMetrics.contacted} />
        <MetricCard label="Concretados" value={requestMetrics.concreted} />
        <MetricCard label="No concretados" value={requestMetrics.notConcreted} />
        <MetricCard
          label="Total pendiente"
          value={`$${requestMetrics.pendingEstimatedTotal}`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Ultimos pedidos recibidos</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/pedidos">Abrir listado</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {requestMetrics.latest.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Todavia no hay pedidos recibidos.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Total estimado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestMetrics.latest.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">{request.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{request.buyerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.buyerCompanyName ?? "Sin empresa"}
                      </div>
                    </TableCell>
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
                        <Link href={`/admin/pedidos/${request.id}`}>Ver detalle</Link>
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

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
