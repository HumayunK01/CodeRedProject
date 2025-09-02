import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProbabilityGauge } from "@/components/ui/probability-gauge";
import { Confetti } from "@/components/ui/confetti";
import { AlertCircle, CheckCircle, XCircle, ZoomIn } from "lucide-react";
import { DiagnosisResult } from "@/lib/types";

interface DiagnosisResultsProps {
  results: DiagnosisResult | null;
  isLoading: boolean;
}

export const DiagnosisResults = ({ results, isLoading }: DiagnosisResultsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [gradCamZoomed, setGradCamZoomed] = useState(false);

  // Show confetti for negative results (healthy)
  const isHealthy = results && (
    (results.label === 'Negative' || results.label === 'Uninfected') ||
    (results.probability !== undefined && results.probability < 0.3)
  );

  const getStatusIcon = () => {
    if (!results) return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
    
    const isPositive = results.label === 'Positive' || results.label === 'Infected' || 
                      (results.probability !== undefined && results.probability > 0.7);
    
    if (isPositive) {
      return <XCircle className="h-6 w-6 text-destructive" />;
    }
    return <CheckCircle className="h-6 w-6 text-success" />;
  };

  const getVariant = () => {
    if (!results) return 'secondary';
    
    const isPositive = results.label === 'Positive' || results.label === 'Infected' ||
                      (results.probability !== undefined && results.probability > 0.7);
    
    return isPositive ? 'destructive' : 'default';
  };

  if (isLoading) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle>Analysis in Progress</CardTitle>
          <CardDescription>Processing your data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            Upload an image or fill out the symptoms form to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No analysis performed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (isHealthy) {
              setShowConfetti(true);
            }
          }}
        >
          <Card className="data-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <div>
                  <CardTitle>Diagnosis Result</CardTitle>
                  <CardDescription>
                    {results.label === 'Positive' || results.label === 'Infected' 
                      ? 'Malaria parasites detected' 
                      : 'No malaria parasites detected'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Probability Gauge */}
              {results.probability !== undefined && (
                <div className="flex flex-col items-center space-y-2">
                  <ProbabilityGauge 
                    probability={results.probability} 
                    size={140}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Result</span>
                  <Badge variant={getVariant()} className="w-full justify-center">
                    {results.label}
                  </Badge>
                </div>
                
                {results.confidence && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</span>
                    <div className="text-center font-semibold">
                      {Math.round(results.confidence * 100)}%
                    </div>
                  </div>
                )}
              </div>
              
              {results.explanations?.gradcam && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Analysis Visualization</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ZoomIn className="h-3 w-3 mr-1" />
                      Click to zoom
                    </div>
                  </div>
                  <div 
                    className={`relative overflow-hidden rounded-lg border cursor-pointer transition-transform duration-200 ${
                      gradCamZoomed ? 'scale-150 z-50' : 'hover:scale-105'
                    }`}
                    onClick={() => setGradCamZoomed(!gradCamZoomed)}
                  >
                    <img 
                      src={results.explanations.gradcam}
                      alt="Grad-CAM visualization showing areas of interest"
                      className="w-full"
                    />
                    {gradCamZoomed && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <p className="text-xs">Click to zoom out</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      <Confetti 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </>
  );
};