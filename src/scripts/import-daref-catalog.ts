import "./load-env";

import fs from "node:fs/promises";
import path from "node:path";

import { closeDb } from "@/db";
import { createDarefImageStorage } from "@/lib/imports/daref/cloudinary-storage";
import { parseDarefImportArgs } from "@/lib/imports/daref/cli";
import { runDarefImport, type DarefImageStorage } from "@/lib/imports/daref/importer";
import { createDarefImportPersistence } from "@/lib/imports/daref/persistence";
import { createDarefSupabasePersistence } from "@/lib/imports/daref/supabase-persistence";
import { buildDarefImportPlan } from "@/lib/imports/daref/transform";

const usage = `
Uso:
  npm run catalog:import:daref
  npm run catalog:import:daref -- apply DAREF-422
  npm run catalog:import:daref -- apply DAREF-422 supabase

Sin --apply se ejecuta una simulacion de solo lectura.
La carga real siempre deja los productos inactivos y pendientes de revision.
`;

async function main() {
  const args = parseDarefImportArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage.trim());
    return;
  }

  const sourcePath = path.join(
    process.cwd(),
    "data",
    "imports",
    "daref",
    "catalogo-daref-maestro.json",
  );
  const snapshot = JSON.parse(await fs.readFile(sourcePath, "utf8"));
  const plan = buildDarefImportPlan(snapshot);
  const persistence =
    args.transport === "supabase"
      ? createDarefSupabasePersistence()
      : createDarefImportPersistence();
  const imageStorage: DarefImageStorage = args.apply
    ? createDarefImageStorage()
    : {
        async upload() {
          throw new Error("La simulacion no debe subir imagenes.");
        },
      };

  const result = await runDarefImport({
    plan,
    apply: args.apply,
    persistence,
    imageStorage,
    concurrency: 4,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactDir = path.join(process.cwd(), "backups", "catalog-imports");
  await fs.mkdir(artifactDir, { recursive: true });
  const reportPath = path.join(
    artifactDir,
    `${plan.importBatch}-${result.report.mode}-${timestamp}.json`,
  );
  await fs.writeFile(reportPath, `${JSON.stringify(result.report, null, 2)}\n`, "utf8");

  let backupPath: string | null = null;
  if (args.apply && result.backup) {
    backupPath = path.join(
      artifactDir,
      `${plan.importBatch}-backup-${timestamp}.json`,
    );
    await fs.writeFile(backupPath, `${JSON.stringify(result.backup, null, 2)}\n`, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        ...result.report,
        reportPath,
        backupPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
