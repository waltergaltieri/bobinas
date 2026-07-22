# Importación histórica del catálogo DAREF Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Importar 422 productos DAREF como fichas pendientes e inactivas, con imágenes en Cloudinary y características normalizadas para Inducidos, Rotores y Estatores.

**Architecture:** Un snapshot JSON auditable se genera desde el Excel con `@oai/artifact-tool`. Un importador CLI valida y planifica el lote, sube imágenes mediante un adaptador inyectable y aplica upserts protegidos en Drizzle/Postgres; el administrador incorpora estado de revisión y guardas de activación.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL/Supabase, Cloudinary Node SDK, Vitest, `@oai/artifact-tool` para la extracción del Excel.

---

### Task 1: Documentación y línea base aislada

**Files:**
- Create: `docs/plans/2026-07-22-importacion-catalogo-daref-design.md`
- Create: `docs/plans/2026-07-22-importacion-catalogo-daref.md`

**Step 1: Confirmar el worktree limpio**

Run: `git status --short`
Expected: solo los dos documentos nuevos.

**Step 2: Confirmar la línea base**

Run: `npm test`
Expected: 83 pruebas aprobadas.

**Step 3: Commit**

```bash
git add docs/plans/2026-07-22-importacion-catalogo-daref-design.md docs/plans/2026-07-22-importacion-catalogo-daref.md
git commit -m "docs: diseñar importacion del catalogo DAREF"
```

### Task 2: Estado de revisión y trazabilidad

**Files:**
- Modify: `src/db/schema.ts`
- Create: generated migration under `drizzle/`
- Modify: `src/scripts/verify-database.ts`
- Test: `src/lib/catalog/product-review.test.ts`
- Create: `src/lib/catalog/product-review.ts`

**Step 1: Write failing tests**

Cover that activation requires `APPROVED`, a positive price and at least one
Cloudinary image, while deactivation is always allowed.

**Step 2: Run tests to verify RED**

Run: `npm test -- src/lib/catalog/product-review.test.ts`
Expected: FAIL because the module does not exist.

**Step 3: Implement the minimal activation policy**

Create `canActivateProduct` returning a typed success or Spanish error.

**Step 4: Run tests to verify GREEN**

Run: `npm test -- src/lib/catalog/product-review.test.ts`
Expected: PASS.

**Step 5: Extend the schema**

Add `product_review_status`, review fields on products and
`product_import_metadata`. Generate a migration, enable RLS on the new table,
revoke `anon`/`authenticated`, and grant the required server role access.

**Step 6: Verify schema generation**

Run: `npm run db:generate`
Expected: a new migration and updated Drizzle metadata.

**Step 7: Commit**

```bash
git add src/db/schema.ts src/lib/catalog/product-review.ts src/lib/catalog/product-review.test.ts src/scripts/verify-database.ts drizzle
git commit -m "feat: agregar revision de productos importados"
```

### Task 3: Snapshot y transformación del catálogo

**Files:**
- Create: `data/imports/daref/catalogo-daref-maestro.json`
- Create: `src/lib/imports/daref/types.ts`
- Create: `src/lib/imports/daref/transform.ts`
- Test: `src/lib/imports/daref/transform.test.ts`

**Step 1: Extract the workbook with artifact-tool**

Generate a JSON snapshot containing products, attribute definitions and
observations. Verify 422 product rows and preserve codes as text.

**Step 2: Write failing transformation tests**

Cover required fields, category counts, deterministic slugs, attribute mapping,
split `/` and `;` values, invalid JSON rejection, duplicate code rejection and
all-products-pending defaults.

**Step 3: Run tests to verify RED**

Run: `npm test -- src/lib/imports/daref/transform.test.ts`
Expected: FAIL because transformation functions do not exist.

**Step 4: Implement minimal transformation functions**

Return a deterministic import plan with category, attribute, option, product,
value and source metadata records.

**Step 5: Run tests to verify GREEN**

Run: `npm test -- src/lib/imports/daref/transform.test.ts`
Expected: PASS with 422 transformed products and all category assertions.

**Step 6: Commit**

```bash
git add data/imports/daref src/lib/imports/daref
git commit -m "feat: transformar catalogo DAREF"
```

### Task 4: Importador idempotente y Cloudinary

**Files:**
- Create: `src/lib/imports/daref/importer.ts`
- Test: `src/lib/imports/daref/importer.test.ts`
- Create: `src/scripts/import-daref-catalog.ts`
- Modify: `package.json`

**Step 1: Write failing importer tests**

Use injected fake persistence and image storage adapters. Cover dry-run without
writes, conflict abort, pending record update, approved record skip, deterministic
Cloudinary public IDs and report aggregation.

**Step 2: Run tests to verify RED**

Run: `npm test -- src/lib/imports/daref/importer.test.ts`
Expected: FAIL because importer does not exist.

**Step 3: Implement the importer core**

Keep orchestration independent from concrete Drizzle and Cloudinary clients.
Limit image concurrency and continue after individual image failures.

**Step 4: Run tests to verify GREEN**

Run: `npm test -- src/lib/imports/daref/importer.test.ts`
Expected: PASS.

**Step 5: Implement concrete adapters and CLI**

Default to dry-run. Require both `--apply` and `--confirm DAREF-422` for writes.
Write backup and final reports under `output/catalog-imports/`.

**Step 6: Verify CLI help and dry-run**

Run: `npm run catalog:import:daref -- --help`
Expected: usage without connecting or writing.

**Step 7: Commit**

```bash
git add src/lib/imports/daref src/scripts/import-daref-catalog.ts package.json package-lock.json
git commit -m "feat: agregar importador idempotente DAREF"
```

### Task 5: Flujo administrativo de revisión

**Files:**
- Modify: `src/lib/validations/catalog.ts`
- Modify: `src/app/actions/catalog.ts`
- Modify: `src/lib/data/catalog.ts`
- Modify: `src/components/admin/product-fields.tsx`
- Modify: `src/components/admin/admin-product-list.tsx`
- Modify: `src/app/admin/productos/page.tsx`
- Test: relevant files under `src/**/*.test.ts(x)`

**Step 1: Write failing UI and action-policy tests**

Cover pending badge/filter and refusal to activate pending, zero-price or
image-less products.

**Step 2: Run targeted tests to verify RED**

Run: `npm test -- src/components/admin/admin-product-list.test.tsx src/lib/validations/catalog.test.ts src/lib/catalog/product-review.test.ts`
Expected: FAIL on the new expectations.

**Step 3: Implement review fields and server guards**

Expose review status/notes in admin, add filtering and enforce activation on the
server for both edit and quick toggle paths.

**Step 4: Run targeted tests to verify GREEN**

Run the same command.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app src/components/admin src/lib
git commit -m "feat: agregar cola de revision de productos"
```

### Task 6: Migración, simulación y carga real

**Files:**
- Runtime reports under `output/catalog-imports/` only

**Step 1: Verify local code**

Run: `npm test && npm run lint && npm run build`
Expected: all commands exit 0.

**Step 2: Verify current database before mutation**

Run: `npm run db:verify`
Expected: current database reachable; record baseline counts.

**Step 3: Apply migration**

Run: `npm run db:migrate`
Expected: migration applies once.

**Step 4: Verify migrated database**

Run: `npm run db:verify`
Expected: review fields and import metadata table are present with RLS enabled.

**Step 5: Run dry-run**

Run: `npm run catalog:import:daref`
Expected: 422 planned products, zero writes, zero code conflicts.

**Step 6: Run real import**

Run: `npm run catalog:import:daref -- --apply --confirm DAREF-422`
Expected: report records all database and image outcomes.

**Step 7: Verify imported state**

Run a read-only verification command checking unique codes, category counts,
pending/inactive/zero-price defaults, normalized values, Cloudinary hosts and
missing images.

**Step 8: Re-run dry-run for idempotency**

Run: `npm run catalog:import:daref`
Expected: no duplicates; existing pending source records are classified as safe
updates and reviewed records as protected skips.

### Task 7: Final verification and handoff

**Files:**
- Modify: `README.md`

**Step 1: Document operations**

Document dry-run, confirmed apply, safety rules, review workflow and report path.

**Step 2: Run full verification**

Run: `npm test && npm run lint && npm run build`
Expected: all exit 0.

**Step 3: Review git diff and runtime report**

Run: `git status --short && git diff --check`
Expected: only intended changes and no whitespace errors.

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: documentar carga historica DAREF"
```

## Resultado de la ejecucion del 22 de julio de 2026

La migracion se aplico en el proyecto Supabase `Bobinas`. Como la contraseña de
`DATABASE_URL` disponible estaba vencida, la carga uso el transporte
administrativo de Supabase con la clave de servicio. Este transporte conserva
las mismas validaciones e idempotencia; sus escrituras son reintentables y los
productos permanecen inactivos/PENDING durante todo el proceso.

Resultado verificado en produccion:

- 422 productos y 422 metadatos de origen;
- 221 Inducidos, 111 Rotores y 90 Estatores;
- 8 caracteristicas y 1.062 valores normalizados;
- 422 productos inactivos, PENDING, sin precio y sin stock disponible;
- 0 imagenes: las 422 URLs originales de Casa Medina respondieron HTTP 404.

Las URLs originales quedaron preservadas en `product_import_metadata` para
recuperacion o reemplazo durante la revision humana. La regla de activacion
impide publicar cualquier producto hasta que tenga una imagen valida.
