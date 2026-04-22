import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ForecastChart } from "@/components/forecast/ForecastChart";
import { ForecastMap } from "@/components/forecast/ForecastMap";
import {
  ComparisonPayload,
  RankedForecastResult,
  ForecastPrediction,
} from "@/lib/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  Crown,
  Wind,
  Newspaper,
  Activity,
  ChevronDown,
  ChevronUp,
  BarChart3,
  MapPin,
  LineChart,
  Shield,
  AlertTriangle,
  Thermometer,
  Droplets,
} from "lucide-react";

interface ComparisonResultsProps {
  payload: ComparisonPayload | null;
  isLoading: boolean;
}

const getRiskPalette = (riskLevel?: string) => {
  switch (riskLevel?.toLowerCase()) {
    case "low":
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        circle: "bg-emerald-500",
        ring: "ring-emerald-500/30",
        hex: "#10b981",
        text: "text-emerald-700",
        bgSoft: "bg-emerald-50",
      };
    case "medium":
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        circle: "bg-amber-500",
        ring: "ring-amber-500/30",
        hex: "#f59e0b",
        text: "text-amber-700",
        bgSoft: "bg-amber-50",
      };
    case "high":
      return {
        badge: "bg-orange-100 text-orange-800 border-orange-200",
        circle: "bg-orange-500",
        ring: "ring-orange-500/30",
        hex: "#f97316",
        text: "text-orange-700",
        bgSoft: "bg-orange-50",
      };
    case "critical":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        circle: "bg-red-500",
        ring: "ring-red-500/30",
        hex: "#ef4444",
        text: "text-red-700",
        bgSoft: "bg-red-50",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        circle: "bg-gray-400",
        ring: "ring-gray-300",
        hex: "#9ca3af",
        text: "text-gray-700",
        bgSoft: "bg-gray-50",
      };
  }
};

const buildChartData = (predictions: ForecastPrediction[]) => {
  return predictions.map((p) => ({
    week: p.week,
    predictedCases: p.point ?? p.cases ?? 0,
    p10: p.p10,
    p90: p.p90,
  }));
};

// Overview chart showing all regions' risk scores side-by-side
const ComparisonOverviewChart = ({ items }: { items: RankedForecastResult[] }) => {
  const chartData = items
    .filter((i) => !i.failed)
    .map((i) => ({
      region: i.result.region.length > 12 ? i.result.region.slice(0, 12) + "…" : i.result.region,
      fullRegion: i.result.region,
      riskScore: Math.round((i.result.risk_fusion?.fused_risk_score ?? 0) * 100),
      rank: i.rank,
      riskLevel: i.result.risk_fusion?.risk_level || "Unknown",
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Risk Score Comparison
        </h3>
      </div>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              width={35}
              label={{ value: 'Risk %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#666' } }}
            />
            <RechartsTooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                    <p className="font-semibold text-xs">{d.fullRegion}</p>
                    <p className="text-xs text-muted-foreground">Rank #{d.rank}</p>
                    <p className="text-xs">Risk: <strong>{d.riskScore}%</strong></p>
                    <p className="text-xs">Level: <strong>{d.riskLevel}</strong></p>
                  </div>
                );
              }}
            />
            <Bar dataKey="riskScore" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={getRiskPalette(entry.riskLevel).hex} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Compact stat block for the overview tab
const StatBlock = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-lg bg-white/60 border border-gray-100 p-3 space-y-0.5">
    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
      {label}
    </p>
    <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
    {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

const RegionCard = ({
  item,
  isSafest,
  defaultOpen,
}: {
  item: RankedForecastResult;
  isSafest: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const { result } = item;
  const riskLevel = result.risk_fusion?.risk_level || "Unknown";
  const score = result.risk_fusion?.fused_risk_score ?? 0;
  const palette = getRiskPalette(riskLevel);

  if (item.failed) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-foreground">{result.region}</p>
          <p className="text-xs text-muted-foreground">
            {item.errorMessage || "Failed to fetch forecast"}
          </p>
        </div>
      </div>
    );
  }

  const chartData = buildChartData(result.predictions);
  const peakCases = Math.max(...chartData.map((d) => d.predictedCases));
  const totalCases = chartData.reduce((s, d) => s + d.predictedCases, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`rounded-xl border transition-all overflow-hidden ${
          isSafest
            ? `border-emerald-300 bg-emerald-50/40 border-l-4 border-l-emerald-500 shadow-md shadow-emerald-500/10`
            : "border-gray-200 bg-white hover:shadow-sm"
        }`}
      >
        {/* Header (always visible) */}
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 sm:p-5 cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Rank circle */}
                <div
                  className={`w-12 h-12 rounded-full ${palette.circle} flex items-center justify-center text-white font-bold shadow-md ring-4 ${palette.ring} flex-shrink-0`}
                >
                  {isSafest ? (
                    <Crown className="h-6 w-6" />
                  ) : (
                    <span className="text-lg">{item.rank}</span>
                  )}
                </div>

                {/* Region + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg text-foreground">
                      {result.region}
                    </h3>
                    {isSafest && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                        <Shield className="h-3 w-3 mr-1" />
                        Safest to Travel
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Math.round(totalCases).toLocaleString()} total • {Math.round(peakCases).toLocaleString()} peak
                  </p>
                </div>
              </div>

              {/* Risk score bubble */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-bold ${palette.text}`}>
                    {(score * 100).toFixed(0)}
                  </span>
                  <span className={`text-sm ${palette.text}`}>%</span>
                </div>
                <Badge className={`${palette.badge} border text-[10px]`}>
                  {riskLevel}
                </Badge>
              </div>
            </div>

            {/* Risk score bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Risk Score
                </span>
                <button
                  type="button"
                  className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {open ? (
                    <>
                      Hide details <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      View details <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(2, score * 100)}%`,
                    backgroundColor: palette.hex,
                  }}
                />
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Collapsible detailed content */}
        <CollapsibleContent>
          <div className="border-t border-gray-100 p-4 sm:p-5 bg-white/50 space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100/60 rounded-lg">
                <TabsTrigger value="overview" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="chart" className="text-xs">
                  <LineChart className="h-3 w-3 mr-1" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="map" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Map
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="pt-4 space-y-4">
                {/* Stat grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatBlock
                    label="Avg/Week"
                    value={item.avgProjectedCases.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  />
                  <StatBlock label="Peak" value={Math.round(peakCases).toLocaleString()} />
                  <StatBlock label="Total" value={Math.round(totalCases).toLocaleString()} />
                  <StatBlock
                    label="Rank"
                    value={`#${item.rank}`}
                    hint={isSafest ? "Safest" : ""}
                  />
                </div>

                {/* Component breakdown */}
                {result.risk_fusion && (
                  <div className="space-y-3 p-4 rounded-lg bg-gray-50/60 border border-gray-100">
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Risk Components
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          icon: TrendingUp,
                          label: "Forecast Trend",
                          value: result.risk_fusion.components.forecast_trend,
                        },
                        {
                          icon: Wind,
                          label: "Weather",
                          value: result.risk_fusion.components.weather_suitability,
                        },
                        {
                          icon: Newspaper,
                          label: "Media Pressure",
                          value: result.risk_fusion.components.news_pressure,
                        },
                        {
                          icon: Activity,
                          label: "Symptom Risk",
                          value: result.risk_fusion.components.symptom_risk,
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon className="h-3 w-3" />
                              {label}
                            </span>
                            <span className="font-semibold text-foreground">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={value * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current conditions */}
                {result.live_insights && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 border border-sky-100">
                      <Thermometer className="h-4 w-4 text-sky-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Temp</p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.temperature?.toFixed(0)}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <Droplets className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Humidity</p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.humidity?.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <Wind className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rain</p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.precipitation?.toFixed(1)}mm
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Chart Tab */}
              <TabsContent value="chart" className="pt-4">
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <ForecastChart data={chartData} />
                </div>
              </TabsContent>

              {/* Map Tab */}
              <TabsContent value="map" className="pt-4">
                <ForecastMap
                  region={result.region}
                  hotspots={result.hotspots}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const ComparisonResults = ({
  payload,
  isLoading,
}: ComparisonResultsProps) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 space-y-6"
      >
        <div className="relative w-20 h-20">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-4 border-primary/40"
              style={{
                borderRadius: "50%",
              }}
            />
          ))}
          <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">Analyzing Regions</p>
          <p className="text-sm text-muted-foreground">
            Running forecasts and calculating risk scores...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!payload || payload.ranked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
        <div className="p-4 rounded-full bg-primary/5 mb-4">
          <BarChart3 className="h-10 w-10 text-primary/40" />
        </div>
        <p className="text-base font-semibold text-foreground mb-1">
          No comparison yet
        </p>
        <p className="text-sm text-muted-foreground">
          Select 2–5 regions and run a comparison.
        </p>
      </div>
    );
  }

  const successful = payload.ranked.filter((r) => !r.failed);
  const failed = payload.ranked.filter((r) => r.failed);
  const safestItem = successful[0];

  return (
    <div className="space-y-5">
      {/* Top banner with summary */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {successful.length} regions compared
              </p>
              <p className="text-[11px] text-muted-foreground">
                {payload.horizon_weeks}-week horizon • ranked safest to riskiest
              </p>
            </div>
          </div>
          {safestItem && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
              <Crown className="h-3.5 w-3.5 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-800">
                Safest: {safestItem.result.region}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overview comparison chart */}
      {successful.length > 0 && <ComparisonOverviewChart items={payload.ranked} />}

      {/* Section title */}
      <div className="flex items-center gap-2 pt-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Regional Breakdown
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Region cards (animated) */}
      <AnimatePresence mode="wait">
        <div className="space-y-3">
          {successful.map((item, idx) => (
            <motion.div
              key={`region-${item.result.region}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
            >
              <RegionCard
                item={item}
                isSafest={item === safestItem}
                defaultOpen={item === safestItem}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Failed regions */}
      {failed.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Unavailable
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-foreground text-sm">
                  {failed.length} region{failed.length > 1 ? "s" : ""} could not be analyzed
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {failed.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-yellow-600" />
                      <strong>{f.result.region}</strong>: {f.errorMessage || "Unknown error"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
