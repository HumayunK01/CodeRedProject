import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkline } from "@/components/ui/sparkline";
import { apiClient } from "@/lib/api";
import { useCurrentUser } from "@/components/providers/DbUserProvider";
import { DiagnosisService, ForecastService } from "@/lib/db";
import {
  Microscope,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Clock,
  MapPin,
  Info,
  Brain,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Database,
  User,
  Loader2
} from "lucide-react";

// --- Sub-components for Clean Code Architecture ---

const DashboardContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`relative overflow-hidden bg-primary backdrop-blur-xl rounded-[24px] border border-primary/10 ${className}`}>
    {children}
  </section>
);

const SectionHeader = ({ icon: Icon, title, subtitle, rightElement }: { icon: any, title: string, subtitle: string, rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary uppercase tracking-tight">{title}</h3>
        <p className="text-[11px] text-foreground/60 font-semibold uppercase tracking-widest leading-none">{subtitle}</p>
      </div>
    </div>
    {rightElement}
  </div>
);

const MetricCard = ({ stat }: { stat: any }) => {
  const Icon = stat.icon;
  return (
    <Card className="bg-white/40 backdrop-blur-md border border-white/60 shadow-none hover:shadow-lg hover:-translate-y-0.5 rounded-[20px] group transition-all duration-400 overflow-hidden">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon className="h-4 w-4 text-primary group-hover:text-white" />
        </div>
        <Badge variant="secondary" className="text-[9px] px-2 py-0 h-5 font-bold bg-white/50 text-primary border border-primary/5">
          {stat.change}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div>
          <p className="text-[11px] text-foreground/60 uppercase tracking-widest font-semibold mb-1">{stat.title}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-primary">
              {stat.value}
              <span className="text-sm ml-0.5 text-primary/40 font-semibold">{stat.suffix}</span>
            </h3>
            <div className="h-6 w-16 opacity-40 group-hover:opacity-100 transition-opacity">
              <Sparkline data={stat.sparklineData} color="hsl(var(--primary))" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-primary/5">
            <span className="text-[11px] text-foreground/60 font-semibold">{stat.source === 'db' ? 'YOUR DATA' : 'RELIABILITY'}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-foreground/20 hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="text-[10px] bg-primary text-white border-none rounded-xl">
                {stat.tooltip}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActionItem = ({ to, title, desc, icon: Icon, color }: { to: string, title: string, desc: string, icon: any, color: string }) => (
  <Link to={to} className="group/item">
    <div className="h-full p-6 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-400 flex flex-col items-center text-center gap-4">
      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${color} border transition-all duration-500 group-hover/item:scale-110 shadow-sm`}>
        <Icon className="h-6 w-6 stroke-2" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-sm text-primary tracking-tight">{title}</h4>
        <p className="text-xs text-foreground/60 font-semibold uppercase tracking-widest">{desc}</p>
      </div>
      <div className="mt-0 p-1.5 rounded-full bg-primary/5 group-hover/item:bg-primary transition-colors">
        <ArrowRight className="h-3 w-3 text-primary group-hover/item:text-white" />
      </div>
    </div>
  </Link>
);

const ActivityLogItem = ({ activity }: { activity: any }) => (
  <div className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-all cursor-default group">
    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 text-primary border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
      {activity.type === 'diagnosis' ? <Microscope className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-primary truncate group-hover:translate-x-1 transition-transform duration-500">{activity.title}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] text-foreground/50 uppercase font-semibold tracking-widest leading-none">{activity.time}</span>
        <span className="h-0.5 w-0.5 rounded-full bg-primary/20"></span>
        <span className="text-[11px] text-foreground/50 uppercase font-semibold tracking-widest leading-none">{activity.type}</span>
      </div>
    </div>
    <Badge className={`rounded-lg px-3 h-6 text-[9px] font-medium uppercase border-none shadow-sm ${activity.result === 'Critical' ? 'bg-rose-500 text-white' : 'bg-primary/10 text-primary'}`}>
      {activity.result}
    </Badge>
  </div>
);

const InfrastructureMetric = ({ metric }: { metric: any }) => (
  <div className="flex items-center justify-between p-5 rounded-[20px] bg-white/50 backdrop-blur-sm border border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all group">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
        <metric.icon className="h-5 w-5 text-primary stroke-[1.5]" />
      </div>
      <div>
        <p className="text-xs text-foreground/50 uppercase tracking-widest font-semibold mb-0.5">{metric.title}</p>
        <p className="text-xl font-bold text-primary leading-none">{metric.value}</p>
      </div>
    </div>
    <Badge variant="secondary" className="bg-primary/10 text-primary text-[8px] px-2 h-5 rounded-md font-medium uppercase tracking-widest border border-primary/10">
      {metric.status}
    </Badge>
  </div>
);

// User Stats Card - Shows database-synced user stats
const UserStatsCard = () => {
  const { userWithStats, isSignedIn, isLoading } = useCurrentUser();
  const [dbStats, setDbStats] = useState<{
    diagnosisCount: number;
    forecastCount: number;
    lastActivity: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchUserDbStats = async () => {
      if (!userWithStats?.clerkId) return;

      try {
        const [diagStats, forecastStats] = await Promise.all([
          DiagnosisService.getStatsByClerkId(userWithStats.clerkId),
          ForecastService.getStatsByClerkId(userWithStats.clerkId),
        ]);

        const lastDiag = diagStats?.lastDiagnosis;
        const lastForc = forecastStats?.lastForecast;
        let lastActivity = null;

        if (lastDiag && lastForc) {
          lastActivity = new Date(lastDiag) > new Date(lastForc)
            ? new Date(lastDiag).toLocaleDateString()
            : new Date(lastForc).toLocaleDateString();
        } else if (lastDiag) {
          lastActivity = new Date(lastDiag).toLocaleDateString();
        } else if (lastForc) {
          lastActivity = new Date(lastForc).toLocaleDateString();
        }

        setDbStats({
          diagnosisCount: diagStats?.total || 0,
          forecastCount: forecastStats?.total || 0,
          lastActivity,
        });
      } catch (error) {
        console.error("Failed to fetch user DB stats:", error);
      }
    };

    fetchUserDbStats();
  }, [userWithStats?.clerkId]);

  if (!isSignedIn) {
    return (
      <DashboardContainer className="bg-white/90 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <User className="h-6 w-6 text-primary/60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">Sign in to sync your data</h3>
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-medium">Cloud Storage & Cross-Device Access</p>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  if (isLoading) {
    return (
      <DashboardContainer className="bg-white/90 p-8 flex items-center justify-center gap-3 min-h-[160px]">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-primary/80">Syncing your data...</span>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="bg-white/90 p-6 lg:p-8">
      <SectionHeader
        icon={Database}
        title="Your Synced Data"
        subtitle="Cloud Storage"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Diagnoses */}
        <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <Microscope className="h-5 w-5 text-primary group-hover:text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dbStats?.diagnosisCount || userWithStats?._count?.diagnoses || 0}</p>
            <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Diagnoses</p>
          </div>
        </div>

        {/* Forecasts */}
        <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <TrendingUp className="h-5 w-5 text-primary group-hover:text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dbStats?.forecastCount || userWithStats?._count?.forecasts || 0}</p>
            <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Forecasts</p>
          </div>
        </div>

        {/* Reports */}
        <div className="p-4 rounded-[20px] bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-default">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <FileText className="h-5 w-5 text-primary group-hover:text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{userWithStats?._count?.reports || 0}</p>
            <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-widest mt-1">Reports</p>
          </div>
        </div>
      </div>

      {dbStats?.lastActivity && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-primary/5">
          <Clock className="h-3 w-3 text-foreground/40" />
          <p className="text-xs text-foreground/50 font-medium tracking-wide">Last activity: {dbStats.lastActivity}</p>
        </div>
      )}
    </DashboardContainer>
  );
};

// --- Main Dashboard Page Component ---

const Dashboard = () => {
  const { clerkId, isSignedIn } = useCurrentUser();

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

  // Fetch user-specific stats from database
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isSignedIn || !clerkId) return;

      try {
        const [diagStats, forecastStats] = await Promise.all([
          DiagnosisService.getStatsByClerkId(clerkId),
          ForecastService.getStatsByClerkId(clerkId),
        ]);

        // Update quick stats with user data
        setQuickStats(prev => prev.map(stat => {
          if (stat.title === "Today's Diagnoses" && diagStats) {
            return {
              ...stat,
              value: diagStats.total,
              change: diagStats.positive > 0 ? `${diagStats.positive} positive` : "All clear",
              sparklineData: [60, 80, 75, 90, diagStats.total * 10 || 85].map(v => ({ value: v })),
              tooltip: `${diagStats.total} total diagnoses, ${diagStats.positive} positive`,
              source: 'db'
            };
          }
          if (stat.title === "Active Forecasts" && forecastStats) {
            return {
              ...stat,
              value: forecastStats.active,
              change: forecastStats.highRisk > 0 ? `${forecastStats.highRisk} high risk` : "Low risk",
              sparklineData: [40, 50, 65, 55, forecastStats.active * 15 || 70].map(v => ({ value: v })),
              tooltip: `${forecastStats.total} total, ${forecastStats.active} active forecasts`,
              source: 'db'
            };
          }
          return stat;
        }));
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    fetchUserStats();
  }, [clerkId, isSignedIn]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await apiClient.getDashboardStats();

        setQuickStats(prev => {
          // Merge API stats with any existing DB stats
          return [
            prev[0].source === 'db' ? prev[0] : { title: "Today's Diagnoses", value: stats.today_diagnoses, change: "+12%", trend: "up", icon: Microscope, tooltip: "Tests completed today", sparklineData: [60, 80, 75, 90, 85].map(v => ({ value: v })), suffix: "", source: "api" },
            prev[1].source === 'db' ? prev[1] : { title: "Active Forecasts", value: stats.active_forecasts, change: "+3", trend: "up", icon: TrendingUp, tooltip: "Active breakout models", sparklineData: [40, 50, 65, 55, 70].map(v => ({ value: v })), suffix: "", source: "api" },
            { title: "Risk Regions", value: stats.risk_regions, change: "-2", trend: "down", icon: MapPin, tooltip: "Monitored hotspots", sparklineData: [90, 80, 70, 75, 60].map(v => ({ value: v })), suffix: "", source: "api" },
            { title: "System Health", value: stats.system_health, change: "Excellent", trend: "stable", icon: Activity, tooltip: "Uptime and response quality", sparklineData: [99, 98, 99.5, 99, 99.2].map(v => ({ value: v })), suffix: "%", source: "api" }
          ];
        });

        setSystemMetrics([
          { title: "Model Accuracy", value: stats.model_accuracy, status: "excellent", icon: Brain },
          { title: "Response Time", value: stats.response_time, status: "optimal", icon: Zap },
          { title: "Data Security", value: stats.data_security, status: "compliant", icon: Shield },
          { title: "Global Reach", value: stats.global_reach, status: "regions", icon: Globe }
        ]);

        setRecentActivity(stats.recent_activity);
        setLoading(false);
      } catch (error) {
        console.error('Data Fetch Error:', error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent space-y-2 lg:space-y-4 pb-2 w-full max-w-[100vw] overflow-x-hidden">

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

      {/* User Stats Card - Shows synced data */}
      <section className="mx-2">
        <UserStatsCard />
      </section>

      {/* Primary Metrics Section */}
      <section className="mx-2 mb-0 relative">
        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-accent/10 rounded-[24px] blur-sm opacity-20 transition duration-700" />
        <DashboardContainer className="bg-white/80">
          <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-8 py-8 relative z-10">
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat) => <MetricCard key={stat.title} stat={stat} />)}
              </div>
            </TooltipProvider>
          </div>
        </DashboardContainer>
      </section>

      {/* Main Layout Grid */}
      <div className="mx-2 grid lg:grid-cols-12 gap-4 items-start relative px-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Column 1: Core Hub & History */}
        <div className="lg:col-span-8 space-y-4 relative z-10">

          {/* Action Center */}
          <section className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[24px] blur opacity-30 transition duration-1000" />
            <DashboardContainer className="bg-white/90 p-6 lg:p-8">
              <SectionHeader icon={Activity} title="Core Operations" subtitle="Primary hub" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ActionItem to="/diagnosis" title="Diagnosis" desc="Analysis" icon={Microscope} color="bg-primary/5 text-primary border-primary/10" />
                <ActionItem to="/forecast" title="Forecast" desc="Epidemic" icon={TrendingUp} color="bg-primary/5 text-primary border-primary/10" />
                <ActionItem to="/reports" title="Reports" desc="Data Logs" icon={FileText} color="bg-primary/5 text-primary border-primary/10" />
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
                <Button variant="outline" className="rounded-full px-4 h-9 text-[9px] font-medium tracking-widest border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white shadow-sm" asChild>
                  <Link to="/reports">VIEW ALL <ArrowRight className="ml-1.5 h-3 w-3" /></Link>
                </Button>
              }
            />
            <div className="bg-white/40 rounded-[16px] border border-white shadow-inner-sm overflow-hidden divide-y divide-primary/5">
              {recentActivity.map((activity, i) => <ActivityLogItem key={i} activity={activity} />)}
            </div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none opacity-60" />
          </DashboardContainer>
        </div>

        {/* Column 2: Infrastructure Vitals */}
        <div className="lg:col-span-4 h-full relative z-10">
          <DashboardContainer className="bg-white/90 p-6 lg:p-8 sticky top-24 shadow-sm h-full flex flex-col">
            <SectionHeader icon={BarChart3} title="Infrastructure" subtitle="Vitals" />
            <div className="grid grid-cols-1 gap-4 flex-1">
              {systemMetrics.map((metric) => <InfrastructureMetric key={metric.title} metric={metric} />)}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;