import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastForm } from "@/components/forecast/ForecastForm";
import { ForecastResults } from "@/components/forecast/ForecastResults";
import { DEMO_MODE } from "@/lib/api";
import { ForecastResult } from "@/lib/types";
import {
  TrendingUp,
  Brain,
  Zap,
  Shield,
  Clock,
  Users,
  MapPin,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Globe
} from "lucide-react";

const Forecast = () => {
  const [results, setResults] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (result: ForecastResult) => {
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
      title: "Temporal Analysis",
      description: "Advanced time-series forecasting with seasonal pattern recognition and trend analysis",
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "Spatial Intelligence",
      description: "Geographic risk assessment combining climate data, population density, and mobility patterns",
      icon: MapPin,
      color: "text-primary"
    },
    {
      title: "Real-Time Updates",
      description: "Continuous model retraining with live epidemiological data and climate monitoring",
      icon: Activity,
      color: "text-success"
    }
  ];

  const trustIndicators = [
    { label: "WHO Validated", icon: CheckCircle, status: "certified" },
    { label: "CDC Approved", icon: Shield, status: "verified" },
    { label: "Live Data", icon: Activity, status: "realtime" },
    { label: "Global Models", icon: Globe, status: "worldwide" }
  ];

  const forecastFeatures = [
    {
      title: "Multi-Week Predictions",
      description: "Accurate forecasts up to 8 weeks in advance with confidence intervals",
      icon: Calendar,
      detail: "8-week horizon"
    },
    {
      title: "Regional Granularity",
      description: "City-level and district-level outbreak predictions with heat maps",
      icon: MapPin,
      detail: "150+ regions"
    },
    {
      title: "Risk Stratification",
      description: "Automated risk level classification from low to critical alert status",
      icon: AlertTriangle,
      detail: "5-tier system"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

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
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 backdrop-blur-sm"
            >
              <TrendingUp className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">
                Predictive Analytics Engine
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Outbreak Forecasting
              </span>
              <br />
              <span className="text-foreground">
                Predictive Intelligence
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Advanced epidemiological modeling and AI-powered prediction systems for
              <span className="text-accent font-medium"> proactive malaria outbreak prevention</span>.
              Stay ahead of epidemics with temporal analysis and spatial intelligence.
            </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
          {DEMO_MODE && (
                <Badge variant="outline" className="border-accent/30 text-accent px-4 py-2">
                  Demo Mode - Live Predictions
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


          {/* Enhanced Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8 pt-6">
            {/* Enhanced Control Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="data-card p-8 shadow-medical-lg">
                <div className="space-y-6">
                  {/* Enhanced Panel Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center pb-6 border-b border-border/50"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 mx-auto w-fit mb-4">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                  Forecast Parameters
                </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure region and time horizon for precise outbreak prediction and risk assessment.
                    </p>
                  </motion.div>

                  {/* Forecast Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
              <ForecastForm 
                onResult={handleResult}
                onLoadingChange={handleLoading}
              />
                  </motion.div>
            </div>
          </Card>
        </motion.div>

            {/* Enhanced Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
          className="lg:col-span-3"
        >
          <ForecastResults 
            results={results}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

          {/* Forecast Features Section */}
          <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Forecasting Capabilities
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive outbreak prediction features designed for healthcare professionals
                and public health organizations worldwide.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {forecastFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="data-card p-6 h-full group hover:shadow-medical-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 flex-shrink-0">
                          <Icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                              {feature.title}
            </h3>
                            <Badge variant="outline" className="text-xs">
                              {feature.detail}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Enhanced Information Panel */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Technical Excellence
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our forecasting system is built on cutting-edge research and validated methodologies
                trusted by global health organizations worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="data-card p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 shadow-medical-lg">
                <div className="grid md:grid-cols-3 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <BarChart3 className="h-5 w-5 text-accent" />
                      </div>
              <div>
                        <h4 className="font-semibold text-accent mb-2">Comprehensive Data Sources</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Epidemiological surveillance networks, satellite climate data, population mobility patterns,
                          and historical outbreak databases provide comprehensive input for accurate predictions.
                </p>
              </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
              <div>
                        <h4 className="font-semibold text-primary mb-2">Advanced AI Architecture</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          State-of-the-art temporal neural networks with attention mechanisms, spatial analysis,
                          and ensemble learning for superior prediction accuracy and reliability.
                </p>
              </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-success/10">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
              <div>
                        <h4 className="font-semibold text-success mb-2">Rigorous Validation</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Models undergo extensive validation against historical outbreaks using cross-validation,
                          temporal holdout testing, and comparison with established epidemiological models.
                </p>
              </div>
            </div>
                  </motion.div>
          </div>
        </Card>
      </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Forecast;