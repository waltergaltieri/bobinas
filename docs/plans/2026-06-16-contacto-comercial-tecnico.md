# Contacto Comercial Tecnico Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the sparse public contact page with a fuller technical-commercial contact page using demo contact data for now.

**Architecture:** Keep the route as a static server component at `src/app/(public)/contacto/page.tsx`. Use fixed data arrays for contact channels, request preparation hints, and process steps so the page can later be wired to admin-managed settings.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, lucide-react, Vitest, Testing Library.

---

### Task 1: Contact Page Contract

**Files:**
- Create: `src/app/(public)/contacto/page.test.tsx`
- Modify: `src/app/(public)/contacto/page.tsx`

**Step 1: Write the failing test**

Assert the page renders:
- A stronger hero: `Hablemos de tu repuesto`.
- CTAs for WhatsApp and email.
- A "Para responderte mejor" section with technical data hints.
- Contact demo channels.
- A process line from consultation to solicitud de pedido.
- A buyer portal CTA.
- No checkout/payment/buy-now wording.

**Step 2: Run test to verify it fails**

Run: `npm test -- 'src/app/(public)/contacto/page.test.tsx'`
Expected: FAIL because the current page is still sparse.

**Step 3: Implement the page**

Replace the current card-only layout with industrial homepage-compatible sections:
- Technical commercial hero.
- Contact channel panel with demo data.
- Technical checklist.
- Four-step response process.
- Buyer portal block.

**Step 4: Verify**

Run:
- `npm test -- 'src/app/(public)/contacto/page.test.tsx'`
- `npm run lint`
- `npm run build`
