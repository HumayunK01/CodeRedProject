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
  Info
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
      sparklineData: [{ value: 18 }, { value: 22 }, { value: 20 }, { value: 26 }, { value: 24 }]
    },
    {
      title: "Active Forecasts",
      value: 8,
      change: "+3",
      trend: "up", 
      icon: TrendingUp,
      tooltip: "Regional outbreak forecasting models currently running with weekly predictions",
      sparklineData: [{ value: 5 }, { value: 6 }, { value: 7 }, { value: 5 }, { value: 8 }]
    },
    {
      title: "Risk Regions",
      value: 5,
      change: "-2",
      trend: "down",
      icon: MapPin,
      tooltip: "Geographic regions currently classified as high-risk for malaria outbreaks",
      sparklineData: [{ value: 8 }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 5 }]
    },
    {
      title: "System Health",
      value: "99.2%",
      change: "Stable",
      trend: "stable",
      icon: Activity,
      tooltip: "Overall system uptime and performance metrics for ML models and API endpoints",
      sparklineData: [{ value: 99 }, { value: 98.8 }, { value: 99.5 }, { value: 99.1 }, { value: 99.2 }]
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
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor malaria diagnosis and outbreak forecasting systems
            </p>
          </div>
          
          {DEMO_MODE && (
            <Badge variant="outline" className="border-primary/30 text-primary">
              Demo Mode
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="data-card group hover:scale-[1.02] transition-transform duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground hover:text-primary cursor-help" />
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
                          className="text-xs"
                        >
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Main Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="data-card group cursor-pointer">
            <Link to="/diagnosis" className="block">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Microscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Malaria Diagnosis
                    </CardTitle>
                    <CardDescription>
                      Upload images or input symptoms
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Start diagnosis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="data-card group cursor-pointer">
            <Link to="/forecast" className="block">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Outbreak Forecasting
                    </CardTitle>
                    <CardDescription>
                      Predict regional outbreaks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  View forecasts
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="data-card group cursor-pointer">
            <Link to="/reports" className="block">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <FileText className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Reports & History
                    </CardTitle>
                    <CardDescription>
                      View past results and exports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  View reports
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Card className="data-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system operations</CardDescription>
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
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30"
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
                  >
                    {activity.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;