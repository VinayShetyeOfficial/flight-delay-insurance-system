
import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatArea } from "@/components/ChatArea";
import { useChat } from "@/contexts/ChatContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Loader2, Plus, MessageSquare, User as UserIcon, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateChannelDialog } from "@/components/CreateChannelDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Chat() {
  const { 
    activeChannel, 
    messages, 
    sendMessage, 
    editMessage, 
    deleteMessage,
    loading,
    createChannel,
    channels,
  } = useChat();
  
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [channelType, setChannelType] = useState<"group" | "direct">("group");
  
  // Close mobile menu when switching channels
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeChannel]);
  
  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;
  
  const handleSearchMessages = (query: string) => {
    setSearchQuery(query);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openCreateChannel = (type: "group" | "direct") => {
    setChannelType(type);
    setIsCreateDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-chat-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your conversations...</p>
        </div>
      </div>
    );
  }
  
  return (
    <SettingsProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <ChatSidebar 
          isOpen={isMobileMenuOpen} 
          onToggle={toggleMobileMenu}
          onCreateChannel={openCreateChannel} 
        />
        
        {!activeChannel ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="w-16 h-16 bg-chat-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-2xl text-chat-primary h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">Welcome to Echo Chat</h2>
              <p className="text-muted-foreground mb-6 dark:text-gray-400">
                {channels.length > 0 
                  ? "Select a channel from the sidebar to start messaging or create a new one." 
                  : "Create a new channel or direct message to start chatting."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  className="bg-chat-primary hover:bg-chat-primary/90 flex items-center gap-2"
                  onClick={() => openCreateChannel("group")}
                >
                  <Hash className="h-4 w-4" />
                  Create New Channel
                </Button>
                <Button 
                  variant="outline" 
                  className="border-chat-primary/30 text-chat-primary hover:text-chat-primary hover:bg-chat-primary/10 flex items-center gap-2"
                  onClick={() => openCreateChannel("direct")}
                >
                  <UserIcon className="h-4 w-4" />
                  Start Direct Message
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatHeader 
              channel={activeChannel} 
              onSearchMessages={handleSearchMessages}
              onToggleMobileMenu={toggleMobileMenu}
            />
            <ChatArea 
              messages={filteredMessages} 
              onSendMessage={sendMessage}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
            />
          </div>
        )}
        
        <CreateChannelDialog 
          open={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)}
          type={channelType}
        />
      </div>
    </SettingsProvider>
  );
}
