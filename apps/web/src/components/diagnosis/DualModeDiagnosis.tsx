import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/diagnosis/ImageUploader";
import { SymptomsForm } from "@/components/diagnosis/SymptomsForm";
import { DiagnosisResult } from "@/lib/types";
import {
  Image,
  FileText
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DualModeDiagnosisProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const DualModeDiagnosis = ({ onResult, onLoadingChange }: DualModeDiagnosisProps) => {
  const { user } = useUser();
  const isDoctor = user?.publicMetadata?.role === "doctor";
  const [activeTab, setActiveTab] = useState("symptoms");

  const handleResult = (result: DiagnosisResult) => {
    onResult(result);
  };

  const handleLoadingChange = (loading: boolean) => {
    onLoadingChange(loading);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-primary">Begin Assessment</h3>
            <p className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Start with Risk Screening, then verify with Diagnostics if needed.</p>
          </div>

          <TabsList className="bg-primary/5 border border-primary/10 p-1 h-12 rounded-full relative flex items-center">
            {["symptoms", "image"].map((tab) => {
              if (tab === "image" && !isDoctor) {
                return (
                  <Tooltip key={tab}>
                    <TooltipTrigger asChild>
                      <div className="relative z-10 flex-1 rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wide text-primary/40 h-full flex items-center justify-center gap-2 cursor-not-allowed">
                        <Image className="h-3.5 w-3.5 opacity-50" />
                        Diagnostic Confirmation
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restricted to verified medical professionals.</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative z-10 flex-1 rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 
                     data-[state=active]:text-white text-primary/60 hover:text-primary h-full flex items-center justify-center gap-2
                     data-[state=active]:bg-transparent"
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {tab === "symptoms" ? <FileText className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
                  {tab === "symptoms" ? "Risk Screening" : "Diagnostic Confirmation"}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="symptoms" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            {activeTab === "symptoms" && (
              <motion.div
                key="symptoms"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <SymptomsForm
                  onResult={handleResult}
                  onLoadingChange={handleLoadingChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="image" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            {activeTab === "image" && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ImageUploader
                  onResult={handleResult}
                  onLoadingChange={handleLoadingChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};