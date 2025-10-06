// OutbreakLens Type Definitions

// Export Prisma types for convenience
export type {
  User,
  Diagnosis,
  Forecast,
  Report,
  SystemLog,
} from "../../../../database/generated";

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
  fatigue: boolean;
  muscle_aches: boolean;
  nausea: boolean;
  diarrhea: boolean;
  abdominal_pain: boolean;
  cough: boolean;
  skin_rash: boolean;
  age: number;
  region: string;
  followUpAnswers?: Record<string, any>;
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