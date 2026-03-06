import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ForecastResult, ForecastPrediction } from "@/lib/types";
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
  Minus,
  CloudRain,
  Thermometer,
  Newspaper,
  Zap,
  Shield,
  Brain,
  Activity,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface ForecastResultsProps {
  results: ForecastResult | null;
  isLoading: boolean;
}

export const ForecastResults = ({ results, isLoading }: ForecastResultsProps) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'map'>('chart');

  /** Get case count from either v2 `point` or v1 `cases` field */
  const getCases = (pred: ForecastPrediction): number => pred.point ?? pred.cases ?? 0;

  const isV2 = results?.model_version?.startsWith('v2');

  const handleExportChart = () => {
    console.log('Export chart functionality would be implemented here');
  };

  const getTrendDirection = (predictions: ForecastPrediction[]) => {
    if (predictions.length < 2) return 'stable';

    const first = getCases(predictions[0]);
    const last = getCases(predictions[predictions.length - 1]);

    if (first === 0) {
      let positiveTrends = 0;
      let negativeTrends = 0;

      for (let i = 1; i < predictions.length; i++) {
        const change = getCases(predictions[i]) - getCases(predictions[i - 1]);
        if (change > 0) positiveTrends++;
        else if (change < 0) negativeTrends++;
      }

      if (positiveTrends === 0 && negativeTrends === 0) return 'stable';
      if (positiveTrends > negativeTrends) return 'increasing';
      if (negativeTrends > positiveTrends) return 'decreasing';
      if (last > first) return 'increasing';
      if (last < first) return 'decreasing';
      return 'stable';
    }

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

  interface CombinedDataPoint {
    week: string;
    historicalCases?: number;
    predictedCases?: number;
    p10?: number;
    p90?: number;
  }

  const combinedData: CombinedDataPoint[] = [];

  if (results?.predictions) {
    results.predictions.forEach(p => {
      combinedData.push({
        week: p.week,
        predictedCases: getCases(p),
        p10: p.p10,
        p90: p.p90,
      });
    });
  }

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
                    <h3 className="font-semibold mb-2">Analyzing Your Region</h3>
                    <p className="text-sm text-muted-foreground">
                      Checking weather, news, and disease patterns to estimate what may happen next...
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
            className="space-y-5"
          >
            {/* ── Section 1: Summary Header ─────────────────────────────── */}
            <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm overflow-hidden">
              <CardContent className="py-3 sm:py-4">
                {/* Top row: Region, Period, Trend */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none">Region</p>
                      <p className="text-base font-bold text-primary leading-tight">{results.region}</p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border hidden sm:block" />

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none">Looking Ahead</p>
                      <p className="text-sm sm:text-base font-bold text-primary leading-tight">
                        {results.predictions.length} week{results.predictions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border hidden sm:block" />

                  <div className="flex items-center gap-2">
                    {getTrendIcon(getTrendDirection(results.predictions))}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none">Trend</p>
                      <p className={`text-base font-bold capitalize leading-tight ${getTrendColor(getTrendDirection(results.predictions))}`}>
                        {getTrendDirection(results.predictions)}
                      </p>
                    </div>
                  </div>

                  {results.disease && (
                    <>
                      <div className="h-8 w-px bg-border hidden sm:block" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none">Disease</p>
                          <p className="text-base font-bold text-primary leading-tight">{results.disease}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Badges row */}
                {isV2 && results.explanation && (
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/50">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] px-2 py-0.5">
                      <Activity className="h-3 w-3 mr-1" />
                      Enhanced AI Model
                    </Badge>
                    <Badge
                      variant={results.explanation.confidence_level === 'high' ? 'default' : results.explanation.confidence_level === 'moderate' ? 'secondary' : 'destructive'}
                      className="text-[10px] px-2 py-0.5"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {results.explanation.confidence_level === 'high' ? 'High certainty' : results.explanation.confidence_level === 'moderate' ? 'Moderate certainty' : 'Low certainty'}
                    </Badge>
                    {results.drift_status && (
                      <Badge
                        variant={results.drift_status.drift_detected ? 'destructive' : 'outline'}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {results.drift_status.drift_detected ? (
                          <><XCircle className="h-3 w-3 mr-1" />Patterns shifting</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" />Patterns stable</>
                        )}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Section 2: Overall Risk ────────────────────────────────── */}
            {results.risk_fusion ? (
              <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">Overall Risk Assessment</CardTitle>
                      <CardDescription className="text-xs">
                        We combine disease trends, weather, news, and symptoms into one risk score.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Big risk number */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                    <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${results.risk_fusion.risk_level.toLowerCase() === 'critical' ? 'bg-destructive/10 ring-2 ring-destructive/20' :
                      results.risk_fusion.risk_level.toLowerCase() === 'high' ? 'bg-destructive/10' :
                        results.risk_fusion.risk_level.toLowerCase() === 'medium' ? 'bg-amber-500/10' :
                          'bg-emerald-500/10'
                      }`}>
                      <p className={`text-2xl font-black leading-none ${results.risk_fusion.risk_level.toLowerCase() === 'critical' || results.risk_fusion.risk_level.toLowerCase() === 'high' ? 'text-destructive' :
                        results.risk_fusion.risk_level.toLowerCase() === 'medium' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                        {(results.risk_fusion.fused_risk_score * 100).toFixed(0)}%
                      </p>
                      <p className={`text-[10px] font-bold uppercase mt-0.5 ${results.risk_fusion.risk_level.toLowerCase() === 'critical' || results.risk_fusion.risk_level.toLowerCase() === 'high' ? 'text-destructive/70' :
                        results.risk_fusion.risk_level.toLowerCase() === 'medium' ? 'text-amber-600/70' :
                          'text-emerald-600/70'
                        }`}>
                        {results.risk_fusion.risk_level}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed text-center sm:text-left">
                        {results.risk_fusion.risk_level.toLowerCase() === 'critical' ? 'Immediate attention recommended. Multiple factors point to significantly elevated outbreak risk in this region.' :
                          results.risk_fusion.risk_level.toLowerCase() === 'high' ? 'Several indicators suggest elevated risk of disease activity. Stay informed and follow public health guidance.' :
                            results.risk_fusion.risk_level.toLowerCase() === 'medium' ? 'Some factors indicate moderate risk. Continue monitoring — conditions could change.' :
                              'Current indicators suggest low risk in this region. No immediate concerns detected.'}
                      </p>
                    </div>
                  </div>

                  {/* Component breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "Disease Trend", desc: "Are cases going up or down?", value: results.risk_fusion.components.forecast_trend, color: "blue" },
                      { label: "Weather Risk", desc: "Is weather favoring disease spread?", value: results.risk_fusion.components.weather_suitability, color: "amber" },
                      { label: "News Alerts", desc: "Are there outbreak reports?", value: results.risk_fusion.components.news_pressure, color: "red" },
                      { label: "Reported Symptoms", desc: "Are people reporting symptoms?", value: results.risk_fusion.components.symptom_risk ?? 0, color: "purple" },
                    ].map((comp, i) => (
                      <div key={i} className="bg-white/60 rounded-xl p-2.5 text-center group cursor-default" title={comp.desc}>
                        <p className="text-[10px] uppercase font-bold text-foreground/40 mb-1.5">{comp.label}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-700 ${comp.color === 'blue' ? 'bg-blue-500' :
                              comp.color === 'amber' ? 'bg-amber-500' :
                                comp.color === 'red' ? 'bg-red-500' : 'bg-purple-500'
                              }`}
                            style={{ width: `${Math.min(comp.value * 100, 100)}%` }}
                          />
                        </div>
                        <p className={`text-xs font-bold ${comp.color === 'blue' ? 'text-blue-600' :
                          comp.color === 'amber' ? 'text-amber-600' :
                            comp.color === 'red' ? 'text-red-600' : 'text-purple-600'
                          }`}>
                          {(comp.value * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : results.hotspot_score !== undefined && (
              <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${results.hotspot_score > 0.7 ? 'bg-destructive/10' : results.hotspot_score > 0.4 ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                        }`}>
                        <AlertTriangle className={`h-5 w-5 ${results.hotspot_score > 0.7 ? 'text-destructive' : results.hotspot_score > 0.4 ? 'text-amber-500' : 'text-emerald-500'
                          }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">How Likely Is an Outbreak?</p>
                        <p className="text-sm text-foreground/60">
                          Based on patterns in this region, here's how likely disease activity could increase.
                        </p>
                      </div>
                    </div>
                    <div className="text-right sm:text-right self-end sm:self-auto">
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

            {/* ── Section 3: Projected Cases (Chart + Stats) ─────────────── */}
            <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">Projected Cases Over Time</CardTitle>
                      <CardDescription className="text-xs">
                        How many cases we expect each week. {combinedData.some(d => d.p10) && 'The shaded area shows the range of possibilities.'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-secondary/30 p-0.5 rounded-lg self-end sm:self-auto">
                    <Button
                      variant={activeTab === 'chart' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('chart')}
                      className={`h-7 text-xs ${activeTab === 'chart' ? 'shadow-sm' : ''}`}
                    >
                      <BarChart3 className="mr-1.5 h-3 w-3" />
                      Chart
                    </Button>
                    <Button
                      variant={activeTab === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('map')}
                      className={`h-7 text-xs ${activeTab === 'map' ? 'shadow-sm' : ''}`}
                    >
                      <Map className="mr-1.5 h-3 w-3" />
                      Map
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'chart' ? (
                    <motion.div
                      key="chart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ForecastChart data={combinedData} />
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

                {/* Inline stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Worst Week", value: results.predictions.reduce((max, pred) => getCases(pred) > getCases(max) ? pred : max).week },
                    { label: "Highest Cases", value: Math.max(...results.predictions.map(p => getCases(p))) },
                    { label: "Total Expected", value: results.predictions.reduce((sum, pred) => sum + getCases(pred), 0) },
                    { label: "Avg. Per Week", value: Math.round(results.predictions.reduce((sum, pred) => sum + getCases(pred), 0) / results.predictions.length) }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/60 border border-white/80 p-2 sm:p-3 rounded-xl text-center">
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-foreground/40 mb-0.5">{stat.label}</p>
                      <p className="text-sm sm:text-base font-bold text-primary truncate">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Section 4: Current Conditions (Weather + News) ─────────── */}
            {results.live_insights && (
              <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">Current Conditions</CardTitle>
                      <CardDescription className="text-xs">
                        Live weather and news for {results.region} that may affect disease spread.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Weather */}
                  <div className="bg-white/60 border border-white/80 p-3 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Temperature</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{results.live_insights.temperature}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Humidity & Rainfall</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{results.live_insights.humidity}% ({(results.live_insights.precipitation || 0).toFixed(1)}mm)</span>
                    </div>
                  </div>

                  {/* News */}
                  <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Newspaper className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Recent Health News</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-white/50 border-white/60 text-primary">
                        {results.live_insights.news_articles_found} Articles
                      </Badge>
                    </div>
                    {results.live_insights.top_headlines && results.live_insights.top_headlines.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-foreground/80 list-disc pl-4">
                        {results.live_insights.top_headlines.map((headline, idx) => (
                          <li key={idx} className="leading-snug tracking-tight">{headline}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic tracking-tight">No outbreak-related news found right now — that's a good sign.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Section 5: Why This Forecast ───────────────────────────── */}
            {results.explanation && (
              <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">Why This Forecast?</CardTitle>
                      <CardDescription className="text-xs">
                        Here's what influenced this prediction and any special conditions we detected.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Key Factors */}
                  <div className="bg-white/60 border border-white/80 p-3 rounded-xl space-y-2">
                    <p className="text-[10px] uppercase font-bold text-foreground/40">Key Factors</p>
                    {results.explanation.top_drivers.slice(0, 5).map((driver, idx) => {
                      const friendlyNames: Record<string, string> = {
                        'temperature': 'Temperature',
                        'humidity': 'Humidity',
                        'precipitation': 'Rainfall',
                        'cases lag 1': 'Last week\'s cases',
                        'cases lag 2': 'Cases 2 weeks ago',
                        'cases lag 3': 'Cases 3 weeks ago',
                        'cases lag 4': 'Cases a month ago',
                        'cases lag 5': 'Cases 5 weeks ago',
                        'cases lag 6': 'Cases 6 weeks ago',
                        'cases lag 7': 'Cases 7 weeks ago',
                        'cases lag 8': 'Cases 2 months ago',
                        'week sin': 'Week of the year',
                        'week cos': 'Seasonal timing',
                        'month sin': 'Time of year',
                        'month cos': 'Seasonal cycle',
                        'region id': 'Region',
                        'temp c mean': 'Average temperature',
                        'humidity mean': 'Average humidity',
                        'precip mm sum': 'Total rainfall',
                        'weather risk': 'Weather-related risk',
                        'news count': 'Number of news reports',
                        'news risk score': 'News alert level',
                        'missing weather': 'Weather data availability',
                        'missing news': 'News data availability',
                        'trend': 'Overall trend',
                        'rolling mean 4': 'Recent 4-week average',
                        'rolling std 4': 'How much cases vary',
                        'rolling mean 8': 'Recent 8-week average',
                        'rolling std 8': 'Longer-term variability',
                        'news pressure': 'News reports',
                        'pop density': 'Population density',
                        'cases diff 1': 'Weekly change in cases',
                        'is monsoon': 'Monsoon season',
                      };
                      const label = friendlyNames[driver.feature.replace(/_/g, ' ')] || driver.feature.replace(/_/g, ' ');
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-foreground/70 truncate mr-2">{label}</span>
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(driver.importance * 100, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-primary w-10 text-right">{(driver.importance * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* What We Noticed */}
                  <div className="bg-white/60 border border-white/80 p-3 rounded-xl space-y-3">
                    <p className="text-[10px] uppercase font-bold text-foreground/40">What We Noticed</p>
                    {results.explanation.reasons.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {results.explanation.reasons.map((reason, idx) => (
                          <Badge key={idx} variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'outline'} className="text-[10px]">
                            {reason.text || reason.code.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nothing unusual detected — all factors are within normal ranges.</p>
                    )}

                    {/* Model Reliability */}
                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Info className="h-3 w-3 text-foreground/40" />
                        <p className="text-[10px] uppercase font-bold text-foreground/40">Model Reliability</p>
                      </div>
                      <div className="space-y-1.5">
                        {results.explanation.confidence_level && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground/60">Confidence</span>
                            <Badge
                              variant={results.explanation.confidence_level === 'high' ? 'default' : results.explanation.confidence_level === 'moderate' ? 'secondary' : 'destructive'}
                              className="text-[10px] capitalize"
                            >
                              {results.explanation.confidence_level}
                            </Badge>
                          </div>
                        )}
                        {results.explanation.model_agreement !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground/60">Model Agreement</span>
                            <span className="text-xs font-bold text-primary">{(results.explanation.model_agreement * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {results.explanation.interval_relative_width !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground/60">Prediction Spread</span>
                            <span className="text-xs font-bold text-foreground/70">{(results.explanation.interval_relative_width * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {results.drift_status && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground/60">Pattern Stability</span>
                            <Badge
                              variant={results.drift_status.drift_detected ? 'destructive' : 'outline'}
                              className="text-[10px]"
                            >
                              {results.drift_status.drift_detected ? 'Shifting' : 'Stable'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Section 6: What If Measures Are Taken ──────────────────── */}
            {results.scenario && (
              <Card className="bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                      <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">What If Measures Are Taken?</CardTitle>
                      <CardDescription className="text-xs">
                        If health interventions are applied, here's how much they could reduce cases.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-700/60 mb-1">Cases Prevented</p>
                      <p className="text-2xl font-bold text-emerald-600">{Math.round(results.scenario.effect_summary.cases_averted)}</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-700/60 mb-1">Reduction</p>
                      <p className="text-2xl font-bold text-emerald-600">{Math.abs(results.scenario.effect_summary.pct_change).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center h-full min-h-[400px] sm:min-h-[500px] lg:min-h-full border-2 border-dashed border-primary/10 rounded-[24px]"
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