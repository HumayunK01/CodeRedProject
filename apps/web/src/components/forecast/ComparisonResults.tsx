import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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

// Two-tone system: emerald reserved for safest, primary for everything else.
const SAFEST_ACCENT = {
  text: "text-emerald-700",
  bg: "bg-emerald-50",
  border: "border-emerald-200",
  softBorder: "border-l-emerald-500",
  solid: "bg-emerald-500",
  ring: "ring-emerald-500/20",
  hex: "#10b981",
};

const DEFAULT_ACCENT = {
  text: "text-primary",
  bg: "bg-primary/5",
  border: "border-primary/15",
  softBorder: "border-l-primary",
  solid: "bg-primary",
  ring: "ring-primary/15",
  hex: "hsl(var(--primary))",
};

const buildChartData = (predictions: ForecastPrediction[]) => {
  return predictions.map((p) => ({
    week: p.week,
    predictedCases: p.point ?? p.cases ?? 0,
    p10: p.p10,
    p90: p.p90,
  }));
};

// Overview bar chart — all primary color, safest emerald
const ComparisonOverviewChart = ({ items }: { items: RankedForecastResult[] }) => {
  const chartData = items
    .filter((i) => !i.failed)
    .map((i) => ({
      region:
        i.result.region.length > 12
          ? `${i.result.region.slice(0, 12)}…`
          : i.result.region,
      fullRegion: i.result.region,
      riskScore: Math.round((i.result.risk_fusion?.fused_risk_score ?? 0) * 100),
      rank: i.rank,
      riskLevel: i.result.risk_fusion?.risk_level || "Unknown",
      isSafest: i.rank === 1,
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Risk Score Comparison
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Safest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />
            <span>Other Regions</span>
          </div>
        </div>
      </div>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="barSafest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="region"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              width={35}
            />
            <RechartsTooltip
              cursor={{ fill: "hsl(var(--primary) / 0.05)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                    <p className="font-semibold text-xs text-foreground">
                      {d.fullRegion}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Rank #{d.rank} · {d.riskLevel}
                    </p>
                    <p className="text-xs mt-1">
                      Risk Score:{" "}
                      <span
                        className={`font-bold ${
                          d.isSafest ? "text-emerald-600" : "text-primary"
                        }`}
                      >
                        {d.riskScore}%
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="riskScore" radius={[10, 10, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.isSafest ? "url(#barSafest)" : "url(#barPrimary)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Stat chip — cleaner, icon + label + value
const StatChip = ({
  label,
  value,
  accentSafe,
}: {
  label: string;
  value: string;
  accentSafe?: boolean;
}) => (
  <div
    className={`rounded-xl px-3 py-2.5 border ${
      accentSafe
        ? "bg-emerald-50/50 border-emerald-100"
        : "bg-gray-50/60 border-gray-100"
    }`}
  >
    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
      {label}
    </p>
    <p
      className={`text-base sm:text-lg font-bold leading-tight mt-0.5 ${
        accentSafe ? "text-emerald-700" : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

// Component row — horizontal bar with label + value
const ComponentRow = ({
  icon: Icon,
  label,
  value,
  isSafest,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  isSafest: boolean;
}) => {
  const pct = Math.round(value * 100);
  const color = isSafest ? "#10b981" : "hsl(var(--primary))";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const RegionCard = ({
  item,
  isSafest,
  defaultOpen,
  maxScore,
}: {
  item: RankedForecastResult;
  isSafest: boolean;
  defaultOpen?: boolean;
  maxScore: number;
}) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const { result } = item;
  const riskLevel = result.risk_fusion?.risk_level || "Unknown";
  const score = result.risk_fusion?.fused_risk_score ?? 0;
  const accent = isSafest ? SAFEST_ACCENT : DEFAULT_ACCENT;

  if (item.failed) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100">
          <AlertCircle className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">{result.region}</p>
          <p className="text-xs text-muted-foreground">
            {item.errorMessage || "Failed to fetch forecast"}
          </p>
        </div>
      </div>
    );
  }

  const chartData = buildChartData(result.predictions);
  const peakCases = Math.max(...chartData.map((d) => d.predictedCases), 0);
  const totalCases = chartData.reduce((s, d) => s + d.predictedCases, 0);
  const scorePct = Math.round(score * 100);
  // Relative fill — how this region's risk compares to the worst in the group
  const relativeFill = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${
          isSafest
            ? `${accent.border} ${accent.bg} border-l-4 ${accent.softBorder} shadow-sm shadow-emerald-500/5`
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 sm:p-5 cursor-pointer group">
            <div className="flex items-start justify-between gap-4">
              {/* Left: rank + info */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Rank badge — solid color background */}
                <div
                  className={`relative w-12 h-12 rounded-xl ${accent.solid} flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}
                >
                  {isSafest ? (
                    <Crown className="h-5 w-5" />
                  ) : (
                    <span className="text-lg">{item.rank}</span>
                  )}
                </div>

                {/* Region + metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
                      {result.region}
                    </h3>
                    {isSafest ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-[10px] gap-1 hover:bg-emerald-100">
                        <Shield className="h-2.5 w-2.5" />
                        Safest
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-gray-200 text-muted-foreground font-medium"
                      >
                        {riskLevel}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(totalCases).toLocaleString()} total
                    </span>
                    <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                    <span>Peak {Math.round(peakCases).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right: score */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-baseline gap-0.5">
                  <span
                    className={`text-3xl sm:text-4xl font-bold tabular-nums ${accent.text} leading-none`}
                  >
                    {scorePct}
                  </span>
                  <span className={`text-lg font-semibold ${accent.text}`}>%</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Risk Score
                </span>
              </div>
            </div>

            {/* Relative risk bar — shows how this region compares */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Relative Risk
                </span>
                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  {open ? "Hide details" : "View details"}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, relativeFill)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: accent.hex }}
                />
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded content */}
        <CollapsibleContent>
          <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/30 space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-100 rounded-xl p-1 h-auto">
                <TabsTrigger
                  value="overview"
                  className="text-xs data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg py-1.5"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="chart"
                  className="text-xs data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg py-1.5"
                >
                  <LineChart className="h-3 w-3 mr-1" />
                  Chart
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="text-xs data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-lg py-1.5"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Map
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="pt-4 space-y-4 mt-0">
                {/* Stat grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatChip
                    label="Avg/Week"
                    value={item.avgProjectedCases.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  />
                  <StatChip
                    label="Peak"
                    value={Math.round(peakCases).toLocaleString()}
                  />
                  <StatChip
                    label="Total"
                    value={Math.round(totalCases).toLocaleString()}
                  />
                  <StatChip
                    label="Rank"
                    value={`#${item.rank}`}
                    accentSafe={isSafest}
                  />
                </div>

                {/* Component breakdown */}
                {result.risk_fusion && (
                  <div className="space-y-3 p-4 rounded-xl bg-white border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Risk Components
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        Contribution to risk score
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <ComponentRow
                        icon={TrendingUp}
                        label="Forecast Trend"
                        value={result.risk_fusion.components.forecast_trend}
                        isSafest={isSafest}
                      />
                      <ComponentRow
                        icon={Wind}
                        label="Weather"
                        value={result.risk_fusion.components.weather_suitability}
                        isSafest={isSafest}
                      />
                      <ComponentRow
                        icon={Newspaper}
                        label="Media Pressure"
                        value={result.risk_fusion.components.news_pressure}
                        isSafest={isSafest}
                      />
                      <ComponentRow
                        icon={Activity}
                        label="Symptom Risk"
                        value={result.risk_fusion.components.symptom_risk}
                        isSafest={isSafest}
                      />
                    </div>
                  </div>
                )}

                {/* Current conditions */}
                {result.live_insights && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100">
                      <div className="p-1.5 rounded-lg bg-primary/5">
                        <Thermometer className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Temp
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.temperature?.toFixed(0)}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100">
                      <div className="p-1.5 rounded-lg bg-primary/5">
                        <Droplets className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Humidity
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.humidity?.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100">
                      <div className="p-1.5 rounded-lg bg-primary/5">
                        <Wind className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Rain
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {result.live_insights.precipitation?.toFixed(1)}mm
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Chart */}
              <TabsContent value="chart" className="pt-4 mt-0">
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <ForecastChart data={chartData} />
                </div>
              </TabsContent>

              {/* Map */}
              <TabsContent value="map" className="pt-4 mt-0">
                <ForecastMap region={result.region} hotspots={result.hotspots} />
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
            />
          ))}
          <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">Analyzing Regions</p>
          <p className="text-sm text-muted-foreground">
            Running forecasts and calculating risk scores…
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
  const riskiestItem = successful[successful.length - 1];
  const maxScore = Math.max(
    ...successful.map((r) => r.result.risk_fusion?.fused_risk_score ?? 0),
    0.01
  );

  return (
    <div className="space-y-5">
      {/* Top banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-primary/10 shadow-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {successful.length} regions compared
              </p>
              <p className="text-[11px] text-muted-foreground">
                {payload.horizon_weeks}-week horizon · ranked safest to riskiest
              </p>
            </div>
          </div>
          {safestItem && riskiestItem && safestItem !== riskiestItem && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
                <Crown className="h-3.5 w-3.5 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-800">
                  {safestItem.result.region}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">vs</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-primary/15">
                <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {riskiestItem.result.region}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview chart */}
      {successful.length > 0 && <ComparisonOverviewChart items={payload.ranked} />}

      {/* Section divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Regional Breakdown
          </span>
          <div className="w-1 h-1 rounded-full bg-primary" />
        </div>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Region cards */}
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
                maxScore={maxScore}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Failed */}
      {failed.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Unavailable
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-foreground text-sm">
                  {failed.length} region{failed.length > 1 ? "s" : ""} could not
                  be analyzed
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {failed.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <strong>{f.result.region}</strong>:{" "}
                      {f.errorMessage || "Unknown error"}
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
