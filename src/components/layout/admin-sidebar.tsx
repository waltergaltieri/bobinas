import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  Gauge,
  Home,
  Image,
  ListFilter,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const icons = {
  "/admin": Gauge,
  "/admin/productos": Boxes,
  "/admin/categorias": ListFilter,
  "/admin/caracteristicas": SlidersHorizontal,
  "/admin/compradores": Users,
  "/admin/pedidos": ClipboardList,
  "/admin/home": Home,
  "/admin/popup": Image,
  "/admin/configuracion": Settings,
};

const items = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/caracteristicas", label: "Caracteristicas" },
  { href: "/admin/compradores", label: "Compradores" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/popup", label: "Popup" },
  { href: "/admin/configuracion", label: "Configuracion" },
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-svh w-64 shrink-0 border-r bg-background px-3 py-4 lg:block">
      <Link href="/admin" className="flex items-center gap-3 px-2 pb-4 font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          B
        </span>
        Admin Bobinas
      </Link>
      <Separator />
      <nav className="mt-4 grid gap-1">
        {items.map((item) => {
          const Icon = icons[item.href as keyof typeof icons];
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="justify-start gap-3"
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
