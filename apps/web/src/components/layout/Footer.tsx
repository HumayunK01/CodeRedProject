import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Microscope, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Heart,
  Shield,
  Brain,
  Globe,
  FileText,
  Users,
  ArrowUp
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    product: [
      { name: "Diagnosis", href: "/diagnosis" },
      { name: "Forecasting", href: "/forecast" },
      { name: "Analytics", href: "/reports" },
      { name: "Dashboard", href: "/dashboard" }
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/docs#api" },
      { name: "User Guide", href: "/docs#guide" },
      { name: "Status", href: "/status" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Team", href: "/about#team" },
      { name: "Careers", href: "/about#careers" },
      { name: "Contact", href: "/about#contact" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Medical Disclaimer", href: "/disclaimer" },
      { name: "HIPAA Compliance", href: "/compliance" }
    ]
  };

  const socialLinks = [
    { name: "GitHub", href: "https://github.com/HumayunK01", icon: Github },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/devhumayun/", icon: Linkedin }
  ];

  const contactInfo = [
    { icon: Mail, text: "humayunk.pvt@gmail.com", href: "mailto:humayunk.pvt@gmail.com" },
    { icon: MapPin, text: "Mumbai, India", href: "#" }
  ];

  const features = [
    { icon: Brain, text: "AI-Powered Diagnosis" },
    { icon: Globe, text: "Global Coverage" },
    { icon: Shield, text: "HIPAA Compliant" },
    { icon: FileText, text: "Research Grade" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Microscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">BioSentinel</h3>
                  <p className="text-sm text-muted-foreground">AI-Driven Healthcare</p>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Transforming healthcare through precision AI diagnostics and proactive epidemiological surveillance, 
                enabling faster response times and better health outcomes in malaria-endemic regions.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <feature.icon className="h-3 w-3 mr-1" />
                    {feature.text}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 pt-8"
        >
          <Separator className="mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Contact Us
              </h4>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                  >
                    <contact.icon className="h-4 w-4" />
                    <span>{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-9 w-9 p-0"
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Newsletter</h4>
              <p className="text-sm text-muted-foreground">
                Stay updated with the latest in AI healthcare innovation.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button size="sm" className="btn-medical">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 text-sm text-muted-foreground"
            >
              <span>© 2024 BioSentinel. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Built with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="hidden md:inline">for healthcare</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  v1.0.0
                </Badge>
                <span>•</span>
                <span>MIT License</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
