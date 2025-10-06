import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { chatbotService, ChatMessage } from '@/lib/chatbot';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle
} from 'lucide-react';

interface ChatbotProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export const Chatbot = ({ className = '', isOpen: externalIsOpen, onToggle }: ChatbotProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onToggle) {
      onToggle(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for OutbreakLens - an AI-powered malaria diagnosis and outbreak forecasting platform. I can help you with:\n\n• Malaria symptoms and diagnosis\n• Prevention strategies and treatments\n• Outbreak forecasting and risk assessment\n• Location-based malaria analysis\n• How to use this website\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await chatbotService.sendMessage([...messages, userMessage]);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or consult with healthcare professionals for medical advice.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for malaria information and outbreak forecasting. I can help answer questions about symptoms, prevention, and risk assessment. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
    setInputValue('');
  };

  // Simple text formatter for basic markdown-like formatting
  const formatMessage = (content: string) => {
    // Split by newlines and process each line
    return content.split('\n').map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex items-start space-x-2 mb-1">
            <span className="text-primary mt-0.5">•</span>
            <span>{line.replace(/^•\s*/, '').replace(/^-/, '')}</span>
          </div>
        );
      }

      // Handle bold text (basic **text** pattern)
      const boldPattern = /\*\*(.*?)\*\*/g;
      if (boldPattern.test(line)) {
        const parts = line.split(boldPattern);
        return (
          <div key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </div>
        );
      }

      // Handle headers (### text pattern)
      if (line.trim().startsWith('###')) {
        return (
          <h4 key={index} className="font-semibold text-primary mt-3 mb-2">
            {line.replace(/^###\s*/, '')}
          </h4>
        );
      }

      // Regular paragraph
      return line.trim() ? <p key={index} className="mb-2 last:mb-0">{line}</p> : null;
    }).filter(Boolean);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Status Indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] h-[450px] sm:h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-10rem)] z-40"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
              {/* Header */}
              <div className="p-4 border-b bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">AI Malaria Assistant</h3>
                      <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startNewChat}
                    className="text-xs"
                  >
                    New Chat
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 min-h-0">
                <div className="space-y-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="text-sm leading-relaxed">
                            {formatMessage(message.content)}
                          </div>
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>


              {/* Input Area */}
              <div className="p-4 border-t bg-background/50">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about malaria..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="px-3"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Medical Disclaimer */}
                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Not medical advice - consult healthcare professionals</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
