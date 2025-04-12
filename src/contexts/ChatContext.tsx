import React, { createContext, useState, useContext, useEffect } from "react";
import { Channel, User } from "../types";
import { mockChannels, getMockMessages, mockUsers } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";

// Define types for the context
interface Attachment {
  id: string;
  type: "image" | "file" | "audio";
  url: string;
  name: string;
  size?: number;
  duration?: number; // For audio attachments
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

interface Message {
  id: string;
  content: string;
  sender: User;
  channelId: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
  reactions: Reaction[];
  failed?: boolean;
  isEdited?: boolean;
}

interface ChatContextType {
  channels: Channel[];
  activeChannel: Channel | null;
  messages: Message[];
  setActiveChannel: (channel: Channel) => void;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  createChannel: (
    name: string,
    members: User[],
    isPrivate: boolean,
    isDirect?: boolean
  ) => Promise<Channel>;
  loading: boolean;
  currentlyEditingId: string | null;
  setCurrentlyEditingId: (id: string | null) => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [currentlyEditingId, setCurrentlyEditingId] = useState<string | null>(
    null
  );

  // Fetch channels when user changes
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) {
        setChannels([]);
        setActiveChannel(null);
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use mock data for now until API is fully set up
        const userChannels = mockChannels.filter((channel) =>
          channel.members.some((member) => member.id === user.id)
        );

        setChannels(userChannels);

        if (userChannels.length > 0 && !activeChannel) {
          const initialChannel = userChannels[0];
          setActiveChannel(initialChannel);
          await fetchMessages(initialChannel.id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching channels:", error);
        setLoading(false);
      }
    };

    fetchChannels();
  }, [user]);

  // Fetch messages when active channel changes
  const fetchMessages = async (channelId: string) => {
    try {
      // For now, use mock data
      const channelMessages = getMockMessages(channelId);
      setMessages(channelMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSetActiveChannel = async (channel: Channel) => {
    setActiveChannel(channel);
    await fetchMessages(channel.id);
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!activeChannel || !user) return;

    // Create a temporary message ID that we can reference in the catch block
    const tempId = `temp_${Date.now()}`;

    try {
      // Process attachments if any
      const processedAttachments: Attachment[] = [];

      if (attachments && attachments.length > 0) {
        // In a real app, we would upload these files to storage
        // For demo, we'll create local object URLs
        attachments.forEach((file, index) => {
          const fileType = file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("audio/")
            ? "audio"
            : "file";

          // Create a local URL for the file (in a real app, this would be a server URL)
          const url = URL.createObjectURL(file);

          processedAttachments.push({
            id: `attachment_${Date.now()}_${index}`,
            type: fileType as "image" | "file" | "audio",
            url,
            name: file.name,
            size: file.size,
          });
        });
      }

      const newMessage: Message = {
        id: tempId,
        content,
        sender: user,
        channelId: activeChannel.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        reactions: [],
        attachments:
          processedAttachments.length > 0 ? processedAttachments : undefined,
      };

      // Add to local state immediately for optimistic UI
      setMessages((prev) => [...prev, newMessage]);

      // In a real app, this would be an API call
      // For now, simulate a delay and update with a "real" ID
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, id: `msg_${Date.now()}` } : msg
          )
        );
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);

      // Mark the message as failed
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? { ...msg, failed: true } : msg))
      );

      toast.error("Failed to send message", {
        icon: <AlertCircle className="h-4 w-4" />,
        position: "top-right",
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!activeChannel) return;

    try {
      // Update message in local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, updatedAt: new Date() }
            : msg
        )
      );

      // In a real app, this would be an API call
      // For now, we just update the local state
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");

      // Fetch messages again to restore state
      if (activeChannel) {
        await fetchMessages(activeChannel.id);
      }
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeChannel) return;

    try {
      // Remove message from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // In a real app, this would be an API call
      // For now, we just update the local state
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");

      // Fetch messages again to restore state
      if (activeChannel) {
        await fetchMessages(activeChannel.id);
      }
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!activeChannel || !user) return;

    try {
      // Update message in local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          // Check if reaction already exists
          const existingReaction = msg.reactions.find((r) => r.emoji === emoji);

          if (existingReaction) {
            // If user already reacted, remove their reaction
            if (existingReaction.users.includes(user.id)) {
              const updatedUsers = existingReaction.users.filter(
                (id) => id !== user.id
              );

              // If no users left, remove the reaction
              if (updatedUsers.length === 0) {
                return {
                  ...msg,
                  reactions: msg.reactions.filter((r) => r.emoji !== emoji),
                };
              }

              // Otherwise update the users list
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, users: updatedUsers, count: updatedUsers.length }
                    : r
                ),
              };
            }

            // If user hasn't reacted, add their reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      users: [...r.users, user.id],
                      count: r.count + 1,
                    }
                  : r
              ),
            };
          }

          // If reaction doesn't exist, add it
          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              {
                emoji,
                count: 1,
                users: [user.id],
              },
            ],
          };
        })
      );

      // In a real app, this would be an API call
      // For now, we just update the local state
    } catch (error) {
      console.error("Error reacting to message:", error);
      toast.error("Failed to add reaction");

      // Fetch messages again to restore state
      if (activeChannel) {
        await fetchMessages(activeChannel.id);
      }
    }
  };

  const createChannel = async (
    name: string,
    members: User[],
    isPrivate: boolean,
    isDirect: boolean = false
  ): Promise<Channel> => {
    if (!user) throw new Error("User not authenticated");

    if (!members.some((m) => m.id === user.id)) {
      members.push(user);
    }

    // For direct messages, get other user and format name properly
    let channelName = name;
    const type = isDirect ? "direct" : "group";

    if (isDirect && members.length === 2) {
      const otherUser = members.find((m) => m.id !== user.id);
      if (otherUser) {
        channelName = otherUser.username;
      }
    }

    try {
      // Check if direct channel already exists
      if (isDirect) {
        const otherUserId = members.find((m) => m.id !== user.id)?.id;

        const existingChannel = channels.find(
          (c) =>
            c.type === "direct" &&
            c.members.length === 2 &&
            c.members.some((m) => m.id === otherUserId)
        );

        if (existingChannel) {
          setActiveChannel(existingChannel);
          await fetchMessages(existingChannel.id);
          return existingChannel;
        }
      }

      // Create new channel locally
      const newChannel: Channel = {
        id: `channel_${Date.now()}`,
        name: channelName,
        type: type,
        isPrivate,
        members,
        createdAt: new Date(),
        unreadCount: 0,
      };

      // Update state
      setChannels((prev) => [...prev, newChannel]);
      setActiveChannel(newChannel);
      setMessages([]);

      toast.success(`${isDirect ? "Conversation" : "Channel"} created`, {
        icon: <CheckCircle className="h-4 w-4" />,
        position: "top-right",
      });

      return newChannel;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  };

  const value = {
    channels,
    activeChannel,
    messages,
    setActiveChannel: handleSetActiveChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    createChannel,
    loading,
    currentlyEditingId,
    setCurrentlyEditingId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
