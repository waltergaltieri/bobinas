import { describe, expect, it } from "vitest";

import {
  getAdminPurchaseRequestDetail,
  getAdminPurchaseRequests,
  updateAdminPurchaseRequest,
} from "./purchase-requests";

const sampleRequestId = "16161616-1616-4161-8161-161616161616";

describe("admin purchase request data", () => {
  it("lets admin list received requests from the fallback source", async () => {
    const requests = await getAdminPurchaseRequests();

    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0]).toMatchObject({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
      buyerName: expect.any(String),
      status: expect.any(String),
      saleResult: expect.any(String),
    });
  });

  it("lets admin read request detail with product snapshots", async () => {
    const detail = await getAdminPurchaseRequestDetail(sampleRequestId);

    expect(detail).not.toBeNull();
    expect(detail?.items[0]).toMatchObject({
      productNameSnapshot: "Bobina Bosch 12V",
      productCodeSnapshot: "BOB-12",
      unitPriceSnapshot: "12500.00",
    });
  });

  it("lets admin change request state", async () => {
    const updated = await updateAdminPurchaseRequest(sampleRequestId, {
      status: "IN_REVIEW",
    });

    expect(updated.status).toBe("IN_REVIEW");
  });

  it("lets admin mark a request as concreted", async () => {
    const updated = await updateAdminPurchaseRequest(sampleRequestId, {
      status: "COMPLETED",
      saleResult: "CONCRETED",
    });

    expect(updated.status).toBe("COMPLETED");
    expect(updated.saleResult).toBe("CONCRETED");
    expect(updated.completedAt).toBeInstanceOf(Date);
  });

  it("lets admin mark a request as not concreted", async () => {
    const updated = await updateAdminPurchaseRequest(sampleRequestId, {
      status: "NOT_COMPLETED",
      saleResult: "NOT_CONCRETED",
    });

    expect(updated.status).toBe("NOT_COMPLETED");
    expect(updated.saleResult).toBe("NOT_CONCRETED");
    expect(updated.completedAt).toBeInstanceOf(Date);
  });
});
