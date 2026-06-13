"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PopupSettingsView } from "@/lib/data/site-content";

const STORAGE_KEY = "bobinas_popup_seen";

export function HomePopup({ popup }: { popup: PopupSettingsView | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldOpenPopup(popup)) {
      return;
    }

    const timeout = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timeout);
  }, [popup]);

  if (!popup || !open) {
    return null;
  }

  const close = () => {
    try {
      if (popup.showOnce) {
        window.localStorage.setItem(STORAGE_KEY, popup.id);
      }
    } catch {
      // Ignore storage failures; closing the popup should still work.
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg border bg-card p-5 shadow-lg">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          onClick={close}
          aria-label="Cerrar popup"
        >
          <X className="h-4 w-4" />
        </Button>
        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popup.imageUrl}
            alt={popup.title ?? "Mensaje"}
            className="mb-4 aspect-video w-full rounded-md object-cover"
          />
        ) : null}
        <div className="pr-8">
          <h2 className="text-xl font-semibold">{popup.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{popup.text}</p>
        </div>
        {popup.buttonText && popup.buttonLink ? (
          <Button asChild className="mt-5" onClick={close}>
            <Link href={popup.buttonLink}>{popup.buttonText}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function shouldOpenPopup(popup: PopupSettingsView | null) {
  if (!popup) {
    return false;
  }

  try {
    return !(
      popup.showOnce && window.localStorage.getItem(STORAGE_KEY) === popup.id
    );
  } catch {
    return true;
  }
}
