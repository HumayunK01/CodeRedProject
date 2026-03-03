import { describe, it, expect, beforeEach } from "vitest";
import { StorageManager } from "@/lib/storage";
import type { StoredResult } from "@/lib/types";

// Helper to create a fake stored result
function makeResult(overrides: Partial<StoredResult> = {}): StoredResult {
  return {
    id: overrides.id ?? Date.now().toString(),
    type: overrides.type ?? "diagnosis",
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    input: overrides.input ?? { image: "test.png" },
    result: overrides.result ?? {
      label: "Parasitized",
      confidence: 0.95,
      method: "cnn",
      model_version: "1.0",
    },
  };
}

describe("StorageManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveResult / getAllResults", () => {
    it("saves and retrieves a result", () => {
      const result = makeResult({ id: "r1" });
      StorageManager.saveResult(result);

      const all = StorageManager.getAllResults();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("r1");
    });

    it("newest result appears first (prepend order)", () => {
      StorageManager.saveResult(makeResult({ id: "old" }));
      StorageManager.saveResult(makeResult({ id: "new" }));

      const all = StorageManager.getAllResults();
      expect(all[0].id).toBe("new");
      expect(all[1].id).toBe("old");
    });

    it("caps storage at 50 results", () => {
      for (let i = 0; i < 55; i++) {
        StorageManager.saveResult(makeResult({ id: `r${i}` }));
      }
      expect(StorageManager.getAllResults()).toHaveLength(50);
    });
  });

  describe("getResultById", () => {
    it("returns the matching result", () => {
      StorageManager.saveResult(makeResult({ id: "target" }));
      StorageManager.saveResult(makeResult({ id: "other" }));

      const found = StorageManager.getResultById("target");
      expect(found).not.toBeNull();
      expect(found?.id).toBe("target");
    });

    it("returns null for non-existent ID", () => {
      expect(StorageManager.getResultById("nope")).toBeNull();
    });
  });

  describe("deleteResult", () => {
    it("removes only the specified result", () => {
      StorageManager.saveResult(makeResult({ id: "keep" }));
      StorageManager.saveResult(makeResult({ id: "delete-me" }));

      StorageManager.deleteResult("delete-me");

      const all = StorageManager.getAllResults();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("keep");
    });

    it("does nothing if ID doesn't exist", () => {
      StorageManager.saveResult(makeResult({ id: "a" }));
      StorageManager.deleteResult("nonexistent");
      expect(StorageManager.getAllResults()).toHaveLength(1);
    });
  });

  describe("clearAll", () => {
    it("removes all stored results", () => {
      StorageManager.saveResult(makeResult({ id: "a" }));
      StorageManager.saveResult(makeResult({ id: "b" }));

      StorageManager.clearAll();
      expect(StorageManager.getAllResults()).toHaveLength(0);
    });
  });

  describe("exportToCsv", () => {
    it("returns 'No data to export' when empty", () => {
      expect(StorageManager.exportToCsv()).toBe("No data to export");
    });

    it("returns CSV with headers and data rows", () => {
      StorageManager.saveResult(makeResult({ id: "csv-test", type: "diagnosis" }));

      const csv = StorageManager.exportToCsv();
      const lines = csv.split("\n");

      expect(lines[0]).toContain("ID");
      expect(lines[0]).toContain("Type");
      expect(lines[0]).toContain("Timestamp");
      expect(lines).toHaveLength(2); // header + 1 data row
      expect(lines[1]).toContain("csv-test");
      expect(lines[1]).toContain("diagnosis");
    });
  });

  describe("exportToJson", () => {
    it("returns valid JSON string", () => {
      StorageManager.saveResult(makeResult({ id: "json-test" }));

      const json = StorageManager.exportToJson();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].id).toBe("json-test");
    });
  });

  describe("exportToPdf", () => {
    it("returns a Blob", async () => {
      StorageManager.saveResult(makeResult({ id: "pdf-test" }));

      const blob = await StorageManager.exportToPdf();
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");
    });
  });
});
