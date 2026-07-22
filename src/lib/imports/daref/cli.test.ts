import { describe, expect, it } from "vitest";

import { parseDarefImportArgs } from "./cli";

describe("parseDarefImportArgs", () => {
  it("defaults to a safe dry-run", () => {
    expect(parseDarefImportArgs([])).toEqual({
      apply: false,
      help: false,
      transport: "database",
    });
  });

  it("accepts the explicit confirmation for the real load", () => {
    expect(
      parseDarefImportArgs(["--apply", "--confirm", "DAREF-422"]),
    ).toEqual({ apply: true, help: false, transport: "database" });
  });

  it("accepts positional arguments forwarded reliably by npm on Windows", () => {
    expect(parseDarefImportArgs(["apply", "DAREF-422"])).toEqual({
      apply: true,
      help: false,
      transport: "database",
    });
  });

  it("accepts the Supabase service API transport", () => {
    expect(
      parseDarefImportArgs(["apply", "DAREF-422", "supabase"]),
    ).toEqual({
      apply: true,
      help: false,
      transport: "supabase",
    });
  });

  it("rejects applying without the exact confirmation token", () => {
    expect(() => parseDarefImportArgs(["--apply"])).toThrow(
      "La carga real requiere --confirm DAREF-422",
    );
  });

  it("returns help without requiring confirmation", () => {
    expect(parseDarefImportArgs(["--help"])).toEqual({
      apply: false,
      help: true,
      transport: "database",
    });
    expect(parseDarefImportArgs(["help"])).toEqual({
      apply: false,
      help: true,
      transport: "database",
    });
  });
});
