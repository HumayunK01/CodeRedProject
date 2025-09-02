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
  Trash2
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

  const handleExportCsv = () => {
    try {
      const csv = StorageManager.exportToCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biosentinel-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
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
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & History</h1>
            <p className="text-muted-foreground">
              View, analyze, and export your diagnosis and forecast results
            </p>
          </div>
          
          <Button onClick={handleExportCsv} className="btn-medical">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="data-card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 input-medical"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="forecast">Forecast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Results List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="data-card">
            <CardHeader>
              <CardTitle>Results History</CardTitle>
              <CardDescription>
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No results found. Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((result) => {
                    const Icon = getResultIcon(result.type);
                    const resultData = result.result as any;
                    
                    return (
                      <div
                        key={result.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-medical ${
                          selectedResult?.id === result.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedResult(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant={getResultColor(result) as any}>
                                  {result.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {dayjs(result.timestamp).format('MMM D, YYYY')}
                                </span>
                              </div>
                              
                              <p className="font-medium truncate">
                                {resultData.label || resultData.region || 'Result'}
                              </p>
                              
                              <p className="text-sm text-muted-foreground truncate">
                                {result.type === 'diagnosis' 
                                  ? `Confidence: ${(resultData.confidence * 100).toFixed(1)}%`
                                  : `${resultData.predictions?.length || 0} week forecast`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <Card className="data-card">
            <CardHeader>
              <CardTitle>Result Details</CardTitle>
              <CardDescription>
                {selectedResult ? 'View detailed information' : 'Select a result to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={getResultColor(selectedResult) as any}>
                      {selectedResult.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResult(selectedResult.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Timestamp</p>
                      <p className="text-sm text-muted-foreground">
                        {dayjs(selectedResult.timestamp).format('MMMM D, YYYY [at] h:mm A')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">ID</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedResult.id}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Input Data</p>
                      <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(selectedResult.input, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Result Data</p>
                      <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(selectedResult.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Click on a result to view detailed information and raw data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;