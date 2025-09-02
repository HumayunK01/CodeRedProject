import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Code, 
  Settings, 
  Database, 
  Zap,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Docs = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Code snippet copied successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {language}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="h-8 w-8 p-0"
        >
          {copiedCode === id ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  const apiEndpoints = [
    {
      method: "POST",
      path: "/predict/image",
      description: "Upload blood smear image for AI analysis",
      request: "multipart/form-data with 'file' field",
      response: `{
  "label": "Positive|Negative",
  "confidence": 0.87,
  "explanations": {
    "gradcam": "base64_image_string"
  }
}`
    },
    {
      method: "POST", 
      path: "/predict/symptoms",
      description: "Analyze symptoms for malaria risk assessment",
      request: `{
  "fever": true,
  "chills": true,
  "headache": false,
  "anemia": true,
  "nausea": false,
  "age": 35,
  "region": "Mumbai"
}`,
      response: `{
  "probability": 0.72,
  "threshold": 0.5,
  "label": "High Risk",
  "confidence": 0.84
}`
    },
    {
      method: "POST",
      path: "/forecast/region",
      description: "Generate outbreak forecast for specific region",
      request: `{
  "region": "Mumbai",
  "horizon_weeks": 4
}`,
      response: `{
  "region": "Mumbai",
  "predictions": [
    {"week": "2024-W01", "cases": 120},
    {"week": "2024-W02", "cases": 135}
  ],
  "hotspot_score": 0.72,
  "hotspots": [
    {"lat": 19.0760, "lng": 72.8777, "intensity": 0.8}
  ]
}`
    },
    {
      method: "GET",
      path: "/health",
      description: "Check backend service health status",
      request: "No body required",
      response: `{
  "status": "ok|warn|down",
  "message": "Service operational",
  "timestamp": "2024-01-01T00:00:00Z"
}`
    }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Complete developer guide for BioSentinel integration and deployment
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary">
            API Reference
          </Badge>
          <Badge variant="outline" className="border-accent/30 text-accent">
            Setup Guide
          </Badge>
          <Badge variant="outline" className="border-success/30 text-success">
            Examples
          </Badge>
        </div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="data-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Quick Start</CardTitle>
            </div>
            <CardDescription>
              Get BioSentinel running locally in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">1. Environment Setup</h3>
              <CodeBlock
                id="env-setup"
                language="bash"
                code={`# Clone the repository
git clone https://github.com/your-org/biosentinel-frontend.git
cd biosentinel-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">2. Environment Configuration</h3>
              <CodeBlock
                id="env-config"
                language="env"
                code={`# .env.local
NEXT_PUBLIC_APP_NAME=BioSentinel
INFER_BASE_URL=http://localhost:8000
INFER_TIMEOUT_MS=15000`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">3. Start Development Server</h3>
              <CodeBlock
                id="dev-start"
                language="bash"
                code={`# Start the development server
npm run dev

# Open browser to http://localhost:3000
# The app will work in demo mode without backend`}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="data-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>API Reference</CardTitle>
            </div>
            <CardDescription>
              Backend endpoints and data contracts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={endpoint.method === "GET" ? "secondary" : "default"}
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </div>
                
                <p className="text-muted-foreground">{endpoint.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Request</h4>
                    <CodeBlock
                      id={`request-${index}`}
                      language="json"
                      code={endpoint.request}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <CodeBlock
                      id={`response-${index}`}
                      language="json"
                      code={endpoint.response}
                    />
                  </div>
                </div>
                
                {index < apiEndpoints.length - 1 && (
                  <hr className="border-border/50" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="data-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Configuration</CardTitle>
            </div>
            <CardDescription>
              Advanced configuration options and customizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Backend Integration</h3>
              <p className="text-muted-foreground mb-4">
                To connect to a real backend service, update your environment variables:
              </p>
              <CodeBlock
                id="backend-config"
                language="env"
                code={`# Point to your backend service
INFER_BASE_URL=https://your-api-domain.com

# Adjust timeout for slower networks
INFER_TIMEOUT_MS=30000`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Map Tiles Configuration</h3>
              <p className="text-muted-foreground mb-4">
                Switch from OpenStreetMap to Mapbox for enhanced mapping:
              </p>
              <CodeBlock
                id="map-config"
                language="typescript"
                code={`// In src/components/forecast/ForecastMap.tsx
// Replace OpenStreetMap tiles with Mapbox
const mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

// Add your Mapbox token
const mapboxToken = 'your_mapbox_access_token_here';`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Build Configuration</h3>
              <CodeBlock
                id="build-config"
                language="bash"
                code={`# Production build
npm run build

# Static export for CDN deployment
npm run export

# Preview production build
npm run preview`}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deployment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="data-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Deployment Guide</CardTitle>
            </div>
            <CardDescription>
              Deploy BioSentinel to production environments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Docker Deployment</h3>
              <CodeBlock
                id="docker-deploy"
                language="dockerfile"
                code={`# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Environment Variables</h3>
              <p className="text-muted-foreground mb-4">
                Required environment variables for production deployment:
              </p>
              <CodeBlock
                id="prod-env"
                language="env"
                code={`# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=BioSentinel
INFER_BASE_URL=https://api.your-domain.com
INFER_TIMEOUT_MS=15000

# Optional: Analytics and monitoring
ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn`}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground text-lg">
            Get support and connect with the development community
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            GitHub Issues
          </Button>
          
          <Button variant="outline" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
          
          <Button asChild size="lg" className="btn-medical">
            <Link to="/about">
              Contact Team
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Docs;