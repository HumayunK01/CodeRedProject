
import { useState, useMemo } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StorageManager } from "@/lib/storage";
import { StoredResult } from "@/lib/types";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { ReportsStats } from "@/components/reports/ReportsStats";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsExport } from "@/components/reports/ReportsExport";
import { ReportsList } from "@/components/reports/ReportsList";

const Reports = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);

  const results = useMemo(() => isSignedIn ? StorageManager.getAllResults() : [], [isSignedIn]);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = searchTerm === "" ||
        result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(result.input).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || result.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [results, searchTerm, typeFilter]);

  if (!isLoaded) {
    return null;
  }

  const handleDeleteResult = (id: string) => {
    StorageManager.deleteResult(id);
    setSelectedResult(null);
    // Force re-render by updating the search term
    setSearchTerm(prev => prev + " ");
    setSearchTerm(prev => prev.trim());

    toast({
      title: "Result Deleted",
      description: "The selected result has been removed.",
    });
  };

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
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Your Reports</h2>
              <p className="text-muted-foreground">
                Sign in to securely view your diagnosis history and health insights.
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
              Reports
            </h1>
            <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Reference past diagnosis and forecast results to track health trends, review outcomes, and inform future decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-stretch relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Filters & Stats (Sidebar) */}
        <div className="lg:col-span-4 space-y-4 relative z-10 h-full">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-4 space-y-8">
            <ReportsStats results={results} isSignedIn={isSignedIn || false} />
            <ReportsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              isSignedIn={isSignedIn || false}
              onFilterChange={() => { }}
            />
            <ReportsExport isSignedIn={isSignedIn || false} />
          </DashboardContainer>
        </div>

        {/* Column 2: Results List (Main Area) */}
        <div className="lg:col-span-8 space-y-4 relative z-10 h-full">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 h-full flex flex-col min-h-[600px]">
            <ReportsList
              results={filteredResults}
              isSignedIn={isSignedIn || false}
              selectedResult={selectedResult}
              setSelectedResult={setSelectedResult}
              onDelete={handleDeleteResult}
            />
          </DashboardContainer>
        </div>
      </div >
    </div >
  );
};

export default Reports;