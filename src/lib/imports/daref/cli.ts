export function parseDarefImportArgs(args: string[]) {
  const help =
    args.includes("--help") || args.includes("-h") || args.includes("help");
  const transport = args.includes("supabase") ? "supabase" : "database";
  if (help) return { apply: false, help: true, transport } as const;

  const apply = args.includes("--apply") || args[0] === "apply";
  if (apply) {
    const confirmIndex = args.indexOf("--confirm");
    const confirmed =
      (confirmIndex >= 0 && args[confirmIndex + 1] === "DAREF-422") ||
      (args[0] === "apply" && args[1] === "DAREF-422");
    if (!confirmed) {
      throw new Error("La carga real requiere --confirm DAREF-422");
    }
  }

  const supported = new Set([
    "--apply",
    "--confirm",
    "DAREF-422",
    "apply",
    "help",
    "database",
    "supabase",
  ]);
  const unknown = args.filter((arg) => !supported.has(arg));
  if (unknown.length > 0) {
    throw new Error(`Argumentos desconocidos: ${unknown.join(", ")}`);
  }

  return { apply, help: false, transport } as const;
}
