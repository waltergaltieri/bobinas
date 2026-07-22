# Bobinas

Sistema web para catalogo publico de repuestos automotores y portal privado de
compradores autorizados. No es ecommerce tradicional: no hay checkout, no hay
pago online y los pedidos son solicitudes revisadas manualmente.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL
- Drizzle ORM
- Cloudinary
- Zod
- React Hook Form

## Requisitos

- Node.js 20.9 o superior
- npm
- Proyecto Supabase
- Cuenta Cloudinary

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` usando `.env.example` como base.

Variables requeridas:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Supabase recomienda las claves nuevas `sb_publishable_*` y `sb_secret_*`.
El proyecto soporta ambos estilos:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEY`

Nunca uses claves privadas con prefijo `NEXT_PUBLIC_`.

3. Levantar la app:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Supabase

1. Crear un proyecto en Supabase.
2. Copiar `NEXT_PUBLIC_SUPABASE_URL`.
3. Copiar la clave publica (`anon` legacy o `publishable` nueva).
4. Copiar la clave privada (`service_role` legacy o `secret` nueva).
5. Copiar el connection string de Postgres en `DATABASE_URL`.

El frontend no consulta tablas directamente desde Supabase. La app lee y escribe
datos desde el servidor usando Drizzle, para controlar que el publico no reciba
precios.

### Conexion real para staging

1. Completar `.env.local` con las variables reales.
2. Confirmar que `DATABASE_URL` apunte a la base del proyecto Supabase correcto.
3. Aplicar migraciones:

```bash
npm run db:migrate
```

4. Cargar datos iniciales controlados:

```bash
npm run db:seed
```

5. Verificar tablas, datos base y conexion:

```bash
npm run db:verify
```

Si `DATABASE_URL` existe, la app debe leer DB real y no datos demo. El fallback
demo queda reservado para desarrollo sin base configurada.

## Base de datos

Generar migraciones si cambia `src/db/schema.ts`:

```bash
npm run db:generate
```

Aplicar migraciones a la base configurada en `DATABASE_URL`:

```bash
npm run db:migrate
```

Alternativa para desarrollo, empujando el schema directo:

```bash
npm run db:push
```

Cargar datos iniciales:

```bash
npm run db:seed
```

Verificar que las tablas existan y que haya datos base:

```bash
npm run db:verify
```

La migracion `0001_hardening_rls_api_access.sql` habilita RLS y revoca acceso
directo a tablas desde los roles `anon` y `authenticated`. Esto evita que la
Data API de Supabase exponga columnas como `price`. El servidor sigue usando
la conexion Postgres de `DATABASE_URL`.

## Primer ADMIN

No existe registro publico ni autoconversion a admin.

1. Crear el usuario en Supabase Auth desde el dashboard:
   Auth > Users > Add user.
2. Copiar el `User UID`.
3. Agregar estas variables en `.env.local`:

```env
FIRST_ADMIN_AUTH_USER_ID=
FIRST_ADMIN_EMAIL=
FIRST_ADMIN_NAME=
FIRST_ADMIN_COMPANY_NAME=
```

4. Vincular el usuario Auth con un profile ADMIN:

```bash
npm run admin:create
```

El script hace upsert por `auth_user_id` y fuerza `role = ADMIN`.

Despues de ejecutar el script, validar login real y acceso a:

- `/admin`
- `/admin/productos`
- `/admin/compradores`
- `/admin/pedidos`
- `/admin/metricas`

## Primer BUYER

1. Iniciar sesion como ADMIN.
2. Entrar a `/admin/compradores`.
3. Crear un comprador activo con email real de prueba.
4. Usar la accion de reset/cambio de clave para que Supabase Auth envie el
   correo correspondiente.
5. Iniciar sesion como BUYER y validar:

- Puede ver precios en catalogo privado.
- Puede armar una lista de pedido.
- Puede modificar cantidades.
- Puede enviar una solicitud de pedido.
- Puede entrar a `/mi-pedido` y `/mis-pedidos`.
- No puede acceder a `/admin`.

## Cloudinary

1. Crear una cuenta Cloudinary.
2. Copiar desde Dashboard:
   - Cloud name
   - API key
   - API secret
3. Completar:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

La ruta `POST /api/admin/cloudinary/upload`:

- Requiere rol ADMIN.
- Rechaza usuarios publicos o BUYER.
- Acepta JPG, PNG y WebP.
- Limita cada archivo a 5 MB.
- Devuelve `url` y `publicId`.

Validaciones recomendadas en staging:

- Subir imagen de producto.
- Subir imagen de categoria.
- Subir imagen de slide de home.
- Subir imagen de popup.
- Confirmar preview y visualizacion publica/admin.
- Confirmar rechazo de formatos no permitidos.
- Confirmar rechazo de archivos mayores a 5 MB.

## Importacion inicial DAREF

El snapshot versionado en
`data/imports/daref/catalogo-daref-maestro.json` contiene 422 productos de las
categorias Inducidos, Rotores y Estatores. La importacion crea tambien sus
caracteristicas y opciones normalizadas.

Simulacion de solo lectura con la conexion PostgreSQL:

```bash
npm run catalog:import:daref
```

Carga real, con confirmacion explicita:

```bash
npm run catalog:import:daref -- apply DAREF-422
```

Si la clave de servicio de Supabase esta vigente pero `DATABASE_URL` no lo
esta, se puede usar el transporte administrativo de la Data API:

```bash
npm run catalog:import:daref -- apply DAREF-422 supabase
```

Ambos transportes son idempotentes y protegen los productos que ya fueron
revisados. Todo producto importado queda:

- inactivo;
- con precio 0 y stock por pedido;
- en estado de revision `PENDING`;
- vinculado al lote y URL de origen;
- impedido de activarse hasta estar `APPROVED`, tener precio positivo y al
  menos una imagen.

Los reportes y respaldos se escriben en `backups/catalog-imports/` y no se
versionan. Un fallo individual de imagen no publica el producto ni interrumpe
la carga de sus datos; queda registrado en el reporte para su revision.

## Vercel staging

Antes de crear un preview/staging en Vercel:

1. Ejecutar build local:

```bash
npm run build
```

2. Configurar estas variables en el proyecto Vercel:

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

3. Usar en `NEXT_PUBLIC_SITE_URL` la URL real del preview/staging.
4. No configurar claves privadas con prefijo `NEXT_PUBLIC_`.
5. Revisar que emails de Supabase Auth permitan redireccionar a la URL de
   staging.

## QA staging

PUBLIC:

- Home carga.
- Catalogo carga.
- Busqueda y filtros funcionan.
- Ficha de producto carga sin precio.
- No aparece accion privada de pedido.
- El HTML publico no contiene precio.

BUYER:

- Login funciona.
- Catalogo muestra precios.
- Puede agregar productos a la lista de pedido.
- Puede modificar cantidades.
- Puede enviar una solicitud.
- Puede ver historial propio.
- No puede entrar a admin.

ADMIN:

- Login funciona.
- Dashboard carga.
- Productos, categorias, caracteristicas y compradores cargan.
- Pedidos recibidos cargan.
- Puede cambiar estado, agregar nota interna y marcar resultado comercial.
- Metricas cargan y registran actividad real.
- Upload a Cloudinary funciona solo con rol ADMIN.

Seguridad:

- `.env.local` no aparece en Git.
- No hay secrets versionados.
- `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEY` solo se usan server-side.
- Notas internas no se muestran al BUYER.
- Metricas no exponen datos sensibles innecesarios.
- El fallback demo no se mezcla con DB real.

## Scripts

```bash
npm run dev        # servidor local
npm run build      # build productivo
npm run lint       # eslint
npm test           # vitest
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
npm run db:verify
npm run admin:create
npm run catalog:import:daref
```

## Reglas criticas

- El publico no ve precios.
- BUYER y ADMIN pueden ver precios.
- Los pedidos son solicitudes, no ventas automaticas.
- No usar lenguaje de checkout, pago online o compra automatica.
- Las caracteristicas tecnicas deben estar normalizadas.
- Las imagenes viven en Cloudinary; la DB guarda URLs/public IDs.

## Verificacion recomendada

Antes de avanzar con nuevas funcionalidades:

```bash
npm test
npm run lint
npm run build
npm run db:generate
```

Si hay `DATABASE_URL` real configurado:

```bash
npm run db:migrate
npm run db:seed
npm run db:verify
```
