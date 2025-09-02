import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/diagnosis/ImageUploader";
import { SymptomsForm } from "@/components/diagnosis/SymptomsForm";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { DEMO_MODE } from "@/lib/api";
import { DiagnosisResult } from "@/lib/types";
import { Upload, Stethoscope } from "lucide-react";

const Diagnosis = () => {
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (result: DiagnosisResult) => {
    setResults(result);
    setIsLoading(false);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setResults(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Malaria Diagnosis</h1>
            <p className="text-muted-foreground">
              AI-powered malaria detection using image analysis and symptom assessment
            </p>
          </div>
          
          {DEMO_MODE && (
            <Badge variant="outline" className="border-primary/30 text-primary">
              Demo Mode
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="data-card p-6">
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="image" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Blood Smear Image</span>
                </TabsTrigger>
                <TabsTrigger value="symptoms" className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>Symptoms Assessment</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Upload Blood Smear Image
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a high-quality microscopic image of a blood smear for AI analysis.
                      Supported formats: JPEG, PNG (max 10MB)
                    </p>
                  </div>
                  
                  <ImageUploader 
                    onResult={handleResult}
                    onLoadingChange={handleLoading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="symptoms" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Symptoms Assessment
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Provide patient information and symptoms for risk assessment.
                    </p>
                  </div>
                  
                  <SymptomsForm 
                    onResult={handleResult}
                    onLoadingChange={handleLoading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <DiagnosisResults 
            results={results}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="p-4 bg-warning/5 border-warning/20">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-warning/20">
              <div className="h-2 w-2 rounded-full bg-warning" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-warning mb-1">Medical Disclaimer</p>
              <p className="text-muted-foreground">
                This tool is designed for decision support only and is not a substitute for 
                professional medical diagnosis. Always consult with qualified healthcare providers 
                for medical decisions and treatment plans.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Diagnosis;