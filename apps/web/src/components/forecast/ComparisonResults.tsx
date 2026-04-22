import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ComparisonPayload, RankedForecastResult } from "@/lib/types";
import {
  TrendingUp,
  AlertCircle,
  Crown,
  Droplets,
  Wind,
  Newspaper,
  Activity,
  Loader2,
} from "lucide-react";

interface ComparisonResultsProps {
  payload: ComparisonPayload | null;
  isLoading: boolean;
}

const getRiskColor = (riskLevel?: string) => {
  switch (riskLevel?.toLowerCase()) {
    case "low":
      return { badge: "bg-emerald-100 text-emerald-800", circle: "bg-emerald-500" };
    case "medium":
      return { badge: "bg-amber-100 text-amber-800", circle: "bg-amber-500" };
    case "high":
      return { badge: "bg-orange-100 text-orange-800", circle: "bg-orange-500" };
    case "critical":
      return { badge: "bg-red-100 text-red-800", circle: "bg-red-500" };
    default:
      return { badge: "bg-gray-100 text-gray-800", circle: "bg-gray-500" };
  }
};

const RegionCard = ({
  item,
  isSafest,
}: {
  item: RankedForecastResult;
  isSafest: boolean;
}) => {
  const { result } = item;
  const riskLevel = result.risk_fusion?.risk_level || "Unknown";
  const score = result.risk_fusion?.fused_risk_score ?? 0;
  const colors = getRiskColor(riskLevel);

  if (item.failed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-red-200 bg-red-50/30 p-4 flex items-center gap-3"
      >
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-foreground">{result.region}</p>
          <p className="text-xs text-muted-foreground">
            {item.errorMessage || "Failed to fetch forecast"}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border transition-all ${
        isSafest
          ? `border-emerald-200 bg-emerald-50/50 border-l-4 border-l-emerald-500`
          : "border-gray-200 bg-white"
      } p-4`}
    >
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Rank circle */}
            <div
              className={`w-10 h-10 rounded-full ${colors.circle} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
              {isSafest ? <Crown className="h-5 w-5" /> : item.rank}
            </div>

            {/* Region name and risk badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base text-foreground">
                  {result.region}
                </h3>
                {isSafest && (
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                    Safest to Travel
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Risk level badge */}
          <Badge className={`${colors.badge} flex-shrink-0`}>
            {riskLevel}
          </Badge>
        </div>

        {/* Risk score */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Risk Score:</span>
          <div className="flex items-baseline gap-2 flex-1">
            <span className="text-xl font-bold text-foreground">
              {(score * 100).toFixed(0)}%
            </span>
            <Progress value={score * 100} className="h-2 flex-1" />
          </div>
        </div>

        {/* Component breakdown */}
        {result.risk_fusion && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {[
              {
                icon: TrendingUp,
                label: "Trend",
                value: result.risk_fusion.components.forecast_trend,
              },
              {
                icon: Wind,
                label: "Weather",
                value: result.risk_fusion.components.weather_suitability,
              },
              {
                icon: Newspaper,
                label: "Media",
                value: result.risk_fusion.components.news_pressure,
              },
              {
                icon: Activity,
                label: "Symptoms",
                value: result.risk_fusion.components.symptom_risk,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {label}
                  </div>
                  <Progress value={value * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Average cases */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-muted-foreground">Avg. Cases/Week:</span>
          <span className="font-medium text-foreground">
            {item.avgProjectedCases.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </motion.div>
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
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
              className="w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </div>
        <p className="text-muted-foreground">
          Comparing {payload?.ranked.length || 0} regions...
        </p>
      </motion.div>
    );
  }

  if (!payload || payload.ranked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
        <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-base font-medium text-foreground mb-2">
          No comparison data
        </p>
        <p className="text-sm text-muted-foreground">
          Select 2–5 regions and run a comparison.
        </p>
      </div>
    );
  }

  const safestItem = payload.ranked[0];
  const otherItems = payload.ranked.slice(1);
  const failedItems = payload.ranked.filter((item) => item.failed);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>
            <strong>{payload.ranked.length} regions</strong> compared • ranked
            safest → riskiest
          </span>
        </div>
      </div>

      {/* Safest region highlight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`safest-${safestItem.result.region}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0 }}
        >
          <RegionCard item={safestItem} isSafest={!safestItem.failed} />
        </motion.div>
      </AnimatePresence>

      {/* Other regions */}
      <AnimatePresence mode="wait">
        <div className="space-y-3">
          {otherItems.map((item, idx) => (
            <motion.div
              key={`region-${item.result.region}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + 1) * 0.07 }}
            >
              <RegionCard item={item} isSafest={false} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Failed regions notice */}
      {failedItems.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">
                {failedItems.length} region{failedItems.length > 1 ? "s" : ""}{" "}
                could not be compared
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your network connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
