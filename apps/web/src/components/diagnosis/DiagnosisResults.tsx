import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Info, Download, Microscope, ChevronDown, ChevronRight, Image as ImageIcon, FileText } from "lucide-react";
import { DiagnosisResult, SymptomsInput } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DiagnosisResultsProps {
  results: DiagnosisResult | null;
  isLoading: boolean;
  patientData?: SymptomsInput & { id?: string; timestamp?: string };
  imageData?: { image: string; id?: string; timestamp?: string };
}

export const DiagnosisResults = ({ results, isLoading, patientData, imageData }: DiagnosisResultsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModelInsights, setShowModelInsights] = useState(false);

  // Determine if this is an image-based diagnosis
  const isImageDiagnosis = imageData !== undefined && imageData.image !== undefined;

  // Show confetti for negative results (healthy) or low risk
  const isHealthy = results && (
    (results.label === 'Negative' || results.label === 'Uninfected') ||
    (results.probability !== undefined && results.probability < 0.3) ||
    results.label.includes('Low')
  );

  const getStatusIcon = () => {
    if (!results) return <AlertCircle className="h-5 w-5 text-muted-foreground" />;

    // Handle risk assessment results (from symptoms model)
    if (results.label.includes('High')) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    } else if (results.label.includes('Medium')) {
      return <AlertCircle className="h-5 w-5 text-warning" />;
    } else if (results.label.includes('Low')) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }

    // Handle image analysis results (from CNN model)
    const isPositive = results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized';

    if (isPositive) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <CheckCircle className="h-5 w-5 text-success" />;
  };

  const getRiskColor = () => {
    if (!results) return 'text-muted-foreground';

    if (results.label.includes('High')) {
      return 'text-destructive';
    } else if (results.label.includes('Medium')) {
      return 'text-warning';
    } else if (results.label.includes('Low')) {
      return 'text-success';
    }

    const isPositive = results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized';
    return isPositive ? 'text-destructive' : 'text-success';
  };

  const getRiskBgColor = () => {
    if (!results) return 'bg-muted';

    if (results.label.includes('High')) {
      return 'bg-destructive/20';
    } else if (results.label.includes('Medium')) {
      return 'bg-warning/20';
    } else if (results.label.includes('Low')) {
      return 'bg-success/20';
    }

    const isPositive = results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized';
    return isPositive ? 'bg-destructive/20' : 'bg-success/20';
  };

  const generateReportHtml = () => {
    if (!results) return '';

    const formatDate = (dateString?: string) => {
      if (!dateString) return new Date().toLocaleString();
      return new Date(dateString).toLocaleString();
    };

    // Generate report for image-based diagnosis
    if (isImageDiagnosis) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malaria Blood Smear Analysis Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .page {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            page-break-after: always;
        }
        .report-header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .report-title {
            color: #007bff;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .report-subtitle {
            color: #6c757d;
            font-size: 18px;
            margin-bottom: 5px;
        }
        .report-date {
            color: #6c757d;
            font-size: 14px;
        }
        .section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
            color: #007bff;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        .info-value {
            color: #6c757d;
        }
        .result-card {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .positive {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .negative {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .confidence-bar {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            margin: 15px 0;
            overflow: hidden;
        }
        .confidence-level {
            height: 100%;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .disclaimer {
            font-size: 12px;
            color: #6c757d;
            font-style: italic;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="report-header">
            <h1 class="report-title">Malaria Blood Smear Analysis Report</h1>
            <p class="report-subtitle">AI-Powered Medical Intelligence Platform</p>
            <p class="report-date">Generated on: ${formatDate(imageData?.timestamp)}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Analysis Information</h2>
            <div class="info-item">
                <div class="info-label">Image File:</div>
                <div class="info-value">${imageData?.image || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Analysis Type:</div>
                <div class="info-value">Blood Smear Image Analysis (CNN Model)</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Analysis Results</h2>
            <div class="result-card ${results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized' ? 'positive' : 'negative'}">
                <h3>Diagnosis: ${results.label}</h3>
                ${results.confidence !== undefined ? `
                    <p>Model Confidence: ${(results.confidence * 100).toFixed(1)}%</p>
                    <div class="confidence-bar">
                        <div class="confidence-level" style="width: ${(results.confidence * 100)}%; background-color: ${results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized' ? '#dc3545' : '#28a745'}">
                            ${(results.confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div>
                <h3>Interpretation:</h3>
                <p>
                    ${results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized'
          ? 'The AI model detected malaria parasites in the blood smear image. Immediate medical consultation is strongly recommended for confirmation and treatment.'
          : 'The AI model did not detect malaria parasites in the blood smear image. Continue monitoring symptoms and seek medical advice if they worsen.'}
                </p>
            </div>
        </div>
    </div>

    <div class="page">
        <div class="section">
            <h2 class="section-title">Medical Disclaimer</h2>
            <p>
                This AI-powered assessment tool is designed for decision support only and should never replace
                professional medical diagnosis, consultation, or treatment. Always consult with qualified healthcare providers
                for medical decisions, laboratory testing, and treatment plans.
            </p>
            <p>
                <strong>If you suspect malaria or any serious illness, seek immediate medical attention.</strong>
                Early diagnosis and treatment are critical for the best outcomes.
            </p>
        </div>

        <div class="disclaimer">
            This report is generated by Foresee Medical Intelligence Platform. The assessment is based on
            machine learning algorithms trained on clinical data. Results should be interpreted by qualified
            healthcare professionals in conjunction with clinical evaluation.
        </div>

        <div class="footer">
            <p>Report ID: ${imageData?.id || 'N/A'}</p>
            <p>© ${new Date().getFullYear()} Foresee Medical Intelligence Platform</p>
        </div>
    </div>
</body>
</html>
      `;
    }

    // Generate report for symptom-based diagnosis
    if (patientData) {
      const symptomsList = [
        { key: "fever", label: "Fever", value: patientData.fever },
        { key: "chills", label: "Chills or Shivering", value: patientData.chills },
        { key: "headache", label: "Headache", value: patientData.headache },
        { key: "fatigue", label: "Fatigue", value: patientData.fatigue },
        { key: "muscle_aches", label: "Muscle or Joint Pain", value: patientData.muscle_aches },
        { key: "nausea", label: "Nausea", value: patientData.nausea },
        { key: "diarrhea", label: "Diarrhea", value: patientData.diarrhea },
        { key: "abdominal_pain", label: "Abdominal Pain", value: patientData.abdominal_pain },
        { key: "cough", label: "Cough", value: patientData.cough },
        { key: "skin_rash", label: "Skin Rash", value: patientData.skin_rash }
      ];

      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malaria Risk Assessment Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .page {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            page-break-after: always;
        }
        .report-header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .report-title {
            color: #007bff;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .report-subtitle {
            color: #6c757d;
            font-size: 18px;
            margin-bottom: 5px;
        }
        .report-date {
            color: #6c757d;
            font-size: 14px;
        }
        .section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
            color: #007bff;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .patient-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        .info-value {
            color: #6c757d;
        }
        .symptoms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .symptom-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border-radius: 4px;
        }
        .symptom-present {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        .symptom-absent {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
        }
        .symptom-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .present {
            background-color: #dc3545;
        }
        .absent {
            background-color: #28a745;
        }
        .result-card {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .high-risk {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .medium-risk {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .low-risk {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .confidence-bar {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            margin: 15px 0;
            overflow: hidden;
        }
        .confidence-level {
            height: 100%;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .disclaimer {
            font-size: 12px;
            color: #6c757d;
            font-style: italic;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #dee2e6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="report-header">
            <h1 class="report-title">Malaria Risk Assessment Report</h1>
            <p class="report-subtitle">AI-Powered Medical Intelligence Platform</p>
            <p class="report-date">Generated on: ${formatDate(patientData.timestamp)}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Patient Information</h2>
            <div class="patient-info-grid">
                <div class="info-item">
                    <div class="info-label">Age:</div>
                    <div class="info-value">${patientData.age} years</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Region:</div>
                    <div class="info-value">${patientData.region}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Symptom Assessment</h2>
            <div class="symptoms-grid">
                ${symptomsList.map(symptom => `
                    <div class="symptom-item ${symptom.value ? 'symptom-present' : 'symptom-absent'}">
                        <div class="symptom-indicator ${symptom.value ? 'present' : 'absent'}"></div>
                        <div>${symptom.label}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Analysis Results</h2>
            <div class="result-card ${results.label.includes('High') ? 'high-risk' : results.label.includes('Medium') ? 'medium-risk' : 'low-risk'}">
                <h3>Risk Level: ${results.label}</h3>
                ${results.probability !== undefined ? `
                    <p>Confidence Score: ${(results.probability * 100).toFixed(1)}%</p>
                    <div class="confidence-bar">
                        <div class="confidence-level" style="width: ${(results.probability * 100)}%; background-color: ${results.label.includes('High') ? '#dc3545' : results.label.includes('Medium') ? '#ffc107' : '#28a745'}">
                            ${(results.probability * 100).toFixed(1)}%
                        </div>
                    </div>
                ` : ''}
                ${results.confidence !== undefined ? `
                    <p>Model Confidence: ${(results.confidence * 100).toFixed(1)}%</p>
                ` : ''}
            </div>
            
            <div>
                <h3>Interpretation:</h3>
                <p>
                    ${results.label.includes('High')
          ? 'The AI model indicates a HIGH risk of malaria based on the reported symptoms. Immediate medical consultation is strongly recommended.'
          : results.label.includes('Medium')
            ? 'The AI model indicates a MODERATE risk of malaria. Medical consultation is recommended for proper evaluation.'
            : 'The AI model indicates a LOW risk of malaria. Continue monitoring symptoms and seek medical advice if they worsen.'}
                </p>
            </div>
        </div>
    </div>

    <div class="page">
        <div class="section">
            <h2 class="section-title">Medical Disclaimer</h2>
            <p>
                This AI-powered assessment tool is designed for decision support only and should never replace
                professional medical diagnosis, consultation, or treatment. Always consult with qualified healthcare providers
                for medical decisions, laboratory testing, and treatment plans.
            </p>
            <p>
                <strong>If you suspect malaria or any serious illness, seek immediate medical attention.</strong>
                Early diagnosis and treatment are critical for the best outcomes.
            </p>
        </div>

        <div class="disclaimer">
            This report is generated by Foresee Medical Intelligence Platform. The assessment is based on
            machine learning algorithms trained on clinical data. Results should be interpreted by qualified
            healthcare professionals in conjunction with clinical evaluation.
        </div>

        <div class="footer">
            <p>Report ID: ${patientData.id || 'N/A'}</p>
            <p>© ${new Date().getFullYear()} Foresee Medical Intelligence Platform</p>
        </div>
    </div>
</body>
</html>
      `;
    }

    return '';
  };

  const downloadReport = async () => {
    if (!results) return;

    // Create a temporary element to hold the HTML content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = generateReportHtml();
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.width = '800px'; // Set a fixed width for consistent rendering
    tempElement.style.backgroundColor = 'white';
    document.body.appendChild(tempElement);

    try {
      // Get all pages (div elements with class 'page')
      const pages = tempElement.querySelectorAll('.page');

      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const padding = 20; // Padding in mm

      // Process each page separately
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Add a new page if this isn't the first page
        if (i > 0) {
          pdf.addPage();
        }

        // Use html2canvas to capture the page as an image
        const canvas = await html2canvas(page as HTMLElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Calculate dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (padding * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Ensure the image fits within the page
        let finalImgHeight = imgHeight;
        let finalImgWidth = imgWidth;

        if (imgHeight > (pageHeight - (padding * 2))) {
          finalImgHeight = pageHeight - (padding * 2);
          finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
        }

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', padding, padding, finalImgWidth, finalImgHeight);
      }

      // Save the PDF
      const fileName = isImageDiagnosis
        ? `malaria-blood-smear-analysis-${imageData?.id || Date.now()}.pdf`
        : `malaria-risk-assessment-${patientData?.id || Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download if PDF generation fails
      const reportHtml = generateReportHtml();
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = isImageDiagnosis
        ? `malaria-blood-smear-analysis-${imageData?.id || Date.now()}.html`
        : `malaria-risk-assessment-${patientData?.id || Date.now()}.html`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      // Clean up the temporary element
      document.body.removeChild(tempElement);
    }
  };

  if (isLoading) {
    return (
      <Card className="data-card border-2 border-primary/20 shadow-medical-lg bg-card">
        <CardHeader className="bg-primary/5 rounded-t-lg py-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <span>Analysis in Progress</span>
          </CardTitle>
          <CardDescription className="text-xs">Processing your data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="data-card border-2 border-primary/20 shadow-medical-lg bg-card">
        <CardHeader className="bg-primary/5 rounded-t-lg py-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Microscope className="h-4 w-4 text-primary" />
            </div>
            <span>Analysis Results</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Upload an image or fill out the symptoms form to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24 py-4">
          <p className="text-muted-foreground text-sm">No analysis performed yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate probability for display (model confidence)
  const probability = results.probability !== undefined
    ? results.probability
    : results.confidence !== undefined
      ? results.confidence
      : 0;

  const confidencePercentage = Math.round(probability * 100);

  // Determine risk level
  const riskLevel = results.label.includes('High')
    ? 'High Risk'
    : results.label.includes('Medium')
      ? 'Medium Risk'
      : results.label.includes('Low')
        ? 'Low Risk'
        : results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized'
          ? 'High Risk'
          : 'Low Risk';

  // Map risk levels to numerical values for the gauge (representing risk factor, not confidence)
  const getRiskPercentage = () => {
    if (results.label.includes('High')) return 85;
    if (results.label.includes('Medium')) return 50;
    if (results.label.includes('Low')) return 15;
    if (results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized') return 85;
    return 15; // Default to low risk
  };

  const riskPercentage = getRiskPercentage();

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="data-card border-2 border-border/50 shadow-medical-lg bg-gradient-to-br from-card to-secondary/5 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg relative py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Microscope className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {isImageDiagnosis ? 'Blood Smear Analysis Report' : 'Malaria Diagnosis Report'}
                    </CardTitle>
                  </div>
                </div>
                {results && (
                  <Button
                    onClick={downloadReport}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 h-8 text-xs px-2 bg-background/80 backdrop-blur-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download Report</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 py-4">
              {/* Confidence Gauge */}
              <div className="flex flex-col items-center justify-center space-y-2 py-3">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Background circle with subtle glow */}
                  <div className="absolute w-full h-full rounded-full border-4 border-muted animate-pulse-slow"></div>

                  {/* Animated progress ring */}
                  <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    {/* Background ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Progress ring with animation */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="hsl(var(--primary))"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{
                        strokeDashoffset: 283 - (283 * confidencePercentage) / 100,
                        rotate: -90
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      transform="rotate(-90 50 50)"
                      strokeDasharray="283"
                      strokeDashoffset="283"
                    />
                  </svg>

                  {/* Center content */}
                  <div className="absolute flex flex-col items-center">
                    <motion.span
                      className={`text-3xl font-bold text-foreground`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      {confidencePercentage}%
                    </motion.span>
                    <motion.span
                      className={`text-sm font-semibold text-muted-foreground`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      Model Confidence
                    </motion.span>
                  </div>
                </div>

                <p className="text-center text-muted-foreground text-sm max-w-xs">
                  {isImageDiagnosis
                    ? results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized'
                      ? 'Malaria parasites detected in blood smear. Immediate medical consultation is strongly recommended.'
                      : 'No malaria parasites detected in blood smear. Continue monitoring symptoms.'
                    : riskLevel.includes('High')
                      ? 'High probability of malaria infection detected. Immediate medical consultation is strongly recommended.'
                      : riskLevel.includes('Medium')
                        ? 'Moderate probability of malaria infection detected. Further lab testing is recommended.'
                        : 'Low probability of malaria infection detected. Continue monitoring symptoms.'}
                </p>
              </div>

              {/* Data Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`space-y-1.5 text-center p-3 rounded-lg ${getRiskBgColor()}`}>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Result</span>
                  <div className={`text-base font-bold ${getRiskColor()}`}>
                    {isImageDiagnosis
                      ? results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized'
                        ? 'Parasites Detected'
                        : 'No Parasites'
                      : riskLevel}
                  </div>
                </div>

                <div className="space-y-1.5 text-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</span>
                  <div className="text-base font-bold text-foreground">
                    {confidencePercentage}%
                  </div>
                </div>
              </div>

              {/* Interpretation Box */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-center text-foreground text-sm">
                  {isImageDiagnosis
                    ? results.label === 'Positive' || results.label === 'Infected' || results.label === 'Parasitized'
                      ? 'Recommend immediate medical consultation. Further blood testing is critical for confirmation.'
                      : 'Continue monitoring symptoms. Consult your healthcare provider if symptoms worsen.'
                    : riskLevel.includes('High')
                      ? 'Recommend immediate medical consultation. Further blood testing is critical for confirmation.'
                      : riskLevel.includes('Medium')
                        ? 'Recommend further blood test for confirmation. Consult your healthcare provider.'
                        : 'Continue monitoring symptoms. Consult your healthcare provider if symptoms worsen.'}
                </p>
              </div>

              {/* Model Insights */}
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowModelInsights(!showModelInsights)}
                  className="w-full p-3 bg-secondary/30 hover:bg-secondary/50 flex items-center justify-between transition-colors text-sm"
                >
                  <span className="font-medium">Model Insights</span>
                  {showModelInsights ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showModelInsights && (
                  <div className="p-3 bg-background/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analysis Type:</span>
                      <span className="font-medium">
                        {isImageDiagnosis ? 'CNN Blood Smear Analysis' : 'Symptom Risk Assessment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="font-medium">
                        {isImageDiagnosis ? 'Convolutional Neural Network' : 'Random Forest Classifier'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Accuracy:</span>
                      <span className="font-medium">
                        {isImageDiagnosis ? '92%' : '87%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">Oct 2025</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};