import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactPage from "./page";

describe("ContactPage", () => {
  it("renders a technical commercial contact page with demo data", () => {
    render(<ContactPage />);

    expect(
      screen.getByRole("heading", { name: /Hablemos de tu repuesto/i }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /Consultar por WhatsApp/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Enviar email/i })).toBeTruthy();

    expect(screen.getByText(/Para responderte mejor/i)).toBeTruthy();
    expect(screen.getByText(/Codigo OEM o interno/i)).toBeTruthy();
    expect(screen.getAllByText(/Foto de la pieza/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Voltaje, estrias, medidas o cantidad de dientes/i)).toBeTruthy();

    expect(screen.getByText("+54 11 4567-8900")).toBeTruthy();
    expect(screen.getByText("ventas@bobinas.test")).toBeTruthy();
    expect(screen.getByText(/Av. Repuestos 1234/i)).toBeTruthy();
    expect(screen.getByText(/Consulta recibida/i)).toBeTruthy();
    expect(screen.getByText(/Solicitud de pedido/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Acceso clientes/i })).toBeTruthy();

    const text = document.body.textContent?.toLowerCase() ?? "";
    expect(text).not.toContain("checkout");
    expect(text).not.toContain("pagar");
    expect(text).not.toContain("comprar ahora");
  });
});
