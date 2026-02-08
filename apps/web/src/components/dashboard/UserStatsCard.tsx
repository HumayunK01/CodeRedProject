
import { useState, useEffect } from "react";
import { Loader2, Database, Microscope, TrendingUp, FileText, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { DiagnosisService, ForecastService } from "@/lib/db";

export const UserStatsCard = () => {
    const { userWithStats, isSignedIn, isLoading } = useCurrentUser();
    const [dbStats, setDbStats] = useState<{
        diagnosisCount: number;
        forecastCount: number;
        lastActivity: string | null;
    } | null>(null);

    useEffect(() => {
        const fetchUserDbStats = async () => {
            if (!userWithStats?.clerkId) return;

            try {
                const [diagStats, forecastStats] = await Promise.all([
                    DiagnosisService.getStatsByClerkId(userWithStats.clerkId),
                    ForecastService.getStatsByClerkId(userWithStats.clerkId),
                ]);

                const lastDiag = diagStats?.lastDiagnosis;
                const lastForc = forecastStats?.lastForecast;
                let lastActivity = null;

                if (lastDiag && lastForc) {
                    lastActivity = new Date(lastDiag) > new Date(lastForc)
                        ? new Date(lastDiag).toLocaleDateString()
                        : new Date(lastForc).toLocaleDateString();
                } else if (lastDiag) {
                    lastActivity = new Date(lastDiag).toLocaleDateString();
                } else if (lastForc) {
                    lastActivity = new Date(lastForc).toLocaleDateString();
                }

                setDbStats({
                    diagnosisCount: diagStats?.total || 0,
                    forecastCount: forecastStats?.total || 0,
                    lastActivity,
                });
            } catch (error) {
                console.error("Failed to fetch user DB stats:", error);
            }
        };

        if (isSignedIn) {
            fetchUserDbStats();
        }
    }, [userWithStats?.clerkId, isSignedIn]);

    if (!isSignedIn) {
        return (
            <DashboardContainer className="bg-white/90 p-6 lg:p-8">
                <SectionHeader
                    icon={Database}
                    title="Your Synced Data"
                    subtitle="Cloud Storage"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 flex flex-col items-center justify-center gap-2">
                            <Skeleton className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="text-center space-y-1 mt-1">
                                <Skeleton className="h-8 w-12 mx-auto bg-gray-200" />
                                <Skeleton className="h-3 w-16 mx-auto bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-primary/5">
                    <Skeleton className="h-3 w-40 bg-gray-200" />
                </div>
            </DashboardContainer>
        );
    }

    if (isLoading) {
        return (
            <DashboardContainer className="bg-white/90 p-8 flex items-center justify-center gap-3 min-h-[160px]">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-primary/80">Syncing your data...</span>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer className="bg-white/90 p-6 lg:p-8">
            <SectionHeader
                icon={Database}
                title="Your Synced Data"
                subtitle="Cloud Storage"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Diagnoses */}
                <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Microscope className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{dbStats?.diagnosisCount || userWithStats?._count?.diagnoses || 0}</p>
                        <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Diagnoses</p>
                    </div>
                </div>

                {/* Forecasts */}
                <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <TrendingUp className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{dbStats?.forecastCount || userWithStats?._count?.forecasts || 0}</p>
                        <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Forecasts</p>
                    </div>
                </div>

                {/* Reports */}
                <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <FileText className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{userWithStats?._count?.reports || 0}</p>
                        <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Reports</p>
                    </div>
                </div>
            </div>

            {dbStats?.lastActivity && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-primary/5">
                    <Clock className="h-3 w-3 text-foreground/40" />
                    <p className="text-xs text-foreground/50 font-medium tracking-wide">Last activity: {dbStats.lastActivity}</p>
                </div>
            )}
        </DashboardContainer>
    );
};
