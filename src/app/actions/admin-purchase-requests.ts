"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  purchaseRequestStatusEnum,
  saleResultEnum,
  type PurchaseRequestStatus,
  type SaleResult,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { updateAdminPurchaseRequest } from "@/lib/data/purchase-requests";

const adminUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(purchaseRequestStatusEnum.enumValues),
  saleResult: z.enum(saleResultEnum.enumValues),
  adminNotes: z.string().optional(),
  saleResultNotes: z.string().optional(),
});

export async function updateAdminPurchaseRequestAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = adminUpdateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: formData.get("status"),
    saleResult: formData.get("saleResult"),
    adminNotes: String(formData.get("adminNotes") ?? ""),
    saleResultNotes: String(formData.get("saleResultNotes") ?? ""),
  });

  if (!parsed.success) {
    redirect("/admin/pedidos?mensaje=datos-invalidos");
  }

  await updateAdminPurchaseRequest(parsed.data.id, {
    status: parsed.data.status as PurchaseRequestStatus,
    saleResult: parsed.data.saleResult as SaleResult,
    adminNotes: parsed.data.adminNotes,
    saleResultNotes: parsed.data.saleResultNotes,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${parsed.data.id}`);
  redirect(`/admin/pedidos/${parsed.data.id}?mensaje=pedido-actualizado`);
}
