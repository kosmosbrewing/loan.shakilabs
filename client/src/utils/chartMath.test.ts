import { describe, expect, it } from "vitest";
import { bulletWidth, normalizeSegments, positiveBarWidth } from "./chartMath";

describe("chartMath", () => {
  it("uses zero-based comparison bars", () => {
    expect(positiveBarWidth(0, 100)).toBe(0);
    expect(positiveBarWidth(25, 100)).toBe(25);
  });

  it("normalizes exact principal compositions", () => {
    expect(normalizeSegments([40, 60])).toEqual([0.4, 0.6]);
  });

  it("caps bullet bars at the regulatory limit", () => {
    expect(bulletWidth(0.2, 0.4)).toBe(50);
    expect(bulletWidth(0.5, 0.4)).toBe(100);
  });
});
