import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import {
  clearRequestListAction,
  removeRequestItemAction,
  updateRequestItemQuantityAction,
} from "@/app/actions/purchase-requests";
import { RequestSubmitForm } from "@/components/buyer/request-submit-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/session";
import { getActiveRequestList } from "@/lib/data/purchase-requests";

type MyRequestPageProps = {
  searchParams: Promise<{ mensaje?: string }>;
};

const messages: Record<string, string> = {
  "producto-agregado": "Producto agregado al pedido.",
  "cantidad-actualizada": "Cantidad actualizada.",
  "cantidad-invalida": "La cantidad ingresada no es valida.",
  "producto-eliminado": "Producto eliminado.",
  "lista-vaciada": "Lista de pedido vaciada.",
  "producto-no-disponible": "El producto no esta disponible para pedido.",
};

export default async function MyRequestPage({ searchParams }: MyRequestPageProps) {
  const [{ mensaje }, profile] = await Promise.all([
    searchParams,
    getCurrentProfile(),
  ]);
  const list = await getActiveRequestList(profile);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Mi pedido</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Revisá productos, cantidades y observaciones antes de enviar la
            solicitud para revisión comercial.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/productos">Seguir viendo productos</Link>
        </Button>
      </div>

      {mensaje && messages[mensaje] ? (
        <Alert className="mb-6">
          <AlertDescription>{messages[mensaje]}</AlertDescription>
        </Alert>
      ) : null}

      {list.items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Lista vacia</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground">
            <p>
              Todavia no agregaste productos al pedido. Entrá al catálogo y
              seleccioná los repuestos que querés consultar.
            </p>
            <Button asChild className="w-fit">
              <Link href="/productos">Ir al catálogo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Productos en la lista</CardTitle>
              <form action={clearRequestListAction}>
                <input type="hidden" name="redirectTo" value="/mi-pedido" />
                <Button type="submit" variant="outline" size="sm">
                  Vaciar lista
                </Button>
              </form>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Precio unitario</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-[11px] text-muted-foreground">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "Sin imagen"
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/productos/${item.slug}`}
                              className="font-medium hover:underline"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {item.internalCode}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[item.brand, item.model].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${item.unitPrice}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.quantity > 1 ? (
                            <QuantityForm
                              productId={item.productId}
                              quantity={item.quantity - 1}
                              label="Reducir cantidad"
                              icon="minus"
                            />
                          ) : (
                            <RemoveForm productId={item.productId} compact />
                          )}
                          <form
                            action={updateRequestItemQuantityAction}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="productId"
                              value={item.productId}
                            />
                            <input
                              type="hidden"
                              name="redirectTo"
                              value="/mi-pedido"
                            />
                            <Input
                              name="quantity"
                              type="number"
                              min={1}
                              defaultValue={item.quantity}
                              className="h-9 w-20"
                            />
                            <Button type="submit" variant="outline" size="sm">
                              Actualizar
                            </Button>
                          </form>
                          <QuantityForm
                            productId={item.productId}
                            quantity={item.quantity + 1}
                            label="Aumentar cantidad"
                            icon="plus"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${item.subtotal}</TableCell>
                      <TableCell className="text-right">
                        <RemoveForm productId={item.productId} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Productos</span>
                  <span>{list.totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total estimado
                  </span>
                  <span className="font-mono text-2xl font-semibold">
                    ${list.estimatedTotal}
                  </span>
                </div>
              </div>
              <RequestSubmitForm disabled={list.items.length === 0} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuantityForm({
  productId,
  quantity,
  label,
  icon,
}: {
  productId: string;
  quantity: number;
  label: string;
  icon: "minus" | "plus";
}) {
  const Icon = icon === "minus" ? Minus : Plus;

  return (
    <form action={updateRequestItemQuantityAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="redirectTo" value="/mi-pedido" />
      <Button type="submit" variant="outline" size="icon" aria-label={label}>
        <Icon className="h-4 w-4" />
      </Button>
    </form>
  );
}

function RemoveForm({
  productId,
  compact = false,
}: {
  productId: string;
  compact?: boolean;
}) {
  return (
    <form action={removeRequestItemAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="redirectTo" value="/mi-pedido" />
      <Button
        type="submit"
        variant="outline"
        size={compact ? "icon" : "sm"}
        aria-label="Eliminar producto"
      >
        <Trash2 className="h-4 w-4" />
        {compact ? null : "Eliminar"}
      </Button>
    </form>
  );
}
