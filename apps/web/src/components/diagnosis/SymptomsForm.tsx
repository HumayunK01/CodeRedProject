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
import { 
  Stethoscope,
  User,
  MapPin,
  Loader2,
  Info
} from "lucide-react";

interface SymptomsFormProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

const commonRegions = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"
];

const symptoms = [
  { key: "fever", label: "Fever", description: "Body temperature above 38°C (100.4°F)" },
  { key: "chills", label: "Chills", description: "Shivering or feeling cold" },
  { key: "headache", label: "Headache", description: "Persistent head pain" },
  { key: "anemia", label: "Anemia", description: "Fatigue, weakness, pale skin" },
  { key: "nausea", label: "Nausea/Vomiting", description: "Feeling sick or vomiting" }
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
      anemia: false,
      nausea: false,
      age: 0,
      region: "",
    },
  });

  const onSubmit = async (data: SymptomsFormData) => {
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      const result = await apiClient.predictSymptoms(data);
      
      // Store result in localStorage
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: data,
        result
      };
      
      StorageManager.saveResult(storedResult);
      
      onResult(result);
      
      toast({
        title: "Assessment Complete",
        description: `Risk Level: ${result.label} (${(result.probability! * 100).toFixed(1)}%)`,
      });
      
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to assess symptoms",
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
        {/* Patient Information */}
        <Card className="p-4 bg-muted/30">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Patient Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        placeholder="Enter age"
                        className="input-medical"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                    <FormLabel className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Region/Location</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-medical">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonRegions.map((region) => (
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
            </div>
          </div>
        </Card>

        {/* Symptoms Assessment */}
        <Card className="p-4 bg-muted/30">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Symptoms Assessment</h3>
            </div>
            
            <div className="space-y-4">
              {symptoms.map((symptom, index) => (
                <motion.div
                  key={symptom.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name={symptom.key}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            {symptom.label}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {symptom.description}
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
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
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-4 w-4" />
                Assess Risk
              </>
            )}
          </Button>
        </motion.div>

        {/* Information */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-primary">Assessment Information</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• This tool uses machine learning to assess malaria risk based on symptoms</li>
                <li>• Results are for informational purposes and should not replace medical consultation</li>
                <li>• Geographic location helps calibrate risk based on regional patterns</li>
                <li>• Early symptoms may overlap with other illnesses</li>
              </ul>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
};