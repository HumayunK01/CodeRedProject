import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorageManager } from "@/lib/storage";
import { StoredResult } from "@/lib/types";
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

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 8;

  const results = useMemo(() => StorageManager.getAllResults(), []);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = searchTerm === "" ||
        result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(result.input).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || result.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [results, searchTerm, typeFilter]);

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
    <div className="min-h-screen bg-background relative">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      {/* Medical Disclaimer Marquee */}
      <div className="bg-destructive/10 dark:bg-destructive/15 border-b border-destructive/20 dark:border-destructive/30 py-1.5 relative z-10">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive mr-1.5 flex-shrink-0 animate-pulse" />
          <div className="relative overflow-hidden w-full max-w-4xl">
            <div className="animate-marquee whitespace-nowrap text-xs text-destructive font-medium py-0.5">
              This ML-powered assessment tool is for decision support only and should never replace professional medical diagnosis. Always consult with qualified healthcare providers for medical decisions.
            </div>
          </div>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-1.5 flex-shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Enhanced Header Section */}
      <section className="relative px-4 py-6 lg:px-6 lg:py-8 mt-2 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-1"
          >
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Medical Reports Archive
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
              Comprehensive archive of diagnosis results and outbreak forecasts
            </p>

            {/* Export Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <Button onClick={handleExportCsv} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handleExportJson} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button onClick={handleExportAll} variant="default" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">ML-Powered</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">HIPAA Compliant</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">24/7 Monitoring</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Medical Grade</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Overview */}
      <section className="px-4 lg:px-6 pb-6 pt-2">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 pt-6">
              Data Overview
            </h2>
            <p className="text-muted-foreground">
              Comprehensive statistics and insights from your medical data archive
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6 h-full text-center group hover:shadow-medical-lg transition-all duration-300">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold mb-2">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="px-4 lg:px-6 pb-6 pt-2">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
            <p className="text-muted-foreground">
              Find specific results and organize your medical data archive
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="data-card p-6 shadow-medical-lg">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, symptoms, or region..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                      className="pl-10 input-medical h-12 text-base"
                    />
                  </div>
                </div>

                <Select value={typeFilter} onValueChange={(value) => {
                  setTypeFilter(value);
                  setCurrentPage(1); // Reset to first page when filtering
                }}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis Only</SelectItem>
                    <SelectItem value="forecast">Forecasts Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-muted-foreground"
                >
                  Showing {filteredResults.length} of {results.length} results
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Main Content Grid */}
      <div className="px-4 lg:px-6 pb-6 pt-2">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Enhanced Results List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="data-card shadow-medical-lg">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <span>Results History</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {filteredResults.length === 0
                          ? 'No results found matching your criteria'
                          : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredResults.length)} of ${filteredResults.length} results`
                        }
                      </CardDescription>
                    </div>

                    {filteredResults.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          {results.length} total records
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredResults.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-6">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search terms or filters to find relevant results.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setTypeFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {currentResults.map((result, index) => {
                        const Icon = getResultIcon(result.type);
                        const resultData = result.result as any;

                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            viewport={{ once: true }}
                            className={`group p-6 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-medical-lg ${selectedResult?.id === result.id
                              ? 'border-primary bg-primary/5 shadow-medical'
                              : 'border-border hover:border-primary/30 hover:bg-card/50'
                              }`}
                            onClick={() => setSelectedResult(result)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 transition-all duration-300 ${selectedResult?.id === result.id ? 'scale-110' : 'group-hover:scale-105'
                                  }`}>
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <Badge
                                      variant={getResultColor(result) as any}
                                      className="font-medium"
                                    >
                                      {result.type}
                                    </Badge>
                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{dayjs(result.timestamp).format('MMM D, YYYY')}</span>
                                    </div>
                                  </div>

                                  <p className="font-semibold text-base mb-1 truncate">
                                    {result.type === 'diagnosis'
                                      ? `Malaria Risk: ${(result.result as any).label || 'Assessment'}`
                                      : resultData.region || 'Medical Result'}
                                  </p>

                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {result.type === 'diagnosis'
                                      ? `Confidence: ${((result.result as any).confidence * 100).toFixed(1)}%${(result.result as any).explanations ? ' • With analysis' : ''}`
                                      : `Forecast: ${resultData.predictions?.length || 0} weeks • ${resultData.hotspot_score ? 'Risk analysis included' : 'Regional predictions'}`
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${selectedResult?.id === result.id ? 'opacity-100' : ''
                                    }`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {result.type === 'diagnosis' && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Patient Age:</span>
                                  <span className="font-medium">{(result.input as any).age || 'N/A'} years</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <span className="text-muted-foreground">Region:</span>
                                  <span className="font-medium">{(result.input as any).region || 'N/A'}</span>
                                </div>
                                {(result.result as any).confidence !== undefined && (
                                  <div className="mt-2">
                                    <div className="w-full bg-secondary rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full ${(result.result as any).label?.includes('High') ? 'bg-destructive' :
                                          (result.result as any).label?.includes('Medium') ? 'bg-warning' :
                                            'bg-success'
                                          }`}
                                        style={{ width: `${(result.result as any).confidence * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                      <span className="text-muted-foreground">Confidence</span>
                                      <span className="font-medium">{((result.result as any).confidence * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="border-t border-border/50 p-6">
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>

                      <div className="flex items-center space-x-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Calculate start index for pagination window
                          let startPage = 1;
                          if (totalPages > 5) {
                            if (currentPage <= 3) {
                              startPage = 1;
                            } else if (currentPage >= totalPages - 2) {
                              startPage = totalPages - 4;
                            } else {
                              startPage = currentPage - 2;
                            }
                          }

                          const page = startPage + i;
                          return (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={currentPage === page ? "default" : "outline"}
                              className="w-10 h-10 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}

                        {totalPages > 5 && (
                          <>
                            {currentPage < totalPages - 2 && (
                              <span className="text-muted-foreground">...</span>
                            )}
                            {currentPage < totalPages - 1 && (
                              <Button
                                onClick={() => handlePageChange(totalPages)}
                                variant="outline"
                                className="w-10 h-10 p-0"
                              >
                                {totalPages}
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Enhanced Result Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Card className="data-card shadow-medical-lg sticky top-8">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <span>Result Details</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {selectedResult
                          ? 'Comprehensive analysis and raw data'
                          : 'Select a result to explore details'
                        }
                      </CardDescription>
                    </div>

                    {selectedResult && (
                      <div className="text-right">
                        <Badge
                          variant={getResultColor(selectedResult) as any}
                          className="mb-2"
                        >
                          {selectedResult.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResult(selectedResult.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedResult ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Summary Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Record Type</p>
                          <p className="font-semibold capitalize">{selectedResult.type}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Date Created</p>
                          <p className="font-semibold">{dayjs(selectedResult.timestamp).format('MMM D, YYYY')}</p>
                        </div>
                      </div>

                      {selectedResult.type === 'diagnosis' && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3 text-primary">Diagnosis Report</h4>
                          <div className="space-y-3">
                            {(selectedResult.result as any).label && (
                              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="font-medium">Risk Level</span>
                                <Badge
                                  variant={
                                    (selectedResult.result as any).label.includes('High') ? 'destructive' :
                                      (selectedResult.result as any).label.includes('Medium') ? 'secondary' :
                                        'default'
                                  }
                                >
                                  {(selectedResult.result as any).label}
                                </Badge>
                              </div>
                            )}

                            {(selectedResult.result as any).confidence !== undefined && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Model Confidence</span>
                                  <span className="font-mono">{((selectedResult.result as any).confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${(selectedResult.result as any).confidence * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {(selectedResult.result as any).probability !== undefined && (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Risk Probability</span>
                                  <span className="font-mono">{((selectedResult.result as any).probability * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-accent h-2 rounded-full"
                                    style={{ width: `${(selectedResult.result as any).probability * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 text-accent">Input Parameters</h4>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                            {JSON.stringify(selectedResult.input, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 text-success">Analysis Results</h4>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                            {JSON.stringify(selectedResult.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                        <Eye className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Result Selected</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Click on any result from the history list to view comprehensive
                        details, technical information, and raw analysis data.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;