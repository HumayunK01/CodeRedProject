
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";

interface ReportsFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    isSignedIn: boolean;
    onFilterChange: () => void;
}

export const ReportsFilters = ({
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    isSignedIn,
    onFilterChange
}: ReportsFiltersProps) => {

    return (
        <div>
            <SectionHeader
                icon={Filter}
                title="Search & Filter"
                subtitle="Find Records"
            />
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Search</label>
                    {isSignedIn ? (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by region, symptoms, or date..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    onFilterChange();
                                }}
                                className="pl-9 bg-white/50 border-white/40 h-11 rounded-xl focus-visible:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    ) : <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Record Type</label>
                    <p className="text-[10px] text-muted-foreground">Filter results by diagnosis or forecast reports.</p>
                    {isSignedIn ? (
                        <Select value={typeFilter} onValueChange={(value) => {
                            setTypeFilter(value);
                            onFilterChange();
                        }}>
                            <SelectTrigger className="bg-white/50 border-white/40 h-11 rounded-xl focus:ring-primary/20 transition-all font-medium">
                                <SelectValue placeholder="All Results" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Results</SelectItem>
                                <SelectItem value="diagnosis">Diagnosis Only</SelectItem>
                                <SelectItem value="forecast">Forecasts Only</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : <Skeleton className="h-11 w-full rounded-xl bg-gray-200" />}
                </div>
            </div>
        </div>
    );
};
