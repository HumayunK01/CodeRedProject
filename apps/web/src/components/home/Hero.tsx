
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Microscope, TrendingUp, ArrowRight, Zap } from "lucide-react";

export const Hero = () => {
    return (
        <section className="mx-2 mt-4 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3 h-auto lg:h-[calc(100vh-6rem)] w-full">
                {/* Left Card: Content */}
                <div className="relative px-6 py-12 lg:p-16 rounded-[24px] bg-white shadow-sm border border-border/50 overflow-hidden flex flex-col justify-center order-2 lg:order-1">
                    {/* Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-60"></div>

                    <div className="relative z-10 max-w-2xl mx-auto lg:mx-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-left space-y-8"
                        >
                            <div className="space-y-6">
                                <motion.h1
                                    className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.1]"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    Foresee
                                    <br />
                                    <span className="text-primary">
                                        Medical Intelligence
                                    </span>
                                </motion.h1>

                                <motion.div
                                    className="space-y-4 max-w-xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                                >
                                    <p className="text-lg md:text-2xl text-primary/80 font-medium tracking-wide">
                                        Diagnose Today, Predict Tomorrow.
                                    </p>
                                    <p className="text-sm md:text-lg text-muted-foreground/80 leading-relaxed">
                                        Advanced epidemiological implementation for predictive healthcare analysis.
                                        Translate complex medical data into actionable foresight with our
                                        neuro-symbolic AI engine.
                                    </p>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row gap-4 justify-start items-center"
                            >
                                <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg btn-medical group shadow-medical-lg w-full sm:w-auto">
                                    <Link to="/diagnosis">
                                        <Microscope className="mr-2 h-5 w-5" />
                                        Start Diagnosis
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-primary/30 hover:bg-primary/5 backdrop-blur-sm w-full sm:w-auto">
                                    <Link to="/forecast">
                                        <TrendingUp className="mr-2 h-5 w-5" />
                                        View Forecasts
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Card: Hero Image */}
                <motion.div
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
                    className="relative min-h-[400px] lg:h-full rounded-[24px] overflow-hidden order-1 lg:order-2"
                >
                    <div className="absolute inset-0 bg-black/10 z-10"></div>
                    <img
                        src="/hero-image.png"
                        alt="Medical Professional using Foresee AI"
                        className="w-full h-full object-cover"
                    />

                    {/* Floating Card 2: Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="absolute bottom-4 right-4 lg:bottom-12 lg:right-8 z-20 bg-white/95 backdrop-blur-md p-3 lg:p-4 rounded-2xl shadow-xl border border-white/50 max-w-[150px] lg:max-w-[200px] hidden sm:block"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                            <p className="text-[10px] lg:text-xs font-semibold text-foreground">Live Monitoring</p>
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-primary rounded-full"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Analysis</span>
                                <span>Processing...</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Avatars Cutout - Bottom Left */}
                    <div className="absolute bottom-0 left-0 z-30 bg-background rounded-tr-[32px] pt-2 pr-4 pb-0 pl-0">
                        {/* Top Connector */}
                        <div className="absolute -top-6 left-0 w-6 h-6 bg-transparent" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, transparent 24px, hsl(var(--background)) 25px)' }}></div>

                        {/* Right Connector */}
                        <div className="absolute bottom-0 -right-6 w-6 h-6 bg-transparent" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, transparent 24px, hsl(var(--background)) 25px)' }}></div>

                        <div className="flex -space-x-3 pl-4 pb-4 lg:pl-6 lg:pb-6 pt-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full border-[3px] border-background bg-gray-200 overflow-hidden`}>
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                </div>
                            ))}
                            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-[3px] border-background bg-primary text-white flex items-center justify-center text-xs lg:text-base font-bold">
                                2k+
                            </div>
                        </div>
                    </div>

                    {/* Floating Card 3: Feature Tag */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20 bg-white text-foreground px-3 py-2 lg:px-4 lg:py-2 rounded-full shadow-xl border border-gray-100 flex items-center gap-2"
                    >
                        <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs lg:text-sm font-semibold">Real-time Insights</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
