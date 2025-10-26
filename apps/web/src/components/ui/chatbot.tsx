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
  AlertCircle,
  Brain,
  Sparkles,
  Heart,
  Activity,
  Clock
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
      content: 'Hello! I\'m your AI assistant for malaria information and outbreak forecasting. I can help answer questions about symptoms, prevention, and risk assessment. How can I assist you today?',
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

  // Enhanced text formatter for medical content
  const formatMessage = (content: string) => {
    // Split by newlines and process each line
    return content.split('\n').map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 mb-2 group"
          >
            <div className="p-1 rounded-full bg-primary/10 mt-0.5 group-hover:bg-primary/20 transition-colors">
              <span className="text-primary text-xs">•</span>
            </div>
            <span className="text-sm leading-relaxed">{line.replace(/^•\s*/, '').replace(/^-/, '')}</span>
          </motion.div>
        );
      }

      // Handle bold text (basic **text** pattern)
      const boldPattern = /\*\*(.*?)\*\*/g;
      if (boldPattern.test(line)) {
        const parts = line.split(boldPattern);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <motion.strong
                  key={i}
                  className="font-semibold text-primary"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {part}
                </motion.strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </motion.div>
        );
      }

      // Handle headers (### text pattern)
      if (line.trim().startsWith('###')) {
        return (
          <motion.h4
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-primary mt-4 mb-3 text-base border-l-2 border-primary/20 pl-3"
          >
            {line.replace(/^###\s*/, '')}
          </motion.h4>
        );
      }

      // Handle medical alerts/warnings
      if (line.trim().startsWith('⚠️') || line.toLowerCase().includes('warning') || line.toLowerCase().includes('caution')) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start space-x-3 mb-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
          >
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <span className="text-sm leading-relaxed">{line.replace(/^⚠️\s*/, '')}</span>
          </motion.div>
        );
      }

      // Regular paragraph
      return line.trim() ? (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="mb-3 last:mb-0 text-sm leading-relaxed"
        >
          {line}
        </motion.p>
      ) : null;
    }).filter(Boolean);
  };

  return (
    <>
      {/* Enhanced Chat Toggle Button */}
      <motion.div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="rounded-full w-16 h-16 shadow-medical-xl bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 group"
          >
            <div className="relative">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="w-7 h-7 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <MessageCircle className="w-7 h-7 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulsing background effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </Button>

          {/* Enhanced Status Indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-success to-success/80 rounded-full border-2 border-white shadow-sm"
            animate={{
              scale: [1, 1.3, 1],
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0.4)",
                "0 0 0 8px rgba(34, 197, 94, 0)",
                "0 0 0 0 rgba(34, 197, 94, 0)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            {isOpen ? 'Close AI Assistant' : 'Ask AI Assistant'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, rotateX: -10 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              scale: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[500px] h-[480px] sm:h-[580px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-10rem)] z-40"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-card/98 backdrop-blur-md overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/3 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
              </div>

              {/* Enhanced Header */}
              <div className="relative p-5 border-b border-border/50 bg-gradient-to-r from-primary/8 via-background/50 to-accent/8 backdrop-blur-sm">
                <div className="flex items-center justify-between relative z-10">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Brain className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <motion.h3
                        className="font-semibold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        AI Medical Assistant
                      </motion.h3>
                      <motion.div
                        className="flex items-center space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <p className="text-xs text-muted-foreground">Active • Ready to Help</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startNewChat}
                      className="text-xs hover:bg-primary/10 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      New Chat
                    </Button>
                  </motion.div>
                </div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/10 to-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                />
              </div>

              {/* Enhanced Messages */}
              <ScrollArea className="flex-1 p-6 min-h-0 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none"></div>
                <div className="relative z-10 space-y-6 pr-2">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-4'
                            : 'bg-gradient-to-br from-muted/80 to-muted/60 border border-border/50 mr-4'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div
                            className={`p-1.5 rounded-full flex-shrink-0 ${
                              message.role === 'user'
                                ? 'bg-primary-foreground/20'
                                : 'bg-primary/10'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {message.role === 'assistant' ? (
                              <Brain className="w-4 h-4 text-primary" />
                            ) : (
                              <User className="w-4 h-4 text-primary-foreground" />
                            )}
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm leading-relaxed">
                              {formatMessage(message.content)}
                            </div>

                            <motion.div
                              className={`text-xs mt-3 flex items-center space-x-1 ${
                                message.role === 'user'
                                  ? 'text-primary-foreground/60 justify-end'
                                  : 'text-muted-foreground justify-start'
                              }`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Clock className="w-3 h-3" />
                              <span>
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Enhanced Loading indicator */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gradient-to-br from-muted/80 to-muted/60 p-4 rounded-2xl border border-border/50 shadow-sm mr-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className="p-2 rounded-full bg-primary/10"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                              <Brain className="w-4 h-4 text-primary" />
                            </motion.div>
                            <div className="flex space-x-1">
                              <motion.div
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.1 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="relative p-5 border-t border-border/50 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm">
                <div className="flex space-x-3">
                  <motion.div
                    className="flex-1 relative"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about malaria symptoms, prevention, or outbreaks..."
                      disabled={isLoading}
                      className="pr-12 h-12 text-base border-2 border-border/50 focus:border-primary/50 bg-background/80 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-300"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      Press Enter to send
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      size="lg"
                      className="h-12 px-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl shadow-lg transition-all duration-300"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>

              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

