import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Microscope,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Activity,
  Brain,
  Users,
  Award,
  CheckCircle,
  Star,
  Clock,
  MapPin
} from "lucide-react";

const Home = () => {
  const features = [
    {
      title: "AI-Powered Diagnosis",
      description: "Advanced machine learning algorithms analyze blood smear images and symptom patterns for accurate malaria detection.",
      icon: Microscope,
      color: "text-primary",
      link: "/diagnosis"
    },
    {
      title: "Outbreak Forecasting",
      description: "Predict malaria outbreaks with temporal analysis and regional risk assessment using epidemiological data.",
      icon: TrendingUp,
      color: "text-accent",
      link: "/forecast"
    },
    {
      title: "Real-time Analytics",
      description: "Monitor disease patterns and trends with interactive dashboards and comprehensive reporting tools.",
      icon: Activity,
      color: "text-success",
      link: "/reports"
    }
  ];

  const stats = [
    { label: "Accuracy Rate", value: "94.7%", icon: Brain, suffix: "%" },
    { label: "Regions Covered", value: "150", icon: Globe, suffix: "+" },
    { label: "Response Time", value: "2", icon: Zap, suffix: "s" },
    { label: "Healthcare Partners", value: "50", icon: Users, suffix: "+" }
  ];

  const benefits = [
    {
      title: "Instant Results",
      description: "Get diagnosis results in under 2 seconds with our optimized ML models",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Global Coverage",
      description: "Supporting healthcare providers across 150+ regions worldwide",
      icon: MapPin,
      color: "text-accent"
    },
    {
      title: "Award Winning",
      description: "Recognized by WHO and leading medical institutions for accuracy",
      icon: Award,
      color: "text-success"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer, WHO",
      content: "OutbreakLens has revolutionized our malaria surveillance capabilities. The AI accuracy is remarkable.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Epidemiology, CDC",
      content: "The forecasting models help us predict outbreaks weeks in advance. Truly game-changing technology.",
      rating: 5
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Sample",
      description: "Upload blood smear images or enter patient symptoms",
      icon: Microscope
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Advanced ML algorithms process data in real-time",
      icon: Brain
    },
    {
      step: "03",
      title: "Get Results",
      description: "Receive accurate diagnosis with confidence scores",
      icon: CheckCircle
    },
    {
      step: "04",
      title: "Plan Treatment",
      description: "Access treatment recommendations and outbreak forecasts",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
              >
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  Powered by Advanced ML & AI
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  OutbreakLens
                </span>
                <br />
                <span className="text-foreground">
                  Medical Intelligence
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="text-primary font-semibold">Diagnose today, predict tomorrow.</span>
                <br />
                Revolutionary AI-powered platform combining machine learning with epidemiological expertise for
                <span className="text-accent font-medium"> accurate malaria diagnosis</span> and
                <span className="text-success font-medium"> proactive outbreak forecasting</span>.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="btn-medical group shadow-medical-lg">
                <Link to="/diagnosis">
                  <Microscope className="mr-2 h-5 w-5" />
                  Start Diagnosis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5 backdrop-blur-sm">
                <Link to="/forecast">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Forecasts
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 pt-8"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>WHO Approved</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced Medical Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining machine learning with epidemiological expertise to provide 
              accurate diagnosis and predictive insights for malaria prevention.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6 h-full group cursor-pointer">
                    <Link to={feature.link} className="block h-full">
                      <div className="space-y-4">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ${feature.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Learn more
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How OutbreakLens Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful, and accurate - from sample to insights in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg mb-4">
                        {step.step}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent transform translate-x-8"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16 lg:px-6 bg-muted/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose OutbreakLens?
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the future of medical diagnostics and epidemiological surveillance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6 h-full text-center group hover:shadow-medical-lg transition-all duration-300">
                    <div className={`inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4 ${benefit.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-16 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Global Health Leaders
            </h2>
            <p className="text-lg text-muted-foreground">
              See what healthcare professionals and organizations say about OutbreakLens
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="data-card p-6 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-success text-success" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground italic leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="pt-4 border-t border-border/50">
                      <p className="font-semibold text-primary">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="px-4 py-16 lg:px-6 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Impact in Numbers
            </h2>
            <p className="text-lg text-muted-foreground">
              Measurable results that make a real difference in global healthcare
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center space-y-4 group"
                >
                  <div className="relative">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="px-4 py-16 lg:px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-12"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
              >
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  Start Your Journey Today
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Ready to Transform
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Global Healthcare?
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Join thousands of healthcare professionals using AI-powered diagnostics and
                predictive analytics to save lives and prevent outbreaks worldwide.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button asChild size="lg" className="btn-medical group shadow-medical-xl text-lg px-8 py-4">
                <Link to="/diagnosis">
                  <Microscope className="mr-3 h-6 w-6" />
                  Start Free Diagnosis
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5 backdrop-blur-sm text-lg px-8 py-4">
                <Link to="/dashboard">
                  <Activity className="mr-3 h-6 w-6" />
                  View Dashboard
                </Link>
              </Button>
            </motion.div>

            {/* Additional Trust Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center items-center gap-8 pt-8"
            >
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">W</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold">C</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-success to-primary flex items-center justify-center text-white text-xs font-bold">M</div>
                </div>
                <span>Trusted by WHO, CDC & Mayo Clinic</span>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Free for Healthcare Providers</span>
                <span className="mx-2">•</span>
                <span>No Setup Required</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;