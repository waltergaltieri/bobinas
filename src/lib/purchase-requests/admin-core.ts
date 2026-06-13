import type {
  ProfileRole,
  PurchaseRequestStatus,
  SaleResult,
} from "@/db/schema";

export type AdminRequestProfile = {
  id: string;
  role: ProfileRole;
} | null;

export type AdminRequestItemSnapshot = {
  productId: string | null;
  productNameSnapshot: string;
  productCodeSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  subtotalSnapshot: string;
  currentProductName?: string | null;
};

export type AdminEditableRequest = {
  id: string;
  status: PurchaseRequestStatus;
  saleResult: SaleResult;
  adminNotes: string | null;
  saleResultNotes: string | null;
  completedAt: Date | null;
  items: AdminRequestItemSnapshot[];
};

export type AdminRequestUpdateInput = {
  status?: PurchaseRequestStatus;
  saleResult?: SaleResult;
  adminNotes?: string;
  saleResultNotes?: string;
};

export class AdminRequestError extends Error {}

export const requestStatusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revision",
  CONTACTED: "Contactado",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Venta concretada",
  NOT_COMPLETED: "Venta no concretada",
};

export const commercialResultLabels: Record<SaleResult, string> = {
  UNKNOWN: "Sin definir",
  CONCRETED: "Concretada",
  NOT_CONCRETED: "No concretada",
};

export function assertAdminRequestAccess(
  profile: AdminRequestProfile,
): asserts profile is { id: string; role: "ADMIN" } {
  if (!profile || profile.role !== "ADMIN") {
    throw new AdminRequestError("Solo ADMIN puede gestionar pedidos.");
  }
}

export function applyAdminRequestUpdate({
  profile,
  request,
  input,
  now = new Date(),
}: {
  profile: AdminRequestProfile;
  request: AdminEditableRequest;
  input: AdminRequestUpdateInput;
  now?: Date;
}) {
  assertAdminRequestAccess(profile);
  const nextStatus = input.status ?? request.status;
  const nextSaleResult = input.saleResult ?? request.saleResult;
  const shouldClose =
    nextStatus === "COMPLETED" ||
    nextStatus === "NOT_COMPLETED" ||
    nextSaleResult === "CONCRETED" ||
    nextSaleResult === "NOT_CONCRETED";

  return {
    ...request,
    status: nextStatus,
    saleResult: nextSaleResult,
    adminNotes:
      input.adminNotes === undefined ? request.adminNotes : input.adminNotes,
    saleResultNotes:
      input.saleResultNotes === undefined
        ? request.saleResultNotes
        : input.saleResultNotes,
    completedAt: shouldClose ? request.completedAt ?? now : request.completedAt,
  };
}

export function toBuyerVisibleRequestDetail<T extends AdminEditableRequest>(
  request: T,
) {
  const { adminNotes, saleResultNotes, ...buyerVisible } = request;
  void adminNotes;
  void saleResultNotes;

  return buyerVisible;
}

export function getRequestStatusLabel(status: PurchaseRequestStatus) {
  return requestStatusLabels[status];
}

export function getCommercialResultLabel(result: SaleResult) {
  return commercialResultLabels[result];
}
