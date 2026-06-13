import Link from "next/link";

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
import {
  getCommercialResultLabel,
  getRequestStatusLabel,
} from "@/lib/purchase-requests/admin-core";

export default async function AdminMetricsPage() {
  const metrics = await getAdminUsageMetrics();
  const { summary } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin / Metricas</p>
          <h1 className="text-3xl font-semibold">Metricas</h1>
          <p className="text-muted-foreground">
            Lectura operativa de uso, busquedas y pedidos recibidos.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Volver al panel</Link>
        </Button>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.requestStatusCounts.length === 0 ? (
              <EmptyState text="Todavia no hay pedidos para agrupar." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {metrics.requestStatusCounts.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{getRequestStatusLabel(item.status)}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado comercial</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.saleResultCounts.length === 0 ? (
              <EmptyState text="Todavia no hay resultados para agrupar." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {metrics.saleResultCounts.map((item) => (
                  <div
                    key={item.result}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">
                      {getCommercialResultLabel(item.result)}
                    </span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MetricTable
          title="Productos mas vistos"
          emptyText="Todavia no hay vistas registradas."
          headers={["Producto", "Vistas"]}
          rows={metrics.topViewedProducts.map((item) => [
            item.productName,
            String(item.count),
          ])}
        />

        <MetricTable
          title="Productos mas solicitados"
          emptyText="Todavia no hay productos solicitados."
          headers={["Producto", "Unidades"]}
          rows={metrics.topRequestedProducts.map((item) => [
            item.productName,
            String(item.quantity),
          ])}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MetricTable
          title="Busquedas frecuentes"
          emptyText="Todavia no hay busquedas registradas."
          headers={["Busqueda", "Veces", "Promedio resultados"]}
          rows={metrics.frequentSearches.map((item) => [
            item.query,
            String(item.count),
            item.averageResults.toFixed(1),
          ])}
        />

        <MetricTable
          title="Actividad reciente"
          emptyText="Todavia no hay actividad reciente registrada."
          headers={["Evento", "Detalle", "Fecha"]}
          rows={metrics.recentActivity.map((item) => [
            item.label,
            item.detail,
            item.createdAt.toLocaleString("es-AR"),
          ])}
        />
      </div>
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

function MetricTable({
  title,
  emptyText,
  headers,
  rows,
}: {
  title: string;
  emptyText: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState text={emptyText} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.join("-")}>
                    {row.map((cell, index) => (
                      <TableCell
                        key={`${cell}-${index}`}
                        className={index > 0 ? "whitespace-nowrap" : undefined}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
