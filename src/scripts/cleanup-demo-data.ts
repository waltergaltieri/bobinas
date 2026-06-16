import "./load-env";

import { v2 as cloudinary } from "cloudinary";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

import { readServerEnv } from "@/lib/env";

const testProfileEmails = [
  "admin.fase7@bobinas.test",
  "buyer.fase7.20260614@bobinas.test",
  "compras@tallernorte.test",
];

const testAuthEmails = [
  "admin.fase7@bobinas.test",
  "buyer.fase7.20260614@bobinas.test",
];

const demoProductSlugs = [
  "bobina-bosch-12v",
  "inducido-valeo-reforzado",
  "plaqueta-reguladora-universal",
];

const demoProductCodes = ["BOB-12", "IND-VAL-01", "PLA-UNI"];

type CloudinaryResource = {
  public_id: string;
};

async function main() {
  const env = readServerEnv();

  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required to clean demo data.");
  }

  const db = postgres(env.databaseUrl, { prepare: false });

  try {
    const activeAdmins = await db<{ email: string }[]>`
      select email
      from profiles
      where role = 'ADMIN'
        and is_active = true
      order by email
    `;
    const realAdmins = activeAdmins.filter((admin) => !admin.email.endsWith(".test"));

    if (realAdmins.length === 0) {
      throw new Error("No active non-test ADMIN profile found. Cleanup aborted.");
    }

    const cleanup = await db.begin(async (tx) => {
      const deletedProducts = await tx`
        delete from products
        where slug = any(${demoProductSlugs})
           or internal_code = any(${demoProductCodes})
        returning slug
      `;
      const deletedRequests = await tx`
        delete from purchase_requests
        where buyer_id in (
          select id from profiles where email = any(${testProfileEmails})
        )
        returning id
      `;
      const deletedProfiles = await tx<{ email: string }[]>`
        delete from profiles
        where email = any(${testProfileEmails})
        returning email
      `;
      const deletedProductViews = await tx`delete from product_views returning id`;
      const deletedSearchLogs = await tx`delete from search_logs returning id`;
      const deletedRequestEvents = await tx`delete from request_events returning id`;
      const deletedSlides = await tx`
        delete from home_slides
        where image_url like '%res.cloudinary.com/demo%'
           or image_public_id like 'demo/%'
        returning id
      `;
      const cleanedPopup = await tx`
        update popup_settings
        set is_active = false,
            image_url = null,
            image_public_id = null,
            title = null,
            text = null,
            button_text = null,
            button_link = null,
            starts_at = null,
            ends_at = null,
            updated_at = now()
        returning id
      `;
      const reviewedSettings = await tx`
        update site_settings
        set email = case when email like '%.test' then null else email end,
            phone = case when phone = '+54 11 4567-8900' then null else phone end,
            whatsapp = case when whatsapp = '+5491123456789' then null else whatsapp end,
            address = case when address = 'Av. Repuestos 1234, Buenos Aires' then null else address end,
            logo_url = case when logo_url like '%res.cloudinary.com/demo%' then null else logo_url end,
            logo_public_id = case when logo_public_id like 'demo/%' then null else logo_public_id end,
            updated_at = now()
        returning id
      `;

      return {
        adminsKept: realAdmins.map((admin) => admin.email),
        productsDeleted: deletedProducts.length,
        requestsDeleted: deletedRequests.length,
        profilesDeleted: deletedProfiles.map((profile) => profile.email),
        productViewsDeleted: deletedProductViews.length,
        searchLogsDeleted: deletedSearchLogs.length,
        requestEventsDeleted: deletedRequestEvents.length,
        demoSlidesDeleted: deletedSlides.length,
        popupRowsCleaned: cleanedPopup.length,
        settingsRowsReviewed: reviewedSettings.length,
      };
    });

    const authUsersDeleted = await deleteTestAuthUsers(env);
    const cloudinaryDeleted = await deleteCloudinaryValidationAssets(env);

    console.log(
      JSON.stringify(
        {
          ...cleanup,
          authUsersDeleted,
          cloudinaryDeleted,
        },
        null,
        2,
      ),
    );
  } finally {
    await db.end();
  }
}

async function deleteTestAuthUsers(env: ReturnType<typeof readServerEnv>) {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return [];
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const deleted: string[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    for (const user of data.users) {
      const email = user.email?.toLowerCase();

      if (!email || !testAuthEmails.includes(email)) {
        continue;
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        throw deleteError;
      }

      deleted.push(email);
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return deleted;
}

async function deleteCloudinaryValidationAssets(
  env: ReturnType<typeof readServerEnv>,
) {
  if (
    !env.cloudinaryCloudName ||
    !env.cloudinaryApiKey ||
    !env.cloudinaryApiSecret
  ) {
    return [];
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });

  const resources = await cloudinary.api.resources({
    type: "upload",
    prefix: "bobinas/phase7-validation",
    max_results: 100,
  });
  const publicIds = (resources.resources as CloudinaryResource[]).map(
    (resource) => resource.public_id,
  );

  if (publicIds.length === 0) {
    return [];
  }

  await cloudinary.api.delete_resources(publicIds, {
    type: "upload",
    resource_type: "image",
  });

  return publicIds;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
