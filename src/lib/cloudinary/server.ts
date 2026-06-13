import { v2 as cloudinary } from "cloudinary";

import { readServerEnv } from "@/lib/env";

let configured = false;

export function hasCloudinaryEnv() {
  const env = readServerEnv();
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );
}

export function getCloudinary() {
  if (!hasCloudinaryEnv()) {
    throw new Error("Cloudinary environment variables are required.");
  }

  if (!configured) {
    const env = readServerEnv();
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}
