import { describe, expect, it } from "vitest";

import {
  buildWhatsappLink,
  getPublicHomeContent,
  shouldDisplayPopup,
} from "./site-content";

describe("site content", () => {
  it("loads public home content without exposing prices", async () => {
    const content = await getPublicHomeContent();

    expect(content.settings.businessName).toBeTruthy();
    expect(content.featuredProducts.length).toBeGreaterThan(0);
    expect(
      content.featuredProducts.every((product) => !("price" in product)),
    ).toBe(true);
  });

  it("shows active slides and hides inactive slides", async () => {
    const content = await getPublicHomeContent();

    expect(content.slides.length).toBeGreaterThan(0);
    expect(content.slides.every((slide) => slide.isActive)).toBe(true);
    expect(content.slides.map((slide) => slide.title)).not.toContain(
      "Slide inactivo",
    );
  });

  it("respects popup active flag and date window", () => {
    const now = new Date("2026-06-13T12:00:00-03:00");

    expect(
      shouldDisplayPopup({
        isActive: false,
        startsAt: null,
        endsAt: null,
      }, now),
    ).toBe(false);
    expect(
      shouldDisplayPopup({
        isActive: true,
        startsAt: new Date("2026-06-14T00:00:00-03:00"),
        endsAt: null,
      }, now),
    ).toBe(false);
    expect(
      shouldDisplayPopup({
        isActive: true,
        startsAt: null,
        endsAt: new Date("2026-06-12T00:00:00-03:00"),
      }, now),
    ).toBe(false);
    expect(
      shouldDisplayPopup({
        isActive: true,
        startsAt: new Date("2026-06-12T00:00:00-03:00"),
        endsAt: new Date("2026-06-14T00:00:00-03:00"),
      }, now),
    ).toBe(true);
  });

  it("builds a WhatsApp link with sanitized phone and encoded message", () => {
    const link = buildWhatsappLink({
      phone: "+54 9 11 2345-6789",
      message: "Hola, quiero consultar por productos del catalogo.",
    });

    expect(link).toBe(
      "https://wa.me/5491123456789?text=Hola%2C+quiero+consultar+por+productos+del+catalogo.",
    );
  });
});
