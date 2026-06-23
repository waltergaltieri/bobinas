import Link from "next/link";

import {
  createBuyerAction,
  toggleBuyerAction,
} from "@/app/actions/buyers";
import { BuyerFields } from "@/components/admin/buyer-fields";
import { EntityForm } from "@/components/admin/entity-form";
import { Badge } from "@/components/ui/badge";
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
import { getBuyers } from "@/lib/data/buyers";

type BuyersAdminPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuyersAdminPage({
  searchParams,
}: BuyersAdminPageProps) {
  const { q } = await searchParams;
  const buyers = await getBuyers({ search: q });

  return (
    <div className="grid gap-6 2xl:grid-cols-[430px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nuevo comprador</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityForm action={createBuyerAction} submitLabel="Crear comprador">
            <BuyerFields includePassword />
          </EntityForm>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Compradores</h1>
            <p className="text-muted-foreground">
              Alta manual, acceso privado, notas internas y pedidos asociados.
            </p>
          </div>
          <form className="flex gap-2">
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Nombre, empresa, email o telefono"
              className="w-[280px]"
            />
            <Button type="submit">Buscar</Button>
            {q ? (
              <Button asChild variant="outline">
                <Link href="/admin/compradores">Limpiar</Link>
              </Button>
            ) : null}
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado</CardTitle>
          </CardHeader>
          <CardContent>
            {buyers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No hay compradores que coincidan con la busqueda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>CUIT</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>
                        <div className="font-medium">{buyer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {buyer.companyName ?? "Sin empresa"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{buyer.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {buyer.phone ?? "Sin telefono"}
                        </div>
                      </TableCell>
                      <TableCell>{buyer.cuit ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={buyer.isActive ? "default" : "secondary"}>
                          {buyer.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/compradores/${buyer.id}`}>
                              Ver detalle
                            </Link>
                          </Button>
                          <form action={toggleBuyerAction}>
                            <input type="hidden" name="id" value={buyer.id} />
                            <input
                              type="hidden"
                              name="isActive"
                              value={String(buyer.isActive)}
                            />
                            <Button type="submit" variant="outline" size="sm">
                              {buyer.isActive ? "Desactivar" : "Activar"}
                            </Button>
                          </form>
                        </div>
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
  );
}
