import { describe, it, expect } from "vitest";
import {
  features,
  stats,
  benefits,
  testimonials,
  steps,
  featureHeadline,
} from "@/data/landing-page";

describe("landing-page data", () => {
  describe("features", () => {
    it("has exactly 3 features", () => {
      expect(features).toHaveLength(3);
    });

    it("each feature has required fields", () => {
      for (const feature of features) {
        expect(feature).toHaveProperty("title");
        expect(feature).toHaveProperty("description");
        expect(feature).toHaveProperty("icon");
        expect(feature).toHaveProperty("link");
        expect(feature.link).toMatch(/^\//); // starts with /
      }
    });

    it("links point to valid app routes", () => {
      const validRoutes = ["/diagnosis", "/forecast", "/reports", "/dashboard", "/status"];
      for (const feature of features) {
        expect(validRoutes).toContain(feature.link);
      }
    });
  });

  describe("stats", () => {
    it("has 4 stats", () => {
      expect(stats).toHaveLength(4);
    });

    it("each stat has label, value, icon, suffix", () => {
      for (const stat of stats) {
        expect(stat).toHaveProperty("label");
        expect(stat).toHaveProperty("value");
        expect(stat).toHaveProperty("icon");
        expect(stat).toHaveProperty("suffix");
      }
    });
  });

  describe("testimonials", () => {
    it("has at least 3 testimonials", () => {
      expect(testimonials.length).toBeGreaterThanOrEqual(3);
    });

    it("each testimonial has name, role, content, rating", () => {
      for (const t of testimonials) {
        expect(t.name).toBeTruthy();
        expect(t.role).toBeTruthy();
        expect(t.content).toBeTruthy();
        expect(t.rating).toBeGreaterThanOrEqual(1);
        expect(t.rating).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("steps", () => {
    it("has 3 steps in order", () => {
      expect(steps).toHaveLength(3);
      expect(steps[0].step).toBe("1");
      expect(steps[1].step).toBe("2");
      expect(steps[2].step).toBe("3");
    });
  });

  describe("featureHeadline", () => {
    it("has all parts defined", () => {
      expect(featureHeadline.part1).toBeTruthy();
      expect(featureHeadline.part2).toBeTruthy();
      expect(featureHeadline.part3).toBeTruthy();
      expect(featureHeadline.part4).toBeTruthy();
    });
  });

  describe("benefits", () => {
    it("each benefit has title, description, icon, color", () => {
      for (const b of benefits) {
        expect(b.title).toBeTruthy();
        expect(b.description).toBeTruthy();
        expect(b.icon).toBeDefined();
        expect(b.color).toMatch(/^text-/);
      }
    });
  });
});
