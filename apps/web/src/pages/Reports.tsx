
import { useState, useMemo, useCallback } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StoredResult } from "@/lib/types";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { ReportsStats } from "@/components/reports/ReportsStats";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsExport } from "@/components/reports/ReportsExport";
import { ReportsList } from "@/components/reports/ReportsList";
import { useReports } from "@/hooks/use-reports";

const Reports = () => {
  // NOTE: We intentionally do NOT return null on !isLoaded — that caused the
  // blank-screen flash on every reload. Instead we always render the shell and
  // let child components show skeletons while auth resolves.
  const { isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);

  // Fetch reports from the backend database (paginated)
  const { results, isLoading, isLoadingMore, hasMore, error, loadMore, deleteResult, refresh } = useReports();

  // Derive "auth is still resolving" — show skeletons in this window
  const authLoading = !isLoaded;

  const filteredResults = useMemo(() => {
    if (!isSignedIn) return [];
    const q = searchTerm.toLowerCase();
    return results.filter(result => {
      const matchesSearch =
        q === "" ||
        result.id.toLowerCase().includes(q) ||
        JSON.stringify(result.result).toLowerCase().includes(q) ||
        JSON.stringify(result.input).toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || result.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [results, searchTerm, typeFilter, isSignedIn]);

  const handleDeleteResult = useCallback(async (id: string) => {
    deleteResult(id);
    setSelectedResult(null);
    toast({ title: "Result Removed", description: "The record has been removed from view." });
  }, [deleteResult, toast]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    toast({ title: "Reports Refreshed", description: "Latest records loaded from the database." });
  }, [refresh, toast]);

  // Effective loading: either auth or first-page DB fetch still in progress
  const showSkeleton = authLoading || (isLoading && results.length === 0);

  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden relative">

      {/* Auth overlay — shown when signed-out, always renders the underlying shell */}
      <AnimatePresence>
        {!authLoading && !isSignedIn && (
          <motion.div
            key="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-4"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
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
            {isSignedIn && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full text-xs font-medium transition-all"
                >
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error Banner */}
      <AnimatePresence>
        {isSignedIn && error && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-2"
          >
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-7 text-xs"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-stretch relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4 relative z-10 h-full">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-4 space-y-8">
            <ReportsStats
              results={results}
              isSignedIn={isSignedIn || false}
              isLoading={showSkeleton}
            />
            <ReportsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              isSignedIn={isSignedIn || false}
              onFilterChange={() => { }}
            />
            <ReportsExport isSignedIn={isSignedIn || false} results={results} />
          </DashboardContainer>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4 relative z-10 h-full">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 h-full flex flex-col min-h-[600px]">
            <ReportsList
              results={filteredResults}
              isSignedIn={isSignedIn || false}
              isLoading={showSkeleton}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore && searchTerm === "" && typeFilter === "all"}
              onLoadMore={loadMore}
              selectedResult={selectedResult}
              setSelectedResult={setSelectedResult}
              onDelete={handleDeleteResult}
            />
          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;