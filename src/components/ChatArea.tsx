import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";

// Define the Message type to match what's used in ChatMessage.tsx
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
  };
  channelId: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: any[];
  reactions: any[];
  isEdited?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, attachments?: File[]) => void;
  onEditMessage: (id: string, text: string) => void;
  onDeleteMessage: (id: string) => void;
}

export function ChatArea({
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}: ChatAreaProps) {
  const [replyTo, setReplyTo] = useState<Message | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollToBottom(isScrolledUp);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleSendMessage = (text: string, attachments?: File[]) => {
    onSendMessage(text, attachments);
    setReplyTo(undefined);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground text-sm">
                Start the conversation by sending a message below. You can share
                images, files, and more.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onReply={handleReply}
              />
            ))}
            {/* Extra padding div to ensure enough space at bottom for UI elements like emoji picker */}
            <div className="h-36 w-full" aria-hidden="true"></div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollToBottom && (
        <button
          className="absolute bottom-[5.58rem] right-6 z-10 bg-chat-primary text-white p-2 rounded-full shadow-md hover:bg-chat-primary/90 transition-colors"
          onClick={scrollToBottom}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(undefined)}
      />
    </div>
  );
}
