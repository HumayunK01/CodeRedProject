import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { chatbotService, ChatMessage } from '@/lib/chatbot';
import {
  Send,
  Loader2,
  Bot,
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

interface ChatbotProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export const Chatbot = ({ className = '', isOpen, onToggle }: ChatbotProps) => {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat with AI welcome message
  useEffect(() => {
    const initChat = async () => {
      try {
        const welcome = await chatbotService.getWelcomeMessage();
        setMessages([{
          id: '1',
          role: 'assistant',
          content: welcome,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to init chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      const response = await chatbotService.sendMessage([...messages, userMessage], {
        context: `User is currently viewing page: ${location.pathname}`
      });

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
      // Re-focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = async () => {
    setMessages([]);
    setIsInitializing(true);
    setInputValue('');

    try {
      const welcome = await chatbotService.getWelcomeMessage();
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: welcome,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to restart chat:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className={className}>
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<Bot className="h-6 w-6" />}
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
            className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
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
            {messages.map((message) => (
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
                    className={
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md"
                        : "bg-white dark:bg-muted shadow-sm border border-border/50"
                    }
                  >
                    {/* Render message content with basic formatting */}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </ChatBubbleMessage>

                  <div className={cn(
                    "flex px-1 mt-1 text-muted-foreground",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-[10px]">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  src="/graphimage.png"
                  fallback="AI"
                  className="bg-primary/10 text-primary"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter className="bg-background/40 backdrop-blur-md p-3 border-t">
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
