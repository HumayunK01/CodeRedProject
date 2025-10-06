import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { DiagnosisResult } from "@/lib/types";
import { symptomsSchema, SymptomsFormData } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import { LocationDetector } from "@/components/ui/location-detector";
import { LocationData } from "@/lib/location";
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
  AlertCircle
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
  {
    key: "fever",
    label: "Do you currently have a fever?",
    description: "Body temperature above 38°C (100.4°F)",
    detailedInfo: "Malaria often causes recurring high fever. If yes, we'll ask about pattern and severity.",
    icon: Thermometer,
    followUp: {
      hasFever: {
        label: "How would you describe your fever pattern?",
        type: "select",
        options: [
          { value: "constant", label: "Constant high fever" },
          { value: "intermittent", label: "Comes and goes (classic malaria pattern)" },
          { value: "low-grade", label: "Mild fever only" }
        ]
      },
      severity: {
        label: "How severe is your fever?",
        type: "scale",
        options: [
          { value: "mild", label: "Mild (38-38.5°C)" },
          { value: "moderate", label: "Moderate (38.5-39.5°C)" },
          { value: "severe", label: "Severe (39.5°C+)" }
        ]
      },
      duration: {
        label: "How long have you had this fever?",
        type: "select",
        options: [
          { value: "hours", label: "Less than 24 hours" },
          { value: "1-3days", label: "1-3 days" },
          { value: "4-7days", label: "4-7 days" },
          { value: "week-plus", label: "More than a week" }
        ]
      }
    }
  },
  {
    key: "chills",
    label: "Do you experience chills or shivering?",
    description: "Feeling cold, shivering, followed by sweating",
    detailedInfo: "Alternating chills and sweating are characteristic of malaria. If yes, we'll ask about the pattern.",
    icon: Droplets,
    followUp: {
      hasChills: {
        label: "How would you describe your chills?",
        type: "select",
        options: [
          { value: "mild", label: "Mild shivering" },
          { value: "severe", label: "Intense shaking/chills" },
          { value: "cyclic", label: "Comes and goes with fever" }
        ]
      },
      pattern: {
        label: "When do your chills typically occur?",
        type: "select",
        options: [
          { value: "before-fever", label: "Before fever spikes" },
          { value: "with-fever", label: "During fever" },
          { value: "after-fever", label: "After fever breaks" },
          { value: "random", label: "At random times" }
        ]
      }
    }
  },
  {
    key: "headache",
    label: "Do you have headaches?",
    description: "Persistent or severe head pain",
    detailedInfo: "Malaria headaches are often severe and may include neck stiffness. If yes, we'll ask about intensity.",
    icon: Heart,
    followUp: {
      severity: {
        label: "How severe are your headaches?",
        type: "scale",
        options: [
          { value: "mild", label: "Mild discomfort" },
          { value: "moderate", label: "Moderate pain" },
          { value: "severe", label: "Severe, debilitating pain" }
        ]
      },
      location: {
        label: "Where is your headache located?",
        type: "select",
        options: [
          { value: "forehead", label: "Front of head/forehead" },
          { value: "temples", label: "Sides/temples" },
          { value: "back", label: "Back of head" },
          { value: "all-over", label: "All over" }
        ]
      }
    }
  },
  {
    key: "fatigue",
    label: "Do you feel extremely tired or fatigued?",
    description: "Profound tiredness and lack of energy",
    detailedInfo: "Malaria causes significant fatigue due to anemia. If yes, we'll ask about the severity and onset.",
    icon: Activity,
    followUp: {
      severity: {
        label: "How severe is your fatigue?",
        type: "scale",
        options: [
          { value: "mild", label: "Somewhat tired" },
          { value: "moderate", label: "Need frequent rests" },
          { value: "severe", label: "Can barely function" }
        ]
      },
      onset: {
        label: "When did this fatigue start?",
        type: "select",
        options: [
          { value: "sudden", label: "Suddenly, recently" },
          { value: "gradual", label: "Gradually over time" },
          { value: "with-other-symptoms", label: "Along with other symptoms" }
        ]
      }
    }
  },
  {
    key: "muscle_aches",
    label: "Do you have muscle or joint pain?",
    description: "Body aches, especially in muscles and joints",
    detailedInfo: "Malaria often causes deep muscle pain and joint stiffness. If yes, we'll ask about location and severity.",
    icon: Activity,
    followUp: {
      severity: {
        label: "How severe is your muscle/joint pain?",
        type: "scale",
        options: [
          { value: "mild", label: "Minor discomfort" },
          { value: "moderate", label: "Noticeable pain" },
          { value: "severe", label: "Severe, limiting movement" }
        ]
      },
      location: {
        label: "Which areas are most affected?",
        type: "select",
        options: [
          { value: "legs", label: "Legs and thighs" },
          { value: "back", label: "Back and shoulders" },
          { value: "arms", label: "Arms and hands" },
          { value: "joints", label: "Joints (knees, elbows)" },
          { value: "all-over", label: "All over body" }
        ]
      }
    }
  }
] as const;

export const SymptomsForm = ({ onResult, onLoadingChange }: SymptomsFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState<Record<string, boolean>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, any>>({});
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);

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
      age: 25,
      region: "Unknown",
      followUpAnswers: {},
    },
  });

  const handlePrimaryAnswer = (symptomKey: string, value: boolean) => {
    if (value) {
      setShowFollowUp(prev => ({ ...prev, [symptomKey]: true }));
    } else {
      setShowFollowUp(prev => ({ ...prev, [symptomKey]: false }));
      // Clear follow-up answers when unchecking primary symptom
      const followUpKeys = Object.keys(symptoms.find(s => s.key === symptomKey)?.followUp || {});
      const newAnswers = { ...followUpAnswers };
      followUpKeys.forEach(key => {
        delete newAnswers[`${symptomKey}_${key}`];
      });
      setFollowUpAnswers(newAnswers);
    }
  };

  const handleFollowUpAnswer = (symptomKey: string, followUpKey: string, value: string) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [`${symptomKey}_${followUpKey}`]: value
    }));
  };

  // Debug function to check form data
  const debugFormData = () => {
    console.log('Current form values:', form.getValues());
    console.log('Current followUpAnswers:', followUpAnswers);
  };

  // Handle location detection
  const handleLocationDetected = (location: LocationData) => {
    setDetectedLocation(location);

    // Auto-fill region if location has region data
    if (location.region) {
      form.setValue('region', location.region);
      toast({
        title: "Location Detected",
        description: `Region set to: ${location.region}`,
      });
    } else if (location.city) {
      // If no region but city is available, suggest it
      toast({
        title: "Location Detected",
        description: `Detected: ${location.city}${location.country ? `, ${location.country}` : ''}`,
      });
    }
  };

  const onSubmit = async (data: SymptomsFormData) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      // Combine basic form data with follow-up answers
      const enhancedData = {
        ...data,
        followUpAnswers
      };

      console.log('Enhanced data being sent:', enhancedData);

      const result = await apiClient.predictSymptoms(enhancedData);
      
      // Store result in localStorage
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: enhancedData,
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
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log('Form submit event triggered');
        form.handleSubmit(onSubmit)();
      }} className="space-y-6">
        {/* Location Detection */}
        <LocationDetector
          onLocationSelect={handleLocationDetected}
          selectedLocation={detectedLocation}
          className="mb-6"
        />

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
                      {detectedLocation && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Auto-detected
                        </Badge>
                      )}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    {detectedLocation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected: {detectedLocation.formatted}
                      </p>
                    )}
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
            
            <div className="space-y-6">
              {symptoms.map((symptom, index) => {
                const IconComponent = symptom.icon;
                const symptomFollowUp = symptom.followUp;
                const isVisible = showFollowUp[symptom.key];

                return (
                <motion.div
                  key={symptom.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name={symptom.key}
                    render={({ field }) => (
                        <FormItem className="group">
                          <div className="space-y-4">
                            {/* Primary Question */}
                            <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/20 transition-all duration-200 hover:shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handlePrimaryAnswer(symptom.key, checked || false);
                                  }}
                                  className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <FormLabel className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors">
                            {symptom.label}
                          </FormLabel>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                            {symptom.description}
                          </p>
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-primary/70 hover:text-primary font-medium">
                                    Why this matters for diagnosis
                                  </summary>
                                  <p className="mt-2 text-muted-foreground leading-relaxed">
                                    {symptom.detailedInfo}
                                  </p>
                                </details>
                              </div>
                            </div>

                            {/* Follow-up Questions */}
                            {isVisible && symptomFollowUp && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="ml-6 space-y-3"
                              >
                                {Object.entries(symptomFollowUp).map(([followUpKey, followUpConfig]) => (
                                  <div key={followUpKey} className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/30">
                                    <label className="text-sm font-medium mb-2 block">
                                      {followUpConfig.label}
                                    </label>
                                    {followUpConfig.type === "select" ? (
                                      <Select
                                        value={followUpAnswers[`${symptom.key}_${followUpKey}`] || ""}
                                        onValueChange={(value) => handleFollowUpAnswer(symptom.key, followUpKey, value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {followUpConfig.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : followUpConfig.type === "scale" ? (
                                      <div className="space-y-2">
                                        {followUpConfig.options.map((option) => (
                                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`${symptom.key}_${followUpKey}`}
                                              value={option.value}
                                              checked={followUpAnswers[`${symptom.key}_${followUpKey}`] === option.value}
                                              onChange={(e) => handleFollowUpAnswer(symptom.key, followUpKey, e.target.value)}
                                              className="text-primary"
                                            />
                                            <span className="text-sm">{option.label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </motion.div>
                            )}
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

        {/* Debug Button (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            type="button"
            variant="outline"
            onClick={debugFormData}
            className="w-full mb-4"
          >
            Debug Form Data
          </Button>
        )}

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
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">Interactive Assessment Information</p>
              <div className="text-muted-foreground space-y-2">
                <p>• <strong>Conversational Flow:</strong> Answer primary questions first, then provide detailed follow-up information for more accurate assessment</p>
                <p>• <strong>Smart Questioning:</strong> The system adapts based on your responses, asking relevant follow-up questions only when needed</p>
                <p>• <strong>Severity Scales:</strong> Rate symptom intensity to help differentiate between mild conditions and serious infections</p>
                <p>• <strong>Pattern Recognition:</strong> Questions about timing, duration, and patterns help identify malaria's characteristic cyclic nature</p>
                <p>• <strong>Clinical Intelligence:</strong> This tool simulates a healthcare provider's systematic approach to symptom evaluation</p>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
};