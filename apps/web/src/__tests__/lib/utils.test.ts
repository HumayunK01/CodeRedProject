import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() — Tailwind class merge utility", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("filters out falsy values", () => {
    expect(cn("base", false, null, undefined, 0, "extra")).toBe("base extra");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles array input", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });
});
