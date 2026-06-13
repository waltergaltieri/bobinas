const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const maxImageUploadSize = 5 * 1024 * 1024;

export type UploadFileLike = {
  type: string;
  size: number;
};

export function validateImageUpload(file: UploadFileLike) {
  if (!allowedImageTypes.has(file.type)) {
    return {
      ok: false as const,
      error: "Formato no permitido. Usá JPG, PNG o WebP.",
    };
  }

  if (file.size > maxImageUploadSize) {
    return {
      ok: false as const,
      error: "La imagen no puede superar 5 MB.",
    };
  }

  return { ok: true as const };
}
