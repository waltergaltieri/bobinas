import { describe, expect, it, vi } from "vitest";

import { createDarefImageStorage } from "./cloudinary-storage";

describe("createDarefImageStorage", () => {
  it("returns an existing deterministic asset when upload reports a conflict", async () => {
    const upload = vi.fn().mockRejectedValue({
      message: "Asset already exists",
      http_code: 400,
    });
    const resource = vi.fn().mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/daref-100.jpg",
      public_id: "bobinas/catalogo-daref/100",
    });
    const storage = createDarefImageStorage({
      uploader: { upload },
      api: { resource },
    });

    await expect(
      storage.upload({
        sourceUrl: "https://example.com/100.jpg",
        publicId: "bobinas/catalogo-daref/100",
        altText: "DAREF 100",
      }),
    ).resolves.toEqual({
      url: "https://res.cloudinary.com/test/image/upload/daref-100.jpg",
      publicId: "bobinas/catalogo-daref/100",
    });
    expect(resource).toHaveBeenCalledWith("bobinas/catalogo-daref/100", {
      resource_type: "image",
      type: "upload",
    });
  });
});
