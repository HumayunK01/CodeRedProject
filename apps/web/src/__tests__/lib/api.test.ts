import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ApiClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("getHealth()", () => {
    it("returns health status on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "ok", message: "Healthy" }),
      });

      const result = await apiClient.getHealth();
      expect(result).toEqual({ status: "ok", message: "Healthy" });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("returns down status on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const result = await apiClient.getHealth();
      expect(result.status).toBe("down");
      expect(result.message).toContain("500");
    });
  });

  describe("predictSymptoms()", () => {
    it("sends correct payload and returns result", async () => {
      const mockResult = {
        label: "High Risk",
        confidence: 0.87,
        method: "dhs_model",
        model_version: "2.0",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const symptoms = {
        fever: true,
        age_months: 300,
        state: "Maharashtra",
        residence_type: "Urban",
        slept_under_net: false,
      };

      const result = await apiClient.predictSymptoms(symptoms);
      expect(result).toEqual(mockResult);

      // Verify the request was made with correct options
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/predict/symptoms");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });
      expect(JSON.parse(options.body)).toEqual(symptoms);
    });

    it("throws descriptive error on API failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: { message: "Invalid input" } })),
      });

      await expect(
        apiClient.predictSymptoms({
          fever: true,
          age_months: 300,
          state: "Test",
          residence_type: "Urban",
          slept_under_net: false,
        })
      ).rejects.toThrow();
    });
  });

  describe("predictImage()", () => {
    it("sends file as FormData", async () => {
      const mockResult = {
        label: "Parasitized",
        confidence: 0.95,
        method: "cnn",
        model_version: "1.0",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const file = new File(["fake-image-data"], "cell.png", { type: "image/png" });
      const result = await apiClient.predictImage(file);

      expect(result).toEqual(mockResult);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/predict/image");
      expect(options.method).toBe("POST");
      expect(options.body).toBeInstanceOf(FormData);
    });
  });

  describe("forecastRegion()", () => {
    it("sends correct payload and returns forecast", async () => {
      const mockForecast = {
        region: "India",
        predictions: [
          { week: "2026-W10", cases: 150 },
          { week: "2026-W11", cases: 175 },
        ],
        hotspot_score: 0.65,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecast),
      });

      const result = await apiClient.forecastRegion({ region: "India", horizon_weeks: 4 });
      expect(result).toEqual(mockForecast);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/forecast");
      expect(options.method).toBe("POST");
    });
  });

  describe("getForecastRegions()", () => {
    it("returns array of region strings", async () => {
      const regions = ["India", "Brazil", "Global"];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ regions }),
      });

      const result = await apiClient.getForecastRegions();
      expect(result).toEqual(regions);
    });
  });

  describe("network failure handling", () => {
    it("getHealth returns down status on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await apiClient.getHealth();
      expect(result.status).toBe("down");
      expect(result.message).toBe("Connection failed");
    });

    it("predictSymptoms throws on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        apiClient.predictSymptoms({
          fever: true,
          age_months: 300,
          state: "Test",
          residence_type: "Urban",
          slept_under_net: false,
        })
      ).rejects.toThrow("Network error");
    });
  });
});
