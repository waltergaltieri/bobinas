import Link from "next/link";

import { CommercialResultBadge, RequestStatusBadge } from "@/components/admin/request-badges";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  purchaseRequestStatusEnum,
  saleResultEnum,
  type PurchaseRequestStatus,
  type SaleResult,
} from "@/db/schema";
import { getAdminPurchaseRequests } from "@/lib/data/purchase-requests";

type AdminRequestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRequestsPage({
  searchParams,
}: AdminRequestsPageProps) {
  const params = await searchParams;
  const allRequests = await getAdminPurchaseRequests();
  const requests = await getAdminPurchaseRequests({
    status: getStatus(getParam(params.status)),
    saleResult: getSaleResult(getParam(params.saleResult)),
    buyerId: getParam(params.buyerId),
    date: getParam(params.date),
    text: getParam(params.text),
  });
  const buyers = uniqueBuyers(allRequests);
  const hasFilters = ["status", "saleResult", "buyerId", "date", "text"].some(
    (key) => Boolean(getParam(params[key])),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Pedidos recibidos</h1>
        <p className="text-muted-foreground">
          Seguimiento comercial de solicitudes enviadas por compradores
          autorizados.
        </p>
      </div>

      {getParam(params.mensaje) === "datos-invalidos" ? (
        <Alert variant="destructive">
          <AlertDescription>No se pudo aplicar el cambio solicitado.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1.2fr_repeat(4,minmax(150px,1fr))_auto] lg:items-end">
            <div className="grid gap-2">
              <Label htmlFor="text">Texto</Label>
              <Input
                id="text"
                name="text"
                defaultValue={getParam(params.text)}
                placeholder="ID, comprador, empresa"
              />
            </div>
            <SelectFilter
              id="status"
              label="Estado"
              value={getParam(params.status)}
              options={purchaseRequestStatusEnum.enumValues}
              labels={statusLabels}
            />
            <SelectFilter
              id="saleResult"
              label="Resultado"
              value={getParam(params.saleResult)}
              options={saleResultEnum.enumValues}
              labels={resultLabels}
            />
            <div className="grid gap-2">
              <Label htmlFor="buyerId">Comprador</Label>
              <select
                id="buyerId"
                name="buyerId"
                defaultValue={getParam(params.buyerId) ?? ""}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" name="date" type="date" defaultValue={getParam(params.date)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Aplicar</Button>
              <Button asChild variant="outline">
                <Link href="/admin/pedidos">Limpiar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "No hay pedidos que coincidan con los filtros aplicados."
                : "Todavia no hay pedidos recibidos."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total estimado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">{request.id}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{request.buyerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.buyerCompanyName ?? "Sin empresa"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.buyerEmail}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.buyerPhone ?? "Sin telefono"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <CommercialResultBadge result={request.saleResult} />
                    </TableCell>
                    <TableCell>{request.itemCount}</TableCell>
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

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revision",
  CONTACTED: "Contactado",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Venta concretada",
  NOT_COMPLETED: "Venta no concretada",
};

const resultLabels: Record<string, string> = {
  UNKNOWN: "Sin definir",
  CONCRETED: "Concretada",
  NOT_CONCRETED: "No concretada",
};

function SelectFilter({
  id,
  label,
  value,
  options,
  labels,
}: {
  id: string;
  label: string;
  value?: string;
  options: readonly string[];
  labels: Record<string, string>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={id}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

function uniqueBuyers(
  requests: Awaited<ReturnType<typeof getAdminPurchaseRequests>>,
) {
  const buyers = new Map<string, string>();

  for (const request of requests) {
    buyers.set(
      request.buyerId,
      request.buyerCompanyName
        ? `${request.buyerName} - ${request.buyerCompanyName}`
        : request.buyerName,
    );
  }

  return [...buyers.entries()].map(([id, label]) => ({ id, label }));
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatus(value: string | undefined) {
  return purchaseRequestStatusEnum.enumValues.includes(
    value as PurchaseRequestStatus,
  )
    ? (value as PurchaseRequestStatus)
    : undefined;
}

function getSaleResult(value: string | undefined) {
  return saleResultEnum.enumValues.includes(value as SaleResult)
    ? (value as SaleResult)
    : undefined;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
