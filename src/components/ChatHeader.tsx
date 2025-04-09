import { useState } from "react";
import { Channel } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bell,
  Search,
  Menu,
  Hash,
  MoreHorizontal,
  X,
  Phone,
  VideoIcon,
  User,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  channel: Channel;
  onSearchMessages: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

export function ChatHeader({
  channel,
  onSearchMessages,
  onToggleMobileMenu,
}: ChatHeaderProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const isDirect = channel.type === "direct";
  const otherUser = isDirect
    ? channel.members.find((m) => m.id !== user?.id)
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchMessages(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchMessages("");
    setSearchVisible(false);
  };

  const onlineStatus = otherUser?.isOnline
    ? "Online"
    : otherUser?.lastSeen
    ? `Last seen ${new Date(otherUser.lastSeen).toLocaleString()}`
    : "Offline";

  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-1"
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {isDirect && otherUser ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar user={otherUser} size="md" />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  otherUser.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-lg text-left">
                {otherUser.username}
              </h2>
              <p className="text-xs text-muted-foreground text-left">
                {onlineStatus}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chat-primary/10 text-chat-primary">
              <Hash className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-lg text-left">
                #{channel.name}
              </h2>
              {channel.description && (
                <p className="text-xs text-muted-foreground text-left">
                  {channel.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {searchVisible ? (
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-[10px] text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="w-64 pl-9 pr-8 py-1 h-9 bg-muted/30 focus-visible:ring-chat-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <Button type="submit" size="sm" className="h-9">
              Search
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearSearch}
              className="h-9"
            >
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchVisible(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search Messages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isMobile && (
              <>
                {isDirect ? (
                  <>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <VideoIcon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Video Call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : (
                  <>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Notifications</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <UserPlus className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add Member</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {isDirect ? "Conversation Options" : "Channel Options"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isDirect ? (
                  <>
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Voice Call</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <VideoIcon className="h-4 w-4 mr-2" />
                      <span>Video Call</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      <span>View Members</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>Add Member</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="h-4 w-4 mr-2" />
                      <span>Notification Settings</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}
