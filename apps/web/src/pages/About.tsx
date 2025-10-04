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
  Heart
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
    <div className="p-4 lg:p-6 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">OutbreakLens</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing malaria diagnosis and outbreak forecasting through 
            advanced machine learning and epidemiological intelligence.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            Medical AI
          </Badge>
          <Badge variant="outline" className="border-accent/30 text-accent">
            Epidemiology
          </Badge>
          <Badge variant="outline" className="border-success/30 text-success">
            Open Source
          </Badge>
        </div>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="data-card p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              To democratize access to advanced malaria diagnostic capabilities and 
              predictive epidemiological intelligence, empowering healthcare providers 
              worldwide to make informed decisions and prevent outbreaks before they occur.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Core Principles */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Core Principles</h2>
          <p className="text-muted-foreground text-lg">
            The foundational values that drive our development and deployment decisions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="data-card p-6 h-full text-center">
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {principle.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Team */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-muted-foreground text-lg">
            Multidisciplinary experts combining medical knowledge with technical innovation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="data-card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  
                  <p className="text-muted-foreground">
                    {member.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ethics & Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="p-8 bg-warning/5 border-warning/20">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Heart className="h-6 w-6 text-warning" />
              </div>
              <h2 className="text-2xl font-bold">Ethical Commitment</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Medical Decision Support</h3>
                <p className="text-muted-foreground">
                  OutbreakLens is designed as a decision support tool to assist healthcare 
                  professionals. It is not intended to replace clinical judgment, 
                  professional medical advice, diagnosis, or treatment.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Data Privacy</h3>
                <p className="text-muted-foreground">
                  We are committed to protecting patient privacy and maintaining 
                  the highest standards of data security. All processing follows 
                  HIPAA guidelines and industry best practices.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Continuous Improvement</h3>
                <p className="text-muted-foreground">
                  Our models are continuously validated against new data and 
                  updated based on feedback from medical professionals and 
                  peer-reviewed research.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Open Science</h3>
                <p className="text-muted-foreground">
                  We believe in transparent, reproducible research and are 
                  committed to sharing our methodologies and contributing to 
                  the global fight against malaria.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join us in advancing medical AI and improving global health outcomes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="btn-medical">
            <Link to="/diagnosis">
              Try OutbreakLens
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="outline" size="lg">
            <Github className="mr-2 h-4 w-4" />
            View Source
          </Button>
          
          <Button variant="outline" size="lg">
            <Mail className="mr-2 h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default About;