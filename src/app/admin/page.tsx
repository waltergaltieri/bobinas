import Link from "next/link";

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
import { getAdminUsageMetrics } from "@/lib/data/metrics";
import { getAdminRequestsDashboard } from "@/lib/data/purchase-requests";

export default async function AdminPage() {
  const [metrics, requestMetrics] = await Promise.all([
    getAdminUsageMetrics(),
    getAdminRequestsDashboard(),
  ]);
  const { summary } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Panel</h1>
          <p className="text-muted-foreground">
            Estado operativo del catalogo, compradores y pedidos recibidos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/metricas">Ver metricas</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pedidos">Ver pedidos</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Productos activos" value={summary.productsActive} />
        <MetricCard label="Compradores activos" value={summary.buyersActive} />
        <MetricCard label="Pedidos pendientes" value={summary.pendingRequests} />
        <MetricCard
          label="Total pendiente estimado"
          value={`$${summary.pendingEstimatedTotal}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="En revision" value={summary.inReviewRequests} />
        <MetricCard label="Contactados" value={summary.contactedRequests} />
        <MetricCard label="Concretados" value={summary.concretedRequests} />
        <MetricCard label="No concretados" value={summary.notConcretedRequests} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Productos mas vistos</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topViewedProducts.length === 0 ? (
              <EmptyState text="Todavia no hay vistas registradas." />
            ) : (
              <CompactRows
                rows={metrics.topViewedProducts.slice(0, 5).map((item) => ({
                  label: item.productName,
                  value: `${item.count} vistas`,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos mas solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topRequestedProducts.length === 0 ? (
              <EmptyState text="Todavia no hay productos en pedidos." />
            ) : (
              <CompactRows
                rows={metrics.topRequestedProducts.slice(0, 5).map((item) => ({
                  label: item.productName,
                  value: `${item.quantity} unidades`,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busquedas frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.frequentSearches.length === 0 ? (
              <EmptyState text="Todavia no hay busquedas registradas." />
            ) : (
              <CompactRows
                rows={metrics.frequentSearches.slice(0, 5).map((item) => ({
                  label: item.query,
                  value: `${item.count} veces`,
                }))}
              />
            )}
          </CardContent>
        </Card>
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
            <EmptyState text="Todavia no hay pedidos recibidos." />
          ) : (
            <div className="overflow-x-auto">
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
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Actividad reciente</CardTitle>
          <Badge variant="secondary">Tracking</Badge>
        </CardHeader>
        <CardContent>
          {metrics.recentActivity.length === 0 ? (
            <EmptyState text="Todavia no hay actividad reciente registrada." />
          ) : (
            <CompactRows
              rows={metrics.recentActivity.slice(0, 6).map((item) => ({
                label: item.label,
                detail: item.detail,
                value: item.createdAt.toLocaleDateString("es-AR"),
              }))}
            />
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

function CompactRows({
  rows,
}: {
  rows: Array<{ label: string; detail?: string; value: string }>;
}) {
  return (
    <div className="divide-y rounded-md border">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{row.label}</div>
            {row.detail ? (
              <div className="truncate text-xs text-muted-foreground">{row.detail}</div>
            ) : null}
          </div>
          <div className="whitespace-nowrap font-mono text-muted-foreground">
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
