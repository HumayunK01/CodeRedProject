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
import { DiagnosisResult } from "@/lib/types";
import { symptomsSchema, SymptomsFormData } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import { INDIA_REGIONS } from "@/lib/constants";
import {
  Stethoscope,
  User,
  MapPin,
  Loader2,
  Thermometer,
  Droplets,
  Activity,
  Clock,
  Wind,
  Heart,
  ChevronRight,
  Info,
  ChevronDown,
  Check
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SymptomsFormProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

const symptoms = [
  { key: "fever", label: "Fever", description: "> 38°C / 100.4°F", icon: Thermometer },
  { key: "chills", label: "Chills/Shivering", description: "Cold sensations", icon: Wind },
  { key: "headache", label: "Severe Headache", description: "Persistent pain", icon: Activity },
  { key: "fatigue", label: "Extreme Fatigue", description: "Lethargy", icon: Clock },
  { key: "muscle_aches", label: "Muscle/Joint Pain", description: "Body aches", icon: Activity },
  { key: "nausea", label: "Nausea/Vomiting", description: "Stomach upset", icon: Droplets },
  { key: "diarrhea", label: "Diarrhea", description: "Loose stools", icon: Droplets },
  { key: "abdominal_pain", label: "Abdominal Pain", description: "Cramping", icon: Heart },
  { key: "cough", label: "Dry Cough", description: "Persistent", icon: Wind },
  { key: "skin_rash", label: "Skin Rash", description: "Unusual spots", icon: Droplets }
] as const;

export const SymptomsForm = ({ onResult, onLoadingChange }: SymptomsFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<SymptomsFormData>({
    resolver: zodResolver(symptomsSchema),
    defaultValues: {
      fever: false, chills: false, headache: false, fatigue: false, muscle_aches: false,
      nausea: false, diarrhea: false, abdominal_pain: false, cough: false, skin_rash: false,
      region: "Unknown"
    },
  });

  const onSubmit = async (data: SymptomsFormData) => {
    setIsSubmitting(true);
    onLoadingChange(true);
    try {
      const result = await apiClient.predictSymptoms(data);
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: data,
        result
      };
      StorageManager.saveResult(storedResult);
      onResult(result);
      toast({ title: "Assessment Complete", description: `Risk Level: ${result.label}` });
      form.reset();
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to assess symptoms.",
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
              <p className="text-xs text-foreground/50 font-medium">This information helps us tailor the assessment more accurately.</p>
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
              name="region"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-foreground/60 uppercase tracking-wider font-semibold mb-2">Region</FormLabel>
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
                    {/* 
                      Fixes:
                      1. onWheel/onTouchMove stopPropagation: Prevents 'scroll chaining' so the page doesn't scroll when scrolling the list.
                      2. z-[9999]: Ensures it is definitely on top.
                      3. Modal behavior: The scrolling issue is often due to the portal not locking body scroll, 
                         but manually stopping visual scroll events is a robust fix for the dropdown experience.
                    */}
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
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-primary uppercase tracking-wide">Clinical Symptoms</h4>
              <p className="text-xs text-foreground/50 font-medium mt-1">Select all symptoms the patient is currently experiencing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {symptoms.map((symptom) => {
              const Icon = symptom.icon;
              return (
                <FormField
                  key={symptom.key}
                  control={form.control}
                  name={symptom.key}
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
                            <span className="text-sm font-bold text-foreground/80 block group-hover:text-primary transition-colors">{symptom.label}</span>
                            <span className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">{symptom.description}</span>
                          </div>
                          <div className={`
                                     w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                     ${field.value ? 'bg-primary text-white' : 'bg-primary/5 text-primary/40 group-hover:text-primary'}
                                  `}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </div>

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