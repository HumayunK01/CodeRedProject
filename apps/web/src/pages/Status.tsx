import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { HealthStatus } from "@/lib/types";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Server,
  Database,
  Zap,
  Clock
} from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/hooks/use-toast";

const Status = () => {
  const { toast } = useToast();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getHealth();
      setHealth(result);
      setLastCheck(new Date().toISOString());
    } catch (error) {
      const errorHealth: HealthStatus = {
        status: 'down',
        message: 'Failed to connect to backend service',
        timestamp: new Date().toISOString()
      };
      setHealth(errorHealth);
      setLastCheck(new Date().toISOString());
      
      toast({
        title: "Health Check Failed",
        description: "Unable to connect to the backend service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'warn':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case 'down':
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Activity className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'default';
      case 'warn':
        return 'destructive';
      case 'down':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const services = [
    {
      name: "Backend API",
      description: "ML inference and data processing service",
      status: health?.status || 'unknown',
      icon: Server,
      endpoint: "/health"
    },
    {
      name: "Image Analysis",
      description: "Computer vision model serving",
      status: health?.status === 'ok' ? 'ok' : health?.status || 'unknown',
      icon: Activity,
      endpoint: "/predict/image"
    },
    {
      name: "Symptoms Engine",
      description: "Risk assessment and classification",
      status: health?.status === 'ok' ? 'ok' : health?.status || 'unknown',
      icon: Database,
      endpoint: "/predict/symptoms"
    },
    {
      name: "Forecast Service",
      description: "Epidemiological prediction models",
      status: health?.status === 'ok' ? 'ok' : health?.status || 'unknown',
      icon: Zap,
      endpoint: "/forecast/region"
    }
  ];

  const buildInfo = {
    version: "1.0.0",
    build: "demo-build-123",
    deployed: "2024-01-01T00:00:00Z",
    commit: "abc123f"
  };

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Status</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of OutbreakLens services and infrastructure
            </p>
          </div>
          
          <Button 
            onClick={checkHealth}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

      </motion.div>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="data-card">
          <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {health && (
                <motion.div
                  animate={{ 
                    scale: health.status === 'ok' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ 
                    repeat: health.status === 'ok' ? Infinity : 0,
                    duration: 2 
                  }}
                >
                  {getStatusIcon(health.status)}
                </motion.div>
              )}
              <div>
                <CardTitle>
                  Overall System Health
                </CardTitle>
                <CardDescription>
                  {health?.message || 'Checking system status...'}
                </CardDescription>
              </div>
            </div>
            
            {health && (
              <Badge variant={getStatusColor(health.status) as any}>
                <motion.div
                  className="flex items-center space-x-1"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ 
                    repeat: health.status !== 'ok' ? Infinity : 0,
                    duration: 1.5 
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-current" />
                  <span>{health.status.toUpperCase()}</span>
                </motion.div>
              </Badge>
            )}
          </div>
          </CardHeader>
          
          {lastCheck && (
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last checked: {dayjs(lastCheck).format('MMM D, YYYY [at] h:mm:ss A')}</span>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Service Status */}
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            >
              <Card className="data-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ 
                          scale: service.status === 'ok' ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ 
                          repeat: service.status === 'ok' ? Infinity : 0,
                          duration: 3,
                          delay: index * 0.2
                        }}
                      >
                        {getStatusIcon(service.status)}
                      </motion.div>
                      <Badge variant={getStatusColor(service.status) as any}>
                        <motion.div
                          className="flex items-center space-x-1"
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ 
                            repeat: service.status !== 'ok' ? Infinity : 0,
                            duration: 2,
                            delay: index * 0.1
                          }}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span>{service.status.toUpperCase()}</span>
                        </motion.div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <code className="bg-muted/50 px-2 py-1 rounded text-xs">
                      {service.endpoint}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Build Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Build Information</CardTitle>
            <CardDescription>
              Current deployment details and version information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Version</p>
                <p className="text-muted-foreground">{buildInfo.version}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Build ID</p>
                <p className="text-muted-foreground font-mono">{buildInfo.build}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Deployed</p>
                <p className="text-muted-foreground">
                  {dayjs(buildInfo.deployed).format('MMM D, YYYY')}
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Commit</p>
                <p className="text-muted-foreground font-mono">{buildInfo.commit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Card className="data-card">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              System performance and response time indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-success">
                  N/A
                </div>
                <p className="text-sm text-muted-foreground">Average Response Time</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  N/A
                </div>
                <p className="text-sm text-muted-foreground">Uptime (30 days)</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-accent">
                  N/A
                </div>
                <p className="text-sm text-muted-foreground">Requests Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Status;