
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ActionItem = ({ to, title, desc, icon: Icon, color }: { to: string, title: string, desc: string, icon: any, color: string }) => (
    <Link to={to} className="group/item">
        <div className="h-full p-6 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-400 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${color} border transition-all duration-500 group-hover/item:scale-110 shadow-sm`}>
                <Icon className="h-6 w-6 stroke-2" />
            </div>
            <div className="space-y-1">
                <h4 className="font-semibold text-sm text-primary tracking-tight">{title}</h4>
                <p className="text-xs text-foreground/60 font-semibold uppercase tracking-widest">{desc}</p>
            </div>
            <div className="mt-0 p-1.5 rounded-full bg-primary/5 group-hover/item:bg-primary transition-colors">
                <ArrowRight className="h-3 w-3 text-primary group-hover/item:text-white" />
            </div>
        </div>
    </Link>
);

export const ActionItemSkeleton = () => (
    <div className="h-full p-6 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 flex flex-col items-center text-center gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
    </div>
);
