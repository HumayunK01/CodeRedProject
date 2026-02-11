
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  Microscope,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Clock,
  MapPin,
  Brain,
  Zap,
  Shield,
  Globe,
  BarChart3,
} from "lucide-react";
import { DashboardContainer } from "@/components/layout/DashboardContainer";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard, MetricCardSkeleton } from "@/components/dashboard/MetricCard";
import { ActionItem, ActionItemSkeleton } from "@/components/dashboard/ActionItem";
import { ActivityLogItem, ActivityLogItemSkeleton } from "@/components/dashboard/ActivityLogItem";
import { InfrastructureMetric, InfrastructureMetricSkeleton } from "@/components/dashboard/InfrastructureMetric";
import { UserStatsCard } from "@/components/dashboard/UserStatsCard";


const Dashboard = () => {
  const { clerkId, isSignedIn } = useCurrentUser();
  const { isLoaded } = useAuth(); // used for checking auth loaded status

  const [quickStats, setQuickStats] = useState([
    { title: "Today's Diagnoses", value: 0, change: "+0%", trend: "stable", icon: Microscope, tooltip: "Tests completed today", sparklineData: Array(5).fill({ value: 0 }), suffix: "", source: "api" },
    { title: "Active Forecasts", value: 0, change: "+0", trend: "stable", icon: TrendingUp, tooltip: "Regional outbreaks forecasting", sparklineData: Array(5).fill({ value: 0 }), suffix: "", source: "api" },
    { title: "Risk Regions", value: 0, change: "+0", trend: "stable", icon: MapPin, tooltip: "High-risk regions identified", sparklineData: Array(5).fill({ value: 0 }), suffix: "", source: "api" },
    { title: "System Health", value: 0, change: "Unknown", trend: "stable", icon: Activity, tooltip: "System performance status", sparklineData: Array(5).fill({ value: 0 }), suffix: "%", source: "api" }
  ]);

  const [systemMetrics, setSystemMetrics] = useState([
    { title: "Model Accuracy", value: "0%", status: "unknown", icon: Brain },
    { title: "Response Time", value: "0s", status: "unknown", icon: Zap },
    { title: "Data Security", value: "Unknown", status: "unknown", icon: Shield },
    { title: "Global Reach", value: "0", status: "unknown", icon: Globe }
  ]);

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unified dashboard stats from API (which handles DB querying)
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch if signed in
      if (!isSignedIn) return;

      try {
        setLoading(true);
        // Pass clerkId to get real database stats
        const stats: any = await apiClient.getDashboardStats(clerkId || undefined);

        setQuickStats([
          {
            title: "Today's Diagnoses",
            value: stats.today_diagnoses,
            change: stats.today_positive > 0 ? `${stats.today_positive} positive` : "All clear",
            trend: "stable",
            icon: Microscope,
            tooltip: "Tests completed today",
            sparklineData: [60, 80, 75, 90, 85].map(v => ({ value: v })),
            suffix: "",
            source: "api"
          },
          {
            title: "Active Forecasts",
            value: stats.active_forecasts,
            change: stats.high_risk_forecasts > 0 ? `${stats.high_risk_forecasts} high risk` : "Low risk",
            trend: "stable",
            icon: TrendingUp,
            tooltip: "Active breakout models",
            sparklineData: [40, 50, 65, 55, 70].map(v => ({ value: v })),
            suffix: "",
            source: "api"
          },
          {
            title: "Risk Regions",
            value: stats.risk_regions,
            change: "Monitored",
            trend: "stable",
            icon: MapPin,
            tooltip: "High-risk regions identified",
            sparklineData: [90, 80, 70, 75, 60].map(v => ({ value: v })),
            suffix: "",
            source: "api"
          },
          {
            title: "System Health",
            value: stats.system_health,
            change: "Stable",
            trend: "stable",
            icon: Activity,
            tooltip: "System performance status",
            sparklineData: [99, 98, 99.5, 99, 99.2].map(v => ({ value: v })),
            suffix: "%",
            source: "api"
          }
        ]);

        setSystemMetrics([
          { title: "Model Accuracy", value: stats.model_accuracy, status: "excellent", icon: Brain },
          { title: "Response Time", value: stats.response_time, status: "optimal", icon: Zap },
          { title: "Data Security", value: stats.data_security, status: "compliant", icon: Shield },
          { title: "Global Reach", value: stats.global_reach, status: "regions", icon: Globe }
        ]);

        setRecentActivity(stats.recent_activity);
      } catch (error) {
        console.error('Data Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchDashboardData();
    }
  }, [isSignedIn, clerkId, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden relative">

      {!isSignedIn && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Your Dashboard</h2>
              <p className="text-muted-foreground">
                Sign in to securely view your diagnosis history and health insights.
              </p>
            </div>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full rounded-full shadow-lg hover:shadow-xl transition-all">
                Sign In to Continue
              </Button>
            </SignInButton>
          </motion.div>
        </div>
      )}

      {/* Header Section */}
      <section className="mx-2 mt-4 relative overflow-hidden">
        <div className="relative px-6 py-12 lg:p-16 rounded-[24px] bg-primary border border-white/10 flex flex-col justify-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-40" />

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1]">
              Dashboard
            </h1>
            <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
              Real-time monitoring and advanced epidemiological insights for proactive healthcare management.
            </p>
          </div>
        </div>
      </section>

      {/* User Stats Card - Shows synced data (Handles its own skeleton) */}
      <section className="mx-2 relative z-0">
        <UserStatsCard />
      </section>

      {/* Primary Metrics Section */}
      <section className="mx-2 mb-0 relative">
        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-accent/10 rounded-[24px] blur-sm opacity-20 transition duration-700" />
        <DashboardContainer className="bg-white/80">
          <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-8 py-8 relative z-10">
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isSignedIn
                  ? quickStats.map((stat) => <MetricCard key={stat.title} stat={stat} />)
                  : Array(4).fill(0).map((_, i) => <MetricCardSkeleton key={i} />)
                }
              </div>
            </TooltipProvider>
          </div>
        </DashboardContainer>
      </section>

      {/* Main Layout Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-start relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Core Hub & History */}
        <div className="lg:col-span-8 space-y-4 relative z-0">

          {/* Action Center */}
          <section className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[24px] blur opacity-30 transition duration-1000" />
            <DashboardContainer className="bg-white/90 p-6 lg:p-8">
              <SectionHeader icon={Activity} title="Core Operations" subtitle="Primary hub" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isSignedIn
                  ? (
                    <>
                      <ActionItem to="/diagnosis" title="Diagnosis" desc="Analysis" icon={Microscope} color="bg-primary/5 text-primary border-primary/10" />
                      <ActionItem to="/forecast" title="Forecast" desc="Epidemic" icon={TrendingUp} color="bg-primary/5 text-primary border-primary/10" />
                      <ActionItem to="/reports" title="Reports" desc="Data Logs" icon={FileText} color="bg-primary/5 text-primary border-primary/10" />
                    </>
                  )
                  : Array(3).fill(0).map((_, i) => <ActionItemSkeleton key={i} />)
                }
              </div>
            </DashboardContainer>
          </section>



          {/* Analytical History */}
          <DashboardContainer className="bg-white/90 p-6 lg:p-8">
            <SectionHeader
              icon={Clock}
              title="Analytical History"
              subtitle="Audit logs"
              rightElement={
                isSignedIn && (
                  <Button variant="outline" className="rounded-full px-4 h-9 text-[9px] font-medium tracking-widest border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white shadow-sm" asChild>
                    <Link to="/reports">VIEW ALL <ArrowRight className="ml-1.5 h-3 w-3" /></Link>
                  </Button>
                )
              }
            />
            <div className="bg-white/40 rounded-[16px] border border-white shadow-inner-sm overflow-hidden divide-y divide-primary/5">
              {isSignedIn
                ? recentActivity.map((activity: any, i) => <ActivityLogItem key={i} activity={activity} />)
                : Array(3).fill(0).map((_, i) => <ActivityLogItemSkeleton key={i} />)
              }
            </div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none opacity-60" />
          </DashboardContainer>
        </div>

        {/* Column 2: Infrastructure Vitals */}
        <div className="lg:col-span-4 h-full relative z-0">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-24 shadow-sm h-full flex flex-col">
            <SectionHeader icon={BarChart3} title="Infrastructure" subtitle="Vitals" />
            <div className="grid grid-cols-1 gap-4 flex-1">
              {isSignedIn
                ? systemMetrics.map((metric) => <InfrastructureMetric key={metric.title} metric={metric} />)
                : Array(4).fill(0).map((_, i) => <InfrastructureMetricSkeleton key={i} />)
              }
            </div>
          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;