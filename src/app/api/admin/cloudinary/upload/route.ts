import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/auth/session";
import { getCloudinary, hasCloudinaryEnv } from "@/lib/cloudinary/server";
import { validateImageUpload } from "@/lib/cloudinary/upload-policy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireRole(["ADMIN"]);

  if (!hasCloudinaryEnv()) {
    return NextResponse.json(
      { error: "Faltan variables de entorno de Cloudinary." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "bobinas/catalogo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido." }, { status: 400 });
  }

  const validation = validateImageUpload(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  const result = await getCloudinary().uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
}
