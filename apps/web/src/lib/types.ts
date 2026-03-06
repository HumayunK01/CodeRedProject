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
  confidence: number | null;
  risk_score?: number; // Added
  method: string;
  model_version: string;
  probability?: number;
  threshold?: number;
  explanations?: {
    gradcam?: string;
  };
}

export interface SymptomsInput {
  // ML Features
  fever: boolean | number;
  age_months: number;
  state: string;
  residence_type: string;
  slept_under_net: boolean | number;
  anemia_level?: number | null;
  interview_month?: number;

  // UI/Legacy fields
  age?: number;
  sex?: string;
  region?: string;

  // DB-stored symptom map (JSON blob from persistence layer)
  symptoms?: Record<string, unknown> | unknown[];
}

export interface ForecastInput {
  region: string;
  horizon_weeks: number;
  scenario?: {
    vector_control_delta?: number;
    net_coverage_delta?: number;
    reporting_delay_delta?: number;
  };
}

export interface ForecastPrediction {
  week: string;
  /** v2 field */
  point?: number;
  /** v2 uncertainty bounds */
  p10?: number;
  p50?: number;
  p90?: number;
  /** v2 model agreement score 0-1 */
  model_agreement?: number;
  /** v1 legacy field */
  cases?: number;
}

export interface ForecastHotspot {
  name?: string;
  intensity: number;
  lat: number;
  lng: number;
}

export interface ForecastResult {
  region: string;
  disease?: string;
  model_version?: string;
  historical?: {
    week: string;
    cases: number;
  }[];
  predictions: ForecastPrediction[];
  hotspot_score?: number;
  hotspots?: ForecastHotspot[];
  live_insights?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    news_articles_found: number;
    top_headlines: string[];
  };
  freshness?: {
    weather_fresh: boolean;
    news_fresh: boolean;
  };
  risk_fusion?: {
    fused_risk_score: number;
    risk_level: string;
    components: {
      forecast_trend: number;
      weather_suitability: number;
      news_pressure: number;
      symptom_risk: number;
    };
  };
  drift_status?: {
    drift_detected: boolean;
    mode?: string;
    samples_observed?: number;
    recent_drift_events_24h?: number;
    last_drift_time?: number | null;
    status?: string;
  };
  explanation?: {
    top_drivers: { feature: string; importance: number }[];
    reasons: { code: string; severity: string; text: string }[];
    confidence_level: string;
    interval_relative_width?: number;
    model_agreement?: number;
  };
  scenario?: {
    predictions: ForecastPrediction[];
    effect_summary: {
      cases_averted: number;
      pct_change: number;
    };
  };
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
  today_positive?: number;
  active_forecasts: number;
  high_risk_forecasts?: number;
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