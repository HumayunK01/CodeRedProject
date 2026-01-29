import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DualModeDiagnosis } from "@/components/diagnosis/DualModeDiagnosis";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { StorageManager } from "@/lib/storage";
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Shield,
  Microscope,
  TestTube,
  Info,
  Clock,
  ArrowRight
} from "lucide-react";

// --- Sub-components (Matched to Dashboard) ---

const DashboardContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`relative overflow-hidden bg-primary backdrop-blur-xl rounded-[24px] border border-primary/10 ${className}`}>
    {children}
  </section>
);

const SectionHeader = ({ icon: Icon, title, subtitle, rightElement }: { icon: any, title: string, subtitle: string, rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary uppercase tracking-tight">{title}</h3>
        <p className="text-[11px] text-foreground/60 font-semibold uppercase tracking-widest leading-none">{subtitle}</p>
      </div>
    </div>
    {rightElement}
  </div>
);

// --- Main Diagnosis Page Component ---

const Diagnosis = () => {
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storedPatientData, setStoredPatientData] = useState<SymptomsInput & { id?: string; timestamp?: string } | null>(null);
  const [storedImageData, setStoredImageData] = useState<{ image: string; id?: string; timestamp?: string } | null>(null);

  // Load the most recent patient data from storage
  useEffect(() => {
    const loadRecentPatientData = () => {
      try {
        const allResults = StorageManager.getAllResults();
        const diagnosisResults = allResults.filter(r => r.type === 'diagnosis');
        if (diagnosisResults.length > 0) {
          const mostRecent = diagnosisResults[0];

          // Check if this is symptom data or image data
          if ('image' in mostRecent.input) {
            // Image data
            setStoredImageData({
              image: (mostRecent.input as { image: string }).image,
              id: mostRecent.id,
              timestamp: mostRecent.timestamp
            });
            setStoredPatientData(null);
          } else {
            // Symptom data
            setStoredPatientData({
              ...(mostRecent.input as SymptomsInput),
              id: mostRecent.id,
              timestamp: mostRecent.timestamp
            });
            setStoredImageData(null);
          }
        }
      } catch (error) {
        console.warn('Failed to load patient data:', error);
      }
    };

    loadRecentPatientData();
  }, []);

  const handleResult = (result: DiagnosisResult) => {
    setResults(result);
    setIsLoading(false);

    // Load the patient data again after a new result is generated
    setTimeout(() => {
      const allResults = StorageManager.getAllResults();
      const diagnosisResults = allResults.filter(r => r.type === 'diagnosis');
      if (diagnosisResults.length > 0) {
        const mostRecent = diagnosisResults[0];

        // Check if this is symptom data or image data
        if ('image' in mostRecent.input) {
          setStoredImageData({
            image: (mostRecent.input as { image: string }).image,
            id: mostRecent.id,
            timestamp: mostRecent.timestamp
          });
          setStoredPatientData(null);
        } else {
          setStoredPatientData({
            ...(mostRecent.input as SymptomsInput),
            id: mostRecent.id,
            timestamp: mostRecent.timestamp
          });
          setStoredImageData(null);
        }
      }
    }, 500);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setResults(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden">



      {/* Header Section */}
      <section className="mx-2 mt-4 relative overflow-hidden">
        <div className="relative px-6 py-12 lg:p-16 rounded-[24px] bg-primary border border-white/10 flex flex-col justify-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-4">

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
              Diagnosis
            </h1>
            <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Advanced ML-powered symptom analysis and image detection for accurate malaria risk evaluation.
            </p>


          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-start relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Assessment Form */}
        <div className="lg:col-span-8 space-y-4 relative z-10">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8">
            <SectionHeader
              icon={TestTube}
              title="Patient Assessment"
              subtitle="Dual Mode Analysis"
            />

            <div className="mb-6">
              <p className="text-sm text-foreground/60 leading-relaxed max-w-3xl">
                Choose between symptom-based assessment or blood smear image analysis.
                Our system uses advanced CNN models for image analysis and symptom pattern recognition.
              </p>
            </div>

            <DualModeDiagnosis
              onResult={handleResult}
              onLoadingChange={handleLoading}
            />
          </DashboardContainer>
        </div>

        {/* Column 2: Results Sidebar */}
        <div className="lg:col-span-4 h-full relative z-10">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-4 shadow-sm h-full flex flex-col">
            <SectionHeader icon={Activity} title="Analysis Results" subtitle="Real-time Output" />
            <div className="flex-1">
              <DiagnosisResults
                results={results}
                isLoading={isLoading}
                patientData={storedPatientData || undefined}
                imageData={storedImageData || undefined}
              />
            </div>
          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;