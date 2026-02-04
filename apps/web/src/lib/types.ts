// Foresee Type Definitions

// Re-export Prisma types from db.ts (which handles the @prisma/client import)
export type {
  User,
  Diagnosis,
  Forecast,
  Report,
  SystemLog,
} from "@/lib/db";

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
  sex: 'Male' | 'Female' | 'Other';
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

export interface DashboardStats {
  today_diagnoses: number;
  active_forecasts: number;
  risk_regions: number;
  system_health: number;
  model_accuracy: string;
  response_time: string;
  data_security: string;
  global_reach: string;
  recent_activity: {
    type: string;
    title: string;
    time: string;
    result: string;
    status: string;
  }[];
}

export interface ApiError {
  error?: {
    message: string;
  };
}