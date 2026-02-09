import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { symptomsSchema, SymptomsFormData } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import { DiagnosisService } from "@/lib/db";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { INDIA_REGIONS } from "@/lib/constants";
import {
  Stethoscope,
  User,
  MapPin,
  Loader2,
  Thermometer,
  Activity,
  ChevronRight,
  Info,
  ChevronDown,
  Check,
  Database,
  Shield
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SymptomsFormProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

/**
 * Stage 1: Epidemiological Risk Screening Form
 * Collects DHS-aligned indicators (Fever, Region, etc.) for ML risk stratification.
 * This is NOT a diagnostic tool.
 */
export const SymptomsForm = ({ onResult, onLoadingChange }: SymptomsFormProps) => {
  const { toast } = useToast();
  const { clerkId, isSignedIn } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<SymptomsFormData>({
    resolver: zodResolver(symptomsSchema),
    defaultValues: {
      fever: false,
      sex: "Male",
      region: "Unknown",
      residence_type: "Rural",
      slept_under_net: false,
      age: 0
    },
  });

  const onSubmit = async (data: SymptomsFormData) => {
    setIsSubmitting(true);
    onLoadingChange(true);
    try {
      // Transform to Backend Contract
      const apiPayload: SymptomsInput = {
        ...data,
        fever: data.fever ? 1 : 0,
        age_months: Math.max(1, Math.round(data.age * 12)), // Ensure at least 1 month if age 0? Or just *12
        state: data.region,
        residence_type: data.residence_type,
        slept_under_net: data.slept_under_net ? 1 : 0,
        anemia_level: null, // Not collected in form, send null
        interview_month: new Date().getMonth() + 1
      };

      const result = await apiClient.predictSymptoms(apiPayload);

      // Store result in localStorage (for backward compatibility)
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: apiPayload,
        result
      };
      StorageManager.saveResult(storedResult);

      // Save to database if user is signed in
      if (isSignedIn && clerkId) {
        try {
          // Convert symptoms to the format expected by DiagnosisService
          const symptomsMap: Record<string, boolean> = {
            fever: data.fever,
            slept_under_net: data.slept_under_net,
          };

          await DiagnosisService.createFromMLResult(
            clerkId,
            "", // No image for symptom-based diagnosis
            {
              label: result.label,
              confidence: result.confidence || 0, // Fallback if null
            },
            {
              patientAge: data.age,
              location: data.region,
              symptoms: symptomsMap,
              model_version: result.model_version
            }
          );

          toast({
            title: "Assessment Complete",
            description: (
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                <span>Result: {result.label} - Saved</span>
              </div>
            ),
          });
        } catch (dbError) {
          console.error("Failed to save diagnosis to database:", dbError);
          toast({
            title: "Assessment Complete",
            description: `Result: ${result.label}. Note: Failed to sync with cloud.`,
          });
        }
      } else {
        toast({ title: "Risk Assessment Complete", description: `Result: ${result.label}` });
      }

      onResult(result);
      form.reset();
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to generate risk assessment.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Patient Info Section */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-primary uppercase tracking-wide">Patient Demographics</h4>
              <p className="text-xs text-foreground/50 font-medium">This information is critical for the ML risk model.</p>
            </div>
          </div>


          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Age</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Years"
                        min="0"
                        max="120"
                        className="pl-4 h-11 bg-white/50 border-primary/10 focus:border-primary/30 rounded-xl"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Sex</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white/50 border-primary/10 focus:border-primary/30 rounded-xl">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-2">Region/State</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full h-11 justify-between bg-white/50 border-primary/10 hover:bg-white/70 hover:border-primary/30 text-left font-normal rounded-xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && field.value !== "Unknown" ? (
                            <span className="truncate">{field.value}</span>
                          ) : (
                            <span className="text-muted-foreground">Select Region</span>
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] p-0 rounded-xl bg-white/95 backdrop-blur-xl border-primary/10 shadow-2xl z-40"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      <Command className="w-full h-auto overflow-hidden">
                        <CommandInput
                          placeholder="Search region..."
                          className="h-11 border-none bg-transparent focus:ring-0 outline-none text-base"
                        />
                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No region found.</CommandEmpty>
                          <CommandGroup className="p-1.5">
                            {INDIA_REGIONS.map((region) => (
                              <CommandItem
                                value={region}
                                key={region}
                                onSelect={() => {
                                  form.setValue("region", region);
                                  setOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-primary/5 aria-selected:text-primary transition-colors"
                              >
                                {region}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4 text-primary",
                                    region === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="residence_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Residence Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-white/50 border-primary/10 focus:border-primary/30 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Rural">Rural</SelectItem>
                      <SelectItem value="Urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Risk Factors */}
          <div className="pt-2 border-t border-dashed border-primary/10">
            <FormField
              control={form.control}
              name="slept_under_net"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <label className={`
                         flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 group mt-2
                         ${field.value ? 'bg-primary/5 border-primary/30' : 'bg-white/30 border-transparent hover:bg-white/50 hover:border-primary/10'}
                       `}>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/20"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground/80 block group-hover:text-primary transition-colors">Slept under Mosquito Net?</span>
                        <span className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Important prevention factor</span>
                      </div>
                      <div className={`
                             w-8 h-8 rounded-full flex items-center justify-center transition-colors
                             ${field.value ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40 group-hover:text-primary'}
                           `}>
                        <Shield className="h-4 w-4" />
                      </div>
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Malaria Risk Indicators Section */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-primary uppercase tracking-wide">Malaria Risk Indicators (DHS-Based)</h4>
              <p className="text-xs text-foreground/50 font-medium mt-1">This assessment uses nationally validated risk indicators rather than self-reported symptoms.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name="fever"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <label className={`
                                flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 group
                                ${field.value ? 'bg-primary/5 border-primary/30' : 'bg-white/30 border-transparent hover:bg-white/50 hover:border-primary/10'}
                             `}>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/20"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground/80 block group-hover:text-primary transition-colors">Fever (Last 2 Weeks)</span>
                        <span className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Primary DHS Indicator</span>
                      </div>
                      <div className={`
                                   w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                   ${field.value ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40 group-hover:text-primary'}
                                `}>
                        <Thermometer className="h-4 w-4" />
                      </div>
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />
            <p className="text-[11px] text-foreground/50 italic mt-2 px-1">
              * Fever is the primary clinical indicator used in population-level malaria risk models.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-primary/10">
            <p className="text-[11px] text-center text-foreground/40 font-medium">
              This tool estimates malaria risk based on epidemiological patterns, not a full clinical diagnosis.
            </p>
          </div>
        </div>

        {/* Signed in indicator */}
        {isSignedIn && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Results will be saved to your account</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-[16px] font-medium tracking-wide shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Analysis...</>
          ) : (
            <><Stethoscope className="mr-2 h-4 w-4" /> Get Assessment Results</>
          )}
        </Button>
      </form>
    </Form>
  );
};