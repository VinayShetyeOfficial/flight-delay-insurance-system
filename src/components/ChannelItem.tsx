import { ReactNode, useState } from "react";
import { Channel } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreVertical, Archive, BellOff, Pin, Mail, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  onDeleteChat?: (channelId: string) => void;
  onArchiveChat?: (channelId: string) => void;
  onPinChat?: (channelId: string) => void;
  onMuteChat?: (channelId: string) => void;
  onMarkAsUnread?: (channelId: string) => void;
}

export function ChannelItem({
  channel,
  isActive,
  onClick,
  icon,
  onDeleteChat,
  onArchiveChat,
  onPinChat,
  onMuteChat,
  onMarkAsUnread,
}: ChannelItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const lastMessageDate = channel.lastMessage?.timestamp
    ? format(new Date(channel.lastMessage.timestamp), "h:mm a")
    : null;

  // Prevent click propagation when clicking on the more menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(true);
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-2 py-2 h-auto relative group",
        isActive && "bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 w-full">
        {icon}

        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-start">
            <span className="font-medium text-sm truncate">
              {channel.type === "direct" ? channel.name : `# ${channel.name}`}
            </span>

            <div className="flex items-center">
              {lastMessageDate && (
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {lastMessageDate}
                </span>
              )}

              {/* Ellipsis Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 ml-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={handleMenuClick}
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[200px] bg-background border-border"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveChat?.(channel.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMuteChat?.(channel.id);
                    }}
                    className="cursor-pointer"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Mute notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinChat?.(channel.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Pin className="h-4 w-4 mr-2" />
                    Pin chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsUnread?.(channel.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Mark as unread
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat?.(channel.id);
                    }}
                    className="cursor-pointer text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {channel.lastMessage
              ? channel.lastMessage.text
              : channel.type === "direct"
              ? "Start a conversation"
              : "No messages yet"}
          </span>
        </div>

        {channel.unreadCount ? (
          <div className="absolute right-2 top-2 min-w-5 h-5 flex items-center justify-center bg-chat-primary text-white text-xs rounded-full px-1.5">
            {channel.unreadCount}
          </div>
        ) : null}
      </div>
    </Button>
  );
}
