import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NewsletterSignupProps {
  variant?: "default" | "card" | "inline";
  className?: string;
}

export const NewsletterSignup = ({ variant = "default", className = "" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubscribed(true);
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "card") {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Stay Updated</CardTitle>
          <CardDescription>
            Get the latest updates on AI healthcare innovation and Foresee features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isSubscribed}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-medical"
              disabled={isLoading || isSubscribed}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isSubscribed ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isSubscribed}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          onClick={handleSubmit}
          className="btn-medical"
          disabled={isLoading || isSubscribed}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : isSubscribed ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Subscribed!
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Newsletter</h4>
        <p className="text-sm text-muted-foreground">
          Stay updated with the latest in AI healthcare innovation.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isSubscribed}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          size="sm"
          className="btn-medical"
          disabled={isLoading || isSubscribed}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : isSubscribed ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    </div>
  );
};
