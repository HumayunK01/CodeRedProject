
import { Microscope, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const ActivityLogItem = ({ activity }: { activity: any }) => (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-all cursor-default group">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 text-primary border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
            {activity.type === 'diagnosis' ? <Microscope className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate group-hover:translate-x-1 transition-transform duration-500">{activity.title}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-foreground/50 uppercase font-semibold tracking-widest leading-none">{activity.time}</span>
                <span className="h-0.5 w-0.5 rounded-full bg-primary/20"></span>
                <span className="text-[11px] text-foreground/50 uppercase font-semibold tracking-widest leading-none">{activity.type}</span>
            </div>
        </div>
        <Badge className={`rounded-lg px-3 h-6 text-[9px] font-medium uppercase border-none shadow-sm ${activity.result === 'Critical' ? 'bg-rose-500 text-white' : 'bg-primary/10 text-primary'}`}>
            {activity.result}
        </Badge>
    </div>
);

export const ActivityLogItemSkeleton = () => (
    <div className="flex items-center gap-4 px-6 py-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
);
