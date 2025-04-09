import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Settings,
  Search,
  Users,
  UserPlus,
  Hash,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ChannelItem } from "./ChannelItem";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { UserAvatar } from "./UserAvatar";
import { Channel } from "@/types";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "./SettingsDialog";
import { toast } from "@/components/ui/use-toast";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateChannel: (type: "group" | "direct") => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onCreateChannel,
}: ChatSidebarProps) {
  const { user, logout } = useAuth();
  const { channels, activeChannel, setActiveChannel } = useChat();
  const { theme, setTheme } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups">(
    "all"
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Add debugging logs
  useEffect(() => {
    console.log("All channels:", channels);
  }, [channels]);

  // Filter channels based on search term and active tab
  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "direct")
      return matchesSearch && channel.type === "direct";
    if (activeTab === "groups")
      return matchesSearch && channel.type === "group";

    return matchesSearch;
  });

  // Separate direct messages and group channels
  const directChannels = filteredChannels.filter(
    (channel) => channel.type === "direct"
  );

  const groupChannels = filteredChannels.filter(
    (channel) => channel.type === "group" || !channel.type // Include channels without type for backward compatibility
  );

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // Add handlers for the new channel actions
  const handleDeleteChat = (channelId: string) => {
    // Implement actual delete functionality later
    toast({
      title: "Chat deleted",
      description: "The chat has been deleted successfully.",
      duration: 3000,
    });
    console.log("Delete chat", channelId);
  };

  const handleArchiveChat = (channelId: string) => {
    toast({
      title: "Chat archived",
      description: "The chat has been archived.",
      duration: 3000,
    });
    console.log("Archive chat", channelId);
  };

  const handlePinChat = (channelId: string) => {
    toast({
      title: "Chat pinned",
      description: "The chat has been pinned to the top.",
      duration: 3000,
    });
    console.log("Pin chat", channelId);
  };

  const handleMuteChat = (channelId: string) => {
    toast({
      title: "Notifications muted",
      description: "Notifications for this chat have been muted.",
      duration: 3000,
    });
    console.log("Mute chat", channelId);
  };

  const handleMarkAsUnread = (channelId: string) => {
    toast({
      title: "Marked as unread",
      description: "The chat has been marked as unread.",
      duration: 3000,
    });
    console.log("Mark as unread", channelId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex h-full w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 transition-transform duration-300 ease-in-out md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header with Echo Chat logo and settings */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-chat-primary text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">Echo Chat</h1>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setTheme(
                        theme === "dark"
                          ? "light"
                          : theme === "light"
                          ? "system"
                          : "dark"
                      );
                    }}
                  >
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : theme === "light" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark"
                    ? "Switch to light mode"
                    : theme === "light"
                    ? "Switch to system theme"
                    : "Switch to dark mode"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === "all"
                ? "text-chat-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chat-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === "direct"
                ? "text-chat-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Direct
            {activeTab === "direct" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chat-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === "groups"
                ? "text-chat-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Groups
            {activeTab === "groups" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chat-primary" />
            )}
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {/* Create New Channel buttons */}
          <div className="flex flex-col gap-1.5 px-2 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/20"
              onClick={() => onCreateChannel("group")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30">
                <Hash className="h-3.5 w-3.5" />
              </span>
              <span>New Channel</span>
              <Plus className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/20"
              onClick={() => onCreateChannel("direct")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30">
                <UserPlus className="h-3.5 w-3.5" />
              </span>
              <span>New Direct Message</span>
              <Plus className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <Separator className="my-2" />

          {filteredChannels.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? (
                  <>No conversations match your search.</>
                ) : (
                  <>
                    No{" "}
                    {activeTab === "all"
                      ? "conversations"
                      : activeTab === "direct"
                      ? "direct messages"
                      : "channels"}{" "}
                    yet.
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Direct Messages Section */}
              {directChannels.length > 0 &&
                (activeTab === "all" || activeTab === "direct") && (
                  <div className="mb-2">
                    {activeTab === "all" && (
                      <div className="px-4 py-1.5">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-left">
                          Direct Messages
                        </h3>
                      </div>
                    )}
                    {directChannels.map((channel) => {
                      // Find the other user in the direct message (not the current user)
                      const otherUser = channel.members.find(
                        (member) => member.id !== user?.id
                      );

                      // Determine display name - for direct channels, just show the other user's name
                      const displayName = otherUser
                        ? otherUser.username
                        : channel.name;

                      return (
                        <ChannelItem
                          key={channel.id}
                          channel={{
                            ...channel,
                            name: displayName, // Override the name with just the recipient's name
                          }}
                          isActive={activeChannel?.id === channel.id}
                          onClick={() => setActiveChannel(channel)}
                          icon={
                            channel.type === "direct" ? (
                              <UserAvatar
                                user={otherUser || channel.members[0]}
                                size="sm"
                                className="h-8 w-8"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chat-primary/10 text-chat-primary">
                                <Hash className="h-4 w-4" />
                              </div>
                            )
                          }
                          onDeleteChat={handleDeleteChat}
                          onArchiveChat={handleArchiveChat}
                          onPinChat={handlePinChat}
                          onMuteChat={handleMuteChat}
                          onMarkAsUnread={handleMarkAsUnread}
                        />
                      );
                    })}
                  </div>
                )}

              {/* Group Channels Section */}
              {groupChannels.length > 0 &&
                (activeTab === "all" || activeTab === "groups") && (
                  <div className="mb-2">
                    {activeTab === "all" && (
                      <div className="px-4 py-1.5">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-left">
                          Channels
                        </h3>
                      </div>
                    )}
                    {groupChannels.map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        channel={channel}
                        isActive={activeChannel?.id === channel.id}
                        onClick={() => setActiveChannel(channel)}
                        icon={
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-chat-primary/10 text-chat-primary">
                            <Hash className="h-4 w-4" />
                          </div>
                        }
                        onDeleteChat={handleDeleteChat}
                        onArchiveChat={handleArchiveChat}
                        onPinChat={handlePinChat}
                        onMuteChat={handleMuteChat}
                        onMarkAsUnread={handleMarkAsUnread}
                      />
                    ))}
                  </div>
                )}
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
