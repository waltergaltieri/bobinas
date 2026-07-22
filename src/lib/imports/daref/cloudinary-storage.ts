import { getCloudinary } from "@/lib/cloudinary/server";

import type { DarefImageStorage } from "./importer";

type CloudinaryImageClient = {
  uploader: {
    upload(
      sourceUrl: string,
      options: Record<string, unknown>,
    ): Promise<{ secure_url?: string; public_id?: string }>;
  };
  api: {
    resource(
      publicId: string,
      options: Record<string, unknown>,
    ): Promise<{ secure_url?: string; public_id?: string }>;
  };
};

export function createDarefImageStorage(
  cloudinary: CloudinaryImageClient = getCloudinary(),
): DarefImageStorage {

  return {
    async upload(image) {
      let uploadError: unknown = null;
      try {
        const result = await cloudinary.uploader.upload(image.sourceUrl, {
          resource_type: "image",
          public_id: image.publicId,
          overwrite: false,
          unique_filename: false,
        });

        if (result.secure_url && result.public_id) {
          return { url: result.secure_url, publicId: result.public_id };
        }
      } catch (error) {
        uploadError = error;
      }

      try {
        const existing = await cloudinary.api.resource(image.publicId, {
          resource_type: "image",
          type: "upload",
        });
        if (existing.secure_url && existing.public_id) {
          return { url: existing.secure_url, publicId: existing.public_id };
        }
      } catch {
        if (uploadError) throw uploadError;
      }

      throw new Error(`Cloudinary no devolvio la imagen ${image.publicId}`);
    },
  };
}
