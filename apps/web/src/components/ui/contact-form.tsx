import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ContactFormProps {
  variant?: "default" | "card";
  className?: string;
}

export const ContactForm = ({ variant = "default", className = "" }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "partnership", label: "Partnership" },
    { value: "media", label: "Media & Press" },
    { value: "research", label: "Research Collaboration" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isLoading || isSubmitted}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isLoading || isSubmitted}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="inquiryType" className="text-sm font-medium text-foreground">
          Inquiry Type
        </label>
        <Select
          value={formData.inquiryType}
          onValueChange={(value) => handleInputChange("inquiryType", value)}
          disabled={isLoading || isSubmitted}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            {inquiryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">
          Subject
        </label>
        <Input
          id="subject"
          type="text"
          placeholder="Brief subject line"
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          disabled={isLoading || isSubmitted}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message *
        </label>
        <Textarea
          id="message"
          placeholder="Tell us how we can help you..."
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          disabled={isLoading || isSubmitted}
          rows={5}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full btn-medical"
        disabled={isLoading || isSubmitted}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
            />
            Sending...
          </>
        ) : isSubmitted ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Message Sent!
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );

  if (variant === "card") {
    return (
      <Card className={`w-full max-w-2xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Have questions about Foresee? We'd love to hear from you.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
        <p className="text-muted-foreground">
          Send us a message and we'll respond as soon as possible.
        </p>
      </div>
      {formContent}
    </div>
  );
};
