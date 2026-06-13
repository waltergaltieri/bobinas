"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import {
  clearStoredRequestList,
  createBuyerPurchaseRequest,
  getRequestProduct,
  getStoredRequestList,
  setStoredRequestList,
} from "@/lib/data/purchase-requests";
import {
  addProductToList,
  PurchaseRequestError,
  removeProductFromList,
  updateListItemQuantity,
} from "@/lib/purchase-requests/core";

export type RequestActionState = {
  ok?: boolean;
  error?: string;
};

export async function addToRequestAction(formData: FormData) {
  const profile = await requireRole(["BUYER"]);
  const productId = String(formData.get("productId") ?? "");
  const redirectTo = getInternalRedirect(formData.get("redirectTo"));
  const product = await getRequestProduct(productId);

  if (!product) {
    redirect(withMessage(redirectTo, "producto-no-disponible"));
  }

  const currentList = await getStoredRequestList(profile);
  const nextList = addProductToList({
    profile,
    list: currentList,
    productId,
  });

  await setStoredRequestList(profile, nextList);
  revalidateRequestPaths();
  redirect(withMessage(redirectTo, "producto-agregado"));
}

export async function updateRequestItemQuantityAction(formData: FormData) {
  const profile = await requireRole(["BUYER"]);
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  const redirectTo = getInternalRedirect(formData.get("redirectTo"));

  try {
    const currentList = await getStoredRequestList(profile);
    const nextList = updateListItemQuantity({
      profile,
      list: currentList,
      productId,
      quantity,
    });
    await setStoredRequestList(profile, nextList);
  } catch (error) {
    if (error instanceof PurchaseRequestError) {
      redirect(withMessage(redirectTo, "cantidad-invalida"));
    }
    throw error;
  }

  revalidateRequestPaths();
  redirect(withMessage(redirectTo, "cantidad-actualizada"));
}

export async function removeRequestItemAction(formData: FormData) {
  const profile = await requireRole(["BUYER"]);
  const productId = String(formData.get("productId") ?? "");
  const redirectTo = getInternalRedirect(formData.get("redirectTo"));
  const currentList = await getStoredRequestList(profile);
  const nextList = removeProductFromList({
    profile,
    list: currentList,
    productId,
  });

  await setStoredRequestList(profile, nextList);
  revalidateRequestPaths();
  redirect(withMessage(redirectTo, "producto-eliminado"));
}

export async function clearRequestListAction(formData: FormData) {
  await requireRole(["BUYER"]);
  const redirectTo = getInternalRedirect(formData.get("redirectTo"));

  await clearStoredRequestList();
  revalidateRequestPaths();
  redirect(withMessage(redirectTo, "lista-vaciada"));
}

export async function submitPurchaseRequestAction(
  _previousState: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  const profile = await requireRole(["BUYER"]);
  let id: string;

  try {
    id = await createBuyerPurchaseRequest({
      profile,
      buyerNotes: String(formData.get("buyerNotes") ?? "").trim(),
    });
  } catch (error) {
    if (error instanceof PurchaseRequestError) {
      return { error: error.message };
    }

    return {
      error: "No se pudo enviar el pedido. Revisá la lista e intentá nuevamente.",
    };
  }

  revalidateRequestPaths();
  redirect(`/mis-pedidos?mensaje=pedido-enviado&id=${encodeURIComponent(id)}`);
}

function revalidateRequestPaths() {
  revalidatePath("/productos");
  revalidatePath("/mi-pedido");
  revalidatePath("/mis-pedidos");
}

function getInternalRedirect(value: FormDataEntryValue | null) {
  const fallback = "/mi-pedido";
  const redirectTo = String(value ?? fallback);

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  return redirectTo;
}

function withMessage(pathname: string, message: string) {
  const [path, query = ""] = pathname.split("?");
  const params = new URLSearchParams(query);
  params.set("mensaje", message);

  return `${path}?${params.toString()}`;
}
