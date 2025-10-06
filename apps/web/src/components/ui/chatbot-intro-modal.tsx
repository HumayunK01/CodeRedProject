import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  MessageCircle,
  Bot,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface ChatbotIntroModalProps {
  onClose: () => void;
  onOpenChat: () => void;
}

export const ChatbotIntroModal = ({ onClose, onOpenChat }: ChatbotIntroModalProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleTryChat = () => {
    setIsVisible(false);
    onClose();
    onOpenChat();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="relative overflow-hidden shadow-2xl border-0 bg-card">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-8 w-8 p-0 z-10"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold flex items-center">
                        Meet Your AI Assistant
                        <Sparkles className="w-4 h-4 ml-2 text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get instant help with malaria information
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Malaria Symptoms & Diagnosis</p>
                        <p className="text-sm text-muted-foreground">Get instant guidance on malaria symptoms and risk assessment</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Outbreak Forecasting</p>
                        <p className="text-sm text-muted-foreground">Learn about malaria prediction and prevention strategies</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location-Based Analysis</p>
                        <p className="text-sm text-muted-foreground">Get region-specific malaria risk information</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">24/7 Availability</p>
                        <p className="text-sm text-muted-foreground">Get instant answers anytime, anywhere</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        New
                      </Badge>
                      <span className="text-muted-foreground">
                        AI-powered responses for accurate malaria information
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Maybe Later
                    </Button>
                    <Button
                      onClick={handleTryChat}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Try AI Chat
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-4">
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Tip: Look for the chat bubble in the bottom-right corner anytime you need help!
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
