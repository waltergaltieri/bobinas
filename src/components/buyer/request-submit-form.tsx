"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  submitPurchaseRequestAction,
  type RequestActionState,
} from "@/app/actions/purchase-requests";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: RequestActionState = {};

export function RequestSubmitForm({ disabled }: { disabled: boolean }) {
  const [state, formAction] = useActionState(
    submitPurchaseRequestAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="buyerNotes">Observaciones</Label>
        <Textarea
          id="buyerNotes"
          name="buyerNotes"
          placeholder="Notas sobre disponibilidad, entrega o referencias internas"
          rows={4}
        />
      </div>
      <SubmitButton disabled={disabled} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enviando..." : "Enviar pedido"}
    </Button>
  );
}
