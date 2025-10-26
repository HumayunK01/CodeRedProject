import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { DualModeDiagnosis } from "@/components/diagnosis/DualModeDiagnosis";
import { DiagnosisResults } from "@/components/diagnosis/DiagnosisResults";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import { StorageManager } from "@/lib/storage";
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Shield,
  Microscope,
  TestTube
} from "lucide-react";

const Diagnosis = () => {
  const [results, setResults] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storedPatientData, setStoredPatientData] = useState<SymptomsInput & { id?: string; timestamp?: string } | null>(null);
  const [storedImageData, setStoredImageData] = useState<{ image: string; id?: string; timestamp?: string } | null>(null);

  // Load the most recent patient data from storage
  useEffect(() => {
    const loadRecentPatientData = () => {
      try {
        const allResults = StorageManager.getAllResults();
        const diagnosisResults = allResults.filter(r => r.type === 'diagnosis');
        if (diagnosisResults.length > 0) {
          const mostRecent = diagnosisResults[0];
          
          // Check if this is symptom data or image data
          if ('image' in mostRecent.input) {
            // Image data
            setStoredImageData({
              image: (mostRecent.input as { image: string }).image,
              id: mostRecent.id,
              timestamp: mostRecent.timestamp
            });
            setStoredPatientData(null);
          } else {
            // Symptom data
            setStoredPatientData({
              ...(mostRecent.input as SymptomsInput),
              id: mostRecent.id,
              timestamp: mostRecent.timestamp
            });
            setStoredImageData(null);
          }
        }
      } catch (error) {
        console.warn('Failed to load patient data:', error);
      }
    };

    loadRecentPatientData();
  }, []);

  const handleResult = (result: DiagnosisResult) => {
    setResults(result);
    setIsLoading(false);
    
    // Load the patient data again after a new result is generated
    setTimeout(() => {
      const allResults = StorageManager.getAllResults();
      const diagnosisResults = allResults.filter(r => r.type === 'diagnosis');
      if (diagnosisResults.length > 0) {
        const mostRecent = diagnosisResults[0];
        
        // Check if this is symptom data or image data
        if ('image' in mostRecent.input) {
          // Image data
          setStoredImageData({
            image: (mostRecent.input as { image: string }).image,
            id: mostRecent.id,
            timestamp: mostRecent.timestamp
          });
          setStoredPatientData(null);
        } else {
          // Symptom data
          setStoredPatientData({
            ...(mostRecent.input as SymptomsInput),
            id: mostRecent.id,
            timestamp: mostRecent.timestamp
          });
          setStoredImageData(null);
        }
      }
    }, 500);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setResults(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      {/* Medical Disclaimer Marquee */}
      <div className="bg-destructive/10 dark:bg-destructive/15 border-b border-destructive/20 dark:border-destructive/30 py-1.5 relative z-10">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive mr-1.5 flex-shrink-0 animate-pulse" />
          <div className="relative overflow-hidden w-full max-w-4xl">
            <div className="animate-marquee whitespace-nowrap text-xs text-destructive font-medium py-0.5">
              This ML-powered assessment tool is for decision support only and should never replace professional medical diagnosis. Always consult with qualified healthcare providers for medical decisions.
            </div>
          </div>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-1.5 flex-shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Enhanced Header Section */}
      <section className="relative px-4 py-8 lg:px-6 lg:py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-1"
          >
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 mb-3">
              <Microscope className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Malaria Risk Assessment
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
              Advanced ML-powered symptom analysis and image detection for accurate malaria risk evaluation
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">ML-Powered</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">HIPAA Compliant</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">24/7 Monitoring</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Medical Grade</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="px-4 lg:px-6 pb-12 pt-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Assessment Form - Takes up more space */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="lg:col-span-8"
            >
              <Card className="data-card border-0 shadow-medical-lg bg-gradient-to-br from-card to-secondary/5">
                <div className="p-5 lg:p-6">
                  {/* Enhanced Form Header */}
                  <div className="mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                      className="flex items-center mb-4"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 mr-4">
                        <TestTube className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold mb-1">
                          Patient Assessment
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Comprehensive symptom analysis and image detection
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      className="text-muted-foreground leading-relaxed text-sm max-w-2xl"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Choose between symptom-based assessment or blood smear image analysis for malaria detection.
                      Our AI system uses advanced CNN models for image analysis and symptom pattern recognition to deliver
                      <span className="text-primary font-semibold"> precise risk evaluations</span> with confidence scores
                      and medical recommendations.
                    </motion.p>
                  </div>

                  {/* Dual Mode Diagnosis Component */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
                    <DualModeDiagnosis
                      onResult={handleResult}
                      onLoadingChange={handleLoading}
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Enhanced Results Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-4"
            >
              <div className="sticky top-6 space-y-5">
                {/* Results Display */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <DiagnosisResults
                    results={results}
                    isLoading={isLoading}
                    patientData={storedPatientData || undefined}
                    imageData={storedImageData || undefined}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;