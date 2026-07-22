import { describe, expect, it } from "vitest";

import { parseDarefImportArgs } from "./cli";

describe("parseDarefImportArgs", () => {
  it("defaults to a safe dry-run", () => {
    expect(parseDarefImportArgs([])).toEqual({ apply: false, help: false });
  });

  it("accepts the explicit confirmation for the real load", () => {
    expect(
      parseDarefImportArgs(["--apply", "--confirm", "DAREF-422"]),
    ).toEqual({ apply: true, help: false });
  });

  it("accepts positional arguments forwarded reliably by npm on Windows", () => {
    expect(parseDarefImportArgs(["apply", "DAREF-422"])).toEqual({
      apply: true,
      help: false,
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
    });
    expect(parseDarefImportArgs(["help"])).toEqual({
      apply: false,
      help: true,
    });
  });
});
