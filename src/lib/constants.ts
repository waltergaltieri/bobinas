export const APP_NAME = "Bobinas";

export const forbiddenCommerceTerms = [
  "checkout",
  "pagar",
  "comprar ahora",
] as const;

export const publicNavItems = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const adminNavItems = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/caracteristicas", label: "Caracteristicas" },
  { href: "/admin/compradores", label: "Compradores" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/popup", label: "Popup" },
  { href: "/admin/configuracion", label: "Configuracion" },
] as const;
