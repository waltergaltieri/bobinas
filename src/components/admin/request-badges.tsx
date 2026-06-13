import type { PurchaseRequestStatus, SaleResult } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  getCommercialResultLabel,
  getRequestStatusLabel,
} from "@/lib/purchase-requests/admin-core";

const statusVariants: Record<PurchaseRequestStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  IN_REVIEW: "default",
  CONTACTED: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "default",
  NOT_COMPLETED: "destructive",
};

const resultVariants: Record<SaleResult, "default" | "secondary" | "outline" | "destructive"> = {
  UNKNOWN: "secondary",
  CONCRETED: "default",
  NOT_CONCRETED: "destructive",
};

export function RequestStatusBadge({ status }: { status: PurchaseRequestStatus }) {
  return <Badge variant={statusVariants[status]}>{getRequestStatusLabel(status)}</Badge>;
}

export function CommercialResultBadge({ result }: { result: SaleResult }) {
  return (
    <Badge variant={resultVariants[result]}>
      {getCommercialResultLabel(result)}
    </Badge>
  );
}
