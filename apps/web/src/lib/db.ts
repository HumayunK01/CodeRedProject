/**
 * Database Client for Frontend
 *
 * This module provides functions to interact with the Flask backend API
 * for database operations. All CRUD operations go through the API endpoints.
 */

// Re-export types from our manual type definitions
// (We define these manually since the frontend doesn't use Prisma Client directly)
export type {
  User,
  Diagnosis,
  Forecast,
  Report,
  SystemLog,
  PatientSex,
  RiskLevel,
  ReportType,
  ReportStatus,
} from "./prisma-types";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_INFER_BASE_URL || "http://localhost:8000";

// Type definitions for service inputs (browser-safe)
export interface CreateUserInput {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export interface UserWithStats {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    diagnoses: number;
    forecasts: number;
    reports: number;
  };
}

export interface DiagnosisStats {
  total: number;
  positive: number;
  negative: number;
  lastDiagnosis: string | null;
}

export interface ForecastStats {
  total: number;
  active: number;
  highRisk: number;
  lastForecast: string | null;
}

// ============================================================================
// USER SERVICE
// ============================================================================

export const UserService = {
  /**
   * Sync a Clerk user with the database (create or update)
   */
  upsert: async (data: CreateUserInput): Promise<UserWithStats | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync user");
      }

      return await response.json();
    } catch (error) {
      console.error("[UserService.upsert] Error:", error);
      return null;
    }
  },

  /**
   * Get user with stats by Clerk ID
   */
  findByClerkIdWithStats: async (clerkId: string): Promise<UserWithStats | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${clerkId}/stats`);

      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json();
        throw new Error(error.error || "Failed to get user stats");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("[UserService.findByClerkIdWithStats] Error:", error);
      return null;
    }
  },
};

// ============================================================================
// DIAGNOSIS SERVICE
// ============================================================================

export const DiagnosisService = {
  /**
   * Create a new diagnosis/assessment record from ML result.
   * Note: 'confidence' parameter stores either the CNN confidence or the DHS risk score.
   */
  createFromMLResult: async (
    clerkId: string,
    imageUrl: string,
    mlResult: { label: string; confidence: number },
    metadata?: {
      patientAge?: number;
      patientSex?: string;
      location?: string;
      symptoms?: Record<string, boolean>;
      model_version?: string;
    }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnoses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId,
          imageUrl,
          result: mlResult.label,
          confidence: mlResult.confidence,
          ...metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create diagnosis");
      }

      return await response.json();
    } catch (error) {
      console.error("[DiagnosisService.createFromMLResult] Error:", error);
      throw error;
    }
  },

  /**
   * Get diagnoses for a user
   */
  getByClerkId: async (clerkId: string, limit: number = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnoses/${clerkId}?limit=${limit}`);

      if (!response.ok) {
        if (response.status === 404) return [];
        const error = await response.json();
        throw new Error(error.error || "Failed to get diagnoses");
      }

      return await response.json();
    } catch (error) {
      console.error("[DiagnosisService.getByClerkId] Error:", error);
      return [];
    }
  },

  /**
   * Get diagnosis statistics for a user
   */
  getStatsByClerkId: async (clerkId: string): Promise<DiagnosisStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnoses/${clerkId}/stats`);

      if (!response.ok) {
        if (response.status === 404) {
          return { total: 0, positive: 0, negative: 0, lastDiagnosis: null };
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to get diagnosis stats");
      }

      return await response.json();
    } catch (error) {
      console.error("[DiagnosisService.getStatsByClerkId] Error:", error);
      return { total: 0, positive: 0, negative: 0, lastDiagnosis: null };
    }
  },

  // Legacy method that uses userId - now redirects to use clerkId internally
  getStatsByUserId: async (userId: string): Promise<DiagnosisStats> => {
    console.warn("[DiagnosisService.getStatsByUserId] This method is deprecated. Use getStatsByClerkId instead.");
    return { total: 0, positive: 0, negative: 0, lastDiagnosis: null };
  },
};

// ============================================================================
// FORECAST SERVICE
// ============================================================================

export const ForecastService = {
  /**
   * Create a new forecast from ML result
   */
  createFromMLResult: async (
    clerkId: string,
    region: string,
    horizonWeeks: number,
    mlResult: {
      predictions: { week: string; cases: number }[];
      hotspot_score?: number;
      riskLevel?: string;
    }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forecasts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId,
          region,
          horizonWeeks,
          predictions: mlResult.predictions,
          hotspotScore: mlResult.hotspot_score,
          riskLevel: mlResult.riskLevel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create forecast");
      }

      return await response.json();
    } catch (error) {
      console.error("[ForecastService.createFromMLResult] Error:", error);
      throw error;
    }
  },

  /**
   * Get forecasts for a user
   */
  getByClerkId: async (clerkId: string, limit: number = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forecasts/${clerkId}?limit=${limit}`);

      if (!response.ok) {
        if (response.status === 404) return [];
        const error = await response.json();
        throw new Error(error.error || "Failed to get forecasts");
      }

      return await response.json();
    } catch (error) {
      console.error("[ForecastService.getByClerkId] Error:", error);
      return [];
    }
  },

  /**
   * Get forecast statistics for a user
   */
  getStatsByClerkId: async (clerkId: string): Promise<ForecastStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forecasts/${clerkId}/stats`);

      if (!response.ok) {
        if (response.status === 404) {
          return { total: 0, active: 0, highRisk: 0, lastForecast: null };
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to get forecast stats");
      }

      return await response.json();
    } catch (error) {
      console.error("[ForecastService.getStatsByClerkId] Error:", error);
      return { total: 0, active: 0, highRisk: 0, lastForecast: null };
    }
  },

  // Legacy method that uses userId - now returns empty stats
  getStatsByUserId: async (userId: string): Promise<ForecastStats> => {
    console.warn("[ForecastService.getStatsByUserId] This method is deprecated. Use getStatsByClerkId instead.");
    return { total: 0, active: 0, highRisk: 0, lastForecast: null };
  },
};

// ============================================================================
// REPORT SERVICE (placeholder)
// ============================================================================

export const ReportService = {
  create: async () => {
    console.warn("[ReportService.create] Not yet implemented via API");
    return { id: `local-${Date.now()}` };
  },
};