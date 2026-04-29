import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, Shield, UserCheck, Ban, Scale, Cpu, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "April 29, 2026";

const Terms = () => {
  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden">

      {/* ── HEADER CARD (white, like Hero) ── */}
      <section className="mx-2 mt-4 bg-white rounded-[24px] shadow-sm border border-border/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="container-saas py-12 lg:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Home
              </Link>
            </Button>

            <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-6 shadow-sm">
              Legal
            </span>

            <h1 className="text-4xl md:text-6xl font-normal text-foreground tracking-tight leading-[1.1] mb-6">
              Terms of <span className="text-primary">Service</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-4">
              Please read these terms carefully before using Foresee. By accessing or using our platform,
              you agree to be bound by these Terms of Service.
            </p>

            <p className="text-sm text-muted-foreground/70">Last updated: {LAST_UPDATED}</p>
          </motion.div>
        </div>
      </section>

      {/* ── MEDICAL DISCLAIMER (dark) ── */}
      <section className="section-inset section-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none opacity-40" />
        <div className="container-saas relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-start gap-6"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-medium text-white mb-3">
                Medical Disclaimer — Please Read
              </h2>
              <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-3xl">
                Foresee is an AI-assisted epidemiological intelligence tool.{" "}
                <strong className="text-white">It is not a medical device</strong>, does not provide medical diagnoses,
                and is <strong className="text-white">not a substitute for professional medical advice,
                diagnosis, or treatment</strong>. All AI-generated outputs are for informational and research
                purposes only and must be independently verified by qualified professionals before any
                clinical or public health decision is made. In a medical emergency, contact emergency
                services immediately.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 1: Acceptance, Eligibility, Permitted Use ── */}
      <section className="section-inset section-light bg-white border border-border/50">
        <div className="container-saas">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-6 shadow-sm">
              Agreement
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground tracking-tight">
              Acceptance, Eligibility &amp; Permitted Use
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <FileText className="h-6 w-6 text-primary" />,
                title: "Acceptance",
                body: "By creating an account, clicking \"Accept\", or otherwise accessing the Service, you confirm you have read and agree to these Terms and our Privacy Policy, which is incorporated by reference. If you are using Foresee on behalf of an organisation, you represent that you have authority to bind that organisation.",
              },
              {
                icon: <UserCheck className="h-6 w-6 text-primary" />,
                title: "Eligibility",
                points: [
                  "Be at least 18 years of age",
                  "Be a licensed healthcare professional, public health official, researcher, or authorised institutional user",
                  "Provide accurate and current registration information",
                  "Not have been previously banned from the Service",
                ],
              },
              {
                icon: <Shield className="h-6 w-6 text-primary" />,
                title: "Permitted Use",
                points: [
                  "Disease surveillance and epidemiological analysis",
                  "AI-assisted preliminary assessment for triage and research support",
                  "Generating forecasts for planning and resource allocation",
                  "Training, educational demonstrations, and academic research",
                  "Public health reporting and regulatory compliance",
                ],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="card-saas"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-medium text-foreground">{card.title}</h3>
                </div>
                {"body" in card ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                ) : (
                  <ul className="space-y-3">
                    {card.points!.map((pt, j) => (
                      <li key={j} className="flex gap-3 text-sm text-muted-foreground">
                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: AI Limitations & Prohibited Use (dark) ── */}
      <section className="section-inset section-dark relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-light/10 rounded-full blur-[100px] pointer-events-none opacity-30" />
        <div className="container-saas relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block py-2 px-5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-white uppercase mb-6 shadow-sm">
              Usage Rules
            </span>
            <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight">
              AI Limitations &amp; Prohibited Use
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#10392F] to-[#0A261F] border border-white/10 rounded-[28px] p-8 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 border border-white/10">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-4">AI Output Limitations</h3>
              <ul className="space-y-3">
                {[
                  "All AI outputs are for informational and research purposes only — not clinical diagnoses.",
                  "Must be independently verified by qualified professionals before any decision is made.",
                  "Accuracy depends on the quality and completeness of data you provide.",
                  "Foresee makes no warranty regarding prediction accuracy for any specific use case.",
                  "Foresee does not recommend specific treatments, medications, or clinical interventions.",
                ].map((pt, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40" />
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#10392F] to-[#0A261F] border border-white/10 rounded-[28px] p-8 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 border border-white/10">
                <Ban className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-4">Prohibited Activities</h3>
              <ul className="space-y-3">
                {[
                  "Making clinical diagnoses based solely on AI outputs.",
                  "Submitting false, misleading, or fabricated health data.",
                  "Reverse-engineering or extracting proprietary AI models.",
                  "Scraping or harvesting data using automated means without consent.",
                  "Reselling or sublicensing outputs without a separate commercial agreement.",
                  "Accessing other users' accounts or data without authorisation.",
                  "Transmitting malware or code designed to disrupt or damage systems.",
                ].map((pt, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40" />
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: IP, Liability, Governing Law (white) ── */}
      <section className="section-inset section-light bg-white border border-border/50">
        <div className="container-saas">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block py-2 px-5 rounded-full bg-secondary/30 border border-border/60 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-6 shadow-sm">
              Legal Framework
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground tracking-tight">
              Intellectual Property, Liability &amp; Governing Law
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Shield className="h-6 w-6 text-primary" />,
                title: "Intellectual Property",
                content: "The Service, including all software, algorithms, models, interfaces, trademarks, and trade secrets, is owned by Foresee Medical Intelligence. You retain all ownership rights in data you upload. By uploading, you grant Foresee a limited licence to process your content to deliver the Service.",
              },
              {
                icon: <Scale className="h-6 w-6 text-primary" />,
                title: "Limitation of Liability",
                content: "To the maximum extent permitted by law, Foresee shall not be liable for any indirect, incidental, special, or consequential damages. Our total aggregate liability for any claim shall not exceed the greater of fees paid in the prior 12 months or INR 10,000 (or local equivalent).",
              },
              {
                icon: <Scale className="h-6 w-6 text-primary" />,
                title: "Governing Law",
                content: "These Terms are governed by the laws of India. Disputes shall first be submitted to good-faith mediation. If mediation fails, disputes are resolved by binding arbitration under the Arbitration and Conciliation Act, 1996, seated in New Delhi, India.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="card-saas"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-medium text-foreground">{card.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimers note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10 max-w-4xl mx-auto p-6 bg-secondary/50 border border-border/40 rounded-[20px] text-sm text-muted-foreground leading-relaxed text-center"
          >
            <strong className="text-foreground">Disclaimer of Warranties:</strong> The Service is provided "as is" and "as available"
            without warranties of any kind — including merchantability, fitness for a particular purpose, accuracy,
            or uninterrupted access — to the maximum extent permitted by applicable law.
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER SECTION (dark) ── */}
      <section className="section-inset section-dark relative overflow-hidden">
        <div className="container-saas relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-normal text-white mb-4">
                Termination &amp; Changes
              </h2>
              <div className="space-y-3 text-sm text-white/70">
                <p>
                  <strong className="text-white">Termination by you:</strong> You may delete your account at any time through account settings.
                </p>
                <p>
                  <strong className="text-white">Termination by us:</strong> We may suspend or terminate access immediately if you violate these Terms or your use poses a security risk.
                </p>
                <p>
                  <strong className="text-white">Survival:</strong> Sections covering AI limitations, IP, disclaimers, liability, indemnification, and governing law survive termination.
                </p>
                <p className="pt-2">
                  When we make material changes to these Terms, we will notify registered users by email and display a prominent notice within the platform for at least 14 days.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-normal text-white mb-4">Contact &amp; Legal</h2>
              <div className="bg-white/10 border border-white/20 rounded-[20px] p-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Legal</p>
                    <a href="mailto:legal@foresee.health" className="text-white hover:text-white/80 transition-colors">
                      legal@foresee.health
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Support</p>
                    <a href="mailto:support@foresee.health" className="text-white hover:text-white/80 transition-colors">
                      support@foresee.health
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm">
                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
                  Privacy Policy
                </Link>
                <Link to="/" className="text-white/60 hover:text-white transition-colors">
                  Home
                </Link>
              </div>
              <p className="text-white/40 text-xs mt-4">
                © 2026 Foresee Medical Intelligence. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Terms;
