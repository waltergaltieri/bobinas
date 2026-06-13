# Admin Operativo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the day-to-day admin workflows for buyers, products, categories, attributes, images, stock, and editing without adding advanced metrics, real deploy, or final data loading.

**Architecture:** Keep the current Next.js App Router shape with Server Components for data pages and Server Actions for mutations. Add small domain/service modules where tests can cover validation, duplicate handling, fallback behavior, and product duplication without depending on a live database. Every admin mutation must call `requireRole(["ADMIN"])`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Supabase Auth, Cloudinary server SDK, Zod, Vitest, shadcn/ui primitives.

---

### Task 1: Domain Tests And Validation

**Files:**
- Create/modify tests under `src/lib/**`
- Modify validation files under `src/lib/validations/**`
- Modify domain helpers under `src/lib/data/**`

**Steps:**
1. Add failing tests for buyer validation, duplicate email normalization, product stock rules, duplicate product slug/code generation, category slug conflicts, and attribute type rules.
2. Run targeted Vitest tests and confirm they fail for missing behavior.
3. Implement minimal schemas/helpers to pass.
4. Run targeted tests again.

### Task 2: Buyers Admin

**Files:**
- Create `src/lib/data/buyers.ts`
- Create `src/lib/validations/buyers.ts`
- Create `src/app/actions/buyers.ts`
- Replace `src/app/admin/compradores/page.tsx`
- Add `src/app/admin/compradores/[id]/page.tsx`

**Steps:**
1. Implement list/search/detail/order-safe fallback from sample data.
2. Add create/update/toggle/reset-prep actions with ADMIN authorization.
3. Build dense admin table, form, empty states, clear errors, detail page and associated pedido list.

### Task 3: Products And Images

**Files:**
- Modify `src/lib/validations/catalog.ts`
- Modify `src/lib/data/catalog.ts`
- Modify `src/app/actions/catalog.ts`
- Replace/enhance `src/app/admin/productos/page.tsx`
- Create small admin form helpers under `src/components/admin/`

**Steps:**
1. Add search/filter support for admin product list.
2. Implement update, duplicate, soft delete/toggle, secondary categories, attributes, stock and featured handling.
3. Add image DB actions for add/update sort/delete/unlink and use existing Cloudinary upload route for real file upload.
4. Keep public catalog queries free of price.

### Task 4: Categories

**Files:**
- Modify `src/app/admin/categorias/page.tsx`
- Modify `src/app/actions/catalog.ts`
- Modify `src/lib/data/catalog.ts`

**Steps:**
1. Add edit/toggle/delete-soft form controls.
2. Support parent category, sort order, featured flag, Cloudinary image URL/public ID.
3. Validate unique slug and clear mutation errors.

### Task 5: Attributes

**Files:**
- Modify `src/app/admin/caracteristicas/page.tsx`
- Modify `src/app/actions/catalog.ts`
- Modify `src/lib/data/catalog.ts`

**Steps:**
1. Add edit/toggle/delete-soft or visibility-based deactivate.
2. Manage options for SELECT/MULTISELECT.
3. Block type changes when values exist.
4. Validate NUMBER/BOOLEAN/SELECT/MULTISELECT rules.

### Task 6: Verification

**Commands:**
- `npm test`
- `npm run lint`
- `npm run build`

**Acceptance:**
- `/admin/compradores` is no longer a placeholder.
- ADMIN can operate buyers, products, categories, attributes, images, and stock.
- Public catalog remains price-free.
- Fallback without `DATABASE_URL` still renders useful sample/admin-safe views.
- No checkout/payment language is introduced.
