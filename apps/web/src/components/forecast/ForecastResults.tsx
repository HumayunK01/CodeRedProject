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
  AlertTriangle,
  TrendingDown,
  Minus
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
        const change = predictions[i].cases - predictions[i - 1].cases;
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <div className="p-2 rounded-lg bg-destructive/10">
            <TrendingUp className="h-5 w-5 text-destructive" />
          </div>
        );
      case 'decreasing':
        return (
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <TrendingDown className="h-5 w-5 text-emerald-500" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-lg bg-primary/10">
            <Minus className="h-5 w-5 text-primary" />
          </div>
        );
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-destructive';
      case 'decreasing':
        return 'text-emerald-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
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
              <Card className="bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-foreground/60">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Region</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{results.region}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-foreground/60">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Forecast Period</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {results.predictions.length} week{results.predictions.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-foreground/60">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Trend</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getTrendIcon(getTrendDirection(results.predictions))}
                    </span>
                    <div>
                      <p className={`text-lg font-bold ${getTrendColor(getTrendDirection(results.predictions))}`}>
                        {getTrendDirection(results.predictions)}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-none">
                        {getTrendDirection(results.predictions) === 'decreasing' && 'risk is expected to decline'}
                        {getTrendDirection(results.predictions) === 'increasing' && 'risk is expected to rise'}
                        {getTrendDirection(results.predictions) === 'stable' && 'no significant change'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hotspot Score */}
            {results.hotspot_score !== undefined && (
              <Card className="bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">Regional Risk Score</p>
                        <p className="text-sm text-foreground/60">
                          This represents the likelihood of increased outbreak activity during the selected period.
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
            <Card className="bg-white/60 backdrop-blur-md border border-white/60 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-primary">Forecast Visualization</CardTitle>
                    <CardDescription>
                      This chart shows the projected number of cases over time based on current patterns.
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2 bg-secondary/30 p-1 rounded-lg">
                    <Button
                      variant={activeTab === 'chart' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('chart')}
                      className={activeTab === 'chart' ? 'shadow-sm' : ''}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Chart
                    </Button>

                    <Button
                      variant={activeTab === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('map')}
                      className={activeTab === 'map' ? 'shadow-sm' : ''}
                    >
                      <Map className="mr-2 h-4 w-4" />
                      Map
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
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 ml-1">Key forecast highlights for quick reference</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Peak Week", value: results.predictions.reduce((max, pred) => pred.cases > max.cases ? pred : max).week },
                  { label: "Peak Cases", value: Math.max(...results.predictions.map(p => p.cases)) },
                  { label: "Total Predicted", value: results.predictions.reduce((sum, pred) => sum + pred.cases, 0) },
                  { label: "Average Weekly", value: Math.round(results.predictions.reduce((sum, pred) => sum + pred.cases, 0) / results.predictions.length) }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/40 backdrop-blur-sm border border-white/60 p-4 rounded-xl text-center">
                    <p className="text-xs uppercase font-bold text-foreground/40 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[500px] lg:min-h-full border-2 border-dashed border-primary/10 rounded-[24px]"
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-primary/40" />
            </div>
            <div className="max-w-[240px]">
              <h4 className="text-sm font-semibold text-primary">No Forecast Generated</h4>
              <p className="text-xs text-muted-foreground mt-1">Select a region and time horizon to generate outbreak predictions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};