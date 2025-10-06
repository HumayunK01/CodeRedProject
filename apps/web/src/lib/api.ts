// OutbreakLens API Client with Mock Fallbacks

import { DiagnosisResult, SymptomsInput, ForecastResult, ForecastInput, HealthStatus, ApiError } from './types';

const DEMO_MODE = !import.meta.env.VITE_INFER_BASE_URL || import.meta.env.VITE_INFER_BASE_URL === 'http://localhost:8000';
const BASE_URL = import.meta.env.VITE_INFER_BASE_URL || '';
const TIMEOUT_MS = 15000;

class ApiClient {
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async predictImage(file: File): Promise<DiagnosisResult> {
    if (DEMO_MODE) {
      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        label: 'Positive',
        confidence: 0.87,
        explanations: {
          gradcam: '/placeholder.svg' // Would be base64 image in real API
        }
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await this.fetchWithTimeout(`${BASE_URL}/predict/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message || 'Image prediction failed');
    }

    return response.json();
  }

  async predictSymptoms(symptoms: SymptomsInput): Promise<DiagnosisResult> {
    if (DEMO_MODE) {
      // Mock response based on symptoms
      await new Promise(resolve => setTimeout(resolve, 1200));
      const riskFactors = [
        symptoms.fever, symptoms.chills, symptoms.headache,
        symptoms.fatigue, symptoms.muscle_aches, symptoms.nausea,
        symptoms.diarrhea, symptoms.abdominal_pain, symptoms.cough,
        symptoms.skin_rash
      ].filter(Boolean).length;

      // Enhanced calculation considering age and follow-up answers
      let ageFactor = 0;
      if (symptoms.age > 0) {
        ageFactor = symptoms.age > 60 ? 0.15 : symptoms.age > 40 ? 0.1 : 0.05;
      }

      let followUpBonus = 0;
      if (symptoms.followUpAnswers && typeof symptoms.followUpAnswers === 'object') {
        const followUps = symptoms.followUpAnswers as Record<string, any>;
        // Fever pattern analysis
        if (followUps.fever_hasFever === 'intermittent') followUpBonus += 0.2;
        if (followUps.fever_severity === 'severe') followUpBonus += 0.15;
        // Chills pattern
        if (followUps.chills_pattern === 'before-fever') followUpBonus += 0.1;
        if (followUps.fever_duration === 'week-plus') followUpBonus += 0.1;
      }

      const probability = Math.min(0.15 + (riskFactors * 0.12) + ageFactor + followUpBonus, 0.95);

      return {
        label: probability > 0.6 ? 'High Risk' : probability > 0.3 ? 'Medium Risk' : 'Low Risk',
        probability,
        threshold: 0.6,
        confidence: 0.85
      };
    }

    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/predict/symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptoms),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error.message || 'Symptoms prediction failed');
      }

      return response.json();
    } catch (error) {
      console.warn('Real API call failed, falling back to mock data:', error);
      // If real API fails, return mock data instead of throwing
      return this.getMockPrediction(symptoms);
    }
  }

  private getMockPrediction(symptoms: SymptomsInput): DiagnosisResult {
    // Mock response based on symptoms - duplicate of the DEMO_MODE logic
    const riskFactors = [
      symptoms.fever, symptoms.chills, symptoms.headache,
      symptoms.fatigue, symptoms.muscle_aches, symptoms.nausea,
      symptoms.diarrhea, symptoms.abdominal_pain, symptoms.cough,
      symptoms.skin_rash
    ].filter(Boolean).length;

    // Enhanced calculation considering age and follow-up answers
    let ageFactor = 0;
    if (symptoms.age > 0) {
      ageFactor = symptoms.age > 60 ? 0.15 : symptoms.age > 40 ? 0.1 : 0.05;
    }

    let followUpBonus = 0;
    if (symptoms.followUpAnswers && typeof symptoms.followUpAnswers === 'object') {
      const followUps = symptoms.followUpAnswers as Record<string, any>;
      // Fever pattern analysis
      if (followUps.fever_hasFever === 'intermittent') followUpBonus += 0.2;
      if (followUps.fever_severity === 'severe') followUpBonus += 0.15;
      // Chills pattern
      if (followUps.chills_pattern === 'before-fever') followUpBonus += 0.1;
      if (followUps.fever_duration === 'week-plus') followUpBonus += 0.1;
    }

    const probability = Math.min(0.15 + (riskFactors * 0.12) + ageFactor + followUpBonus, 0.95);

    return {
      label: probability > 0.6 ? 'High Risk' : probability > 0.3 ? 'Medium Risk' : 'Low Risk',
      probability,
      threshold: 0.6,
      confidence: 0.85
    };
  }

  async forecastRegion(input: ForecastInput): Promise<ForecastResult> {
    if (DEMO_MODE) {
      // Mock forecast data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const weeks = Array.from({ length: input.horizon_weeks }, (_, i) => {
        const weekNum = i + 1;
        const baseCases = 100 + Math.sin(weekNum * 0.5) * 50;
        const cases = Math.max(0, Math.floor(baseCases + Math.random() * 30 - 15));
        
        return {
          week: `2024-W${String(weekNum).padStart(2, '0')}`,
          cases
        };
      });

      // Mock hotspots around Mumbai
      const hotspots = [
        { lat: 19.0760, lng: 72.8777, intensity: 0.8 },
        { lat: 19.1136, lng: 72.8697, intensity: 0.6 },
        { lat: 18.9220, lng: 72.8347, intensity: 0.7 },
      ];

      return {
        region: input.region,
        predictions: weeks,
        hotspot_score: 0.72,
        hotspots
      };
    }

    try {
      const response = await this.fetchWithTimeout(`${BASE_URL}/forecast/region`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error.message || 'Forecast failed');
      }

      return response.json();
    } catch (error) {
      console.warn('Real forecast API call failed, falling back to mock data:', error);
      // If real API fails, return mock data instead of throwing
      return this.getMockForecast(input);
    }
  }

  private getMockForecast(input: ForecastInput): ForecastResult {
    // Mock forecast data - duplicate of the DEMO_MODE logic
    const weeks = Array.from({ length: input.horizon_weeks }, (_, i) => {
      const weekNum = i + 1;
      const baseCases = 100 + Math.sin(weekNum * 0.5) * 50;
      const cases = Math.max(0, Math.floor(baseCases + Math.random() * 30 - 15));

      return {
        week: `2024-W${String(weekNum).padStart(2, '0')}`,
        cases
      };
    });

    // Mock hotspots around Mumbai
    const hotspots = [
      { lat: 19.0760, lng: 72.8777, intensity: 0.8 },
      { lat: 19.1136, lng: 72.8697, intensity: 0.6 },
      { lat: 18.9220, lng: 72.8347, intensity: 0.7 },
    ];

    return {
      region: input.region,
      predictions: weeks,
      hotspot_score: 0.72,
      hotspots
    };
  }

  async getHealth(): Promise<HealthStatus> {
    if (DEMO_MODE) {
      return {
        status: 'ok',
        message: 'Demo mode - all systems operational',
        timestamp: new Date().toISOString()
      };
    }

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
}

export const apiClient = new ApiClient();
export { DEMO_MODE };