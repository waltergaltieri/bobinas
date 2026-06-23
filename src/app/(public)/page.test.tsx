import { describe, expect, it } from "vitest";

import { categoryImageClassName, categoryOverlayClassName } from "./page";

describe("home category cards", () => {
  it("shows category images clearly until hover diffuses them", () => {
    const imageClasses = categoryImageClassName.split(" ");
    const overlayClasses = categoryOverlayClassName.split(" ");

    expect(imageClasses).toContain("opacity-90");
    expect(imageClasses).toContain("group-hover:blur-[2px]");
    expect(imageClasses).not.toContain("grayscale");
    expect(imageClasses).not.toContain("opacity-40");

    expect(overlayClasses).not.toContain("backdrop-blur-sm");
    expect(overlayClasses).toContain("group-hover:backdrop-blur-sm");
  });
});
