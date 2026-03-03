import { describe, it, expect } from "vitest";
import { INDIA_REGIONS } from "@/lib/constants";

describe("INDIA_REGIONS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(INDIA_REGIONS)).toBe(true);
    expect(INDIA_REGIONS.length).toBeGreaterThan(0);
  });

  it("contains no duplicates", () => {
    const unique = new Set(INDIA_REGIONS);
    expect(unique.size).toBe(INDIA_REGIONS.length);
  });

  it("contains major metros", () => {
    const metros = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
    for (const city of metros) {
      expect(INDIA_REGIONS).toContain(city);
    }
  });

  it("every entry is a non-empty string", () => {
    for (const region of INDIA_REGIONS) {
      expect(typeof region).toBe("string");
      expect(region.length).toBeGreaterThan(0);
    }
  });
});
