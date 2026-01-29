import { useState, useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { DiagnosisResult } from "@/lib/types";
import { imageUploadSchema } from "@/lib/validations";
import { StorageManager } from "@/lib/storage";
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  Loader2,
  Scan,
  ImageIcon
} from "lucide-react";

interface ImageUploaderProps {
  onResult: (result: DiagnosisResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const ImageUploader = ({ onResult, onLoadingChange }: ImageUploaderProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    try {
      imageUploadSchema.parse({ file });
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Invalid File",
        description: "Please upload a JPEG or PNG image under 10MB.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    // Reset inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    onLoadingChange(true);
    try {
      const result = await apiClient.predictImage(selectedFile);
      const storedResult = {
        id: Date.now().toString(),
        type: 'diagnosis' as const,
        timestamp: new Date().toISOString(),
        input: { image: selectedFile.name },
        result
      };
      StorageManager.saveResult(storedResult);
      onResult(result);
      toast({
        title: "Analysis Complete",
        description: `Diagnosis: ${result.label} (${(result.confidence * 100).toFixed(1)}% confidence)`,
      });

      // Reset the uploader for the next image
      clearFile();
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      onLoadingChange(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wide">Image Analysis</h4>
            <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-medium">Upload blood smear microscopy</p>
          </div>
        </div>

        <div
          className={`relative group cursor-pointer transition-all duration-300 rounded-[16px] border-2 border-dashed
              ${dragActive
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : selectedFile
                ? 'border-transparent'
                : 'border-primary/10 hover:border-primary/30 hover:bg-white/50'
            }
            `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="relative overflow-hidden rounded-[16px]">
              {preview && (
                <div className="relative aspect-video w-full">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                      <X className="mr-2 h-4 w-4" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}
              <div className="bg-white/80 p-3 flex items-center justify-between backdrop-blur-md absolute bottom-0 left-0 right-0 m-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-success/10 rounded-md text-success"><FileImage className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold">{selectedFile.name}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-foreground/40 hidden sm:inline-block">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-primary">Click to upload or drag and drop</h3>
                <p className="text-xs text-foreground/50">High resolution blood smear images (JPG, PNG)</p>
              </div>
              <Label htmlFor="image-upload" className="sr-only">Upload</Label>
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      {selectedFile && (
        <div>
          <Button
            onClick={uploadImage}
            disabled={isUploading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-[16px] font-medium tracking-wide shadow-lg shadow-primary/20"
          >
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><ImageIcon className="mr-2 h-4 w-4" /> Run Image Analysis</>}
          </Button>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
        <AlertCircle className="h-5 w-5 text-orange-500/60 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-orange-700 uppercase tracking-wide">Image Requirements</h5>
          <p className="text-xs text-orange-700/70 leading-relaxed">
            Ensure images are clear, in focus, and well-lit. Poor quality images may result in inaccurate diagnosis. 1000x1000px resolution recommended.
          </p>
        </div>
      </div>
    </div>
  );
};