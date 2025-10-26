import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/diagnosis/ImageUploader";
import { SymptomsForm } from "@/components/diagnosis/SymptomsForm";
import { DiagnosisResult } from "@/lib/types";
import { 
  Image, 
  FileText, 
  Activity,
  Microscope,
  TestTube
} from "lucide-react";

interface DualModeDiagnosisProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const DualModeDiagnosis = ({ onResult, onLoadingChange }: DualModeDiagnosisProps) => {
  const [activeTab, setActiveTab] = useState("symptoms");

  const handleResult = (result: DiagnosisResult) => {
    onResult(result);
  };

  const handleLoadingChange = (loading: boolean) => {
    onLoadingChange(loading);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection Header */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <TestTube className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Diagnosis Mode</h3>
              <p className="text-xs text-muted-foreground">Choose your preferred method for malaria assessment</p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-64 grid-cols-2 bg-secondary/50">
              <TabsTrigger 
                value="symptoms" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4 mr-2" />
                Symptoms Form
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Image className="h-4 w-4 mr-2" />
                Image Upload
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="symptoms" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SymptomsForm 
              onResult={handleResult} 
              onLoadingChange={handleLoadingChange} 
            />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="image" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ImageUploader 
              onResult={handleResult} 
              onLoadingChange={handleLoadingChange} 
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};