import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Activity, Phone } from "lucide-react";
import { featureHeadline } from "@/data/landing-page";

export const Features = () => {
    return (
        <section className="section-inset section-dark mt-2 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-light/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

            <div className="container-saas relative z-10 flex flex-col items-center justify-center min-h-[300px] py-16">
                <div className="flex flex-col gap-2 md:gap-4 items-center">
                    {/* Line 1 */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <p className="text-3xl md:text-5xl font-normal leading-tight text-white/90 tracking-tight flex flex-wrap items-center justify-center gap-3 md:gap-4">
                                <span>{featureHeadline.part1}</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 align-middle backdrop-blur-sm shadow-2xl">
                                    <Brain className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                                </span>
                                <span>{featureHeadline.part2}</span>
                            </p>
                        </motion.div>
                    </div>

                    {/* Line 2 */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.15 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <p className="text-3xl md:text-5xl font-normal leading-tight text-white/90 tracking-tight flex flex-wrap items-center justify-center gap-3 md:gap-4">
                                <span>{featureHeadline.part3}</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 align-middle backdrop-blur-sm shadow-2xl">
                                    <Activity className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                                </span>
                                <span>{featureHeadline.part4}</span>
                                <span className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 align-middle backdrop-blur-sm shadow-2xl">
                                    <Phone className="w-5 h-5 md:w-8 md:h-8 text-accent" />
                                </span>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
