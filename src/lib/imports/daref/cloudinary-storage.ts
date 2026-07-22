import { getCloudinary } from "@/lib/cloudinary/server";

import type { DarefImageStorage } from "./importer";

export function createDarefImageStorage(): DarefImageStorage {
  const cloudinary = getCloudinary();

  return {
    async upload(image) {
      const result = await cloudinary.uploader.upload(image.sourceUrl, {
        resource_type: "image",
        public_id: image.publicId,
        overwrite: false,
        unique_filename: false,
      });

      if (result.secure_url && result.public_id) {
        return { url: result.secure_url, publicId: result.public_id };
      }

      const existing = await cloudinary.api.resource(image.publicId, {
        resource_type: "image",
        type: "upload",
      });
      if (!existing.secure_url || !existing.public_id) {
        throw new Error(`Cloudinary no devolvio la imagen ${image.publicId}`);
      }

      return { url: existing.secure_url, publicId: existing.public_id };
    },
  };
}
