# Core del Sistema — Catálogo de Repuestos con Pedidos Privados

## 1. Resumen del proyecto

Este sistema será un catálogo web avanzado para una empresa que vende bobinas, inducidos y repuestos relacionados con el rubro automotor.

La plataforma no funcionará como una tienda online tradicional. No tendrá pago online ni proceso de compra automático. Su propósito principal será mostrar productos, permitir búsquedas y filtros precisos, y habilitar a compradores registrados a armar pedidos privados que luego serán gestionados manualmente por el administrador.

El sistema tendrá dos comportamientos principales:

1. **Modo catálogo público**: cualquier visitante puede ver productos, categorías, imágenes y características técnicas, pero no puede ver precios ni armar pedidos.
2. **Modo comprador privado**: usuarios creados por el administrador pueden iniciar sesión, ver precios, armar pedidos y enviarlos al administrador para su revisión.

La operación comercial final ocurre fuera del sistema. Luego, el administrador podrá marcar si el pedido terminó en una venta concretada o no concretada.

---

## 2. Propósito del sistema

El objetivo es crear una herramienta que permita:

- Digitalizar el catálogo de productos del cliente.
- Ordenar productos por categorías, marcas, modelos, códigos y características técnicas.
- Facilitar que los compradores encuentren repuestos usando filtros.
- Ocultar precios al público general.
- Mostrar precios solo a compradores autorizados.
- Permitir que compradores registrados armen pedidos.
- Centralizar pedidos recibidos en un panel administrativo.
- Permitir que el administrador marque si cada pedido se concretó o no.
- Darle al cliente control sobre productos, categorías, características, imágenes, popup, carrusel y usuarios.
- Evitar depender de una pasarela de pago.
- Mantener bajos los costos usando tecnologías con planes gratuitos.

---

## 3. Concepto comercial

El sistema no debe presentarse como un e-commerce clásico. Debe comunicarse como:

> Un catálogo comercial avanzado con acceso privado para compradores y gestión interna de pedidos.

Lenguaje recomendado:

- Catálogo
- Pedido
- Solicitud de pedido
- Lista de pedido
- Comprador autorizado
- Pedido pendiente
- Pedido contactado
- Venta concretada
- Venta no concretada

Lenguaje que se debe evitar:

- Checkout
- Comprar ahora
- Pagar
- Pasarela de pago
- Orden pagada
- Venta finalizada automáticamente

---

## 4. Tecnologías recomendadas

### Frontend y backend

- **Next.js**
- **TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui**

Next.js permitirá construir tanto el sitio público como el panel administrativo dentro de una misma aplicación. Se podrá usar Server Components, Server Actions o Route Handlers según convenga.

---

### Base de datos y autenticación

- **Supabase Free**
- **Supabase Auth**
- **Supabase PostgreSQL**

Supabase será usado para:

- Login del administrador.
- Login de compradores.
- Base de datos relacional.
- Productos.
- Categorías.
- Características.
- Usuarios.
- Pedidos.
- Métricas básicas.

---

### Imágenes

- **Cloudinary Free**

Cloudinary será usado para:

- Imágenes de productos.
- Imágenes de categorías.
- Imágenes del carrusel.
- Imagen del popup.
- Logo y assets visuales.

La base de datos no debe guardar archivos binarios. Solo debe guardar URLs, public IDs y metadatos de las imágenes.

Ejemplo:

```txt
product_images
- id
- product_id
- url
- public_id
- alt_text
- sort_order
```

---

### ORM y validaciones

- **Drizzle ORM**
- **Zod**
- **React Hook Form**

Drizzle se usará para definir y consultar la base de datos.  
Zod se usará para validar datos de formularios y acciones.  
React Hook Form se usará para formularios del panel administrativo.

---

### Deploy

- **Vercel**

Vercel será usado para desplegar la aplicación Next.js.

---

## 5. Arquitectura general

```txt
Usuario público
     ↓
Sitio web Next.js
     ↓
Catálogo sin precios
     ↓
Consulta / WhatsApp


Comprador autorizado
     ↓
Login con Supabase Auth
     ↓
Catálogo con precios
     ↓
Lista de pedido
     ↓
Pedido enviado al administrador


Administrador
     ↓
Login con Supabase Auth
     ↓
Panel admin
     ↓
Gestiona productos, categorías, características, compradores, pedidos y contenido visual
```

---

## 6. Tipos de usuarios

### 6.1 Visitante público

Usuario que entra sin iniciar sesión.

Puede:

- Ver la home.
- Ver productos.
- Buscar productos.
- Filtrar productos.
- Ver detalle de producto.
- Ver categorías.
- Contactar por WhatsApp o formulario.

No puede:

- Ver precios.
- Agregar productos a pedido.
- Confirmar pedidos.
- Acceder al panel privado.
- Registrarse libremente.

---

### 6.2 Comprador autorizado

Usuario creado manualmente por el administrador.

Puede:

- Iniciar sesión.
- Ver precios.
- Ver disponibilidad de productos.
- Agregar productos a una lista de pedido.
- Modificar cantidades.
- Enviar pedido al administrador.
- Ver historial de pedidos propios.
- Ver estado de sus pedidos, si se implementa en la primera versión.

No puede:

- Crear productos.
- Editar categorías.
- Ver pedidos de otros compradores.
- Modificar precios.
- Acceder al panel administrativo.

---

### 6.3 Administrador

Usuario principal del cliente.

Puede:

- Acceder al panel admin.
- Crear, editar y eliminar productos.
- Crear y editar categorías.
- Crear y editar características técnicas.
- Administrar compradores.
- Ver pedidos recibidos.
- Cambiar estado de pedidos.
- Marcar si un pedido terminó en venta concretada o no concretada.
- Editar imágenes del carrusel.
- Configurar popup de la home.
- Ver métricas.
- Configurar datos generales del sistema.

---

## 7. Pantallas públicas

### 7.1 Home

Ruta sugerida:

```txt
/
```

Debe incluir:

- Header con logo, navegación y botón de login.
- Carrusel principal editable desde admin.
- Categorías destacadas.
- Productos destacados.
- Buscador rápido.
- Sección institucional breve.
- Botón de WhatsApp.
- Popup configurable, si está activo.
- Footer con datos del negocio.

---

### 7.2 Listado de productos

Ruta sugerida:

```txt
/productos
```

Debe incluir:

- Buscador por texto.
- Filtros por categoría.
- Filtros por marca.
- Filtros por modelo.
- Filtros por características técnicas.
- Ordenamiento.
- Paginación.
- Cards de productos.
- Vista responsive.

Para visitantes públicos:

- No mostrar precio.
- No mostrar botón de agregar al pedido.
- Mostrar botón de consulta.

Para compradores logueados:

- Mostrar precio.
- Mostrar tipo de stock.
- Mostrar botón de agregar al pedido.

---

### 7.3 Detalle de producto

Ruta sugerida:

```txt
/productos/[slug]
```

Debe incluir:

- Galería de imágenes.
- Nombre del producto.
- Marca.
- Modelo.
- Código interno.
- Código OEM, si existe.
- Categoría.
- Descripción.
- Características técnicas.
- Productos relacionados.
- Botón de consulta para público.
- Precio y botón de pedido para compradores logueados.

---

### 7.4 Categorías

Ruta sugerida:

```txt
/categorias/[slug]
```

Debe mostrar productos filtrados por categoría.

---

### 7.5 Login

Ruta sugerida:

```txt
/login
```

Debe permitir acceso a:

- Administrador.
- Compradores autorizados.

No debe existir registro público libre, salvo que el cliente lo pida en una versión futura.

---

## 8. Pantallas del comprador

### 8.1 Catálogo privado

El comprador verá el mismo catálogo que el público, pero con información adicional:

- Precio.
- Stock o disponibilidad.
- Botón “Agregar al pedido”.

---

### 8.2 Lista de pedido

Ruta sugerida:

```txt
/mi-pedido
```

Debe incluir:

- Productos agregados.
- Imagen miniatura.
- Nombre.
- Código.
- Precio unitario.
- Cantidad.
- Subtotal.
- Total estimado.
- Campo de observaciones.
- Botón para enviar pedido.

El texto debe aclarar que el pedido queda sujeto a revisión y confirmación manual.

Mensaje sugerido:

> Al enviar este pedido, el equipo revisará disponibilidad, precios y condiciones para luego contactarte y confirmar la operación.

---

### 8.3 Historial de pedidos

Ruta sugerida:

```txt
/mis-pedidos
```

Debe incluir:

- Número de pedido.
- Fecha.
- Estado.
- Total estimado.
- Detalle.

Esta pantalla puede quedar para una segunda fase si se quiere reducir alcance inicial.

---

## 9. Pantallas del administrador

### 9.1 Dashboard

Ruta sugerida:

```txt
/admin
```

Debe mostrar:

- Productos activos.
- Compradores registrados.
- Pedidos pendientes.
- Pedidos contactados.
- Pedidos concretados.
- Pedidos no concretados.
- Productos más vistos.
- Búsquedas recientes o frecuentes.

---

### 9.2 Productos

Ruta sugerida:

```txt
/admin/productos
```

Funciones:

- Listar productos.
- Buscar productos.
- Filtrar por categoría, marca, estado y stock.
- Crear producto.
- Editar producto.
- Duplicar producto.
- Activar/desactivar producto.
- Eliminar producto, si corresponde.
- Gestionar imágenes.
- Asignar características.

Campos del producto:

```txt
- Nombre
- Slug
- Descripción corta
- Descripción larga
- Marca
- Modelo
- Código interno
- Código OEM
- Categoría principal
- Categorías secundarias
- Precio privado
- Tipo de stock
- Cantidad de stock
- Estado activo/inactivo
- Producto destacado
- Imágenes
- Características técnicas
```

---

### 9.3 Categorías

Ruta sugerida:

```txt
/admin/categorias
```

Funciones:

- Crear categoría.
- Editar categoría.
- Activar/desactivar categoría.
- Ordenar categorías.
- Subir imagen de categoría.
- Definir categoría padre, si se usan jerarquías.

Campos:

```txt
- Nombre
- Slug
- Descripción
- Imagen
- Categoría padre
- Orden
- Activa/inactiva
```

---

### 9.4 Características técnicas

Ruta sugerida:

```txt
/admin/caracteristicas
```

Las características son atributos normalizados usados para mostrar datos técnicos y crear filtros.

Ejemplos:

- Estrías
- Alto
- Ancho
- Largo
- Radio
- Diámetro
- Pines
- Voltaje
- Amperaje
- Tipo de encastre
- Aplicación
- Motor compatible

Campos:

```txt
- Nombre
- Slug
- Tipo de dato
- Unidad
- Usar como filtro
- Mostrar en ficha de producto
- Orden
```

Tipos de dato:

```txt
TEXT
NUMBER
BOOLEAN
SELECT
MULTISELECT
```

Ejemplo:

```txt
Característica: Estrías
Tipo: NUMBER
Unidad: ninguna
Usar como filtro: sí

Valor en producto:
Estrías = 10
```

Esto permite que el filtro funcione correctamente y evita valores duplicados o inconsistentes.

---

### 9.5 Compradores

Ruta sugerida:

```txt
/admin/compradores
```

Funciones:

- Crear comprador.
- Editar comprador.
- Activar/desactivar comprador.
- Resetear contraseña.
- Ver pedidos del comprador.
- Agregar notas internas.

Campos:

```txt
- Nombre
- Empresa
- Email
- Teléfono
- CUIT
- Dirección
- Estado
- Notas internas
```

---

### 9.6 Pedidos

Ruta sugerida:

```txt
/admin/pedidos
```

Funciones:

- Ver pedidos recibidos.
- Filtrar por estado.
- Ver detalle del pedido.
- Cambiar estado.
- Contactar al comprador.
- Marcar venta concretada.
- Marcar venta no concretada.
- Agregar notas internas.

Estados sugeridos:

```txt
PENDING        Pedido recibido
IN_REVIEW      En revisión
CONTACTED      Cliente contactado
CONFIRMED      Pedido confirmado
CANCELLED      Pedido cancelado
COMPLETED      Venta concretada
NOT_COMPLETED  Venta no concretada
```

Importante: el sistema registra pedidos. La venta es un resultado posterior marcado manualmente.

---

### 9.7 Home y carrusel

Ruta sugerida:

```txt
/admin/home
```

Funciones:

- Crear slide.
- Editar slide.
- Subir imagen.
- Cambiar orden.
- Activar/desactivar slide.
- Definir título, subtítulo, botón y enlace.

Campos:

```txt
- Imagen
- Título
- Subtítulo
- Texto del botón
- Link del botón
- Orden
- Activo/inactivo
```

---

### 9.8 Popup

Ruta sugerida:

```txt
/admin/popup
```

Funciones:

- Activar/desactivar popup.
- Subir imagen.
- Configurar título.
- Configurar texto.
- Configurar botón.
- Configurar link.
- Definir fecha de inicio.
- Definir fecha de fin.
- Mostrar una sola vez por usuario/navegador.

Campos:

```txt
- Activo
- Imagen
- Título
- Texto
- Texto del botón
- Link del botón
- Mostrar una sola vez
- Fecha de inicio
- Fecha de fin
```

---

### 9.9 Configuración general

Ruta sugerida:

```txt
/admin/configuracion
```

Funciones:

- Cambiar logo.
- Cambiar datos de contacto.
- Cambiar WhatsApp.
- Cambiar email.
- Cambiar dirección.
- Cambiar redes sociales.
- Cambiar datos SEO básicos.

---

## 10. Funcionalidades principales

### 10.1 Catálogo público

- Listado de productos.
- Filtros.
- Buscador.
- Detalle de producto.
- Productos relacionados.
- Consulta por WhatsApp.
- Sin precios visibles.

---

### 10.2 Catálogo privado

- Acceso con login.
- Precios visibles.
- Stock o disponibilidad visible.
- Lista de pedido.
- Confirmación de pedido.

---

### 10.3 Pedidos

El flujo del pedido será:

```txt
1. Comprador inicia sesión.
2. Busca productos.
3. Agrega productos a su lista.
4. Define cantidades.
5. Envía pedido.
6. El pedido queda como PENDING.
7. Admin revisa.
8. Admin contacta al comprador.
9. Admin marca resultado:
   - Venta concretada
   - Venta no concretada
```

---

### 10.4 Características y filtros

Las características deben ser normalizadas.

No se debe guardar información importante como texto libre.

Incorrecto:

```txt
"10 estrias"
"estria 10"
"10E"
"Diez estrías"
```

Correcto:

```txt
Atributo: Estrías
Tipo: NUMBER
Valor: 10
```

Esto permite filtros consistentes.

---

### 10.5 Imágenes

Las imágenes se subirán a Cloudinary.

Reglas recomendadas:

```txt
Productos:
- Formato preferido: WebP
- Ancho máximo: 1200 px
- Peso ideal: 150 KB a 500 KB

Carrusel:
- Ancho máximo: 1600 px
- Peso ideal: 300 KB a 700 KB

Popup:
- Ancho máximo: 1000 px
- Peso ideal: 150 KB a 400 KB
```

El sistema debería comprimir o validar imágenes antes de subirlas.

---

## 11. Modelo de datos inicial

### users / profiles

```txt
- id
- auth_user_id
- role: ADMIN | BUYER
- name
- company_name
- email
- phone
- cuit
- address
- is_active
- internal_notes
- created_at
- updated_at
```

---

### categories

```txt
- id
- name
- slug
- description
- image_url
- image_public_id
- parent_id
- sort_order
- is_active
- created_at
- updated_at
```

---

### products

```txt
- id
- name
- slug
- short_description
- description
- brand
- model
- internal_code
- oem_code
- main_category_id
- price
- stock_mode
- stock_quantity
- is_active
- is_featured
- created_at
- updated_at
```

Stock modes:

```txt
TRACKED
AVAILABLE
ON_REQUEST
OUT_OF_STOCK
HIDDEN
```

---

### product_categories

```txt
- product_id
- category_id
```

---

### product_images

```txt
- id
- product_id
- url
- public_id
- alt_text
- sort_order
- created_at
```

---

### attributes

```txt
- id
- name
- slug
- type
- unit
- is_filterable
- is_visible
- sort_order
- created_at
- updated_at
```

---

### attribute_options

```txt
- id
- attribute_id
- value
- sort_order
```

---

### product_attribute_values

```txt
- id
- product_id
- attribute_id
- value_text
- value_number
- value_boolean
- option_id
```

---

### purchase_requests

```txt
- id
- buyer_id
- status
- estimated_total
- buyer_notes
- admin_notes
- sale_result
- sale_result_notes
- created_at
- updated_at
- completed_at
```

Sale result:

```txt
UNKNOWN
CONCRETED
NOT_CONCRETED
```

---

### purchase_request_items

```txt
- id
- purchase_request_id
- product_id
- product_name_snapshot
- product_code_snapshot
- unit_price_snapshot
- quantity
- subtotal_snapshot
```

---

### home_slides

```txt
- id
- image_url
- image_public_id
- title
- subtitle
- button_text
- button_link
- sort_order
- is_active
- created_at
- updated_at
```

---

### popup_settings

```txt
- id
- is_active
- image_url
- image_public_id
- title
- text
- button_text
- button_link
- show_once
- starts_at
- ends_at
- updated_at
```

---

### product_views

```txt
- id
- product_id
- user_id
- session_id
- created_at
```

---

### search_logs

```txt
- id
- query
- user_id
- session_id
- results_count
- created_at
```

---

## 12. Permisos y seguridad

Reglas principales:

- Solo ADMIN puede entrar a `/admin`.
- Solo ADMIN puede crear productos, categorías, características y compradores.
- Solo ADMIN puede ver todos los pedidos.
- BUYER solo puede ver sus propios pedidos.
- Visitantes públicos solo pueden leer productos activos sin precio.
- Los precios solo se devuelven a usuarios autenticados con rol ADMIN o BUYER.
- Las imágenes pueden ser públicas.
- No debe existir endpoint público que exponga precios sin verificar sesión.

---

## 13. Reglas de negocio

1. El público no ve precios.
2. El público no puede armar pedidos.
3. El comprador logueado ve precios.
4. El comprador logueado puede armar pedidos.
5. Los pedidos no son ventas automáticas.
6. El admin define si un pedido terminó en venta concretada o no.
7. Las características técnicas deben estar normalizadas.
8. Las imágenes se guardan en Cloudinary, no en Supabase.
9. Supabase se usa para auth y base de datos.
10. El sistema debe poder crecer a futuro con listas de precios por comprador.

---

## 14. Futuras mejoras posibles

No incluir necesariamente en la primera versión, pero dejar preparada la arquitectura para:

- Listas de precios por cliente.
- Descuentos por comprador.
- Importación masiva desde Excel/CSV.
- Exportación de pedidos.
- Notificaciones por email.
- Notificaciones por WhatsApp.
- Historial completo para compradores.
- Productos privados por comprador.
- Integración con sistema de stock externo.
- Múltiples administradores.
- Roles internos adicionales.
- SEO avanzado.
- Blog o sección de novedades.
- Recomendaciones de productos relacionados.
- Modo multi-sucursal.

---

## 15. Fases sugeridas de desarrollo

### Fase 1 — Setup base

- Crear proyecto Next.js.
- Configurar Tailwind.
- Configurar shadcn/ui.
- Configurar Supabase.
- Configurar Drizzle.
- Crear tablas iniciales.
- Implementar login.
- Implementar roles ADMIN y BUYER.
- Proteger rutas.

---

### Fase 2 — Catálogo base

- Crear productos.
- Crear categorías.
- Crear listado público.
- Crear detalle de producto.
- Ocultar precios para público.
- Mostrar productos activos.

---

### Fase 3 — Características y filtros

- Crear CRUD de características.
- Crear asignación de características a productos.
- Crear filtros dinámicos.
- Asegurar que los filtros usen valores normalizados.

---

### Fase 4 — Admin completo de productos

- CRUD de productos.
- Carga de imágenes a Cloudinary.
- Precio privado.
- Stock.
- Productos destacados.
- Categorías secundarias.

---

### Fase 5 — Compradores y pedidos

- Crear compradores desde admin.
- Login comprador.
- Catálogo privado con precios.
- Lista de pedido.
- Confirmación de pedido.
- Panel admin de pedidos.

---

### Fase 6 — Home editable

- Carrusel editable.
- Categorías destacadas.
- Productos destacados.
- Popup configurable.

---

### Fase 7 — Métricas

- Registrar vistas de productos.
- Registrar búsquedas.
- Dashboard básico.
- Productos más consultados.
- Pedidos por estado.

---

### Fase 8 — Pulido visual y entrega

- Diseño responsive.
- Optimización de imágenes.
- SEO básico.
- Estados vacíos.
- Validaciones.
- Pruebas.
- Deploy final.

---

## 16. Prompt base para Codex

```txt
Estamos construyendo un sistema web para una empresa de repuestos automotores.

No es un e-commerce tradicional. Es un catálogo público con productos sin precio y un portal privado para compradores autorizados. Los compradores logueados pueden ver precios y armar solicitudes de pedido. No existe pasarela de pago. La venta real se concreta fuera del sistema y luego el administrador puede marcar si el pedido terminó en venta concretada o no concretada.

Stack:
- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL
- Drizzle ORM
- Cloudinary para imágenes
- Zod
- React Hook Form
- Vercel

Roles:
- PUBLIC: ve catálogo sin precios.
- BUYER: ve catálogo con precios y puede armar pedidos.
- ADMIN: gestiona productos, categorías, características, compradores, pedidos, carrusel, popup y métricas.

Reglas críticas:
- Nunca mostrar precios a usuarios públicos.
- No usar términos de checkout o compra online.
- Usar “pedido” o “solicitud de pedido”.
- Las características técnicas deben estar normalizadas para funcionar como filtros.
- Las imágenes se suben a Cloudinary y en la base solo se guardan URLs/public IDs.
- Los pedidos deben guardar snapshot del nombre, código y precio del producto al momento de enviarse.

Primero construir la base del sistema:
1. Estructura de carpetas.
2. Configuración de Supabase.
3. Configuración de Drizzle.
4. Modelo de datos inicial.
5. Auth con roles.
6. Layout público y layout admin.
7. Protección de rutas.
```

---

## 17. Definición corta del sistema

El sistema es un catálogo digital avanzado para repuestos automotores, con acceso público sin precios y acceso privado para compradores autorizados. Permite administrar productos, categorías, características técnicas filtrables, imágenes, pedidos, compradores y contenido visual del sitio. Su objetivo es facilitar la consulta y organización de productos, permitiendo que los compradores generen pedidos que luego el administrador gestiona manualmente hasta marcar si se concretaron o no como venta.
