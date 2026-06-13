import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsappLink } from "@/lib/data/site-content";

export function WhatsappButton({
  phone,
  message = "Hola, quiero consultar por productos del catalogo.",
  label = "WhatsApp",
  floating = false,
}: {
  phone: string | null | undefined;
  message?: string;
  label?: string;
  floating?: boolean;
}) {
  const href = buildWhatsappLink({ phone, message });

  if (!href) {
    return null;
  }

  return (
    <Button
      asChild
      className={
        floating
          ? "fixed bottom-5 right-5 z-40 shadow-lg"
          : undefined
      }
    >
      <a href={href} target="_blank" rel="noreferrer">
        <MessageCircle className="h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
