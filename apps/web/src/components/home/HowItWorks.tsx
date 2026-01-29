import { motion } from "framer-motion";
import { steps } from "@/data/landing-page";

export const HowItWorks = () => {
    return (

        <section className="section-inset section-light bg-white border border-border/50 mt-2 relative overflow-hidden py-24">
            <div className="container-saas px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-6 shadow-sm">
                        How Foresee Works
                    </span>
                    <h2 className="text-3xl md:text-5xl font-normal text-foreground tracking-tight">
                        Fast - Accurate - Secure
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-16 md:gap-12 relative max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            viewport={{ once: true, amount: 0.4, margin: "-50px" }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Arrow between steps */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-4 left-[55%] lg:left-[60%] w-full h-24 z-0 pointer-events-none opacity-80 md:scale-125 lg:scale-150">
                                    <img
                                        src="/arrow.svg"
                                        alt="arrow"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            <div className="mb-4 relative">
                                <span className="text-[42px] md:text-[84px] leading-none font-light text-primary font-serif">
                                    {step.step}
                                </span>
                            </div>

                            <div className="space-y-4 max-w-sm relative z-10 px-4">
                                <h3 className="text-2xl font-medium text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
