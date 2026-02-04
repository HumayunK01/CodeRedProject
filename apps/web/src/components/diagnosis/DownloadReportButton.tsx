
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface DownloadReportButtonProps {
    diagnosisData: {
        result: string;
        confidence: number;
        patientName?: string;
        patientAge?: string;
        patientSex?: string;
        species?: string;
        parasiteCount?: string;
        [key: string]: any;
    };
    className?: string;
}

export function DownloadReportButton({ diagnosisData, className }: DownloadReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await apiClient.generateReport(diagnosisData);

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Foresee_Report_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating}
            className={className}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Lab Report
                </>
            )}
        </Button>
    );
}
