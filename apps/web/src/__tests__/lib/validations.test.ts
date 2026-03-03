import { describe, it, expect } from "vitest";
import {
  symptomsSchema,
  forecastSchema,
  imageUploadSchema,
} from "@/lib/validations";

describe("symptomsSchema", () => {
  const validSymptoms = {
    fever: true,
    age: 25,
    sex: "Male" as const,
    region: "Mumbai",
    residence_type: "Urban" as const,
    slept_under_net: false,
    anemia_level: "None" as const,
  };

  it("accepts valid symptom data", () => {
    const result = symptomsSchema.safeParse(validSymptoms);
    expect(result.success).toBe(true);
  });

  it("rejects negative age", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, age: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects age over 120", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, age: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects empty region", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, region: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sex enum", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, sex: "Alien" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid anemia level", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, anemia_level: "Critical" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid residence type", () => {
    const result = symptomsSchema.safeParse({ ...validSymptoms, residence_type: "Suburban" });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = symptomsSchema.safeParse({ fever: true });
    expect(result.success).toBe(false);
  });
});

describe("forecastSchema", () => {
  it("accepts valid forecast input", () => {
    const result = forecastSchema.safeParse({ region: "India", horizon_weeks: 4 });
    expect(result.success).toBe(true);
  });

  it("rejects horizon_weeks below 1", () => {
    const result = forecastSchema.safeParse({ region: "India", horizon_weeks: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects horizon_weeks above 14", () => {
    const result = forecastSchema.safeParse({ region: "India", horizon_weeks: 20 });
    expect(result.success).toBe(false);
  });

  it("rejects empty region", () => {
    const result = forecastSchema.safeParse({ region: "", horizon_weeks: 4 });
    expect(result.success).toBe(false);
  });

  it("accepts boundary values (1 and 14 weeks)", () => {
    expect(forecastSchema.safeParse({ region: "Delhi", horizon_weeks: 1 }).success).toBe(true);
    expect(forecastSchema.safeParse({ region: "Delhi", horizon_weeks: 14 }).success).toBe(true);
  });
});

describe("imageUploadSchema", () => {
  it("accepts a valid PNG file under 10MB", () => {
    const file = new File(["x".repeat(100)], "cell.png", { type: "image/png" });
    const result = imageUploadSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });

  it("accepts a valid JPEG file", () => {
    const file = new File(["x"], "cell.jpg", { type: "image/jpeg" });
    const result = imageUploadSchema.safeParse({ file });
    expect(result.success).toBe(true);
  });

  it("rejects non-image file types", () => {
    const file = new File(["x"], "data.pdf", { type: "application/pdf" });
    const result = imageUploadSchema.safeParse({ file });
    expect(result.success).toBe(false);
  });

  it("rejects files over 10MB", () => {
    // Create a mock file with size > 10MB
    const bigContent = new Array(10 * 1024 * 1024 + 1).fill("x").join("");
    const file = new File([bigContent], "huge.png", { type: "image/png" });
    const result = imageUploadSchema.safeParse({ file });
    expect(result.success).toBe(false);
  });
});
