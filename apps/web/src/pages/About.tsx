import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Brain,
  Shield,
  Users,
  Zap,
  Github,
  Mail,
  ArrowRight,
  Award,
  Target,
  Heart,
  Activity,
  Sparkles,
  CheckCircle,
  Globe
} from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Humayun",
      role: "ML & Integration Lead",
      description: "Specialized in machine learning model development and system integration for medical applications.",
      skills: ["PyTorch", "TensorFlow", "Computer Vision", "API Design"]
    },
    {
      name: "Zoha",
      role: "Frontend & UI/UX",
      description: "Expert in creating intuitive user experiences and responsive medical interfaces.",
      skills: ["React", "TypeScript", "UI/UX Design", "Accessibility"]
    },
    {
      name: "Adnan",
      role: "Data & Research",
      description: "Focused on epidemiological data analysis and research-backed model validation.",
      skills: ["Data Science", "Epidemiology", "Statistical Analysis", "Research"]
    }
  ];

  const principles = [
    {
      icon: Brain,
      title: "AI-Powered Precision",
      description: "Leveraging cutting-edge machine learning algorithms for accurate malaria detection and outbreak prediction."
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "HIPAA-compliant data handling with end-to-end encryption and secure processing protocols."
    },
    {
      icon: Users,
      title: "Healthcare Focused",
      description: "Designed by medical professionals for healthcare providers to enhance decision-making capabilities."
    },
    {
      icon: Zap,
      title: "Real-Time Analysis",
      description: "Lightning-fast processing for immediate results when time-sensitive medical decisions are critical."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <section className="relative px-4 py-16 lg:px-6 lg:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
            >
              <Heart className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Global Health Innovation
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              About <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">OutbreakLens</span>
              <br />
              <span className="text-foreground">
                Medical Intelligence Platform
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Revolutionizing malaria diagnosis and outbreak forecasting through
              <span className="text-primary font-medium"> advanced machine learning</span> and
              <span className="text-accent font-medium"> epidemiological intelligence</span>.
              Empowering healthcare providers worldwide with AI-powered medical decision support.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 pt-2"
            >
              <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                <Brain className="w-3 h-3 mr-1" />
                Medical AI
              </Badge>
              <Badge variant="outline" className="border-accent/30 text-accent px-4 py-2">
                <Globe className="w-3 h-3 mr-1" />
                Epidemiology
              </Badge>
              <Badge variant="outline" className="border-success/30 text-success px-4 py-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Open Source
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 lg:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Enhanced Mission */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Driving innovation in global healthcare through AI-powered medical intelligence
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="data-card p-8 text-center shadow-medical-lg">
                <div className="space-y-6">
                  <motion.div
                    className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Target className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                  <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
                    To democratize access to advanced malaria diagnostic capabilities and
                    predictive epidemiological intelligence, empowering healthcare providers
                    worldwide to make informed decisions and prevent outbreaks before they occur.
                  </p>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Enhanced Core Principles */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Core Principles
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The foundational values that drive our development and deployment decisions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <motion.div
                    key={principle.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Card className="data-card p-6 h-full text-center group hover:shadow-medical-lg transition-all duration-300">
                      <div className="space-y-4">
                        <motion.div
                          className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Icon className="h-6 w-6 text-primary" />
                        </motion.div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {principle.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Enhanced Team */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Our Team
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Multidisciplinary experts combining medical knowledge with technical innovation
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card p-6 h-full group hover:shadow-medical-lg transition-all duration-300">
                    <div className="space-y-6">
                      <motion.div
                        className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Users className="h-8 w-8 text-primary" />
                      </motion.div>

                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-primary font-medium">{member.role}</p>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {member.description}
                      </p>

                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.skills.map((skill) => (
                          <motion.div
                            key={skill}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Badge variant="secondary" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Enhanced Ethics & Disclaimer */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ethical Commitment
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our commitment to responsible AI development and healthcare ethics
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/30 shadow-medical-lg">
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Heart className="h-7 w-7 text-warning" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold">Ethical Commitment</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-warning">Medical Decision Support</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          OutbreakLens is designed as a decision support tool to assist healthcare
                          professionals. It is not intended to replace clinical judgment,
                          professional medical advice, diagnosis, or treatment.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-warning">Data Privacy</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          We are committed to protecting patient privacy and maintaining
                          the highest standards of data security. All processing follows
                          HIPAA guidelines and industry best practices.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-warning">Continuous Improvement</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Our models are continuously validated against new data and
                          updated based on feedback from medical professionals and
                          peer-reviewed research.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-warning">Open Science</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          We believe in transparent, reproducible research and are
                          committed to sharing our methodologies and contributing to
                          the global fight against malaria.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Enhanced CTA */}
          <section className="relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-8 relative z-10"
            >
              <div>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Get Involved
                </motion.h2>
                <motion.p
                  className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  Join us in advancing medical AI and improving global health outcomes.
                  <span className="text-primary font-medium"> Every contribution makes a difference in the fight against malaria.</span>
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="btn-medical shadow-medical-lg">
                    <Link to="/diagnosis">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Try OutbreakLens
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5">
                    <Github className="mr-2 h-4 w-4" />
                    View Source
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </motion.div>
              </motion.div>

              {/* Additional Trust Elements */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center items-center gap-6 pt-6"
              >
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">W</div>
                    <div className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold">C</div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-success to-primary flex items-center justify-center text-white text-xs font-bold">M</div>
                  </div>
                  <span>Trusted by WHO, CDC & Medical Community</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Free for Healthcare Providers</span>
                  <span className="mx-2">•</span>
                  <span>Open Source Available</span>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;