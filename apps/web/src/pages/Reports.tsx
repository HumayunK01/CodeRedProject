
import { useState, useMemo } from "react";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorageManager } from "@/lib/storage";
import { StoredResult } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Microscope,
  TrendingUp,
  Eye,
  Trash2,
  Brain,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Activity,
  Shield,
  TestTube,
  Globe
} from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";

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


const Reports = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 8;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const stats = [
    {
      title: "Total Records",
      value: results.length,
      icon: Database,
      color: "text-primary"
    },
    {
      title: "This Month",
      value: results.filter(r => dayjs(r.timestamp).isAfter(dayjs().subtract(1, 'month'))).length,
      icon: Calendar,
      color: "text-accent"
    },
    {
      title: "Diagnosis Results",
      value: results.filter(r => r.type === 'diagnosis').length,
      icon: Microscope,
      color: "text-success"
    },
    {
      title: "Forecast Reports",
      value: results.filter(r => r.type === 'forecast').length,
      icon: TrendingUp,
      color: "text-warning"
    }
  ];

  const handleExportCsv = () => {
    try {
      const csv = StorageManager.exportToCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Reports have been exported to CSV format.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportJson = () => {
    try {
      const json = StorageManager.exportToJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Reports have been exported to JSON format.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAll = () => {
    try {
      // Export CSV
      const csv = StorageManager.exportToCsv();
      const csvBlob = new Blob([csv], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvA = document.createElement('a');
      csvA.href = csvUrl;
      csvA.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(csvA);
      csvA.click();
      document.body.removeChild(csvA);
      URL.revokeObjectURL(csvUrl);

      // Export JSON
      const json = StorageManager.exportToJson();
      const jsonBlob = new Blob([json], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonA = document.createElement('a');
      jsonA.href = jsonUrl;
      jsonA.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.json`;
      document.body.appendChild(jsonA);
      jsonA.click();
      document.body.removeChild(jsonA);
      URL.revokeObjectURL(jsonUrl);

      toast({
        title: "Export Successful",
        description: "Reports have been exported in multiple formats.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const getResultIcon = (type: string) => {
    return type === 'diagnosis' ? Microscope : TrendingUp;
  };

  const getResultColor = (result: StoredResult) => {
    if (result.type === 'diagnosis') {
      const diagResult = result.result as any;
      if (diagResult.label?.toLowerCase().includes('positive') ||
        diagResult.label?.toLowerCase().includes('high')) {
        return 'destructive';
      }
      return 'default';
    }
    return 'secondary';
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

            {/* Stats Section */}
            <div>
              <SectionHeader
                icon={BarChart3}
                title="Data Overview"
                subtitle="Archive Statistics"
              />
              <p className="text-xs text-muted-foreground mb-4 -mt-4">
                A summary of all stored assessments and forecasts for quick reference.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {isSignedIn ? stats.map((stat, i) => (
                  <div key={i} className="bg-white/40 backdrop-blur-sm border border-white/60 p-4 rounded-xl text-center hover:bg-white/60 transition-colors duration-300 group">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} opacity-80 group-hover:opacity-100 transition-all`} strokeWidth={1.5} />
                    <p className="text-xs uppercase font-bold text-foreground/60 mb-1 tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                )) : (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/40 border border-white/60 p-4 rounded-xl text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-lg bg-gray-200" />
                      <Skeleton className="h-3 w-20 mx-auto mb-2 bg-gray-200" />
                      <Skeleton className="h-6 w-12 mx-auto bg-gray-200" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Filters Section */}
            <div>
              <SectionHeader
                icon={Filter}
                title="Search & Filter"
                subtitle="Find Records"
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Search</label>
                  {isSignedIn ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by region, symptoms, or date..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 bg-white/50 border-white/40 h-11 rounded-xl focus-visible:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  ) : <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Record Type</label>
                  <p className="text-[10px] text-muted-foreground">Filter results by diagnosis or forecast reports.</p>
                  {isSignedIn ? (
                    <Select value={typeFilter} onValueChange={(value) => {
                      setTypeFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="bg-white/50 border-white/40 h-11 rounded-xl focus:ring-primary/20 transition-all font-medium">
                        <SelectValue placeholder="All Results" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis Only</SelectItem>
                        <SelectItem value="forecast">Forecasts Only</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />}
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div>
              <SectionHeader
                icon={Download}
                title="Export Data"
                subtitle="Download Reports"
              />
              <p className="text-xs text-muted-foreground mb-4 -mt-4">
                Download selected reports for sharing, record-keeping, or further analysis.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {isSignedIn ? (
                  <>
                    <Button onClick={handleExportCsv} variant="outline" className="bg-white/40 border-white/60 rounded-xl h-11 hover:bg-white/60 hover:text-primary transition-all font-medium">
                      CSV
                    </Button>
                    <Button onClick={handleExportJson} variant="outline" className="bg-white/40 border-white/60 rounded-xl h-11 hover:bg-white/60 hover:text-primary transition-all font-medium">
                      JSON
                    </Button>
                    <Button onClick={handleExportAll} variant="default" className="col-span-2 shadow-lg shadow-primary/20 rounded-xl h-11 text-white font-semibold tracking-wide hover:opacity-90 transition-all">
                      Download Reports
                    </Button>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                    <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                    <Skeleton className="h-11 w-full rounded-xl col-span-2 bg-gray-200" />
                  </>
                )}
              </div>
            </div>

          </DashboardContainer>
        </div>

        {/* Column 2: Results List (Main Area) */}
        <div className="lg:col-span-8 space-y-4 relative z-10 h-full">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 h-full flex flex-col min-h-[600px]">
            <div className="space-y-1 mb-6 shrink-0">
              <div className="flex items-center justify-between">
                <SectionHeader
                  icon={Database}
                  title="Results History"
                  subtitle="Stored Records"
                />
                {isSignedIn && filteredResults.length > 0 && (
                  <div className="text-right mb-6">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                      {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''} Found
                    </Badge>
                  </div>
                )}
              </div>

              <p className="text-sm text-foreground/60 ml-1">
                Open any report to review risk levels, trends, and supporting details from that assessment.
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {!isSignedIn ? (
                // Dummy Skeleton List for Unauthenticated State
                <div className="grid gap-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/40 border border-white/60 p-4 rounded-xl flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32 bg-gray-200" />
                          <Skeleton className="h-4 w-20 bg-gray-200" />
                        </div>
                        <Skeleton className="h-5 w-3/4 bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] border-2 border-dashed border-primary/10 rounded-[24px]">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-primary/40" />
                  </div>
                  <h4 className="text-sm font-semibold text-primary">No Records Found</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">
                    Try adjusting search terms or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {currentResults.map((result) => {
                    const Icon = getResultIcon(result.type);
                    const isSelected = selectedResult?.id === result.id;

                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                              group relative overflow-hidden p-4 rounded-xl border transition-all duration-300 cursor-pointer
                              ${isSelected
                            ? 'bg-primary/5 border-primary/20 shadow-lg'
                            : 'bg-white/40 border-white/60 hover:bg-white/60 hover:border-primary/20 hover:shadow-md'
                          }
                            `}
                        onClick={() => setSelectedResult(result)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`
                                     p-3 rounded-xl transition-all duration-300
                                     ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary shadow-sm group-hover:scale-110'}
                                   `}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getResultColor(result) as any} className="text-[10px] uppercase font-bold px-2 py-0.5 h-5">
                                  {result.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {dayjs(result.timestamp).format('MMM D, YYYY • h:mm A')}
                                </span>
                              </div>
                              <h4 className="font-bold text-foreground/90">
                                {result.type === 'diagnosis'
                                  ? `Diagnosis – ${(result.result as any).label || 'Assessment'} Risk`
                                  : `Forecast – ${(result.result as any).region || 'Regional'} (${(result.result as any).predictions?.length || 4}-week outlook)`
                                }
                              </h4>
                              <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                                {result.type === 'diagnosis'
                                  ? `Symptoms: ${(result.input as any).symptoms?.join(', ') || 'N/A'}`
                                  : `Period: ${(result.result as any).predictions?.length || 0} weeks projection`
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            {isSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResult(result.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Inline Details for Selected Item */}
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-4 pt-4 border-t border-primary/10"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Input Data Section */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Input Data</h5>
                                <div className="space-y-3">
                                  {result.type === 'diagnosis' ? (
                                    <>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Age</span>
                                          <p className="font-medium text-sm">{(result.input as any).age || 'N/A'} Years</p>
                                        </div>
                                        <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Region</span>
                                          <p className="font-medium text-sm">{(result.input as any).region || 'N/A'}</p>
                                        </div>
                                      </div>
                                      {(result.input as any).symptoms?.length > 0 && (
                                        <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold block mb-2">Reported Symptoms</span>
                                          <div className="flex flex-wrap gap-1">
                                            {(result.input as any).symptoms.map((s: string, i: number) => (
                                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/80 border-primary/10 text-foreground/80">
                                                {s}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    // Forecast Input
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Target Region</span>
                                        <p className="font-medium text-sm">{(result.input as any).region}</p>
                                      </div>
                                      <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Horizon</span>
                                        <p className="font-medium text-sm">{(result.input as any).horizon_weeks} Weeks</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Analysis Results Section */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Analysis Results</h5>
                                <div className="space-y-3">
                                  {result.type === 'diagnosis' ? (
                                    <>
                                      <div className="bg-white/50 p-3 rounded-lg border border-white/60 flex items-center justify-between">
                                        <div>
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Risk Level</span>
                                          <p className={`font-bold text-sm ${(result.result as any).label?.includes('High') ? 'text-destructive' :
                                            (result.result as any).label?.includes('Medium') ? 'text-warning' : 'text-success'
                                            }`}>
                                            {(result.result as any).label || 'Unknown'}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Confidence</span>
                                          <p className="font-bold text-sm">{((result.result as any).confidence * 100).toFixed(1)}%</p>
                                        </div>
                                      </div>
                                      {(result.result as any).explanations && (
                                        <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 block">Key Findings</span>
                                          <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                                            {(result.result as any).explanations.slice(0, 3).map((exp: string, i: number) => (
                                              <li key={i}>{exp}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    // Forecast Output
                                    <>
                                      <div className="bg-white/50 p-3 rounded-lg border border-white/60 mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Hotspot Risk Score</span>
                                          <span className={`font-bold text-sm ${((result.result as any).hotspot_score || 0) > 0.7 ? 'text-destructive' :
                                            ((result.result as any).hotspot_score || 0) > 0.4 ? 'text-warning' : 'text-success'
                                            }`}>
                                            {((result.result as any).hotspot_score || 0).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full transition-all ${((result.result as any).hotspot_score || 0) > 0.7 ? 'bg-destructive' :
                                              ((result.result as any).hotspot_score || 0) > 0.4 ? 'bg-warning' : 'bg-success'
                                              }`}
                                            style={{ width: `${Math.min(((result.result as any).hotspot_score || 0) * 100, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                      {(result.result as any).predictions?.length > 0 && (
                                        <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Projected Case Trend</span>
                                            <span className="text-[10px] text-muted-foreground">(Next 3 Weeks)</span>
                                          </div>
                                          <div className="space-y-1.5">
                                            {(result.result as any).predictions.slice(0, 3).map((p: any, i: number) => (
                                              <div key={i} className="flex justify-between text-xs items-center">
                                                <span className="text-foreground/70 font-medium">{p.week}</span>
                                                <div className="flex items-center gap-2">
                                                  <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary/40" style={{ width: `${Math.min((p.cases / 3000000) * 100, 100)}%` }}></div>
                                                  </div>
                                                  <span className="font-mono font-medium min-w-[60px] text-right">{p.cases.toLocaleString()}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {isSignedIn && totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-2 border-t border-primary/10 pt-4">
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">Showing the most recent results first</p>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                  </Button>
                  <span className="text-xs text-foreground/50 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium"
                  >
                    Next <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}

          </DashboardContainer>
        </div>
      </div >
    </div >
  );
};

export default Reports;