import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { chatbotService, ChatMessage } from '@/lib/chatbot';
import {
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleActionWrapper,
  ChatBubbleAction
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";

// Helper component to render message content with table support
const MessageContent = ({ content }: { content: string }) => {
  // Check if content contains a table (markdown table format)
  const hasTable = content.includes('|') && content.includes('---');

  if (!hasTable) {
    return <div className="whitespace-pre-wrap text-sm">{content}</div>;
  }

  // Split content into parts (text before table, table, text after table)
  const parts = content.split(/(\|[^\n]+\|(?:\n\|[-:| ]+\|)?(?:\n\|[^\n]+\|)*)/g);

  return (
    <div className="text-sm space-y-3">
      {parts.map((part, index) => {
        // Check if this part is a table
        if (part.includes('|') && part.includes('---')) {
          const lines = part.trim().split('\n').filter(line => line.trim());
          if (lines.length < 2) return <div key={index} className="whitespace-pre-wrap">{part}</div>;

          // Parse table
          const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
          const rows = lines.slice(2).map(line =>
            line.split('|').map(cell => cell.trim()).filter(cell => cell)
          );

          return (
            <div key={index} className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-border/50 rounded-md overflow-hidden text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    {headers.map((header, i) => (
                      <th key={i} className="border border-border/50 px-3 py-2 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-border/50 px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Regular text
        return part.trim() ? (
          <div key={index} className="whitespace-pre-wrap">{part}</div>
        ) : null;
      })}
    </div>
  );
};

interface ChatbotProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

// Generate contextual quick-reply suggestions based on the AI's last message
const generateQuickReplies = (message: string): string[] => {
  if (!message || !message.includes('?')) return [];
  const lower = message.toLowerCase();

  // Age questions
  if (/\b(age|how old|years old)\b/.test(lower)) {
    return ['Under 5 years', '5-17 years', '18-40 years', '41-65 years', 'Over 65'];
  }

  // Sex / pregnancy
  if (/\b(sex|gender|male or female|pregnant|pregnancy)\b/.test(lower)) {
    return ['Male', 'Female', 'Pregnant', 'Prefer not to say'];
  }

  // Duration / onset
  if (/\b(how long|how many days|since when|when did|duration|onset)\b/.test(lower)) {
    return ['Less than a day', '1-3 days', '3-7 days', 'More than a week'];
  }

  // Travel / location
  if (/\b(travel|traveled|travelled|live|located|country|region|endemic)\b/.test(lower)) {
    return ['I live in an endemic area', 'I traveled recently', 'Neither', 'Not sure'];
  }

  // Bed net / prevention
  if (/\b(bed net|mosquito net|repellent|prophylaxis|antimalarial)\b/.test(lower)) {
    return ['Yes, regularly', 'Sometimes', 'No', 'Not sure'];
  }

  // Symptom yes/no questions
  if (/\b(do you have|are you|have you|experiencing)\b/.test(lower)) {
    return ['Yes', 'No', 'Not sure'];
  }

  // Pre-existing conditions
  if (/\b(condition|medication|medical history|prior|previous)\b/.test(lower)) {
    return ['None', 'Yes, I have some', 'Tell me more'];
  }

  // Severity
  if (/\b(severe|severity|intensity|how bad|mild|moderate)\b/.test(lower)) {
    return ['Mild', 'Moderate', 'Severe'];
  }

  // Generic fallback for any question
  return ['Yes', 'No', 'Tell me more'];
};

export const Chatbot = ({ className = '', isOpen, onToggle }: ChatbotProps) => {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat with AI welcome message
  useEffect(() => {
    const welcome = "Hello! 👋 I'm your Foresee AI Assistant, here to help you with all things related to malaria.\n\nI can assist you with:\n• Understanding malaria symptoms and diagnosis\n• Learning about outbreak forecasting and prevention\n• Getting region-specific risk information\n• Navigating the Foresee platform\n\nWhat would you like to know?";

    setMessages([{
      id: '1',
      role: 'assistant',
      content: welcome,
      timestamp: new Date()
    }]);
    setIsInitializing(false);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-resize input based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '48px'; // Reset height
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const sendUserMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingMessageId(assistantId);

    try {
      await chatbotService.sendMessageStream(
        [...messages, userMessage],
        (fullText) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: fullText } : m
          ));
        },
        {
          context: `User is currently viewing page: ${location.pathname}`
        }
      );
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or consult with healthcare professionals for medical advice.' }
          : m
      ));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendUserMessage(inputValue);
  };

  // Compute quick replies from the latest assistant message
  const quickReplies = useMemo(() => {
    if (isLoading || messages.length === 0) return [];
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant' || !last.content) return [];
    return generateQuickReplies(last.content);
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setIsInitializing(true);
    setInputValue('');

    const welcome = "Hello! 👋 I'm your Foresee AI Assistant, here to help you with all things related to malaria.\n\nI can assist you with:\n• Understanding malaria symptoms and diagnosis\n• Learning about outbreak forecasting and prevention\n• Getting region-specific risk information\n• Navigating the Foresee platform\n\nWhat would you like to know?";

    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: welcome,
      timestamp: new Date()
    }]);
    setIsInitializing(false);
  };

  return (
    <div className={className}>
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<img src="/chatbubble.png" alt="Chat" className="h-[50px] w-[50px] object-contain drop-shadow-xl" />}
        isOpen={isOpen}
        onOpenChange={onToggle}
      >
        <ExpandableChatHeader className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-background to-accent/5 backdrop-blur-sm border-b border-border/50 py-3 px-4">
          <h1 className="text-sm font-semibold text-foreground">
            Foresee AI Assistant
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={startNewChat}
            className="hidden sm:flex h-6 w-6 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
            title="Start New Chat"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </ExpandableChatHeader>

        <ExpandableChatBody className="bg-gradient-to-b from-background/50 to-background">
          <ChatMessageList>
            {messages.length === 0 && isInitializing && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  src="/graphimage.png"
                  fallback="AI"
                  className="bg-primary/10 text-primary"
                />
                <div className="flex flex-col gap-1 w-full max-w-[85%] items-start">
                  <ChatBubbleMessage isLoading={true} />
                </div>
              </ChatBubble>
            )}
            {messages.map((message) => {
              const isStreamingThis = streamingMessageId === message.id;
              const isEmptyStreaming = isStreamingThis && message.content.length === 0;

              return (
                <ChatBubble
                  key={message.id}
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  <ChatBubbleAvatar
                    fallback={message.role === "user" ? "US" : "AI"}
                    src={message.role === "assistant" ? "/graphimage.png" : "/user.png"}
                    className={message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted"}
                  />
                  <div className={cn(
                    "flex flex-col gap-1 w-full max-w-[85%]",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <ChatBubbleMessage
                      variant={message.role === "user" ? "sent" : "received"}
                      isLoading={isEmptyStreaming}
                      className={
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md"
                          : "bg-white dark:bg-muted shadow-sm border border-border/50"
                      }
                    >
                      {!isEmptyStreaming && (
                        <>
                          <MessageContent content={message.content} />
                          {isStreamingThis && (
                            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary/70 align-middle animate-pulse" />
                          )}
                        </>
                      )}
                    </ChatBubbleMessage>

                    {!isEmptyStreaming && (
                      <div className={cn(
                        "flex px-1 mt-1 text-muted-foreground",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-[10px]">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </ChatBubble>
              );
            })}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter className="bg-background/40 backdrop-blur-md p-3 border-t">
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5 px-0.5">
              {quickReplies.map((reply) => (
                <motion.button
                  key={reply}
                  type="button"
                  onClick={() => sendUserMessage(reply)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-border/60 bg-background/80 text-foreground/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors shadow-sm"
                  disabled={isLoading}
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          )}
          <form
            onSubmit={handleSendMessage}
            className="flex flex-col gap-2"
          >
            <div className="relative w-full rounded-[24px] border bg-white shadow-sm focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-200">
              <ChatInput
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="min-h-[48px] max-h-[200px] w-full resize-none border-0 bg-transparent py-3.5 pl-4 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/50 shadow-none overflow-y-auto scrollbar-hide"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:scale-105 active:scale-95"
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="size-4 ml-0.5" />
                )}
              </Button>
            </div>

            <div className="text-center px-4">
              <p className="text-[10px] text-muted-foreground/60">
                AI can make mistakes. Please verify important medical info.
              </p>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  );
};
