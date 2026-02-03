
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DualModeDiagnosis } from "@/components/diagnosis/DualModeDiagnosis";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { ClinicalAdvisory } from "@/components/ui/clinical-advisory";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { StorageManager } from "@/lib/storage";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
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

// --- Skeleton Components ---

const DiagnosisFormSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
      <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-xl bg-gray-200" />
      <Skeleton className="h-24 w-full rounded-xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full rounded-xl bg-gray-200" />
        <Skeleton className="h-10 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl bg-gray-200 mt-6" />
  </div>
);

const DiagnosisResultsSkeleton = () => (
  <div className="space-y-6 h-full">
    <div className="space-y-2 text-center">
      <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-200" />
      <Skeleton className="h-6 w-32 mx-auto bg-gray-200" />
      <Skeleton className="h-4 w-24 mx-auto bg-gray-200" />
    </div>
    <div className="space-y-3 mt-8">
      <Skeleton className="h-20 w-full rounded-xl bg-gray-200" />
      <Skeleton className="h-20 w-full rounded-xl bg-gray-200" />
      <Skeleton className="h-20 w-full rounded-xl bg-gray-200" />
    </div>
  </div>
);


// --- Main Diagnosis Page Component ---

const Diagnosis = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storedPatientData, setStoredPatientData] = useState<SymptomsInput & { id?: string; timestamp?: string } | null>(null);
  const [storedImageData, setStoredImageData] = useState<{ image: string; id?: string; timestamp?: string } | null>(null);

  // Load the most recent patient data from storage
  useEffect(() => {
    if (!isSignedIn) return; // Don't fetch if not signed in

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
  }, [isSignedIn]);

  const handleResult = (result: DiagnosisResult) => {
    setResults(result);
    setIsLoading(false);

    // Load the patient data again after a new result is generated
    if (isSignedIn) {
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
    }
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setResults(null);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden relative">

      {!isSignedIn && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Your Diagnosis</h2>
              <p className="text-muted-foreground">
                Sign in to securely access advanced diagnostic tools and result history.
              </p>
            </div>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full rounded-full shadow-lg hover:shadow-xl transition-all">
                Sign In to Continue
              </Button>
            </SignInButton>
          </motion.div>
        </div>
      )}


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
              Answer a few questions or upload a sample image to receive a clear malaria risk assessment.
            </p>


          </div>
        </div>
      </section>

      {/* Clinical Advisory Disclaimer */}
      < ClinicalAdvisory />

      {/* Main Layout Grid */}
      <div className="mx-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Assessment Form */}
        <div className="lg:col-span-8 space-y-4 relative z-0">
          <DashboardContainer className="bg-white/90 p-4 md:p-6 lg:p-8">
            <SectionHeader
              icon={TestTube}
              title="Patient Assessment"
              subtitle="Choose how you’d like to provide information"
            />

            <div className="mb-6">
              <p className="text-sm text-foreground/60 leading-relaxed max-w-3xl">
                Quickly evaluate potential malaria risk by providing patient details or uploading a microscopy sample.
              </p>
            </div>

            {isSignedIn ? (
              <DualModeDiagnosis
                onResult={handleResult}
                onLoadingChange={handleLoading}
              />
            ) : <DiagnosisFormSkeleton />}
          </DashboardContainer>
        </div>

        {/* Column 2: Results Sidebar */}
        <div className="lg:col-span-4 lg:h-full relative z-0 lg:mt-0">
          <DashboardContainer className="bg-white/90 p-4 md:p-6 lg:p-8 lg:sticky lg:top-4 shadow-sm h-full flex flex-col">
            <SectionHeader icon={Activity} title="Analysis Results" subtitle="Real-time Output" />
            <div className="flex-1">
              {isSignedIn ? (
                <DiagnosisResults
                  results={results}
                  isLoading={isLoading}
                  patientData={storedPatientData || undefined}
                  imageData={storedImageData || undefined}
                />
              ) : <DiagnosisResultsSkeleton />}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </div >
  );
};

export default Diagnosis;