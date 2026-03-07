
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Search, Database, ChevronDown, Loader2 } from "lucide-react";
import { StoredResult } from "@/lib/types";
import { ResultCard } from "./ResultCard";

interface ReportsListProps {
    results: StoredResult[];
    isSignedIn: boolean;
    /** True while the very first page is being fetched */
    isLoading?: boolean;
    /** True while a subsequent "load more" page is being fetched */
    isLoadingMore?: boolean;
    /** Whether more records exist on the server */
    hasMore?: boolean;
    /** Callback to load the next page */
    onLoadMore?: () => void;
    selectedResult: StoredResult | null;
    setSelectedResult: (result: StoredResult | null) => void;
    onDelete: (id: string) => void;
}

export const ReportsList = ({
    results,
    isSignedIn,
    isLoading = false,
    isLoadingMore = false,
    hasMore = false,
    onLoadMore,
    selectedResult,
    setSelectedResult,
    onDelete,
}: ReportsListProps) => {

    // Reset selection when results change
    useEffect(() => {
        setSelectedResult(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results.length]);

    return (
        <div className="h-full flex flex-col min-h-[600px]">
            {/* Header row */}
            <div className="space-y-1 mb-6 shrink-0">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        icon={Database}
                        title="Results History"
                        subtitle="Stored Records"
                    />
                    {isSignedIn && !isLoading && results.length > 0 && (
                        <div className="text-right mb-6">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                                {results.length} Result{results.length !== 1 ? "s" : ""} Loaded
                            </Badge>
                        </div>
                    )}
                </div>
                <p className="text-sm text-foreground/60 ml-1">
                    Open any report to review risk levels, trends, and supporting details from that assessment.
                </p>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4">
                {/* Skeleton — shown while auth resolves or first page is loading */}
                {(!isSignedIn || isLoading) ? (
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
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px] border-2 border-dashed border-primary/10 rounded-[24px]">
                        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-primary/40" />
                        </div>
                        <h4 className="text-sm font-semibold text-primary">No Records Found</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">
                            Try adjusting search terms or filters to find what you&apos;re looking for.
                        </p>
                    </div>
                ) : (
                    /* Results list */
                    <div className="grid gap-3">
                        {results.map((result) => (
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

            {/* Load More / loading-more indicator */}
            {isSignedIn && !isLoading && (hasMore || isLoadingMore) && (
                <div className="mt-6 flex flex-col items-center gap-2 border-t border-primary/10 pt-4">
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                        Showing most recent results first
                    </p>
                    <Button
                        onClick={onLoadMore}
                        disabled={isLoadingMore || !hasMore}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/20 text-primary hover:bg-primary/5 text-xs font-medium min-w-[160px]"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                Loading more…
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3 w-3 mr-1.5" />
                                Load more records
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};
