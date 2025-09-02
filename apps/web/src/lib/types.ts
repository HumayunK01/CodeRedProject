// BioSentinel Type Definitions

export interface DiagnosisResult {
  label: string;
  confidence: number;
  probability?: number;
  threshold?: number;
  explanations?: {
    gradcam?: string;
  };
}

export interface SymptomsInput {
  fever: boolean;
  chills: boolean;
  headache: boolean;
  anemia: boolean;
  nausea: boolean;
  age: number;
  region: string;
}

export interface ForecastInput {
  region: string;
  horizon_weeks: number;
}

export interface ForecastResult {
  region: string;
  predictions: {
    week: string;
    cases: number;
  }[];
  hotspot_score?: number;
  hotspots?: {
    lat: number;
    lng: number;
    intensity: number;
  }[];
}

export interface HealthStatus {
  status: 'ok' | 'warn' | 'down';
  message?: string;
  timestamp?: string;
}

export interface StoredResult {
  id: string;
  type: 'diagnosis' | 'forecast';
  timestamp: string;
  input: SymptomsInput | ForecastInput | { image: string };
  result: DiagnosisResult | ForecastResult;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
  };
}