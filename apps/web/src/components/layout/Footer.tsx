import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Microscope,
  Mail,
  MapPin,

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
    platform: [
      { name: "Diagnosis", href: "/diagnosis" },
      { name: "Forecasting", href: "/forecast" },
      { name: "Analytics", href: "/reports" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ]
  };



  return (
    <footer className="mt-2 mx-2 mb-2 rounded-[24px] section-dark border border-white/10 shadow-sm overflow-hidden relative">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="/whitelogo.svg"
                  alt="Foresee"
                  className="h-12 w-auto object-contain"
                />
                <span className="text-3xl font-medium text-white tracking-tight">Foresee</span>
              </div>

              <p className="text-white/60 leading-relaxed max-w-sm text-base">
                We build tools for the decisions that actually count—replacing uncertainty with clear, clinical direction.
              </p>


            </motion.div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Platform */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="font-medium text-white text-sm tracking-wider uppercase opacity-80">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>



            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="font-medium text-white text-sm tracking-wider uppercase opacity-80">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20 relative z-10">
        <div className="container mx-auto px-4 py-6 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2026 Foresee Medical Intelligence. All rights reserved.
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Scroll to top"
            >
              <span className="mr-2 text-xs uppercase tracking-wider">Back to Top</span>
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
