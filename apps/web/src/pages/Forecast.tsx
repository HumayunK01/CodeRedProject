
import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ForecastForm } from "@/components/forecast/ForecastForm";
import { ForecastResults } from "@/components/forecast/ForecastResults";
import { ForecastResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  Settings,
  Info,
  Shield
} from "lucide-react";

// --- Sub-components (Matched to Diagnosis/Dashboard) ---

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

const ForecastFormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-gray-200" />
        <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-gray-200" />
        <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl bg-gray-200 mt-8" />
  </div>
);

const ForecastResultsSkeleton = () => (
  <div className="space-y-8 h-full">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl bg-gray-200" />
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-64 w-full rounded-xl bg-gray-200" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-xl bg-gray-200" />
      <Skeleton className="h-20 w-full rounded-xl bg-gray-200" />
    </div>
  </div>
);


const Forecast = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [results, setResults] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (result: ForecastResult) => {
    setResults(result);
    setIsLoading(false);
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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Your Forecasts</h2>
              <p className="text-muted-foreground">
                Sign in to create and view advanced epidemiological predictive models.
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
              Forecast
            </h1>
            <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Predict future outbreak trends using our advanced epidemiological models throughout specific regions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-stretch relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Forecast Parameters (Sidebar) */}
        <div className="lg:col-span-4 space-y-4 relative z-0">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-4">
            <SectionHeader
              icon={Settings}
              title="Configuration"
              subtitle="Forecast Parameters"
            />

            <div className="mb-6">
              <p className="text-sm text-foreground/60 leading-relaxed">
                Select a target region and time horizon to generate predictive models.
              </p>
            </div>

            {isSignedIn ? (
              <ForecastForm
                onResult={handleResult}
                onLoadingChange={handleLoading}
              />
            ) : <ForecastFormSkeleton />}
          </DashboardContainer>
        </div>

        {/* Column 2: Forecast Results (Main Area) */}
        <div className="lg:col-span-8 space-y-4 relative z-0">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 h-full flex flex-col">
            <div className="space-y-1 mb-6 shrink-0">
              <SectionHeader
                icon={TrendingUp}
                title="Risk Projections"
                subtitle="Analysis Results"
              />
              <p className="text-sm text-foreground/60 ml-1">
                This section summarizes how outbreak risk is expected to change for the selected region and time period.
              </p>
            </div>

            <div className="flex-1">
              {isSignedIn ? (
                <ForecastResults
                  results={results}
                  isLoading={isLoading}
                />
              ) : <ForecastResultsSkeleton />}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Forecast;