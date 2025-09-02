import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Loader2
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

  const handleFile = useCallback((file: File) => {
    try {
      imageUploadSchema.parse({ file });
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
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
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    onLoadingChange(true);

    try {
      const result = await apiClient.predictImage(selectedFile);
      
      // Store result in localStorage
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
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : selectedFile 
            ? 'border-success bg-success/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          /* File Selected */
          <div className="space-y-4">
            {preview && (
              <div className="relative mx-auto w-48 h-48 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <FileImage className="h-5 w-5 text-success" />
                <p className="font-medium text-success">File Ready</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          </div>
        ) : (
          /* Upload Prompt */
          <div className="text-center space-y-4">
            <motion.div
              animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex p-4 rounded-full bg-primary/10"
            >
              <Upload className="h-8 w-8 text-primary" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {dragActive ? 'Drop image here' : 'Upload Blood Smear Image'}
              </h3>
              <p className="text-muted-foreground">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG • Max 10MB
              </p>
            </div>
            
            <Label
              htmlFor="image-upload"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              Browse Files
            </Label>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={uploadImage}
            disabled={isUploading}
            className="w-full btn-medical"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze Image
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-primary">Image Guidelines</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Use high-resolution microscopic images (at least 1000x1000 pixels)</li>
              <li>• Ensure proper focus and lighting conditions</li>
              <li>• Include multiple cells for better analysis accuracy</li>
              <li>• Avoid blurry or low-contrast images</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};