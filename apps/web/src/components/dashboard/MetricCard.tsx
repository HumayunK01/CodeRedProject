
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkline } from "@/components/ui/sparkline";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const MetricCard = ({ stat }: { stat: any }) => {
    const Icon = stat.icon;
    return (
        <Card className="bg-white/40 backdrop-blur-md border border-white/60 shadow-none hover:shadow-lg hover:-translate-y-0.5 rounded-[20px] group transition-all duration-400 overflow-hidden">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="h-4 w-4 text-primary group-hover:text-white" />
                </div>
                <Badge variant="secondary" className="text-[9px] px-2 py-0 h-5 font-bold bg-white/50 text-primary border border-primary/5">
                    {stat.change}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div>
                    <p className="text-[11px] text-foreground/60 uppercase tracking-widest font-semibold mb-1">{stat.title}</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-bold tracking-tight text-primary">
                            {stat.value}
                            <span className="text-sm ml-0.5 text-primary/40 font-semibold">{stat.suffix}</span>
                        </h3>
                        <div className="h-6 w-16 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Sparkline data={stat.sparklineData} color="hsl(var(--primary))" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-primary/5">
                        <span className="text-[11px] text-foreground/60 font-semibold">{stat.source === 'db' ? 'YOUR DATA' : 'RELIABILITY'}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-foreground/20 hover:text-primary cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px] bg-primary text-white border-none rounded-xl">
                                {stat.tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const MetricCardSkeleton = () => (
    <Card className="bg-white/40 backdrop-blur-md border border-white/60 shadow-none rounded-[20px] overflow-hidden">
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-xl bg-primary/5" />
            <Skeleton className="h-5 w-12 rounded-full" />
        </CardHeader>
        <CardContent className="p-4 pt-2">
            <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <div className="flex items-end justify-between">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <div className="mt-3 pt-2 border-t border-primary/5">
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </CardContent>
    </Card>
);
