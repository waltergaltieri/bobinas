# Home Hero Carousel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the public home hero into a fixed three-slide carousel while keeping the current hero as the first slide.

**Architecture:** Extract the hero content into a client carousel component with fixed slide data. The public page remains a server component that renders the carousel and the rest of the home unchanged.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Carousel Behavior Contract

**Files:**
- Create: `src/components/site/home-hero-carousel.test.tsx`
- Create: `src/components/site/home-hero-carousel.tsx`
- Modify: `src/app/(public)/page.tsx`

**Step 1: Write the failing test**

Test that the carousel renders the current catalog message as slide 01, exposes the two new commercial messages, shows three indicators, and avoids checkout/payment language.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/site/home-hero-carousel.test.tsx`
Expected: FAIL because the component does not exist yet.

**Step 3: Write minimal implementation**

Create a client component with fixed slide definitions:
- Slide 01: current technical catalog hero.
- Slide 02: brand trust and specialist positioning.
- Slide 03: commercial solution and buyer portal positioning.

Use buttons/links with pedido-safe wording only.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/site/home-hero-carousel.test.tsx`
Expected: PASS.

### Task 2: Page Integration

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Step 1: Replace inline hero**

Remove the current inline hero section and render `HomeHeroCarousel`.

**Step 2: Run project checks**

Run: `npm test -- src/components/site/home-hero-carousel.test.tsx`
Run: `npm run lint`
Run: `npm run build`

Expected: all commands exit 0, unless unrelated existing work in the dirty tree blocks them.
