"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadedImage = {
  url: string;
  publicId: string;
  altText: string;
};

export function ProductImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function upload(file: File | null) {
    if (!file) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "bobinas/productos");

      const response = await fetch("/api/admin/cloudinary/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        url?: string;
        publicId?: string;
        error?: string;
      };

      if (!response.ok || !payload.url || !payload.publicId) {
        setError(payload.error ?? "No se pudo subir la imagen.");
        return;
      }

      setImages((current) => [
        ...current,
        { url: payload.url!, publicId: payload.publicId!, altText: "" },
      ]);
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Imagenes nuevas</h3>
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP. Maximo 5 MB por archivo.
          </p>
        </div>
        <Label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
          <ImagePlus className="h-4 w-4" />
          {isPending ? "Subiendo..." : "Subir"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => upload(event.target.files?.[0] ?? null)}
          />
        </Label>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {images.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Todavia no agregaste imagenes nuevas en este formulario.
        </div>
      ) : (
        <div className="grid gap-3">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="grid gap-3 rounded-md border p-3 sm:grid-cols-[96px_1fr_auto]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.altText || "Producto"}
                className="aspect-square w-24 rounded-md object-cover"
              />
              <div className="grid gap-2">
                <input type="hidden" name="imageUrl" value={image.url} />
                <input type="hidden" name="imagePublicId" value={image.publicId} />
                <Label>Texto alternativo</Label>
                <Input
                  name="imageAltText"
                  value={image.altText}
                  onChange={(event) => {
                    const next = [...images];
                    next[index] = { ...image, altText: event.target.value };
                    setImages(next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setImages((current) =>
                    current.filter((candidate) => candidate.publicId !== image.publicId),
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
