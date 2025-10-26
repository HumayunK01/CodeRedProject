import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ForecastResult } from "@/lib/types";
import { ForecastChart } from "./ForecastChart";
import { ForecastMap } from "./ForecastMap";
import { 
  TrendingUp, 
  Map,
  BarChart3,
  Download,
  Loader2,
  MapPin,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface ForecastResultsProps {
  results: ForecastResult | null;
  isLoading: boolean;
}

export const ForecastResults = ({ results, isLoading }: ForecastResultsProps) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'map'>('chart');

  const handleExportChart = () => {
    // This would implement chart export functionality
    console.log('Export chart functionality would be implemented here');
  };

  const getTrendDirection = (predictions: { week: string; cases: number }[]) => {
    if (predictions.length < 2) return 'stable';
    
    // Handle case where first value is zero to avoid division by zero
    const first = predictions[0].cases;
    const last = predictions[predictions.length - 1].cases;
    
    // If first value is zero, look at the overall trend of the data
    if (first === 0) {
      let positiveTrends = 0;
      let negativeTrends = 0;
      
      for (let i = 1; i < predictions.length; i++) {
        const change = predictions[i].cases - predictions[i-1].cases;
        if (change > 0) {
          positiveTrends++;
        } else if (change < 0) {
          negativeTrends++;
        }
      }
      
      // If no trends at all (all values are the same), it's stable
      if (positiveTrends === 0 && negativeTrends === 0) return 'stable';
      
      // If more positive than negative trends, it's increasing
      if (positiveTrends > negativeTrends) return 'increasing';
      if (negativeTrends > positiveTrends) return 'decreasing';
      
      // If equal positive and negative trends, look at overall direction
      if (last > first) return 'increasing';
      if (last < first) return 'decreasing';
      return 'stable';
    }
    
    // Normal percentage change calculation
    const change = ((last - first) / first) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-destructive';
      case 'decreasing':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      default:
        return '→';
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Loading State */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="data-card">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Generating Forecast</h3>
                    <p className="text-sm text-muted-foreground">
                      Processing epidemiological data and running ML models...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : results ? (
          /* Results State */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="data-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardDescription>Region</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.region}</p>
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardDescription>Forecast Period</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {results.predictions.length} week{results.predictions.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card className="data-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardDescription>Trend</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getTrendIcon(getTrendDirection(results.predictions))}
                    </span>
                    <p className={`text-lg font-bold ${getTrendColor(getTrendDirection(results.predictions))}`}>
                      {getTrendDirection(results.predictions)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hotspot Score */}
            {results.hotspot_score !== undefined && (
              <Card className="data-card">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold">Regional Risk Score</p>
                        <p className="text-sm text-muted-foreground">
                          Outbreak probability assessment
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant={results.hotspot_score > 0.7 ? 'destructive' : results.hotspot_score > 0.4 ? 'default' : 'secondary'}
                        className="text-lg px-3 py-1"
                      >
                        {(results.hotspot_score * 100).toFixed(1)}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {results.hotspot_score > 0.7 ? 'High Risk' : results.hotspot_score > 0.4 ? 'Moderate Risk' : 'Low Risk'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visualization Tabs */}
            <Card className="data-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Forecast Visualization</CardTitle>
                    <CardDescription>
                      Interactive charts and maps showing predicted outbreak patterns
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={activeTab === 'chart' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('chart')}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Chart
                    </Button>
                    
                    <Button
                      variant={activeTab === 'map' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('map')}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      Map
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportChart}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <AnimatePresence mode="wait">
                  {activeTab === 'chart' ? (
                    <motion.div
                      key="chart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ForecastChart data={results.predictions} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="map"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ForecastMap 
                        region={results.region}
                        hotspots={results.hotspots}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card className="data-card">
              <CardHeader>
                <CardTitle>Forecast Summary</CardTitle>
                <CardDescription>
                  Key statistics and insights from the prediction model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Peak Week</p>
                    <p className="text-muted-foreground">
                      {results.predictions.reduce((max, pred) => 
                        pred.cases > max.cases ? pred : max
                      ).week}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Peak Cases</p>
                    <p className="text-muted-foreground">
                      {Math.max(...results.predictions.map(p => p.cases))}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Total Predicted</p>
                    <p className="text-muted-foreground">
                      {results.predictions.reduce((sum, pred) => sum + pred.cases, 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-1">Average Weekly</p>
                    <p className="text-muted-foreground">
                      {Math.round(results.predictions.reduce((sum, pred) => sum + pred.cases, 0) / results.predictions.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="data-card">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-muted/30">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">No Forecast Generated</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a region and time horizon to generate outbreak predictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};