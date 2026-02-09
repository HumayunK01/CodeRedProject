// Foresee API Client (Real API Only)

import { DiagnosisResult, SymptomsInput, ForecastResult, ForecastInput, HealthStatus, ApiError, DashboardStats } from './types';
import { StorageManager } from './storage';

const BASE_URL = import.meta.env.VITE_INFER_BASE_URL || 'http://localhost:8000';
const TIMEOUT_MS = 15000;

class ApiClient {
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async predictImage(file: File): Promise<DiagnosisResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/predict/image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error?.message || 'Image prediction failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to predict image. Please try again.');
    }
  }

  /**
   * Stage 1: DHS-Based Risk Stratification
   * Estimates screening risk based on epidemiological factors.
   */
  async predictSymptoms(symptoms: SymptomsInput): Promise<DiagnosisResult> {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/predict/symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptoms)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Risk assessment failed';
        try {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.error?.message || errorMessage;
        } catch {
          // If parsing fails, use the raw error text
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate risk assessment. Please try again.');
    }
  }

  async forecastRegion(input: ForecastInput): Promise<ForecastResult> {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/forecast/region`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Forecast failed';
        try {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.error?.message || errorMessage;
        } catch {
          // If parsing fails, use the raw error text
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate forecast. Please try again.');
    }
  }

  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/health`);

      if (!response.ok) {
        return {
          status: 'down',
          message: `Service unavailable (${response.status})`,
          timestamp: new Date().toISOString()
        };
      }

      return response.json();
    } catch (error) {
      return {
        status: 'down',
        message: 'Connection failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get stored results to send to backend for real statistics
      const storedResults = StorageManager.getAllResults();

      // Encode stored results as URL parameter
      const encodedResults = encodeURIComponent(JSON.stringify(storedResults));

      const response = await this.fetchWithTimeout(`${BASE_URL}/dashboard/stats?stored_results=${encodedResults}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch dashboard statistics. Please try again.');
    }
  }
  async generateReport(data: any): Promise<Blob> {
    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/api/generate_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Report generation failed: ${response.status} ${errorText}`);
      }

      return response.blob();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate report. Please try again.');
    }
  }
}

export const apiClient = new ApiClient();