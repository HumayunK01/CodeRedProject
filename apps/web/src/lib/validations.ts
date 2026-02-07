// Foresee Validation Schemas

import { z } from 'zod';

export const symptomsSchema = z.object({
  fever: z.boolean(),
  age: z.number().min(0, 'Age must be positive').max(120, 'Age must be realistic'),
  sex: z.enum(['Male', 'Female', 'Other']),
  region: z.string().min(1, 'Region is required').max(100, 'Region name too long'),
  chills: z.boolean().optional(),
  headache: z.boolean().optional(),
  fatigue: z.boolean().optional(),
  muscle_aches: z.boolean().optional(),
  nausea: z.boolean().optional(),
  diarrhea: z.boolean().optional(),
  abdominal_pain: z.boolean().optional(),
  cough: z.boolean().optional(),
  skin_rash: z.boolean().optional(),
});

export const forecastSchema = z.object({
  region: z.string().min(1, 'Region is required').max(100, 'Region name too long'),
  horizon_weeks: z.number().min(1, 'Minimum 1 week').max(14, 'Maximum 14 weeks'),
});

export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Only JPEG and PNG files are allowed'
    ),
});

export const diagnosisResultSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  probability: z.number().min(0).max(1).optional(),
  threshold: z.number().min(0).max(1).optional(),
  explanations: z.object({
    gradcam: z.string().optional(),
  }).optional(),
});

export const forecastResultSchema = z.object({
  region: z.string(),
  predictions: z.array(z.object({
    week: z.string(),
    cases: z.number().min(0),
  })),
  hotspot_score: z.number().min(0).max(1).optional(),
  hotspots: z.array(z.object({
    lat: z.number(),
    lng: z.number(),
    intensity: z.number().min(0).max(1),
  })).optional(),
});

export const healthStatusSchema = z.object({
  status: z.enum(['ok', 'warn', 'down']),
  message: z.string().optional(),
  timestamp: z.string().optional(),
});

export type SymptomsFormData = z.infer<typeof symptomsSchema>;
export type ForecastFormData = z.infer<typeof forecastSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;