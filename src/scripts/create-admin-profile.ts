import "dotenv/config";

import { closeDb, getDb } from "@/db";
import { profiles } from "@/db/schema";

async function main() {
  const authUserId = process.env.FIRST_ADMIN_AUTH_USER_ID;
  const email = process.env.FIRST_ADMIN_EMAIL;
  const name = process.env.FIRST_ADMIN_NAME ?? "Administrador";
  const companyName = process.env.FIRST_ADMIN_COMPANY_NAME;

  if (!authUserId || !email) {
    throw new Error(
      "Set FIRST_ADMIN_AUTH_USER_ID and FIRST_ADMIN_EMAIL before running this script.",
    );
  }

  await getDb()
    .insert(profiles)
    .values({
      authUserId,
      email,
      name,
      companyName,
      role: "ADMIN",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: profiles.authUserId,
      set: {
        email,
        name,
        companyName,
        role: "ADMIN",
        isActive: true,
        updatedAt: new Date(),
      },
    });

  console.log(`ADMIN profile linked for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
