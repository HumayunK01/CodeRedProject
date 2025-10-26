import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Info,
  Heart,
  Thermometer,
  Droplets,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Users,
  Syringe,
  Wind
} from "lucide-react";

interface SymptomsFormProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Regions are imported from shared constants

const symptoms = [
  {
    key: "fever",
    label: "Do you currently have a fever?",
    description: "Body temperature above 38°C (100.4°F)",
    icon: Thermometer
  },
  {
    key: "chills",
    label: "Do you experience chills or shivering?",
    description: "Feeling cold, shivering, followed by sweating",
    icon: Wind
  },
  {
    key: "headache",
    label: "Do you have headaches?",
    description: "Persistent or severe head pain",
    icon: Activity
  },
  {
    key: "fatigue",
    label: "Do you feel extremely tired or fatigued?",
    description: "Profound tiredness and lack of energy",
    icon: Clock
  },
  {
    key: "muscle_aches",
    label: "Do you have muscle or joint pain?",
    description: "Body aches, especially in muscles and joints",
    icon: Activity
  },
  {
    key: "nausea",
    label: "Do you feel nauseous or sick to your stomach?",
    description: "Feeling of queasiness or urge to vomit",
    icon: Droplets
  },
  {
    key: "diarrhea",
    label: "Do you have diarrhea?",
    description: "Loose, watery stools",
    icon: Droplets
  },
  {
    key: "abdominal_pain",
    label: "Do you have abdominal pain or cramping?",
    description: "Pain or discomfort in the stomach area",
    icon: Heart
  },
  {
    key: "cough",
    label: "Do you have a cough?",
    description: "Dry or productive cough",
    icon: Wind
  },
  {
    key: "skin_rash",
    label: "Do you have a skin rash or unusual spots?",
    description: "Red, itchy, or unusual skin markings",
    icon: Droplets
  }
] as const;

export const SymptomsForm = ({ onResult, onLoadingChange }: SymptomsFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SymptomsFormData>({
    resolver: zodResolver(symptomsSchema),
    defaultValues: {
      fever: false,
      chills: false,
      headache: false,
      fatigue: false,
      muscle_aches: false,
      nausea: false,
      diarrhea: false,
      abdominal_pain: false,
      cough: false,
      skin_rash: false,
      region: "Unknown"
      // Removed default age value - user must enter it
    },
  });

  const onSubmit = async (data: SymptomsFormData) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      const result = await apiClient.predictSymptoms(data);
      
      // Store result in localStorage with ID and timestamp
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: data,
        result
      };
      
      StorageManager.saveResult(storedResult);
      
      onResult(result);
      
      // Provide clearer messaging based on the result
      let message = `Risk Level: ${result.label}`;
      if (result.probability !== undefined) {
        const percentage = (result.probability * 100).toFixed(1);
        if (result.label.includes('Low')) {
          message = `Risk Level: ${result.label} (${percentage}% confidence this person has low malaria risk)`;
        } else if (result.label.includes('Medium')) {
          message = `Risk Level: ${result.label} (${percentage}% confidence this person has medium malaria risk)`;
        } else {
          message = `Risk Level: ${result.label} (${percentage}% confidence this person has high malaria risk)`;
        }
      }
      
      toast({
        title: "Assessment Complete",
        description: message,
      });
      
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to assess symptoms. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log('Form submit event triggered');
        form.handleSubmit(onSubmit)();
      }} className="space-y-6">
        {/* Patient Information */}
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Patient Information</h3>
                <p className="text-xs text-muted-foreground">Basic demographic details for accurate risk assessment</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Age (years)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="120"
                          placeholder="Enter patient age"
                          className="input-medical pl-3 py-5 text-sm rounded-lg"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
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
                  <FormItem>
                    <FormLabel className="text-sm flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Region/Location</span>
                    </FormLabel>
                    <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-medical pl-3 py-5 text-sm rounded-lg">
                            <SelectValue placeholder="Select patient region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDIA_REGIONS.map((region) => (
                            <SelectItem key={region} value={region} className="text-sm">
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Symptoms Assessment */}
        <Card className="p-5 bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/20 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-lg bg-accent/10">
                <Syringe className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Symptoms Assessment</h3>
                <p className="text-xs text-muted-foreground">Check all symptoms that apply to the patient</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {symptoms.map((symptom, index) => {
                const IconComponent = symptom.icon;

                return (
                <motion.div
                  key={symptom.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025, duration: 0.15 }}
                >
                  <FormField
                    control={form.control}
                    name={symptom.key}
                    render={({ field }) => (
                        <FormItem className="group">
                          <div className="space-y-3">
                            {/* Primary Question */}
                            <div className="flex items-start space-x-3 p-4 rounded-lg border border-muted bg-background hover:border-accent/50 transition-all duration-200">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5 h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accent rounded"
                          />
                        </FormControl>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1.5 mb-1">
                                  <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <FormLabel className="text-sm font-semibold cursor-pointer group-hover:text-accent transition-colors">
                            {symptom.label}
                          </FormLabel>
                                </div>
                                <p className="text-xs text-muted-foreground pl-5.5">
                            {symptom.description}
                          </p>
                              </div>
                            </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-medical py-5 text-base font-semibold rounded-lg"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="mr-1.5 h-4 w-4" />
                Assess Risk
              </>
            )}
          </Button>
        </motion.div>

        {/* Information */}
        <Card className="p-4 bg-primary/5 border-primary/20 rounded-lg">
          <div className="flex items-start space-x-2.5">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2.5 text-xs">
              <p className="font-semibold text-primary">Malaria Risk Assessment</p>
              <div className="text-muted-foreground space-y-1.5">
                <p className="flex items-start space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span><strong>Symptom-Based Analysis:</strong> This assessment evaluates your risk of malaria based on reported symptoms and demographic factors</span>
                </p>
                <p className="flex items-start space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span><strong>Early Detection:</strong> Identifying malaria early improves treatment outcomes significantly</span>
                </p>
                <p className="flex items-start space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                  <span><strong>Regional Considerations:</strong> Your location helps assess local malaria prevalence patterns</span>
                </p>
                <p className="flex items-start space-x-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />
                  <span><strong>Medical Advice:</strong> This tool provides risk assessment only and does not replace professional medical diagnosis</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
};