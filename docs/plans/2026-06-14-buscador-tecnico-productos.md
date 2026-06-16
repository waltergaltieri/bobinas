# Buscador Tecnico de Productos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an assisted technical product search for long codes and
combined filters.

**Architecture:** Keep `/productos` as a server-rendered route. Add pure,
tested catalog helpers for normalization, token matching and suggestions; add a
small client autocomplete component that submits URL parameters.

**Tech Stack:** Next.js App Router, React client component, Drizzle-backed data
helpers, Vitest.

---

### Task 1: Search Behavior

**Files:**
- Modify: `src/lib/data/catalog.ts`
- Test: `src/lib/data/catalog-filters.test.ts`

**Steps:**
1. Add failing tests for searching `BOB12` and `bosch 12 rectangular`.
2. Implement technical normalization that removes separators and accents.
3. Match every query token against the product search fields and attributes.
4. Run the focused tests.

### Task 2: Suggestions

**Files:**
- Modify: `src/lib/data/catalog.ts`
- Test: `src/lib/data/catalog-filters.test.ts`

**Steps:**
1. Add failing tests for catalog suggestions.
2. Generate suggestions from product code, OEM, product name, brand, model,
   category and technical attributes.
3. Cap suggestions to a small list and avoid duplicates.
4. Run the focused tests.

### Task 3: Technical Cards

**Files:**
- Modify: `src/lib/data/product-presenter.ts`
- Modify: `src/components/catalog/product-card.tsx`
- Test: `src/lib/data/product-presenter.test.ts`

**Steps:**
1. Add failing test for highlighted attributes.
2. Pass visible attributes through the presenter.
3. Render compact technical metadata in product cards.
4. Run presenter tests.

### Task 4: Products Page UI

**Files:**
- Create: `src/components/catalog/catalog-search-box.tsx`
- Modify: `src/app/(public)/productos/page.tsx`

**Steps:**
1. Add autocomplete search box fed by server-generated suggestions.
2. Add active filter chips with remove links.
3. Keep all filter state URL-driven.
4. Validate PUBLIC/BUYER visibility manually and with existing tests.

### Task 5: Verification

Run:

```bash
npm test
npm run lint
npm run build
```

Then inspect `/productos` in browser for public price hiding, autocomplete,
chips and layout.

