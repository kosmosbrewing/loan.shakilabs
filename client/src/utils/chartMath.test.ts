import { describe, expect, it } from "vitest";
import { positiveBarWidth } from "./chartMath";

describe("chartMath", () => {
  it("uses zero-based comparison bars", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(25, 100)).toBe(25);
  });

});
