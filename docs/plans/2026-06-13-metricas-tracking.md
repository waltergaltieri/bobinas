# Metricas y tracking implementation plan

**Goal:** Add real product view, search, pedido-event tracking, and admin metric views without changing deploy or final data loading.

**Architecture:** Use existing `product_views` and `search_logs` tables for views/search. Add a small `request_events` table for pedido activity. Tracking runs through lightweight Route Handlers and Server Actions that catch DB/fallback failures, while admin metrics are computed in server-side data helpers and rendered in `/admin` plus `/admin/metricas`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM, PostgreSQL/Supabase, Zod, Vitest, shadcn/ui.

---

### Task 1: Metrics Domain Tests
- Add tests for product view aggregation, frequent searches, requested products, dashboard counts, and fallback metrics.
- Verify they fail before implementation.

### Task 2: Schema And Tracking
- Extend schema with `request_events`.
- Add migration SQL.
- Add `src/lib/data/metrics.ts` with sample fallback and DB aggregation.
- Add `src/lib/tracking/session.ts` for anonymous session IDs.

### Task 3: Route Handlers And Client Trackers
- Add `/api/track/product-view` and `/api/track/search`.
- Add small client components that POST after render without blocking.
- Attach product-view tracker to product detail and search tracker to `/productos`.

### Task 4: Pedido Events
- Log add, quantity update, remove, and submit in existing pedido actions.
- Avoid storing sensitive data; store event type, product ID, buyer ID/session ID, quantity, request ID.

### Task 5: Admin Metrics UI
- Replace dashboard static metrics with real metrics helper.
- Add `/admin/metricas`.
- Add sidebar link.
- Render empty states with cards/tables and existing badges.

### Task 6: Verification
- Run `npm test`, `npm run lint`, `npm run build`.
- Confirm public products stay price-free and admin metrics stay protected by admin layout.
