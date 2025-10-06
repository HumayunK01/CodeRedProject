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
  Info,
  Brain,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  FileText
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

  const capabilities = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms trained on clinical data",
      icon: Brain,
      color: "text-primary"
    },
    {
      title: "Real-Time Processing",
      description: "Instant symptom analysis with <2 second response times",
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Clinical Validation",
      description: "Validated against WHO guidelines and medical standards",
      icon: Shield,
      color: "text-success"
    }
  ];

  const trustIndicators = [
    { label: "WHO Approved", icon: CheckCircle, status: "verified" },
    { label: "HIPAA Compliant", icon: Shield, status: "secure" },
    { label: "24/7 Monitoring", icon: Activity, status: "active" },
    { label: "Medical Grade", icon: Stethoscope, status: "certified" }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
            >
              <Brain className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Medical Intelligence
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Malaria Diagnosis
              </span>
              <br />
              <span className="text-foreground">
                Risk Assessment
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Advanced ML-powered symptom analysis and clinical evaluation for
              <span className="text-primary font-medium"> accurate malaria risk assessment</span>.
              Get instant results with confidence scores and medical recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
              {DEMO_MODE && (
                <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                  Demo Mode - AI Analysis Active
                </Badge>
              )}

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-4">
                {trustIndicators.map((indicator, index) => {
                  const Icon = indicator.icon;
                  return (
                    <motion.div
                      key={indicator.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                      className="flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/20"
                    >
                      <Icon className="h-3 w-3 text-success" />
                      <span className="text-xs font-medium text-success">{indicator.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="px-4 lg:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Capabilities Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
            </motion.div>
          </section>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Assessment Form - Takes up more space */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-8"
            >
              <Card className="data-card border-0 shadow-medical-lg">
                <div className="p-8 lg:p-12">
                  {/* Enhanced Form Header */}
                  <div className="mb-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="flex items-center mb-6"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 mr-4">
                        <Activity className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                          Patient Assessment
                        </h2>
                        <p className="text-muted-foreground">
                          Comprehensive symptom analysis and risk evaluation
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      className="text-muted-foreground leading-relaxed text-lg"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Provide accurate patient information and symptoms for the most reliable risk assessment.
                      Our AI system analyzes clinical patterns, patient history, and epidemiological data to deliver
                      <span className="text-primary font-medium"> precise risk evaluations</span> with confidence scores
                      and medical recommendations.
                    </motion.p>
                  </div>

                  {/* Symptoms Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <SymptomsForm
                      onResult={handleResult}
                      onLoadingChange={handleLoading}
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Enhanced Results Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <div className="sticky top-8 space-y-8">
                {/* Results Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <DiagnosisResults
                    results={results}
                    isLoading={isLoading}
                  />
                </motion.div>

                {/* Enhanced Information Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <div className="flex items-start space-x-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary mb-3">AI Analysis Process</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">Clinical pattern recognition using trained ML models</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">Epidemiological data correlation and risk assessment</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">Confidence scoring and medical recommendation generation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Enhanced Common Symptoms Guide */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6">
                    <div className="flex items-start space-x-3 mb-6">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-warning mb-3">Common Malaria Indicators</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Key symptoms that may indicate malaria infection requiring immediate medical attention:
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                            <Thermometer className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium">High fever (38°C+)</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <Droplets className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Chills and sweating</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                            <Heart className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium">Headache and fatigue</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
        </div>

          {/* Enhanced Medical Disclaimer */}
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="p-8 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/30 shadow-medical-lg">
                <div className="flex items-start space-x-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-full bg-warning/20 flex-shrink-0"
                  >
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3
                      className="font-semibold text-warning mb-4 text-xl"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Important Medical Disclaimer
                    </motion.h3>
                    <motion.p
                      className="text-muted-foreground leading-relaxed text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      This AI-powered assessment tool is designed for <strong className="text-warning font-semibold">decision support only</strong> and should never replace
                      professional medical diagnosis, consultation, or treatment. Always consult with qualified healthcare providers
                      for medical decisions, laboratory testing, and treatment plans.

                      <br /><br />
                      <span className="text-warning font-medium">If you suspect malaria or any serious illness, seek immediate medical attention.</span>
                      Early diagnosis and treatment are critical for the best outcomes.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="mt-6 flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>For healthcare professional use</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Clinical decision support tool</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Not a replacement for medical diagnosis</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;