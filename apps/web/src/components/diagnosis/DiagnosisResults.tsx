import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Info, Microscope, Activity } from "lucide-react";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { DownloadReportButton } from "@/components/diagnosis/DownloadReportButton";
import { useCurrentUser } from "@/components/providers/DbUserProvider";

interface DiagnosisResultsProps {
  results: DiagnosisResult | null;
  isLoading: boolean;
  patientData?: SymptomsInput & { id?: string; timestamp?: string };
  imageData?: { image: string; id?: string; timestamp?: string };
}

export const DiagnosisResults = ({ results, isLoading, patientData, imageData }: DiagnosisResultsProps) => {
  const isImageDiagnosis = imageData !== undefined && imageData.image !== undefined;
  const { user } = useCurrentUser();

  // Get patient name from Clerk user or use fallback
  const patientName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || "Patient";



  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/5 rounded-lg">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary">Processing Data</h4>
            <p className="text-xs text-muted-foreground">Running AI models...</p>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-[20px] bg-primary/5" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-[16px] bg-primary/5" />
            <Skeleton className="h-20 rounded-[16px] bg-primary/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[300px] border-2 border-dashed border-primary/10 rounded-[24px]">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
          <Microscope className="h-8 w-8 text-primary/40" />
        </div>
        <div className="max-w-[200px]">
          <h4 className="text-sm font-semibold text-primary">Your results will appear here once the assessment is complete.</h4>
          <p className="text-xs text-muted-foreground mt-1">Review the information on the left, then submit to see the analysis.</p>
        </div>
      </div>
    );
  }

  const probability = results.probability ?? results.confidence ?? 0;
  const confidencePercentage = Math.round(probability * 100);

  return (
    <>
      <div
        className="h-full flex flex-col"
      >
        {/* Result Header */}
        <div className={`p-6 rounded-[24px] mb-4 text-center relative overflow-hidden ${results.label.includes('Positive') || results.label.includes('High')
          ? 'bg-rose-500/10 border border-rose-500/20'
          : 'bg-emerald-500/10 border border-emerald-500/20'
          }`}>
          <div className="relative z-10 flex flex-col items-center">
            {results.label.includes('Positive') || results.label.includes('High') ? (
              <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30">
                <XCircle className="h-6 w-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-6 w-6" />
              </div>
            )}

            <h2 className={`text-2xl font-bold mb-1 ${results.label.includes('Positive') || results.label.includes('High') ? 'text-rose-600' : 'text-emerald-600'
              }`}>
              {results.label}
            </h2>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
              {isImageDiagnosis ? 'Microscopy Result' : 'Risk Level'}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="bg-white/40 border border-white/60 p-4 rounded-[20px] flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Confidence</p>
              <p className="text-2xl font-bold text-primary">{confidencePercentage}%</p>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-primary/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-primary" strokeDasharray={`${confidencePercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-white/40 border border-white/60 p-5 rounded-[20px] flex-1">
          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" /> AI Model Interpretation
          </h4>
          <p className="text-sm text-foreground/70 leading-relaxed mb-4">
            {results.label.includes('High') || results.label.includes('Positive')
              ? "Our Machine Learning model has identified patterns consistent with high-risk pathology. This analysis is based on probabilistic inference from the input data."
              : "The Machine Learning model probability suggests a low likelihood of immediate anomalies based on current clinical vectors."
            }
          </p>

          <div className="bg-primary/5 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Model Architecture:</span>
              <span className="text-primary font-bold">{isImageDiagnosis ? "Convolutional Neural Network (CNN)" : "Random Forest Classifier"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Inference Engine:</span>
              <span className="text-primary font-bold">{isImageDiagnosis ? "TensorFlow" : "Scikit-Learn"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Model Version:</span>
              <span className="text-primary font-bold">{isImageDiagnosis ? "v2.1.0 (Vision)" : "v3.1.2 (Stable)"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary/5">
            <DownloadReportButton
              diagnosisData={{
                ...results,
                patientName: patientName,
                patientAge: patientData?.age?.toString(),
                patientSex: patientData?.sex,
                result: results.label,
                confidence: results.probability ?? results.confidence,
                symptoms: patientData ? {
                  fever: patientData.fever,
                  chills: patientData.chills,
                  headache: patientData.headache,
                  fatigue: patientData.fatigue,
                  muscle_aches: patientData.muscle_aches,
                  nausea: patientData.nausea,
                  diarrhea: patientData.diarrhea,
                  abdominal_pain: patientData.abdominal_pain,
                  cough: patientData.cough,
                  skin_rash: patientData.skin_rash
                } : undefined,
              }}
              className="w-full"
            />
          </div>


        </div>

      </div>
    </>
  );
};