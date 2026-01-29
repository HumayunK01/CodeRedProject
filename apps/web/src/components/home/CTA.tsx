
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Microscope, ArrowRight } from "lucide-react";

export const CTA = () => {
    return (
        <section className="section-inset section-light bg-white border border-border/50 mt-2 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.4, margin: "-50px" }}
                    className="space-y-6 md:space-y-8"
                >
                    <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-foreground uppercase shadow-sm">
                        YOUR NEW BEGINNING
                    </span>

                    <h2 className="text-3xl md:text-5xl font-normal text-foreground tracking-tight px-2">
                        Take the First Step Toward the Life You Deserve
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto"
                >
                    <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg btn-medical group shadow-medical-lg w-full sm:w-auto">
                        <Link to="/diagnosis">
                            <Microscope className="mr-2 h-5 w-5" />
                            Start Free Diagnosis
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};
