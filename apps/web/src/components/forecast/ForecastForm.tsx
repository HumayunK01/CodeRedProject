import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { ForecastInput, ForecastResult, ForecastPrediction, ComparisonPayload } from "@/lib/types";
import { forecastSchema, ForecastFormData, comparisonForecastSchema, ComparisonForecastFormData } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import { ForecastService } from "@/lib/db";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { RegionMultiSelect } from "@/components/forecast/RegionMultiSelect";
import { RegionSingleSelect } from "@/components/forecast/RegionSingleSelect";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Loader2,
  Info,
  Database,
  FlaskConical,
} from "lucide-react";

interface ForecastFormProps {
  onResult: (result: ForecastResult) => void;
  onLoadingChange: (loading: boolean) => void;
  onComparisonResult?: (payload: ComparisonPayload) => void;
  onModeChange?: (mode: 'single' | 'comparison') => void;
}

export const ForecastForm = ({ onResult, onLoadingChange, onComparisonResult, onModeChange }: ForecastFormProps) => {
  const { toast } = useToast();
  const { clerkId, isSignedIn } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regions, setRegions] = useState<string[]>([
    "Assam", "Bihar", "Delhi", "Gujarat", "Haryana",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
    "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal",
  ]);
  const [scenarioEnabled, setScenarioEnabled] = useState(false);
  const [vectorControl, setVectorControl] = useState(0);
  const [netCoverage, setNetCoverage] = useState(0);
  const [reportingDelay, setReportingDelay] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const fetchedRegions = await apiClient.getForecastRegions();
        if (fetchedRegions && fetchedRegions.length > 0) {
          setRegions(fetchedRegions);
        }
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    };
    fetchRegions();
  }, []);

  const form = useForm<ForecastFormData>({
    resolver: zodResolver(forecastSchema),
    defaultValues: {
      region: "Maharashtra",
      horizon_weeks: 4,
    },
  });

  const watchedWeeks = form.watch("horizon_weeks");

  const computeAvgCases = (predictions: ForecastPrediction[]) => {
    if (!predictions || predictions.length === 0) return 0;
    const sum = predictions.reduce((acc, p) => acc + (p.point ?? p.cases ?? 0), 0);
    return sum / predictions.length;
  };

  const handleSingleSubmit = async (data: ForecastFormData) => {
    console.log('Forecast form submitted with data:', data);
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      const payload: ForecastInput = {
        region: data.region,
        horizon_weeks: data.horizon_weeks,
      };
      if (scenarioEnabled && (vectorControl !== 0 || netCoverage !== 0 || reportingDelay !== 0)) {
        payload.scenario = {
          vector_control_delta: vectorControl,
          net_coverage_delta: netCoverage,
          reporting_delay_delta: reportingDelay,
        };
      }
      const result = await apiClient.forecastRegion(payload);

      // Store result in localStorage (for backward compatibility)
      const storedResult = {
        id: Date.now().toString(),
        type: 'forecast' as const,
        timestamp: new Date().toISOString(),
        input: data,
        result
      };

      StorageManager.saveResult(storedResult);

      // Save to database if user is signed in
      if (isSignedIn && clerkId) {
        try {
          // Determine risk level from hotspot score
          let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
          if (result.hotspot_score) {
            if (result.hotspot_score >= 0.75) riskLevel = 'Critical';
            else if (result.hotspot_score >= 0.5) riskLevel = 'High';
            else if (result.hotspot_score >= 0.25) riskLevel = 'Medium';
          }

          await ForecastService.createFromMLResult(
            clerkId,
            data.region,
            data.horizon_weeks,
            {
              predictions: result.predictions,
              hotspot_score: result.hotspot_score,
              riskLevel,
              risk_fusion: result.risk_fusion,
              drift_status: result.drift_status,
              explanation: result.explanation,
              model_version: result.model_version,
              confidence: result.confidence,
              confidence_level: result.explanation?.confidence_level,
              live_insights: result.live_insights
            }
          );

          toast({
            title: "Forecast Generated",
            description: (
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                <span>{data.horizon_weeks}-week prediction for {data.region} saved</span>
              </div>
            ),
          });
        } catch (dbError) {
          console.error("Failed to save forecast to database:", dbError);
          toast({
            title: "Forecast Generated",
            description: `${data.horizon_weeks}-week prediction for ${data.region} completed. Note: Failed to sync with cloud.`,
          });
        }
      } else {
        toast({
          title: "Forecast Generated",
          description: `${data.horizon_weeks}-week prediction for ${data.region} completed`,
        });
      }

      onResult(result);

    } catch (error) {
      console.error('Forecast submission error:', error);
      toast({
        title: "Forecast Failed",
        description: error instanceof Error ? error.message : "Failed to generate forecast. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  const handleComparisonSubmit = async (data: ComparisonForecastFormData) => {
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      // Fire all region forecasts in parallel
      const settlements = await Promise.allSettled(
        data.regions.map((region) =>
          apiClient.forecastRegion({
            region,
            horizon_weeks: data.horizon_weeks,
          })
        )
      );

      // Build ranked results
      const rankedResults = settlements
        .map((settlement, idx) => {
          const region = data.regions[idx];
          if (settlement.status === 'fulfilled') {
            const result = settlement.value;
            const avgProjectedCases = computeAvgCases(result.predictions);
            return {
              rank: 0,
              result,
              avgProjectedCases,
              failed: false,
            };
          } else {
            return {
              rank: 0,
              result: { region, predictions: [] } as ForecastResult,
              avgProjectedCases: 0,
              failed: true,
              errorMessage:
                settlement.reason instanceof Error
                  ? settlement.reason.message
                  : 'Unknown error',
            };
          }
        })
        .sort((a, b) => {
          // Failed entries go last
          if (a.failed && !b.failed) return 1;
          if (!a.failed && b.failed) return -1;
          if (a.failed && b.failed) return 0;

          // Sort by fused risk score (ascending = safest first)
          const scoreA = a.result.risk_fusion?.fused_risk_score ?? a.avgProjectedCases / 10000;
          const scoreB = b.result.risk_fusion?.fused_risk_score ?? b.avgProjectedCases / 10000;
          return scoreA - scoreB;
        })
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      // Save each successful result to database
      if (isSignedIn && clerkId) {
        try {
          for (const item of rankedResults) {
            if (!item.failed) {
              const result = item.result;
              let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
              if (result.risk_fusion) {
                const score = result.risk_fusion.fused_risk_score;
                if (score >= 0.7) riskLevel = 'Critical';
                else if (score >= 0.5) riskLevel = 'High';
                else if (score >= 0.3) riskLevel = 'Medium';
              }

              await ForecastService.createFromMLResult(
                clerkId,
                result.region,
                data.horizon_weeks,
                {
                  predictions: result.predictions,
                  hotspot_score: result.hotspot_score,
                  riskLevel,
                  risk_fusion: result.risk_fusion,
                  drift_status: result.drift_status,
                  explanation: result.explanation,
                  model_version: result.model_version,
                  confidence_level: result.explanation?.confidence_level,
                  live_insights: result.live_insights,
                }
              );
            }
          }

          const successCount = rankedResults.filter((r) => !r.failed).length;
          toast({
            title: "Comparison Complete",
            description: `${successCount} of ${rankedResults.length} regions analyzed and saved`,
          });
        } catch (dbError) {
          console.error("Failed to save forecasts to database:", dbError);
          toast({
            title: "Comparison Complete",
            description: "Analysis completed. Note: Some results failed to sync with cloud.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Comparison Complete",
          description: `${rankedResults.filter((r) => !r.failed).length} regions analyzed`,
        });
      }

      onComparisonResult?.({
        horizon_weeks: data.horizon_weeks,
        ranked: rankedResults,
      });
    } catch (error) {
      console.error('Comparison submission error:', error);
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "Failed to compare regions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  const onSubmit = async (data: ForecastFormData) => {
    if (comparisonMode) {
      const parsed = comparisonForecastSchema.safeParse({
        regions: selectedRegions,
        horizon_weeks: data.horizon_weeks,
      });
      if (!parsed.success) {
        toast({
          title: "Validation Error",
          description: parsed.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      await handleComparisonSubmit(parsed.data);
    } else {
      await handleSingleSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Main Configuration Card */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6 space-y-6">

          {/* Comparison Mode Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-white/40">
            <div className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold">
              <MapPin className="h-3.5 w-3.5" />
              Region Selection
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/60 font-medium">
                {comparisonMode ? "Compare Regions" : "Single Region"}
              </span>
              <Switch
                checked={comparisonMode}
                onCheckedChange={(checked) => {
                  setComparisonMode(checked);
                  onModeChange?.(checked ? 'comparison' : 'single');
                  if (checked) {
                    setScenarioEnabled(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Region Selection */}
          {comparisonMode ? (
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-2">
                <MapPin className="h-3.5 w-3.5" />
                Regions to Compare (2–5)
              </FormLabel>
              <RegionMultiSelect
                regions={regions}
                selected={selectedRegions}
                onChange={setSelectedRegions}
                maxSelections={5}
              />
              <p className="text-[10px] text-foreground/50 font-medium ml-1">Select 2–5 regions to compare their risk profiles side-by-side.</p>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Target Region
                  </FormLabel>
                  <FormControl>
                    <RegionSingleSelect
                      regions={regions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a region…"
                    />
                  </FormControl>
                  <p className="text-[10px] text-foreground/50 font-medium ml-1">The forecast will be generated using historical data for this location.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Time Horizon */}
          <FormField
            control={form.control}
            name="horizon_weeks"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-4">
                  <FormLabel className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    Forecast Horizon
                  </FormLabel>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {watchedWeeks} week{watchedWeeks !== 1 ? 's' : ''}
                  </span>
                </div>
                <FormControl>
                  <div className="space-y-4 px-1">
                    <Slider
                      min={1}
                      max={14}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full py-4"
                    />
                    <div className="flex justify-between text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
                      <span>Short-term (1–2 whs)</span>
                      <span>Mid-term (3–7 weeks)</span>
                      <span>Long-term (8–14 weeks)</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Intervention Scenario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold">
              <FlaskConical className="h-3.5 w-3.5" />
              What-If Scenario
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={scenarioEnabled}
                onCheckedChange={setScenarioEnabled}
                disabled={comparisonMode}
              />
              {comparisonMode && (
                <span className="text-[10px] text-muted-foreground">
                  Unavailable in comparison mode
                </span>
              )}
            </div>
          </div>

          {scenarioEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 bg-white/30 border border-white/60 rounded-xl p-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60 font-medium">Vector Control</span>
                  <span className="text-xs font-bold text-primary">{vectorControl > 0 ? '+' : ''}{(vectorControl * 100).toFixed(0)}%</span>
                </div>
                <Slider min={-50} max={50} step={5} value={[vectorControl * 100]} onValueChange={v => setVectorControl(v[0] / 100)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60 font-medium">Net Coverage</span>
                  <span className="text-xs font-bold text-primary">{netCoverage > 0 ? '+' : ''}{(netCoverage * 100).toFixed(0)}%</span>
                </div>
                <Slider min={-50} max={50} step={5} value={[netCoverage * 100]} onValueChange={v => setNetCoverage(v[0] / 100)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/60 font-medium">Reporting Delay</span>
                  <span className="text-xs font-bold text-primary">{reportingDelay > 0 ? '+' : ''}{(reportingDelay * 100).toFixed(0)}%</span>
                </div>
                <Slider min={-50} max={50} step={5} value={[reportingDelay * 100]} onValueChange={v => setReportingDelay(v[0] / 100)} />
              </div>
              <p className="text-[10px] text-foreground/40">Negative = increased intervention, Positive = reduced intervention</p>
            </motion.div>
          )}
        </div>

        {/* Signed in indicator */}
        {isSignedIn && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Forecasts will be saved to your account</span>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/10 rounded-[20px] p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/50 rounded-lg shadow-sm">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-primary">Analysis Basis</h4>
              <p className="text-xs text-foreground/60 leading-relaxed">
                This forecast is based on historical cases, climate patterns, and population data.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting || (comparisonMode && selectedRegions.length < 2)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-[16px] font-medium tracking-wide shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {comparisonMode ? "Comparing Regions..." : "Calculating Risk..."}
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                {comparisonMode ? "Compare Regions" : "See Risk Projection"}
              </>
            )}
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 border border-white/60 p-3 rounded-xl text-center relative group">
            <p className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Model</p>
            <p className="text-sm font-bold text-primary">v2 Ensemble</p>
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] rounded p-2 bottom-full mb-2 w-full left-0 pointer-events-none">
              5-model adaptive ensemble with 31% improved MAE over v1. Includes uncertainty quantification.
            </div>
          </div>
          <div className="bg-white/40 border border-white/60 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Update</p>
            <p className="text-sm font-bold text-primary">Weekly</p>
          </div>
        </div>
      </form>
    </Form>
  );
};