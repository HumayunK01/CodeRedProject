import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function ClinicalAdvisory() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mx-2 mt-6 relative"
        >
            <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-r from-amber-50/90 via-white/80 to-amber-50/90 p-[1px] shadow-sm dark:border-amber-500/10 dark:from-amber-950/20 dark:via-neutral-900/40 dark:to-amber-950/20">

                {/* Shimmer Effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-20"
                    animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    style={{ backgroundSize: '200% 100%' }}
                />

                <div className="relative flex flex-row items-start md:items-center gap-3 md:gap-4 rounded-[15px] bg-white/40 dark:bg-black/20 p-3 md:px-5 md:py-4">

                    {/* Icon Section */}
                    <div className="shrink-0 relative">
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-[3000ms]" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-amber-100 to-white shadow-sm ring-1 ring-amber-200/60 dark:from-amber-900/40 dark:to-black dark:ring-amber-500/20">
                            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700/90 dark:text-amber-400">
                                Clinical Disclaimer
                            </h4>
                        </div>

                        <p className="text-sm font-medium leading-relaxed text-neutral-600 dark:text-neutral-400">
                            This <span className="text-foreground/90 font-semibold">AI-powered assessment</span> is for decision support only and must <span className="underline decoration-amber-500/30 underline-offset-2">not</span> replace professional diagnosis. Always consult healthcare providers for medical decisions.
                        </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-3xl -mr-4 -mt-4 pointer-events-none" />
                </div>
            </div>
        </motion.div>
    );
}
