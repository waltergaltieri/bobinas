import { describe, expect, it } from "vitest";

import { getDatabaseClientOptions } from "./index";

describe("database client options", () => {
  it("uses a single connection by default to avoid exhausting Supabase direct connections", () => {
    expect(getDatabaseClientOptions({})).toMatchObject({
      max: 1,
      idle_timeout: 20,
      prepare: false,
    });
  });

  it("allows a validated DATABASE_MAX_CONNECTIONS override", () => {
    expect(
      getDatabaseClientOptions({ DATABASE_MAX_CONNECTIONS: "3" }),
    ).toMatchObject({
      max: 3,
    });

    expect(
      getDatabaseClientOptions({ DATABASE_MAX_CONNECTIONS: "not-a-number" }),
    ).toMatchObject({
      max: 1,
    });
  });
});
