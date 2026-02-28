import { useState, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Info, Microscope, Activity, Stethoscope, Sparkles } from "lucide-react";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { DownloadReportButton } from "@/components/diagnosis/DownloadReportButton";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { chatbotService } from "@/lib/chatbot";

interface DiagnosisResultsProps {
  results: DiagnosisResult | null;
  isLoading: boolean;
  patientData?: SymptomsInput & { id?: string; timestamp?: string };
  imageData?: { image: string; id?: string; timestamp?: string };
}

export const DiagnosisResults = ({ results, isLoading, patientData, imageData }: DiagnosisResultsProps) => {
  const isImageDiagnosis = imageData !== undefined && imageData.image !== undefined;
  const { user } = useCurrentUser();
  const [guidance, setGuidance] = useState<string | null>(null);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);

  // Get patient name from Clerk user or use fallback
  const patientName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || "Patient";

  // Fetch AI guidance when results change
  useEffect(() => {
    if (results) {
      const fetchGuidance = async () => {
        setIsGuidanceLoading(true);
        try {
          const advice = await chatbotService.getNextStepsGuidance(results, patientData, isImageDiagnosis);
          setGuidance(advice);
        } catch (error) {
          console.error("Failed to load guidance", error);
        } finally {
          setIsGuidanceLoading(false);
        }
      };

      fetchGuidance();
    } else {
      setGuidance(null);
    }
  }, [results, patientData, isImageDiagnosis]);

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
          <Skeleton className="h-40 w-full rounded-[20px] bg-primary/5" />
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

  const probability = results.risk_score ?? results.probability ?? results.confidence ?? 0;
  const scorePercentage = Math.round(probability * 100);

  return (
    <>
      <div
        className="h-full flex flex-col"
      >
        {/* Result Header */}
        <div className={`p-6 rounded-[24px] mb-4 text-center relative overflow-hidden ${results.label.includes('Positive') || results.label.includes('High') || results.label.includes('Parasitized')
          ? 'bg-rose-500/10 border border-rose-500/20'
          : 'bg-emerald-500/10 border border-emerald-500/20'
          }`}>
          <div className="relative z-10 flex flex-col items-center">
            {results.label.includes('Positive') || results.label.includes('High') || results.label.includes('Parasitized') ? (
              <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30">
                <XCircle className="h-6 w-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-6 w-6" />
              </div>
            )}

            <h2 className={`text-2xl font-bold mb-1 ${results.label.includes('Positive') || results.label.includes('High') || results.label.includes('Parasitized') ? 'text-rose-600' : 'text-emerald-600'
              }`}>
              {results.label}
            </h2>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
              {isImageDiagnosis ? 'Microscopy Result' : 'Risk Level'}
            </p>
          </div>
        </div>

        {/* Metrics Grid — only shown for image/CNN diagnosis */}
        {isImageDiagnosis && (
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-white/40 border border-white/60 p-4 rounded-[20px] flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider mb-1">
                  Confidence
                </p>
                <p className="text-2xl font-bold text-primary">{scorePercentage}%</p>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-primary/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-primary" strokeDasharray={`${scorePercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Interpretation */}
        <div className="bg-white/40 border border-white/60 p-5 rounded-[20px] mb-4">
          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" /> Assessment Interpretation
          </h4>
          <p className="text-sm text-foreground/70 leading-relaxed mb-4">
            {isImageDiagnosis ? (
              results.label.includes('Positive') || results.label.includes('Parasitized')
                ? "Microscopic analysis has identified patterns consistent with parasitic infection. "
                : "Microscopic analysis did not detect parasitic patterns in the uploaded sample. "
            ) : (
              results.method.includes('Fallback') || results.method.includes('Rule-Based')
                ? `The Clinical Risk Index identifies this profile as ${results.label}. This is a rule-based assessment and not a medical diagnosis.`
                : `The Clinical Risk Index Calculator identifies this profile as ${results.label} based on verified DHS risk factors.`
            )}
            <br />
            <span className="text-xs italic opacity-75 mt-1 block">
              * This is a decision support tool and does not replace professional medical advice.
            </span>
          </p>


        </div>

        {/* AI Guidance Section */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-5 rounded-[20px] mb-4 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />

          <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 relative z-10">
            <Sparkles className="h-4 w-4" />
            Dr. Foresee's Guidance
          </h4>

          {isGuidanceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-primary/10" />
              <Skeleton className="h-4 w-full bg-primary/10" />
              <Skeleton className="h-4 w-5/6 bg-primary/10" />
            </div>
          ) : guidance ? (
            <div className="text-sm text-foreground/80 leading-relaxed font-medium relative z-10">
              {guidance.split('\n').map((line, i) => (
                <div key={i} className="min-h-[1.5em]">
                  {line.split('**').map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="text-primary font-bold">{part}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-auto">
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
                slept_under_net: patientData.slept_under_net,
                anemia_level: patientData.anemia_level,
              } : undefined,
            }}
            className="w-full"
          />
        </div>

      </div>
    </>
  );
};