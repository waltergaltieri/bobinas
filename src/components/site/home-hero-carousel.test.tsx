import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HOME_HERO_SLIDES, HomeHeroCarousel } from "./home-hero-carousel";

describe("HomeHeroCarousel", () => {
  it("keeps the current technical hero as the first fixed slide", () => {
    expect(HOME_HERO_SLIDES).toHaveLength(3);
    expect(HOME_HERO_SLIDES[0].title).toContain("Catalogo tecnico");

    render(<HomeHeroCarousel />);

    expect(
      screen.getByRole("heading", {
        name: /Catalogo tecnico de repuestos automotores/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /Explorar catalogo/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Soporte tecnico/i })).toBeTruthy();
  });

  it("adds commercial brand and solution slides without ecommerce language", () => {
    render(<HomeHeroCarousel />);

    fireEvent.click(screen.getByRole("button", { name: /Mostrar slide 2/i }));
    expect(
      screen.getByRole("heading", {
        name: /Especialistas en repuestos electricos automotores/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /Hablar con un asesor/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Mostrar slide 3/i }));
    expect(
      screen.getByRole("heading", {
        name: /Tenemos el repuesto que tu cliente necesita/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /Acceso clientes/i })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Mostrar slide/i })).toHaveLength(3);

    const text = document.body.textContent?.toLowerCase() ?? "";
    expect(text).not.toContain("checkout");
    expect(text).not.toContain("pagar");
    expect(text).not.toContain("comprar ahora");
  });
});
