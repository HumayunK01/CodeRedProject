import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastForm } from "@/components/forecast/ForecastForm";
import { ForecastResults } from "@/components/forecast/ForecastResults";
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
              This ML-powered forecasting tool is for decision support only and should never replace professional epidemiological analysis. Always consult with qualified public health experts for outbreak response decisions.
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
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Outbreak Forecasting
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
              Advanced ML-powered outbreak prediction for proactive malaria prevention
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
                <span className="text-xs font-medium">WHO Validated</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Live Data</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-secondary/50 dark:bg-secondary/30 backdrop-blur-sm border border-border"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Global Models</span>
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
            {/* Forecast Form - Takes up less space */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="lg:col-span-5"
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
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold mb-1">
                          Forecast Parameters
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Configure region and time horizon for outbreak prediction
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      className="text-muted-foreground leading-relaxed text-sm"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Select your target region and forecast horizon for accurate outbreak predictions.
                      Our AI system analyzes epidemiological patterns to deliver
                      <span className="text-primary font-semibold"> precise forecasting</span>.
                    </motion.p>
                  </div>

                  {/* Forecast Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
                    <ForecastForm
                      onResult={handleResult}
                      onLoadingChange={handleLoading}
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Enhanced Results Section - Takes up more space */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-7"
            >
              <div className="sticky top-6 space-y-5">
                {/* Results Display */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <ForecastResults
                    results={results}
                    isLoading={isLoading}
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

export default Forecast;