import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, X, Users, Lock } from "lucide-react";
import { User } from "../types";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
  type?: "group" | "direct";
}

export function CreateChannelDialog({
  open,
  onClose,
  type = "group",
}: CreateChannelDialogProps) {
  const { createChannel } = useChat();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when dialog opens
    if (open) {
      setName(type === "direct" ? "" : "");
      setIsPrivate(type === "direct");
      setSelectedUsers([]);
      setSearchTerm("");

      // In a real app, this would be a fetch call to get users
      // For now we'll use mock data
      import("../data/mockData").then(({ mockUsers }) => {
        // Filter out current user
        const filteredUsers = mockUsers.filter((u) => u.id !== user?.id);
        setAvailableUsers(filteredUsers);
      });
    }
  }, [open, user, type]);

  const handleCreateChannel = async () => {
    setIsSubmitting(true);

    try {
      let channelName = name;

      // For direct messages, use empty name (will be set to other user's name in context)
      if (type === "direct" && selectedUsers.length === 1) {
        channelName = "";
      }

      const newChannel = await createChannel(
        channelName,
        selectedUsers,
        isPrivate,
        type === "direct" // Pass isDirect parameter explicitly
      );

      // Log the created channel for debugging
      console.log("Created channel:", newChannel);

      onClose();
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((selected) => selected.id === user.id)
  );

  const handleSelectUser = (user: User) => {
    if (type === "direct") {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const isCreateDisabled =
    isSubmitting ||
    (type === "group" && (name.trim() === "" || selectedUsers.length === 0)) ||
    (type === "direct" && selectedUsers.length === 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "direct" ? "New Direct Message" : "Create Channel"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {type === "direct" ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation with another user.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-search">Select User</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-search"
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-1 bg-secondary rounded-full pl-1 pr-2 py-1"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{user.username}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label>Users</Label>
                  <ScrollArea className="h-60 mt-1 rounded-md border">
                    <div className="p-2">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => handleSelectUser(user)}
                          >
                            <Avatar>
                              <AvatarImage
                                src={user.avatar}
                                alt={user.username}
                              />
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {user.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : searchTerm ? (
                        <div className="text-center py-4 text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        type !== "direct" && (
                          <div className="text-center py-4 text-muted-foreground">
                            Type to search for users
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. general"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private" className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Private Channel
                </Label>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Add Members
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 bg-secondary rounded-full pl-1 pr-2 py-1"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{user.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <ScrollArea className="h-40 rounded-md border">
                <div className="p-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    ))
                  ) : searchTerm ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Type to search for users
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={isCreateDisabled}
              className="gap-1"
            >
              {type === "direct" ? "Create" : "Create Channel"}
              {isSubmitting && (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
