import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ForecastForm } from "@/components/forecast/ForecastForm";
import { ForecastResults } from "@/components/forecast/ForecastResults";
import { DEMO_MODE } from "@/lib/api";
import { ForecastResult } from "@/lib/types";

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
            <h1 className="text-3xl font-bold">Outbreak Forecasting</h1>
            <p className="text-muted-foreground">
              Predict malaria outbreak patterns using epidemiological data and ML models
            </p>
          </div>
          
          {DEMO_MODE && (
            <Badge variant="outline" className="border-primary/30 text-primary">
              Demo Mode
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <Card className="data-card p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Forecast Parameters
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure region and time horizon for outbreak prediction.
                </p>
              </div>
              
              <ForecastForm 
                onResult={handleResult}
                onLoadingChange={handleLoading}
              />
            </div>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-3"
        >
          <ForecastResults 
            results={results}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              About Outbreak Forecasting
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Data Sources</h4>
                <p className="text-muted-foreground">
                  Epidemiological surveillance data, climate patterns, 
                  population demographics, and historical outbreak records.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Model Architecture</h4>
                <p className="text-muted-foreground">
                  Temporal neural networks with attention mechanisms for 
                  time-series prediction and spatial analysis.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Validation</h4>
                <p className="text-muted-foreground">
                  Models validated against historical outbreaks with 
                  cross-validation and temporal holdout testing.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Forecast;