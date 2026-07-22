# Simplificación de Stock Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ocultar la complejidad técnica del stock y comunicar que la disponibilidad de todo producto activo se confirma al revisar la solicitud de pedido.

**Architecture:** La base de datos conserva el enum y la cantidad actuales. La interfaz administrativa envía esos valores como campos ocultos —`ON_REQUEST`/`0` para altas y los valores existentes para ediciones—, mientras que las vistas humanas usan una única leyenda compartida y dejan de ofrecer filtros o columnas basados en estados internos.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Testing Library y Vitest.

---

### Task 1: Simplificar el formulario administrativo

**Files:**
- Create: `src/components/admin/product-fields.test.tsx`
- Modify: `src/components/admin/product-fields.tsx`

**Step 1: Write the failing tests**

Crear pruebas que rendericen `ProductFields` sin producto y con un `AdminProduct` existente. Verificar:

```tsx
expect(screen.getByText("Disponibilidad a confirmar")).toBeTruthy();
expect(container.querySelector('select[name="stockMode"]')).toBeNull();
expect(container.querySelector('input[name="stockQuantity"][type="number"]')).toBeNull();
expect(container.querySelector('input[name="stockMode"]')).toHaveValue("ON_REQUEST");
expect(container.querySelector('input[name="stockQuantity"]')).toHaveValue("0");
```

Para la edición, verificar que los campos ocultos conservan `product.stockMode` y `product.stockQuantity`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/admin/product-fields.test.tsx`

Expected: FAIL porque todavía existe el selector técnico y no está el mensaje explicativo.

**Step 3: Write minimal implementation**

Reemplazar el selector y el campo numérico por:

```tsx
<input type="hidden" name="stockMode" value={product?.stockMode ?? "ON_REQUEST"} />
<input type="hidden" name="stockQuantity" value={product?.stockQuantity ?? 0} />
```

Agregar junto al precio un bloque informativo con el título “Disponibilidad a confirmar” y una explicación que indique que los compradores pueden incluir el producto en una solicitud y que el dueño confirma la disponibilidad al revisarla.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/admin/product-fields.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/admin/product-fields.tsx src/components/admin/product-fields.test.tsx
git commit -m "Simplificar configuracion de stock en productos"
```

### Task 2: Retirar stock técnico del listado administrativo

**Files:**
- Modify: `src/components/admin/admin-product-list.test.tsx`
- Modify: `src/components/admin/admin-product-list.tsx`
- Modify: `src/app/admin/productos/page.tsx`

**Step 1: Write the failing test**

Ampliar la prueba de la vista en lista:

```tsx
expect(screen.queryByRole("columnheader", { name: "Stock" })).toBeNull();
expect(screen.queryByText("ON_REQUEST")).toBeNull();
```

Ampliar la prueba de tarjetas para verificar que tampoco aparece `ON_REQUEST`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/admin/admin-product-list.test.tsx`

Expected: FAIL porque la tabla y las tarjetas todavía muestran el estado interno.

**Step 3: Write minimal implementation**

- Eliminar la columna “Stock” de la tabla y el bloque de cantidad.
- Eliminar el metadato “Stock” de las tarjetas y reajustar la grilla a categoría/precio.
- Retirar `stockMode` de `AdminProductsPageProps`, de la llamada a `getAdminProducts` y del formulario de filtros.
- Cambiar la descripción de la página por lenguaje operativo sin “stock”.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/admin/admin-product-list.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/admin/admin-product-list.tsx src/components/admin/admin-product-list.test.tsx src/app/admin/productos/page.tsx
git commit -m "Ocultar estados tecnicos de stock en administracion"
```

### Task 3: Unificar el mensaje de disponibilidad para compradores

**Files:**
- Create: `src/lib/catalog/availability.ts`
- Create: `src/components/catalog/product-card.test.tsx`
- Modify: `src/components/catalog/product-card.tsx`
- Modify: `src/app/(public)/productos/[slug]/page.tsx`

**Step 1: Write the failing test**

Renderizar `ProductCard` con un producto privado cuyo `stockMode` sea `AVAILABLE` y verificar:

```tsx
expect(screen.getByText("Disponibilidad a confirmar")).toBeTruthy();
expect(screen.queryByText(/AVAILABLE/)).toBeNull();
expect(screen.getByRole("button", { name: /Agregar al pedido/ })).toBeTruthy();
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/catalog/product-card.test.tsx`

Expected: FAIL porque la tarjeta todavía imprime `Stock: AVAILABLE`.

**Step 3: Write minimal implementation**

Crear la constante compartida:

```ts
export const PRODUCT_AVAILABILITY_LABEL = "Disponibilidad a confirmar";
```

Usarla en la tarjeta y en el detalle privado del producto, sustituyendo el valor de `stockMode`. Mantener sin cambios el botón “Agregar al pedido”.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/catalog/product-card.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/catalog/availability.ts src/components/catalog/product-card.tsx src/components/catalog/product-card.test.tsx "src/app/(public)/productos/[slug]/page.tsx"
git commit -m "Mostrar disponibilidad sujeta a confirmacion"
```

### Task 4: Verificación integral

**Files:**
- Modify only if verification reveals a regression in files changed by this plan.

**Step 1: Run focused tests**

Run: `npm test -- src/components/admin/product-fields.test.tsx src/components/admin/admin-product-list.test.tsx src/components/catalog/product-card.test.tsx src/lib/data/product-presenter.test.ts`

Expected: todos los archivos y pruebas pasan.

**Step 2: Run the complete test suite**

Run: `npm test`

Expected: exit code 0, sin pruebas fallidas.

**Step 3: Run lint**

Run: `npm run lint`

Expected: exit code 0, sin errores.

**Step 4: Run production build**

Run: `npm run build`

Expected: exit code 0.

**Step 5: Inspect scope**

Run: `git status --short` and `git diff --check`

Expected: sin errores de whitespace; los cambios previos del usuario permanecen intactos.
