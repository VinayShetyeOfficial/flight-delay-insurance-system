export interface Channel {
  id: string;
  name: string;
  type: "direct" | "group";
  isPrivate?: boolean;
  members: User[];
  createdAt: Date;
  unreadCount: number;
  lastMessage?: Message;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: "online" | "offline" | "away" | "busy";
}
