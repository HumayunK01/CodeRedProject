import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { ForecastResult } from "@/lib/types";
import { forecastSchema, ForecastFormData } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import { INDIA_REGIONS } from "@/lib/constants";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Loader2,
  Info
} from "lucide-react";

interface ForecastFormProps {
  onResult: (result: ForecastResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Regions are imported from shared constants

export const ForecastForm = ({ onResult, onLoadingChange }: ForecastFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForecastFormData>({
    resolver: zodResolver(forecastSchema),
    defaultValues: {
      region: "",
      horizon_weeks: 4,
    },
  });

  const watchedWeeks = form.watch("horizon_weeks");

  const onSubmit = async (data: ForecastFormData) => {
    console.log('Forecast form submitted with data:', data);
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      const result = await apiClient.forecastRegion(data);

      // Store result in localStorage
      const storedResult = {
        id: Date.now().toString(),
        type: 'forecast' as const,
        timestamp: new Date().toISOString(),
        input: data,
        result
      };

      StorageManager.saveResult(storedResult);

      onResult(result);

      toast({
        title: "Forecast Generated",
        description: `${data.horizon_weeks}-week prediction for ${data.region} completed`,
      });

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Main Configuration Card */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6 space-y-6">

          {/* Region Selection */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Target Region
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-11 bg-white/50 border-primary/10 hover:bg-white/70 hover:border-primary/30 focus:ring-0 focus:border-primary/30 rounded-xl transition-all">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-primary/10 bg-white/95 backdrop-blur-xl">
                    {INDIA_REGIONS.map((region) => (
                      <SelectItem key={region} value={region} className="focus:bg-primary/5 focus:text-primary cursor-pointer">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-foreground/50 font-medium ml-1">The forecast will be generated using historical data for this location.</p>
                <FormMessage />
              </FormItem>
            )}
          />

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
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-[16px] font-medium tracking-wide shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Risk...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                See Risk Projection
              </>
            )}
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/40 border border-white/60 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Accuracy</p>
            <p className="text-sm font-bold text-primary">87.3%</p>
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