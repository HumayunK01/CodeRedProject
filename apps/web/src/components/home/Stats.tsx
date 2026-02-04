import { motion } from "framer-motion";

export const Stats = () => {
    return (
        <section className="section-inset section-dark mt-2 py-20 overflow-hidden">
            <div className="container-saas">
                <div className="mb-16 max-w-4xl mx-auto flex flex-col items-center">
                    {/* Badge Mask */}
                    <div className="overflow-hidden mb-4">
                        <motion.div
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block py-2 px-5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-white uppercase shadow-sm">
                                Why Foresee
                            </span>
                        </motion.div>
                    </div>

                    {/* Title Mask */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight text-center">
                                Core features that set us apart from the competition
                            </h2>
                        </motion.div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 relative">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        <FeatureCard
                            imageSrc="/chart.png"
                            title="Real-time analytics"
                            description="Gain actionable insights into disease spread with our advanced real-time analytics engine."
                            delay={0.1}
                        />
                        <FeatureCard
                            imageSrc="/mobile.png"
                            title="Mobile accessibility"
                            description="Access critical data and manage alerts on the go with our fully responsive platform."
                            delay={0.25}
                        />
                    </div>

                    {/* Middle Column - Image */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        whileInView={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.4 }}
                        className="h-[500px] lg:h-auto rounded-[32px] overflow-hidden relative"
                    >
                        <img
                            src="/stats-feature.png"
                            alt="Medical Professional"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        <FeatureCard
                            imageSrc="/report.png"
                            title="Customizable reports"
                            description="Streamline your reporting process with automated, compliant documentation workflows."
                            delay={0.4}
                        />
                        <FeatureCard
                            imageSrc="/shield.png"
                            title="Enhanced security"
                            description="Protect sensitive patient data with our state-of-the-art HIPAA compliant security measures."
                            delay={0.55}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon: Icon, imageSrc, title, description, delay = 0 }: { icon?: any, imageSrc?: string, title: string, description: string, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
            className="group relative overflow-hidden bg-gradient-to-br from-[#10392F] to-[#0A261F] border border-white/10 rounded-[28px] p-8 flex flex-col items-start gap-5 h-full min-h-[260px] hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1 transition-all duration-300"
        >
            {/* Subtle glow effect behind the icon */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500" />

            <div className="relative z-10">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-16 h-16 object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        {Icon && <Icon className="h-6 w-6 text-primary" />}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-emerald-50 transition-colors">
                    {title}
                </h3>
                <p className="text-emerald-100/70 leading-relaxed text-base">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
