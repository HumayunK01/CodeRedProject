import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ForecastResult, ForecastPrediction } from "@/lib/types";
import { ForecastChart } from "./ForecastChart";
import { ForecastMap } from "./ForecastMap";
import { DiseaseBadges } from "./DiseaseBadges";
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
  Info,
} from "lucide-react";

interface ForecastResultsProps {
  results: ForecastResult | null;
  isLoading: boolean;
}

export const ForecastResults = ({ results, isLoading }: ForecastResultsProps) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'map'>('chart');

  /** Get case count from either v2 `point` or v1 `cases` field */
  const getCases = (pred: ForecastPrediction): number => pred.point ?? pred.cases ?? 0;

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

                  <div className="h-8 w-px bg-border hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none mb-1">Diseases</p>
                      <DiseaseBadges variant="inline" />
                    </div>
                  </div>
                </div>

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
                      <CardTitle className="text-sm font-bold text-primary">How Risky Is It Right Now?</CardTitle>
                      <CardDescription className="text-xs">
                        A simple score that tells you how worried to be, based on cases, weather, and news combined.
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

                  {/* Component breakdown — plain English status instead of raw % */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                      const describe = (value: number, labels: [string, string, string, string]) => {
                        if (value >= 0.75) return { text: labels[0], tone: 'high' as const };
                        if (value >= 0.5) return { text: labels[1], tone: 'medium' as const };
                        if (value >= 0.25) return { text: labels[2], tone: 'low' as const };
                        return { text: labels[3], tone: 'low' as const };
                      };
                      const items = [
                        {
                          icon: TrendingUp,
                          title: "Disease Cases",
                          ...describe(results.risk_fusion.components.forecast_trend, [
                            "Rising sharply",
                            "Climbing",
                            "Holding steady",
                            "Going down",
                          ]),
                        },
                        {
                          icon: CloudRain,
                          title: "Weather",
                          ...describe(results.risk_fusion.components.weather_suitability, [
                            "Very favorable for spread",
                            "Somewhat favorable",
                            "Not a big factor",
                            "Unfavorable — good news",
                          ]),
                        },
                        {
                          icon: Newspaper,
                          title: "News Reports",
                          ...describe(results.risk_fusion.components.news_pressure, [
                            "Many outbreak stories",
                            "A few outbreak stories",
                            "Quiet in the news",
                            "No relevant reports",
                          ]),
                        },
                        {
                          icon: Activity,
                          title: "Symptoms Reported",
                          ...describe(results.risk_fusion.components.symptom_risk ?? 0, [
                            "Unusually high",
                            "Slightly elevated",
                            "Normal levels",
                            "Very few reports",
                          ]),
                        },
                      ];
                      return items.map((item, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-3 flex items-center gap-3 border ${item.tone === 'high'
                            ? 'bg-destructive/5 border-destructive/20'
                            : item.tone === 'medium'
                              ? 'bg-amber-500/5 border-amber-500/20'
                              : 'bg-emerald-500/5 border-emerald-500/20'
                            }`}
                        >
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${item.tone === 'high'
                            ? 'bg-destructive/10 text-destructive'
                            : item.tone === 'medium'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                            }`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none mb-1">{item.title}</p>
                            <p className={`text-sm font-semibold leading-tight ${item.tone === 'high'
                              ? 'text-destructive'
                              : item.tone === 'medium'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                              }`}>{item.text}</p>
                          </div>
                        </div>
                      ));
                    })()}
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
                      <div className="mt-1.5">
                        <DiseaseBadges variant="minimal" />
                      </div>
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
                      <CardTitle className="text-sm font-bold text-primary">What's Happening Right Now</CardTitle>
                      <CardDescription className="text-xs">
                        Today's weather and recent news from {results.region} — things that can help or hurt disease spread.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* One-line plain English summary of current conditions */}
                  {(() => {
                    const temp = results.live_insights.temperature ?? 0;
                    const humidity = results.live_insights.humidity ?? 0;
                    const rain = results.live_insights.precipitation ?? 0;
                    const warm = temp >= 22 && temp <= 32;
                    const humid = humidity >= 70;
                    const rainy = rain >= 5;
                    const favorable = (warm && humid) || (warm && rainy);
                    return (
                      <div className={`rounded-xl p-3 border text-sm ${favorable ? 'bg-amber-500/5 border-amber-500/20 text-amber-800' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800'}`}>
                        <p className="leading-relaxed">
                          <strong className="font-semibold">In short:</strong>{' '}
                          {favorable
                            ? "Warm and humid conditions — these tend to help diseases like malaria spread."
                            : "Conditions are not especially favorable for disease spread right now."}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Weather */}
                    <div className="bg-white/60 border border-white/80 p-3 rounded-xl space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Thermometer className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none mb-1">Temperature</p>
                          <p className="text-sm font-semibold text-primary leading-tight">
                            {results.live_insights.temperature}°C
                            <span className="ml-2 text-xs font-normal text-foreground/60">
                              {(results.live_insights.temperature ?? 0) >= 30 ? '· Hot'
                                : (results.live_insights.temperature ?? 0) >= 22 ? '· Warm'
                                  : (results.live_insights.temperature ?? 0) >= 15 ? '· Mild'
                                    : '· Cool'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CloudRain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none mb-1">Humidity & Rain</p>
                          <p className="text-sm font-semibold text-primary leading-tight">
                            {results.live_insights.humidity}% humid
                            <span className="ml-2 text-xs font-normal text-foreground/60">
                              {(results.live_insights.precipitation ?? 0) >= 10 ? '· Heavy rain'
                                : (results.live_insights.precipitation ?? 0) >= 2 ? '· Some rain'
                                  : '· Dry'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* News */}
                    <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Newspaper className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold text-foreground/40 leading-none mb-1">Recent Health News</p>
                          <p className="text-sm font-semibold text-primary leading-tight">
                            {results.live_insights.news_articles_found === 0
                              ? "No outbreak stories"
                              : results.live_insights.news_articles_found === 1
                                ? "1 outbreak story"
                                : `${results.live_insights.news_articles_found} outbreak stories`}
                          </p>
                        </div>
                      </div>
                      {results.live_insights.top_headlines && results.live_insights.top_headlines.length > 0 ? (
                        <ul className="space-y-1 text-[11px] text-foreground/70 list-disc pl-4 mt-1">
                          {results.live_insights.top_headlines.slice(0, 3).map((headline, idx) => (
                            <li key={idx} className="leading-snug tracking-tight">{headline}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground italic tracking-tight">Nothing concerning in the news right now — a good sign.</p>
                      )}
                    </div>
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
                      <CardTitle className="text-sm font-bold text-primary">What's Behind This Prediction?</CardTitle>
                      <CardDescription className="text-xs">
                        The main things we looked at, and anything unusual we noticed while making this forecast.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Key Factors — plain English, no percentages */}
                  <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-foreground/40 mb-2">What We Looked At</p>
                    {(() => {
                      const drivers = results.explanation.top_drivers.slice(0, 5);
                      const categorize = (feature: string): { group: string; plain: string } => {
                        const f = feature.toLowerCase().replace(/_/g, ' ');
                        if (f.includes('cases lag') || f.includes('cases diff') || f.includes('rolling') || f.includes('slope') || f.includes('ratio') || f.includes('trend'))
                          return { group: 'cases', plain: 'how cases have been changing over recent weeks' };
                        if (f.includes('temp') || f.includes('humidity') || f.includes('precip') || f.includes('rain') || f.includes('weather'))
                          return { group: 'weather', plain: 'current weather conditions (temperature, humidity, rainfall)' };
                        if (f.includes('week') || f.includes('month') || f.includes('season') || f.includes('monsoon'))
                          return { group: 'season', plain: 'the time of year and seasonal patterns' };
                        if (f.includes('news'))
                          return { group: 'news', plain: 'recent health news and outbreak reports' };
                        if (f.includes('region') || f.includes('pop'))
                          return { group: 'region', plain: 'this specific region and its population' };
                        return { group: 'other', plain: 'other historical signals' };
                      };

                      const seen = new Set<string>();
                      const uniqueDescriptions: string[] = [];
                      drivers.forEach((d) => {
                        const { group, plain } = categorize(d.feature);
                        if (!seen.has(group)) {
                          seen.add(group);
                          uniqueDescriptions.push(plain);
                        }
                      });

                      const topGroup = drivers.length > 0 ? categorize(drivers[0].feature).group : null;
                      const mostImportant: Record<string, string> = {
                        cases: "The biggest clue was how cases have been moving over the last few weeks.",
                        weather: "Weather was the strongest signal this week.",
                        season: "The time of year played the biggest role in this prediction.",
                        news: "Recent health news reports stood out the most.",
                        region: "Patterns specific to this region mattered most.",
                        other: "A mix of historical signals shaped this forecast.",
                      };

                      return (
                        <div className="space-y-2.5">
                          {topGroup && (
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                              {mostImportant[topGroup]}
                            </p>
                          )}
                          {uniqueDescriptions.length > 1 && (
                            <div className="pt-2 border-t border-border/40">
                              <p className="text-[11px] text-foreground/60 mb-1.5">It also took into account:</p>
                              <ul className="space-y-1">
                                {uniqueDescriptions.slice(1).map((desc, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-xs text-foreground/70 leading-snug">
                                    <span className="text-primary/60 mt-0.5">•</span>
                                    <span>{desc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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

                    {/* How sure are we? — plain-language confidence summary */}
                    {results.explanation.confidence_level && (
                      <div className="pt-2 border-t border-border/40">
                        <div className="flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 text-foreground/40 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground/70 leading-relaxed">
                            {results.explanation.confidence_level === 'high'
                              ? 'We\'re fairly confident in this forecast — the patterns in recent weeks are clear.'
                              : results.explanation.confidence_level === 'moderate'
                                ? 'This forecast is a reasonable estimate, but conditions could still surprise us.'
                                : 'Take this forecast with caution — the data shows some uncertainty.'}
                          </p>
                        </div>
                      </div>
                    )}
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