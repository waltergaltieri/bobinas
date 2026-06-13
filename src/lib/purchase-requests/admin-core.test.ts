import { describe, expect, it } from "vitest";

import {
  applyAdminRequestUpdate,
  assertAdminRequestAccess,
  getCommercialResultLabel,
  getRequestStatusLabel,
  toBuyerVisibleRequestDetail,
} from "./admin-core";

const admin = { id: "admin-1", role: "ADMIN" as const };
const buyer = { id: "buyer-1", role: "BUYER" as const };

const request = {
  id: "PED-1",
  status: "PENDING" as const,
  saleResult: "UNKNOWN" as const,
  adminNotes: null,
  saleResultNotes: null,
  completedAt: null,
  items: [
    {
      productId: "product-1",
      productNameSnapshot: "Bobina Bosch 12V",
      productCodeSnapshot: "BOB-12",
      unitPriceSnapshot: "12500.00",
      quantity: 1,
      subtotalSnapshot: "12500.00",
      currentProductName: "Bobina Bosch 12V actualizada",
    },
  ],
};

describe("admin purchase request core", () => {
  it("blocks public and buyer users from admin request management", () => {
    expect(() => assertAdminRequestAccess(null)).toThrow("Solo ADMIN");
    expect(() => assertAdminRequestAccess(buyer)).toThrow("Solo ADMIN");
    expect(() => assertAdminRequestAccess(admin)).not.toThrow();
  });

  it("labels request statuses and commercial results", () => {
    expect(getRequestStatusLabel("PENDING")).toBe("Pendiente");
    expect(getRequestStatusLabel("IN_REVIEW")).toBe("En revision");
    expect(getRequestStatusLabel("COMPLETED")).toBe("Venta concretada");
    expect(getRequestStatusLabel("NOT_COMPLETED")).toBe("Venta no concretada");
    expect(getCommercialResultLabel("CONCRETED")).toBe("Concretada");
    expect(getCommercialResultLabel("NOT_CONCRETED")).toBe("No concretada");
  });

  it("lets admin change state, result and notes", () => {
    const updated = applyAdminRequestUpdate({
      profile: admin,
      request,
      input: {
        status: "CONTACTED",
        saleResult: "CONCRETED",
        adminNotes: "Llamar nuevamente por la tarde.",
        saleResultNotes: "Pedido coordinado fuera del sistema.",
      },
    });

    expect(updated.status).toBe("CONTACTED");
    expect(updated.saleResult).toBe("CONCRETED");
    expect(updated.adminNotes).toBe("Llamar nuevamente por la tarde.");
    expect(updated.saleResultNotes).toBe("Pedido coordinado fuera del sistema.");
  });

  it("sets completedAt when a terminal commercial state is selected", () => {
    const updated = applyAdminRequestUpdate({
      profile: admin,
      request,
      input: {
        status: "COMPLETED",
        saleResult: "CONCRETED",
      },
      now: new Date("2026-06-13T10:00:00Z"),
    });

    expect(updated.completedAt?.toISOString()).toBe("2026-06-13T10:00:00.000Z");
  });

  it("does not expose internal notes to buyer-visible details", () => {
    const updated = applyAdminRequestUpdate({
      profile: admin,
      request,
      input: {
        adminNotes: "Solo visible para el equipo interno.",
        saleResultNotes: "Seguimiento comercial interno.",
      },
    });

    expect(toBuyerVisibleRequestDetail(updated)).not.toHaveProperty("adminNotes");
    expect(toBuyerVisibleRequestDetail(updated)).not.toHaveProperty(
      "saleResultNotes",
    );
  });

  it("keeps product snapshots even when current product data changes", () => {
    const updated = applyAdminRequestUpdate({
      profile: admin,
      request,
      input: {
        status: "IN_REVIEW",
      },
    });

    expect(updated.items[0]?.productNameSnapshot).toBe("Bobina Bosch 12V");
    expect(updated.items[0]?.currentProductName).toBe(
      "Bobina Bosch 12V actualizada",
    );
  });
});
