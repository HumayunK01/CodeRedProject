import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkline } from "@/components/ui/sparkline";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Microscope,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Clock,
  Users,
  MapPin,
  Info,
  Brain,
  Zap,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from "lucide-react";
import { DEMO_MODE } from "@/lib/api";

const Dashboard = () => {
  const quickStats = [
    {
      title: "Today's Diagnoses",
      value: 24,
      change: "+12%",
      trend: "up",
      icon: Microscope,
      tooltip: "Number of malaria diagnosis tests completed today using image analysis and symptom assessment",
      sparklineData: [{ value: 18 }, { value: 22 }, { value: 20 }, { value: 26 }, { value: 24 }],
      suffix: ""
    },
    {
      title: "Active Forecasts",
      value: 8,
      change: "+3",
      trend: "up",
      icon: TrendingUp,
      tooltip: "Regional outbreak forecasting models currently running with weekly predictions",
      sparklineData: [{ value: 5 }, { value: 6 }, { value: 7 }, { value: 5 }, { value: 8 }],
      suffix: ""
    },
    {
      title: "Risk Regions",
      value: 5,
      change: "-2",
      trend: "down",
      icon: MapPin,
      tooltip: "Geographic regions currently classified as high-risk for malaria outbreaks",
      sparklineData: [{ value: 8 }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 5 }],
      suffix: ""
    },
    {
      title: "System Health",
      value: 99.2,
      change: "Excellent",
      trend: "stable",
      icon: Activity,
      tooltip: "Overall system uptime and performance metrics for ML models and API endpoints",
      sparklineData: [{ value: 99 }, { value: 98.8 }, { value: 99.5 }, { value: 99.1 }, { value: 99.2 }],
      suffix: "%"
    }
  ];

  const systemMetrics = [
    {
      title: "Model Accuracy",
      value: "94.7%",
      status: "excellent",
      icon: Brain,
      description: "AI diagnostic accuracy rate"
    },
    {
      title: "Response Time",
      value: "<2s",
      status: "optimal",
      icon: Zap,
      description: "Average processing time"
    },
    {
      title: "Data Security",
      value: "HIPAA",
      status: "compliant",
      icon: Shield,
      description: "Healthcare compliance status"
    },
    {
      title: "Global Reach",
      value: "150+",
      status: "regions",
      icon: Globe,
      description: "Active coverage areas"
    }
  ];

  const alerts = [
    {
      type: "success",
      title: "System Update Complete",
      message: "All ML models updated successfully",
      time: "2 hours ago",
      icon: CheckCircle
    },
    {
      type: "warning",
      title: "High Activity Detected",
      message: "Unusual spike in Mumbai region",
      time: "4 hours ago",
      icon: AlertTriangle
    }
  ];

  const recentActivity = [
    {
      type: "diagnosis",
      title: "Blood smear analysis completed",
      time: "5 minutes ago",
      result: "Negative",
      status: "success"
    },
    {
      type: "forecast",
      title: "Mumbai region forecast updated",
      time: "1 hour ago",
      result: "Low risk",
      status: "info"
    },
    {
      type: "diagnosis",
      title: "Symptoms analysis completed",
      time: "2 hours ago",
      result: "High risk",
      status: "warning"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Header Section */}
      <section className="relative px-4 py-12 lg:px-6 lg:py-16 overflow-hidden">
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
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Live System Monitoring
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                OutbreakLens
              </span>
              <br />
              <span className="text-foreground">
                Dashboard
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Real-time monitoring and analytics for malaria diagnosis and outbreak forecasting systems.
              <span className="text-primary font-medium"> Stay ahead of outbreaks with AI-powered insights.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              {DEMO_MODE && (
                <Badge variant="outline" className="border-primary/30 text-primary px-4 py-2">
                  Demo Mode Active
                </Badge>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last updated: Just now</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="px-4 lg:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Enhanced Quick Stats */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Real-Time Analytics
              </h2>
              <p className="text-muted-foreground">
                Live monitoring of diagnosis systems and outbreak predictions
              </p>
            </motion.div>

            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <Card className="data-card group hover:shadow-medical-lg hover:scale-[1.02] transition-all duration-300 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">{stat.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Sparkline
                                data={stat.sparklineData}
                                color={stat.trend === 'up' ? 'hsl(var(--success))' : stat.trend === 'down' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                              />
                              <Badge
                                variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'destructive' : 'secondary'}
                                className={`text-xs ${stat.trend === 'stable' ? 'bg-muted text-muted-foreground' : ''}`}
                              >
                                {stat.change}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-3xl font-bold">
                              <AnimatedCounter value={stat.value} />
                              {stat.suffix}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TooltipProvider>
          </section>

          {/* System Health & Performance */}
          <section className="grid lg:grid-cols-3 gap-8">
            {/* System Metrics */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="data-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>System Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators and system health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemMetrics.map((metric, index) => {
                      const Icon = metric.icon;
                      return (
                        <motion.div
                          key={metric.title}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          viewport={{ once: true }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{metric.title}</p>
                              <p className="text-xs text-muted-foreground">{metric.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{metric.value}</p>
                            <Badge variant="outline" className="text-xs">
                              {metric.status}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Main Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-semibold">Quick Actions</h3>
                <p className="text-muted-foreground">Access core functionality and system tools</p>
              </div>

              <div className="grid gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card group cursor-pointer hover:shadow-medical-lg transition-all duration-300">
                    <Link to="/diagnosis" className="block">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                            <Microscope className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              Malaria Diagnosis
                            </CardTitle>
                            <CardDescription>
                              Upload blood smear images or enter patient symptoms for AI-powered analysis
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card group cursor-pointer hover:shadow-medical-lg transition-all duration-300">
                    <Link to="/forecast" className="block">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-success/10">
                            <TrendingUp className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              Outbreak Forecasting
                            </CardTitle>
                            <CardDescription>
                              Predict regional malaria outbreaks with advanced epidemiological models
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="data-card group cursor-pointer hover:shadow-medical-lg transition-all duration-300">
                    <Link to="/reports" className="block">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-success/10 to-primary/10">
                            <FileText className="h-6 w-6 text-success" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              Reports & History
                            </CardTitle>
                            <CardDescription>
                              View past diagnoses, export reports, and track historical data trends
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Alerts & Notifications */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-6"
            >
              <h3 className="text-xl font-semibold mb-2">System Alerts</h3>
              <p className="text-muted-foreground">Important notifications and system updates</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`data-card border-l-4 ${
                      alert.type === 'success'
                        ? 'border-l-success'
                        : 'border-l-warning'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            alert.type === 'success'
                              ? 'bg-success/10'
                              : 'bg-warning/10'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              alert.type === 'success'
                                ? 'text-success'
                                : 'text-warning'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {alert.time}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Enhanced Recent Activity */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="data-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Recent Activity</span>
                      </CardTitle>
                      <CardDescription>
                        Latest system operations and user interactions
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/reports">
                        View all
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'diagnosis'
                            ? 'bg-primary/10'
                            : 'bg-accent/10'
                        }`}>
                          {activity.type === 'diagnosis' ? (
                            <Microscope className="h-4 w-4 text-primary" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-accent" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{activity.title}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{activity.time}</span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            activity.status === 'success'
                              ? 'default'
                              : activity.status === 'warning'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {activity.result}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;