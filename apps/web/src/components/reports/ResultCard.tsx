
import { motion } from "framer-motion";
import { Trash2, Microscope, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredResult } from "@/lib/types";
import dayjs from "dayjs";

interface ResultCardProps {
    result: StoredResult;
    isSelected: boolean;
    onClick: () => void;
    onDelete: (id: string) => void;
}

export const ResultCard = ({ result, isSelected, onClick, onDelete }: ResultCardProps) => {

    const getResultIcon = (type: string) => {
        return type === 'diagnosis' ? Microscope : TrendingUp;
    };

    const getResultColor = (result: StoredResult) => {
        if (result.type === 'diagnosis') {
            const diagResult = result.result as any;
            if (diagResult.label?.toLowerCase().includes('positive') ||
                diagResult.label?.toLowerCase().includes('high')) {
                return 'destructive';
            }
            return 'default';
        }
        return 'secondary';
    };

    const Icon = getResultIcon(result.type);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
            group relative overflow-hidden p-4 rounded-xl border transition-all duration-300 cursor-pointer
            ${isSelected
                    ? 'bg-primary/5 border-primary/20 shadow-lg'
                    : 'bg-white/40 border-white/60 hover:bg-white/60 hover:border-primary/20 hover:shadow-md'
                }
        `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`
                        p-3 rounded-xl transition-all duration-300
                        ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary shadow-sm group-hover:scale-110'}
                    `}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getResultColor(result) as any} className="text-[10px] uppercase font-bold px-2 py-0.5 h-5">
                                {result.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                                {dayjs(result.timestamp).format('MMM D, YYYY • h:mm A')}
                            </span>
                        </div>
                        <h4 className="font-bold text-foreground/90">
                            {result.type === 'diagnosis'
                                ? `Diagnosis – ${(result.result as any).label || 'Assessment'} Risk`
                                : `Forecast – ${(result.result as any).region || 'Regional'} (${(result.result as any).predictions?.length || 4}-week outlook)`
                            }
                        </h4>
                        <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                            {result.type === 'diagnosis'
                                ? `Symptoms: ${(result.input as any).symptoms?.join(', ') || 'N/A'}`
                                : `Period: ${(result.result as any).predictions?.length || 0} weeks projection`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-start">
                    {isSelected && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(result.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Inline Details for Selected Item */}
            {isSelected && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 pt-4 border-t border-primary/10"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Input Data Section */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Input Data</h5>
                            <div className="space-y-3">
                                {result.type === 'diagnosis' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Age</span>
                                                <p className="font-medium text-sm">{(result.input as any).age || 'N/A'} Years</p>
                                            </div>
                                            <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Region</span>
                                                <p className="font-medium text-sm">{(result.input as any).region || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {(result.input as any).symptoms?.length > 0 && (
                                            <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold block mb-2">Reported Symptoms</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {(result.input as any).symptoms.map((s: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/80 border-primary/10 text-foreground/80">
                                                            {s}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Forecast Input
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Target Region</span>
                                            <p className="font-medium text-sm">{(result.input as any).region}</p>
                                        </div>
                                        <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Horizon</span>
                                            <p className="font-medium text-sm">{(result.input as any).horizon_weeks} Weeks</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Analysis Results Section */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Analysis Results</h5>
                            <div className="space-y-3">
                                {result.type === 'diagnosis' ? (
                                    <>
                                        <div className="bg-white/50 p-3 rounded-lg border border-white/60 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Risk Level</span>
                                                <p className={`font-bold text-sm ${(result.result as any).label?.includes('High') ? 'text-destructive' :
                                                    (result.result as any).label?.includes('Medium') ? 'text-warning' : 'text-success'
                                                    }`}>
                                                    {(result.result as any).label || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Confidence</span>
                                                <p className="font-bold text-sm">{((result.result as any).confidence * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        {(result.result as any).explanations && (
                                            <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 block">Key Findings</span>
                                                <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                                                    {(result.result as any).explanations.slice(0, 3).map((exp: string, i: number) => (
                                                        <li key={i}>{exp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Forecast Output
                                    <>
                                        <div className="bg-white/50 p-3 rounded-lg border border-white/60 mb-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Hotspot Risk Score</span>
                                                <span className={`font-bold text-sm ${((result.result as any).hotspot_score || 0) > 0.7 ? 'text-destructive' :
                                                    ((result.result as any).hotspot_score || 0) > 0.4 ? 'text-warning' : 'text-success'
                                                    }`}>
                                                    {((result.result as any).hotspot_score || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${((result.result as any).hotspot_score || 0) > 0.7 ? 'bg-destructive' :
                                                        ((result.result as any).hotspot_score || 0) > 0.4 ? 'bg-warning' : 'bg-success'
                                                        }`}
                                                    style={{ width: `${Math.min(((result.result as any).hotspot_score || 0) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        {(result.result as any).predictions?.length > 0 && (
                                            <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Projected Case Trend</span>
                                                    <span className="text-[10px] text-muted-foreground">(Next 3 Weeks)</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {(result.result as any).predictions.slice(0, 3).map((p: any, i: number) => (
                                                        <div key={i} className="flex justify-between text-xs items-center">
                                                            <span className="text-foreground/70 font-medium">{p.week}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary/40" style={{ width: `${Math.min((p.cases / 3000000) * 100, 100)}%` }}></div>
                                                                </div>
                                                                <span className="font-mono font-medium min-w-[60px] text-right">{p.cases.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
