
import { Database, Calendar, Microscope, TrendingUp, BarChart3 } from "lucide-react";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { StoredResult } from "@/lib/types";

interface ReportsStatsProps {
    results: StoredResult[];
    isSignedIn: boolean;
}

export const ReportsStats = ({ results, isSignedIn }: ReportsStatsProps) => {

    const stats = [
        {
            title: "Total Records",
            value: results.length,
            icon: Database,
            color: "text-primary"
        },
        {
            title: "This Month",
            value: results.filter(r => dayjs(r.timestamp).isAfter(dayjs().subtract(1, 'month'))).length,
            icon: Calendar,
            color: "text-accent"
        },
        {
            title: "Diagnosis Results",
            value: results.filter(r => r.type === 'diagnosis').length,
            icon: Microscope,
            color: "text-success"
        },
        {
            title: "Forecast Reports",
            value: results.filter(r => r.type === 'forecast').length,
            icon: TrendingUp,
            color: "text-warning"
        }
    ];

    return (
        <div>
            <SectionHeader
                icon={BarChart3}
                title="Data Overview"
                subtitle="Archive Statistics"
            />
            <p className="text-xs text-muted-foreground mb-4 -mt-4">
                A summary of all stored assessments and forecasts for quick reference.
            </p>
            <div className="grid grid-cols-2 gap-4">
                {isSignedIn ? stats.map((stat, i) => (
                    <div key={i} className="bg-white/40 backdrop-blur-sm border border-white/60 p-4 rounded-xl text-center hover:bg-white/60 transition-colors duration-300 group">
                        <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} opacity-80 group-hover:opacity-100 transition-all`} strokeWidth={1.5} />
                        <p className="text-xs uppercase font-bold text-foreground/60 mb-1 tracking-wider">{stat.title}</p>
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </div>
                )) : (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/40 border border-white/60 p-4 rounded-xl text-center">
                            <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-lg bg-gray-200" />
                            <Skeleton className="h-3 w-20 mx-auto mb-2 bg-gray-200" />
                            <Skeleton className="h-6 w-12 mx-auto bg-gray-200" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
