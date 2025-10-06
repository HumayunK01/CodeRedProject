import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymptomsForm } from "@/components/diagnosis/SymptomsForm";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { DEMO_MODE } from "@/lib/api";
import { DiagnosisResult } from "@/lib/types";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full px-4 py-8 lg:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mr-3">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Malaria Risk Assessment
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                AI-powered symptom-based malaria risk evaluation
              </p>
            </div>
          </div>

          {DEMO_MODE && (
            <Badge variant="outline" className="border-primary/30 text-primary mt-4">
              Demo Mode - AI Analysis Active
            </Badge>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Assessment Form - Takes up more space */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-8"
          >
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <div className="p-8 lg:p-10">
                {/* Form Header */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 mr-3">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">Patient Assessment</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Please provide accurate patient information and symptoms for the most reliable risk assessment.
                    Our AI system will analyze the data and provide a comprehensive risk evaluation.
                  </p>
                </div>

                {/* Symptoms Form */}
                <SymptomsForm
                  onResult={handleResult}
                  onLoadingChange={handleLoading}
                />
              </div>
            </Card>
          </motion.div>

          {/* Results Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-8 space-y-6">
              {/* Results Display */}
              <DiagnosisResults
                results={results}
                isLoading={isLoading}
              />

              {/* Information Cards */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary mb-2">How It Works</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>AI analyzes symptoms and patient data</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Evaluates risk based on clinical patterns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Provides confidence levels and explanations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Common Symptoms Guide */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-warning mb-2">Common Malaria Symptoms</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Thermometer className="h-4 w-4 text-destructive" />
                        <span>High fever (38°C+)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Droplets className="h-4 w-4 text-primary" />
                        <span>Chills and sweating</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Heart className="h-4 w-4 text-destructive" />
                        <span>Headache and fatigue</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Medical Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 w-full max-w-none"
        >
          <Card className="p-6 bg-warning/5 border-warning/20">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-warning/20 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-2">Important Medical Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This AI-powered assessment tool is designed for <strong>decision support only</strong> and should never replace
                  professional medical diagnosis, consultation, or treatment. Always consult with qualified healthcare providers
                  for medical decisions, laboratory testing, and treatment plans. If you suspect malaria or any serious illness,
                  seek immediate medical attention.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Diagnosis;