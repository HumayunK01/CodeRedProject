
import { motion } from "framer-motion";
import { Trash2, Microscope, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredResult, DiagnosisResult, ForecastResult, SymptomsInput, ForecastInput } from "@/lib/types";
import dayjs from "dayjs";

interface ResultCardProps {
    result: StoredResult;
    isSelected: boolean;
    onClick: () => void;
    onDelete: (id: string) => void;
}

export const ResultCard = ({ result, isSelected, onClick, onDelete }: ResultCardProps) => {
    // Type-narrowed accessors
    const isDiagnosis = result.type === 'diagnosis';
    const diagResult = result.result as DiagnosisResult;
    const forecastResult = result.result as ForecastResult;
    const symptomsInput = result.input as SymptomsInput;
    const forecastInput = result.input as ForecastInput;

    // Helper to normalize symptoms from Array or Object (DB format)
    const rawSymptoms = isDiagnosis ? symptomsInput.symptoms : null;
    const symptomsList: string[] = Array.isArray(rawSymptoms)
        ? rawSymptoms
        : (typeof rawSymptoms === 'object' && rawSymptoms !== null)
            ? Object.entries(rawSymptoms)
                .filter(([, v]) => v && v !== 'None' && v !== 0 && v !== false)
                .map(([k, v]) => {
                    const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    return v === true ? label : `${label}: ${v}`;
                })
            : [];

    const getResultIcon = (type: string) => {
        return type === 'diagnosis' ? Microscope : TrendingUp;
    };

    const getResultColor = (result: StoredResult): "default" | "destructive" | "secondary" => {
        if (result.type === 'diagnosis') {
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
                            <Badge variant={getResultColor(result)} className="text-[10px] uppercase font-bold px-2 py-0.5 h-5">
                                {result.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium">
                                {dayjs(result.timestamp).format('MMM D, YYYY • h:mm A')}
                            </span>
                        </div>
                        <h4 className="font-bold text-foreground/90">
                            {isDiagnosis
                                ? `Diagnosis – ${diagResult.label || 'Assessment'} Risk`
                                : `Forecast – ${forecastResult.region || 'Regional'} (${forecastResult.predictions?.length || 4}-week outlook)`
                            }
                        </h4>
                        {result.type === 'diagnosis' && symptomsList.length > 0 && (
                            <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                                Symptoms: {symptomsList.join(', ')}
                            </p>
                        )}
                        {result.type === 'forecast' && (
                            <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                                Period: {forecastResult.predictions?.length || 0} weeks projection
                            </p>
                        )}
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
                        {/* Input Data Section - Only show if there's actual data */}
                        {(result.type === 'forecast' ||
                            (isDiagnosis && (symptomsInput.age || symptomsInput.region || symptomsInput.symptoms))) && (
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Input Data</h5>
                                    <div className="space-y-3">
                                        {isDiagnosis ? (
                                            <>
                                                {/* Only show Age and Region if they have actual values (not for image-based diagnosis) */}
                                                {(symptomsInput.age || symptomsInput.region) && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {symptomsInput.age && (
                                                            <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Age</span>
                                                                <p className="font-medium text-sm">{symptomsInput.age} Years</p>
                                                            </div>
                                                        )}
                                                        {symptomsInput.region && (
                                                            <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Region</span>
                                                                <p className="font-medium text-sm">{symptomsInput.region}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {symptomsList.length > 0 && (
                                                    <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                        <span className="text-[10px] uppercase text-muted-foreground font-bold block mb-2">Reported Symptoms</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {symptomsList.map((s: string, i: number) => (
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
                                                    <p className="font-medium text-sm">{forecastInput.region}</p>
                                                </div>
                                                <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Horizon</span>
                                                    <p className="font-medium text-sm">{forecastInput.horizon_weeks} Weeks</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Analysis Results Section */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-primary tracking-wide">Analysis Results</h5>
                            <div className="space-y-3">
                                {isDiagnosis ? (
                                    <>
                                        <div className="bg-white/50 p-3 rounded-lg border border-white/60 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Risk Level</span>
                                                <p className={`font-bold text-sm ${diagResult.label?.includes('High') ? 'text-destructive' :
                                                    diagResult.label?.includes('Medium') ? 'text-warning' : 'text-success'
                                                    }`}>
                                                    {diagResult.label || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Confidence</span>
                                                <p className="font-bold text-sm">{((diagResult.confidence ?? 0) * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        {diagResult.explanations && (
                                            <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold mb-2 block">Key Findings</span>
                                                <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                                                    {Object.values(diagResult.explanations).filter(Boolean).slice(0, 3).map((exp, i: number) => (
                                                        <li key={i}>{String(exp)}</li>
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
                                                <span className={`font-bold text-sm ${(forecastResult.hotspot_score ?? 0) > 0.7 ? 'text-destructive' :
                                                    (forecastResult.hotspot_score ?? 0) > 0.4 ? 'text-warning' : 'text-success'
                                                    }`}>
                                                    {(forecastResult.hotspot_score ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${(forecastResult.hotspot_score ?? 0) > 0.7 ? 'bg-destructive' :
                                                        (forecastResult.hotspot_score ?? 0) > 0.4 ? 'bg-warning' : 'bg-success'
                                                        }`}
                                                    style={{ width: `${Math.min((forecastResult.hotspot_score ?? 0) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        {forecastResult.predictions?.length > 0 && (
                                            <div className="bg-white/50 p-3 rounded-lg border border-white/60">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Projected Case Trend</span>
                                                    <span className="text-[10px] text-muted-foreground">(Next 3 Weeks)</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {forecastResult.predictions.slice(0, 3).map((p, i: number) => (
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
