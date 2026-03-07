
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";
import { StoredResult } from "@/lib/types";
import dayjs from "dayjs";

interface ReportsExportProps {
    isSignedIn: boolean;
    /** Live results from the database (used for export) */
    results?: StoredResult[];
}

export const ReportsExport = ({ isSignedIn, results = [] }: ReportsExportProps) => {
    const { toast } = useToast();

    const exportToCsv = (): string => {
        if (results.length === 0) return "No data to export";
        const headers = ["ID", "Type", "Timestamp", "Input", "Result"];
        const rows = results.map(r => [
            r.id,
            r.type,
            r.timestamp,
            JSON.stringify(r.input),
            JSON.stringify(r.result),
        ]);
        return [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const exportToJson = (): string => JSON.stringify(results, null, 2);

    const download = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const dateSuffix = dayjs().format("YYYY-MM-DD");

    const handleExportCsv = () => {
        try {
            download(exportToCsv(), `foresee-reports-${dateSuffix}.csv`, "text/csv");
            toast({ title: "Export Successful", description: "Reports exported to CSV." });
        } catch {
            toast({ title: "Export Failed", description: "Failed to export CSV.", variant: "destructive" });
        }
    };

    const handleExportJson = () => {
        try {
            download(exportToJson(), `foresee-reports-${dateSuffix}.json`, "application/json");
            toast({ title: "Export Successful", description: "Reports exported to JSON." });
        } catch {
            toast({ title: "Export Failed", description: "Failed to export JSON.", variant: "destructive" });
        }
    };

    const handleExportAll = () => {
        try {
            download(exportToCsv(), `foresee-reports-${dateSuffix}.csv`, "text/csv");
            download(exportToJson(), `foresee-reports-${dateSuffix}.json`, "application/json");
            toast({ title: "Export Successful", description: "Reports exported in multiple formats." });
        } catch {
            toast({ title: "Export Failed", description: "Failed to export reports.", variant: "destructive" });
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
                Download your records for sharing, record-keeping, or further analysis.
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
                            Download All
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
