import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, UserCheck, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "April 29, 2026";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden">

      {/* ── HEADER CARD (white, like Hero) ── */}
      <section className="mx-2 mt-4 bg-white rounded-[24px] shadow-sm border border-border/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

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
              Privacy <span className="text-primary">Policy</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-4">
              We take your privacy seriously. This policy describes how Foresee Medical Intelligence
              collects, uses, and protects your personal and health data.
            </p>

            <p className="text-sm text-muted-foreground/70">Last updated: {LAST_UPDATED}</p>
          </motion.div>
        </div>
      </section>

      {/* ── NOTICE BANNER (dark, like Features/Stats) ── */}
      <section className="section-inset section-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none opacity-40" />
        <div className="container-saas relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-center gap-6"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-medium text-white mb-2">
                Important Notice on Health Data
              </h2>
              <p className="text-white/70 leading-relaxed text-sm md:text-base max-w-3xl">
                Foresee processes health-related data which may be classified as sensitive personal data
                under applicable law. We apply the highest standards of data protection and{" "}
                <strong className="text-white">never sell your personal data</strong> to third parties.
                All health records are encrypted, access-controlled, and processed only for the
                purposes you consent to.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 1: What We Collect ── */}
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
              Data Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground tracking-tight">
              What We Collect &amp; How We Use It
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Database className="h-6 w-6 text-primary" />,
                title: "Data We Collect",
                items: [
                  { label: "Account data", desc: "Name, email, role, and authentication credentials managed through Clerk." },
                  { label: "Health & diagnostic data", desc: "Symptom descriptions, medical images, and lab results you submit for analysis." },
                  { label: "Usage data", desc: "Pages visited, features used, timestamps, IP address, browser type, and device identifiers." },
                  { label: "Communications", desc: "Messages you send to our support team or through the in-app chatbot." },
                ],
              },
              {
                icon: <Eye className="h-6 w-6 text-primary" />,
                title: "How We Use It",
                items: [
                  { label: "Platform delivery", desc: "Providing AI-powered disease diagnosis and outbreak forecasting." },
                  { label: "Model improvement", desc: "Training on de-identified, aggregated data only — never individually identifiable records without consent." },
                  { label: "Communications", desc: "Service alerts, security notices, and product updates." },
                  { label: "Fraud prevention", desc: "Detecting and preventing abuse, fraud, and security incidents." },
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-medium text-foreground">{card.title}</h3>
                </div>
                <ul className="space-y-4">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground font-medium">{item.label}:</strong>{" "}
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto"
          >
            We do not knowingly collect data from children under the age of 13. If you believe a child has
            submitted information to us, please contact us immediately.
          </motion.p>
        </div>
      </section>

      {/* ── SECTION 2: Security & Medical Data ── */}
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
              Data Protection
            </span>
            <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight">
              Security &amp; Medical Data Standards
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Lock className="h-6 w-6 text-white" />,
                title: "Encryption",
                points: [
                  "AES-256 encryption for all data at rest",
                  "TLS 1.3 for all data in transit",
                  "Encrypted database backups",
                ],
              },
              {
                icon: <Shield className="h-6 w-6 text-white" />,
                title: "Access Control",
                points: [
                  "Role-based access controls (RBAC)",
                  "Multi-factor authentication for privileged accounts",
                  "Full audit logging of health record access",
                ],
              },
              {
                icon: <Database className="h-6 w-6 text-white" />,
                title: "Medical Data Rules",
                points: [
                  "Retained for no longer than 36 months unless law requires more",
                  "Never shared with insurers, employers, or marketers",
                  "Consent required before health data processing",
                ],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#10392F] to-[#0A261F] border border-white/10 rounded-[28px] p-8 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 border border-white/10">
                  {card.icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-4">{card.title}</h3>
                <ul className="space-y-3">
                  {card.points.map((pt, j) => (
                    <li key={j} className="flex gap-3 text-sm text-white/70">
                      <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center text-sm text-white/50 mt-8"
          >
            Discovered a vulnerability? Report it responsibly to{" "}
            <a href="mailto:security@foresee.health" className="text-white/80 underline underline-offset-2">
              security@foresee.health
            </a>
          </motion.p>
        </div>
      </section>

      {/* ── SECTION 3: Sharing, Rights & Retention ── */}
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
              Your Data, Your Rights
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground tracking-tight">
              Sharing, Your Rights &amp; Retention
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Sharing */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium text-foreground">Data Sharing</h3>
              <p className="text-sm text-muted-foreground">We never sell your data. We may share with:</p>
              <ul className="space-y-3">
                {[
                  { label: "Service providers", desc: "Under strict data-processing agreements." },
                  { label: "Healthcare partners", desc: "Only where you have explicitly authorised sharing." },
                  { label: "Public authorities", desc: "Aggregated, anonymised data for public health research." },
                  { label: "Legal requirements", desc: "When compelled by court order or applicable law." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground font-medium">{item.label}:</strong> {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Rights */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium text-foreground">Your Rights</h3>
              <p className="text-sm text-muted-foreground">Depending on your jurisdiction:</p>
              <ul className="space-y-3">
                {[
                  "Access — request a copy of your data",
                  "Rectification — correct inaccurate data",
                  "Erasure — request deletion of your data",
                  "Portability — receive data in machine-readable format",
                  "Restriction — limit how we process your data",
                  "Withdraw consent — at any time for health data",
                ].map((right, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50" />
                    {right}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                Contact{" "}
                <a href="mailto:privacy@foresee.health" className="text-primary hover:underline">
                  privacy@foresee.health
                </a>{" "}
                — we respond within 30 days.
              </p>
            </motion.div>

            {/* Retention */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium text-foreground">Retention Periods</h3>
              <p className="text-sm text-muted-foreground">We keep data only as long as necessary:</p>
              <ul className="space-y-3">
                {[
                  { label: "Account data", period: "Account lifetime + 90 days" },
                  { label: "Health records", period: "Up to 36 months (or as required by law)" },
                  { label: "Usage logs", period: "12 months" },
                  { label: "Anonymised data", period: "Indefinitely for research" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-border/40 text-sm last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground text-right ml-4">{item.period}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
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
                Cookies &amp; Changes
              </h2>
              <div className="space-y-3 text-sm text-white/70">
                <p><strong className="text-white">Essential cookies</strong> — authentication session tokens and CSRF protection required for the platform to function.</p>
                <p><strong className="text-white">Analytics cookies</strong> — anonymised usage statistics to understand how features are used.</p>
                <p><strong className="text-white">Preference cookies</strong> — remembering your settings like region selections.</p>
                <p className="pt-2">When we make material changes to this policy, we'll notify registered users by email and display a notice within the platform for at least 14 days.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-normal text-white mb-4">Contact</h2>
              <div className="bg-white/10 border border-white/20 rounded-[20px] p-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Privacy</p>
                    <a href="mailto:privacy@foresee.health" className="text-white hover:text-white/80 transition-colors">
                      privacy@foresee.health
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Security</p>
                    <a href="mailto:security@foresee.health" className="text-white hover:text-white/80 transition-colors">
                      security@foresee.health
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-white/50 text-xs mt-4">
                You also have the right to lodge a complaint with the relevant data protection supervisory authority in your jurisdiction.
              </p>
              <div className="flex items-center gap-4 mt-6 text-sm">
                <Link to="/terms" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
                  Terms of Service
                </Link>
                <Link to="/" className="text-white/60 hover:text-white transition-colors">
                  Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Privacy;
