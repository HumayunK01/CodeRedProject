"use client";

import React, { useRef, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ChatPosition = "bottom-right" | "bottom-left";
export type ChatSize = "sm" | "md" | "lg" | "xl" | "full";

const chatConfig = {
    dimensions: {
        sm: "sm:max-w-sm sm:max-h-[500px]",
        md: "sm:max-w-md sm:max-h-[600px]",
        lg: "sm:max-w-lg sm:max-h-[700px]",
        xl: "sm:max-w-xl sm:max-h-[800px]",
        full: "sm:w-full sm:h-full",
    },
    positions: {
        "bottom-right": "bottom-5 right-5",
        "bottom-left": "bottom-5 left-5",
    },
    chatPositions: {
        "bottom-right": "sm:bottom-[calc(100%+10px)] sm:right-0",
        "bottom-left": "sm:bottom-[calc(100%+10px)] sm:left-0",
    },
    states: {
        open: "pointer-events-auto opacity-100 visible scale-100 translate-y-0",
        closed:
            "pointer-events-none opacity-0 invisible scale-100 sm:translate-y-5",
    },
};

interface ExpandableChatProps extends React.HTMLAttributes<HTMLDivElement> {
    position?: ChatPosition;
    size?: ChatSize;
    icon?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ExpandableChat: React.FC<ExpandableChatProps> = ({
    className,
    position = "bottom-right",
    size = "md",
    icon,
    children,
    isOpen: controlledIsOpen,
    onOpenChange,
    ...props
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const toggleChat = () => {
        const newState = !isOpen;
        if (!isControlled) {
            setInternalIsOpen(newState);
        }
        onOpenChange?.(newState);
    };

    return (
        <div
            className={cn(`fixed ${chatConfig.positions[position]} z-50`, className)}
            {...props}
        >
            <div
                ref={chatRef}
                className={cn(
                    "flex flex-col bg-background border sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-250 ease-out sm:absolute sm:w-[90vw] sm:h-[80vh] fixed inset-0 w-full h-full sm:inset-auto",
                    chatConfig.chatPositions[position],
                    chatConfig.dimensions[size],
                    isOpen ? chatConfig.states.open : chatConfig.states.closed,
                    className,
                )}
            >
                {children}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 sm:hidden z-50"
                    onClick={toggleChat}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <ExpandableChatToggle
                icon={icon}
                isOpen={isOpen}
                toggleChat={toggleChat}
            />
        </div>
    );
};

ExpandableChat.displayName = "ExpandableChat";

const ExpandableChatHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex items-center justify-between p-4 border-b bg-card", className)}
        {...props}
    />
);

ExpandableChatHeader.displayName = "ExpandableChatHeader";

const ExpandableChatBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => <div className={cn("flex-grow flex flex-col overflow-hidden bg-card/50", className)} {...props} />;

ExpandableChatBody.displayName = "ExpandableChatBody";

const ExpandableChatFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => <div className={cn("border-t p-4 bg-card", className)} {...props} />;

ExpandableChatFooter.displayName = "ExpandableChatFooter";

interface ExpandableChatToggleProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    isOpen: boolean;
    toggleChat: () => void;
}

const ExpandableChatToggle: React.FC<ExpandableChatToggleProps> = ({
    className,
    icon,
    isOpen,
    toggleChat,
    ...props
}) => {
    return (
        <div className="relative">
            {/* Notification Dot */}
            {!isOpen && (
                <div className="absolute top-0.5 -right-0.5 z-10">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white dark:border-background shadow-lg" />
                </div>
            )}

            {/* Chat Button */}
            <Button
                variant="default"
                onClick={toggleChat}
                className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    isOpen
                        ? "w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                        : "w-auto h-auto rounded-none shadow-none bg-transparent hover:bg-transparent p-0 hover:scale-110",
                    className,
                )}
                {...props}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-primary-foreground" />
                ) : (
                    icon || <MessageCircle className="h-6 w-6 text-primary-foreground" />
                )}
            </Button>
        </div>
    );
};

ExpandableChatToggle.displayName = "ExpandableChatToggle";

export {
    ExpandableChat,
    ExpandableChatHeader,
    ExpandableChatBody,
    ExpandableChatFooter,
};
