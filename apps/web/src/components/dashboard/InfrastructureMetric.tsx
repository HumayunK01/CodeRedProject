
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const InfrastructureMetric = ({ metric }: { metric: any }) => (
    <div className="flex items-center justify-between p-5 rounded-[20px] bg-white/50 backdrop-blur-sm border border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all group">
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                <metric.icon className="h-5 w-5 text-primary stroke-[1.5]" />
            </div>
            <div>
                <p className="text-xs text-foreground/50 uppercase tracking-widest font-semibold mb-0.5">{metric.title}</p>
                <p className="text-xl font-bold text-primary leading-none">{metric.value}</p>
            </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] px-2 h-5 rounded-md font-medium uppercase tracking-widest border border-primary/10">
            {metric.status}
        </Badge>
    </div>
);

export const InfrastructureMetricSkeleton = () => (
    <div className="flex items-center justify-between p-5 rounded-[20px] bg-white/50 backdrop-blur-sm border border-primary/5">
        <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-12" />
            </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-md" />
    </div>
);
