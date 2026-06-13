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
