
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Database } from "lucide-react";
import { StoredResult } from "@/lib/types";
import { ResultCard } from "./ResultCard";

interface ReportsListProps {
    results: StoredResult[];
    isSignedIn: boolean;
    selectedResult: StoredResult | null;
    setSelectedResult: (result: StoredResult | null) => void;
    onDelete: (id: string) => void;
}

export const ReportsList = ({
    results,
    isSignedIn,
    selectedResult,
    setSelectedResult,
    onDelete
}: ReportsListProps) => {

    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 6;
    const totalPages = Math.ceil(results.length / resultsPerPage);

    // Reset page when results change (e.g. filter)
    useEffect(() => {
        setCurrentPage(1);
    }, [results]);

    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const currentResults = results.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    return (
        <div className="h-full flex flex-col min-h-[600px]">
            <div className="space-y-1 mb-6 shrink-0">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        icon={Database}
                        title="Results History"
                        subtitle="Stored Records"
                    />
                    {isSignedIn && results.length > 0 && (
                        <div className="text-right mb-6">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                {results.length} Result{results.length !== 1 ? 's' : ''} Found
                            </Badge>
                        </div>
                    )}
                </div>

                <p className="text-sm text-foreground/60 ml-1">
                    Open any report to review risk levels, trends, and supporting details from that assessment.
                </p>
            </div>

            <div className="flex-1 space-y-4">
                {!isSignedIn ? (
                    // Dummy Skeleton List for Unauthenticated State
                    <div className="grid gap-3">
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className="bg-white/40 border border-white/60 p-4 rounded-xl flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl bg-gray-200" />
                                <div className="space-y-2 flex-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-32 bg-gray-200" />
                                        <Skeleton className="h-4 w-20 bg-gray-200" />
                                    </div>
                                    <Skeleton className="h-5 w-3/4 bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] border-2 border-dashed border-primary/10 rounded-[24px]">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-primary/40" />
                        </div>
                        <h4 className="text-sm font-semibold text-primary">No Records Found</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">
                            Try adjusting search terms or filters to find what you're looking for.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {currentResults.map((result) => (
                            <ResultCard
                                key={result.id}
                                result={result}
                                isSelected={selectedResult?.id === result.id}
                                onClick={() => setSelectedResult(result)}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {isSignedIn && totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-2 border-t border-primary/10 pt-4">
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">Showing the most recent results first</p>
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium"
                        >
                            <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                        </Button>
                        <span className="text-xs text-foreground/50 font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium"
                        >
                            Next <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
