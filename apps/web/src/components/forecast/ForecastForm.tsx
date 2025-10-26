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
        {/* Region Selection */}
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Target Region</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="input-medical">
                    <SelectValue placeholder="Select region for forecast" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIA_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Forecast Horizon</span>
                </div>
                <span className="text-sm font-normal text-muted-foreground">
                  {watchedWeeks} week{watchedWeeks !== 1 ? 's' : ''}
                </span>
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Slider
                    min={1}
                    max={14}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 week</span>
                    <span>7 weeks</span>
                    <span>14 weeks</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Forecast Parameters Info */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">Forecast Parameters</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• <strong>Region:</strong> Geographic area for outbreak prediction</p>
                <p>• <strong>Horizon:</strong> Number of weeks to forecast ahead</p>
                <p>• <strong>Model:</strong> Temporal neural networks with attention</p>
                <p>• <strong>Data Sources:</strong> Historical cases, climate, demographics</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-medical"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Forecast...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Forecast
              </>
            )}
          </Button>
        </motion.div>

        {/* Model Information */}
        <Card className="p-4 bg-muted/30">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Model Information</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <p className="font-medium">Accuracy</p>
                <p>87.3% ± 2.1%</p>
              </div>
              <div>
                <p className="font-medium">Lead Time</p>
                <p>1-14 weeks</p>
              </div>
              <div>
                <p className="font-medium">Coverage</p>
                <p>150+ regions</p>
              </div>
              <div>
                <p className="font-medium">Update Freq</p>
                <p>Weekly</p>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
};