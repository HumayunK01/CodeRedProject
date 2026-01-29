import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/landing-page";

export const Testimonials = () => {
    return (
        <section className="section-inset section-light bg-white border border-border/50 mt-2 overflow-hidden py-24">
            <div className="container-saas relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.4, margin: "-50px" }}
                    className="text-center mb-10"
                >
                    <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-primary uppercase mb-6 shadow-sm">
                        What Clients Say
                    </span>
                    <h2 className="text-3xl md:text-5xl font-normal text-foreground tracking-tight">
                        Real Stories, Real Impact
                    </h2>
                </motion.div>

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden mask-gradient-x">
                    {/* Gradient Masks */}
                    <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div className="flex w-max animate-marquee space-x-8 hover:[animation-play-state:paused] py-4">
                        {/* Duplicate lists for seamless looping (4 sets to ensure coverage on wide screens) */}
                        {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                            <motion.div
                                key={`${testimonial.name}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index % testimonials.length) * 0.15, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="w-[350px] md:w-[400px] flex-shrink-0 bg-white rounded-[24px] p-8 border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="text-2xl md:text-3xl text-primary leading-none font-serif tracking-widest pt-2">
                                        *****
                                    </div>

                                    <p className="text-base text-foreground/80 leading-relaxed font-normal">
                                        "{testimonial.content}" <span className="font-normal text-foreground/80 whitespace-nowrap">— {testimonial.name}</span>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
