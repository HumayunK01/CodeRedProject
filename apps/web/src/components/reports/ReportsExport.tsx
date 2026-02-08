
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { StorageManager } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

interface ReportsExportProps {
    isSignedIn: boolean;
}

export const ReportsExport = ({ isSignedIn }: ReportsExportProps) => {
    const { toast } = useToast();

    const handleExportCsv = () => {
        try {
            const csv = StorageManager.exportToCsv();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Reports have been exported to CSV format.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export reports. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleExportJson = () => {
        try {
            const json = StorageManager.exportToJson();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Reports have been exported to JSON format.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export reports. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleExportAll = () => {
        try {
            // Export CSV
            const csv = StorageManager.exportToCsv();
            const csvBlob = new Blob([csv], { type: 'text/csv' });
            const csvUrl = URL.createObjectURL(csvBlob);
            const csvA = document.createElement('a');
            csvA.href = csvUrl;
            csvA.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(csvA);
            csvA.click();
            document.body.removeChild(csvA);
            URL.revokeObjectURL(csvUrl);

            // Export JSON
            const json = StorageManager.exportToJson();
            const jsonBlob = new Blob([json], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonA = document.createElement('a');
            jsonA.href = jsonUrl;
            jsonA.download = `foresee-reports-${dayjs().format('YYYY-MM-DD')}.json`;
            document.body.appendChild(jsonA);
            jsonA.click();
            document.body.removeChild(jsonA);
            URL.revokeObjectURL(jsonUrl);

            toast({
                title: "Export Successful",
                description: "Reports have been exported in multiple formats.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export reports. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div>
            <SectionHeader
                icon={Download}
                title="Export Data"
                subtitle="Download Reports"
            />
            <p className="text-xs text-muted-foreground mb-4 -mt-4">
                Download selected reports for sharing, record-keeping, or further analysis.
            </p>
            <div className="grid grid-cols-2 gap-3">
                {isSignedIn ? (
                    <>
                        <Button onClick={handleExportCsv} variant="outline" className="bg-white/40 border-white/60 rounded-xl h-11 hover:bg-white/60 hover:text-primary transition-all font-medium">
                            CSV
                        </Button>
                        <Button onClick={handleExportJson} variant="outline" className="bg-white/40 border-white/60 rounded-xl h-11 hover:bg-white/60 hover:text-primary transition-all font-medium">
                            JSON
                        </Button>
                        <Button onClick={handleExportAll} variant="default" className="col-span-2 shadow-lg shadow-primary/20 rounded-xl h-11 text-white font-semibold tracking-wide hover:opacity-90 transition-all">
                            Download Reports
                        </Button>
                    </>
                ) : (
                    <>
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />
                        <Skeleton className="h-11 w-full rounded-xl col-span-2 bg-gray-200" />
                    </>
                )}
            </div>
        </div>
    );
};
