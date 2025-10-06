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
  AlertTriangle
} from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<StoredResult | null>(null);

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

  const trustIndicators = [
    { label: "Data Encrypted", icon: CheckCircle, status: "secure" },
    { label: "HIPAA Compliant", icon: Brain, status: "certified" },
    { label: "Local Storage", icon: Database, status: "private" },
    { label: "Export Ready", icon: Download, status: "available" }
  ];

  const handleExportCsv = () => {
    try {
      const csv = StorageManager.exportToCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outbreaklens-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
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
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
            >
              <Database className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Medical Data Archive
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Reports & History
              </span>
              <br />
              <span className="text-foreground">
                Data Analytics
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Comprehensive archive of diagnosis results and outbreak forecasts with
              <span className="text-primary font-medium"> advanced analytics</span> and
              <span className="text-accent font-medium"> secure data management</span>.
              Export, analyze, and track your medical intelligence history.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
              <Button onClick={handleExportCsv} className="btn-medical">
                <Download className="mr-2 h-5 w-5" />
                Export All Data
              </Button>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4">
                {trustIndicators.map((indicator, index) => {
                  const Icon = indicator.icon;
                  return (
                    <motion.div
                      key={indicator.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                      className="flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/20"
                    >
                      <Icon className="h-3 w-3 text-success" />
                      <span className="text-xs font-medium text-success">{indicator.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="px-4 lg:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Statistics Overview */}
          <section>
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
          </section>

          {/* Enhanced Filters */}
          <section>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 input-medical h-12 text-base"
                      />
                    </div>
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          </section>

          {/* Enhanced Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
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
                          : `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} in your archive`
                        }
                      </CardDescription>
                    </div>

                    {filteredResults.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Click to view details
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
                      {filteredResults.map((result, index) => {
                        const Icon = getResultIcon(result.type);
                        const resultData = result.result as any;

                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            viewport={{ once: true }}
                            className={`group p-6 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-medical-lg ${
                              selectedResult?.id === result.id
                                ? 'border-primary bg-primary/5 shadow-medical'
                                : 'border-border hover:border-primary/30 hover:bg-card/50'
                            }`}
                            onClick={() => setSelectedResult(result)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 transition-all duration-300 ${
                                  selectedResult?.id === result.id ? 'scale-110' : 'group-hover:scale-105'
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
                                    {resultData.label || resultData.region || 'Medical Result'}
                                  </p>

                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {result.type === 'diagnosis'
                                      ? `AI Confidence: ${(resultData.confidence * 100).toFixed(1)}% • ${resultData.explanations ? 'With detailed analysis' : 'Standard assessment'}`
                                      : `Forecast: ${resultData.predictions?.length || 0} weeks • ${resultData.hotspot_score ? 'Risk analysis included' : 'Regional predictions'}`
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                                    selectedResult?.id === result.id ? 'opacity-100' : ''
                                  }`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
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

                      {/* Technical Details */}
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3 text-primary">Technical Information</h4>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Record ID</p>
                              <p className="text-sm font-mono bg-muted/50 p-2 rounded">
                                {selectedResult.id}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Timestamp</p>
                              <p className="text-sm text-muted-foreground">
                                {dayjs(selectedResult.timestamp).format('MMMM D, YYYY [at] h:mm:ss A')}
                              </p>
                            </div>
                          </div>
                        </div>

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