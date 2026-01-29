import { motion } from "framer-motion";
import { BarChart3, FileText, Smartphone, ShieldCheck } from "lucide-react";

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
                            icon={BarChart3}
                            title="Real-time analytics"
                            description="Gain actionable insights into disease spread with our advanced real-time analytics engine."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Smartphone}
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
                            icon={FileText}
                            title="Customizable reports"
                            description="Streamline your reporting process with automated, compliant documentation workflows."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
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

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
            className="bg-[#1A4D3F] border border-white/5 rounded-[24px] p-8 flex flex-col items-start gap-6 h-full min-h-[240px] hover:bg-[#1A4D3FCC] transition-colors duration-300"
            style={{ backgroundColor: 'hsl(166 60% 18%)' }}
        >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-white/70 leading-relaxed text-lg">
                <span className="font-bold text-white block mb-2">{title}</span>
                {description}
            </p>
        </motion.div>
    );
}
