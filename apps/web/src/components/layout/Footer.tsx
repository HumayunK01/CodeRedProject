import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { Mail, MapPin, ArrowUp, Twitter, Github, Linkedin, Globe } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Diagnosis", href: "/diagnosis" },
        { name: "Forecasting", href: "/forecast" },
        { name: "Analytics", href: "/reports" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Mail size={16} className="text-emerald-400 shrink-0" />,
      text: "foresee.cares@gmail.com",
      href: "mailto:foresee.cares@gmail.com",
    },
    {
      icon: <MapPin size={16} className="text-emerald-400 shrink-0" />,
      text: "India",
    },
  ];

  const socialLinks = [
    { icon: <Twitter size={16} />, label: "Twitter", href: "#" },
    { icon: <Github size={16} />, label: "GitHub", href: "#" },
    { icon: <Linkedin size={16} />, label: "LinkedIn", href: "#" },
    { icon: <Globe size={16} />, label: "Website", href: "#" },
  ];

  return (
    <footer className="mt-2 mx-2 mb-2 rounded-[24px] section-dark border border-white/10 shadow-sm overflow-hidden relative">
      <div className="container mx-auto px-4 py-12 lg:px-6 relative z-[60]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col space-y-4"
          >
            <div className="flex items-center space-x-3">
              <img
                src="/whitelogo.svg"
                alt="Foresee"
                className="h-10 w-auto object-contain"
              />
              <span className="text-white text-2xl font-bold tracking-tight">Foresee</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              We build tools for the decisions that actually count - replacing uncertainty with clear, clinical direction.
            </p>
          </motion.div>

          {/* Link sections */}
          {footerLinks.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (i + 1) }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium text-white text-sm tracking-wider uppercase opacity-80 mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-emerald-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-medium text-white text-sm tracking-wider uppercase opacity-80 mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-white/60 hover:text-emerald-400 transition-colors duration-200 text-sm"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-white/60 text-sm">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <div className="flex space-x-5 text-white/40">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-emerald-400 transition-colors duration-200"
              >
                {icon}
              </a>
            ))}
          </div>

          <p className="text-sm text-white/40 text-center">
            &copy; {new Date().getFullYear()} Foresee Medical Intelligence. All rights reserved.
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

      {/* Text hover effect — only on large screens */}
      <div className="lg:flex hidden h-[30rem] -mt-20 -mb-[18rem] pointer-events-none">
        <TextHoverEffect text="Foresee" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
};

export default Footer;
