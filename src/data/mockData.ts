
import { User, Channel, Message } from "../types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user1",
    username: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    isOnline: true
  },
  {
    id: "user2",
    username: "Bob Smith",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    id: "user3",
    username: "Charlie Davis",
    email: "charlie@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    isOnline: true
  },
  {
    id: "user4",
    username: "Diana Miller",
    email: "diana@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: "user5",
    username: "Edward Wilson",
    email: "edward@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edward",
    isOnline: true
  },
  {
    id: "user6",
    username: "Fiona Thompson",
    email: "fiona@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona",
    isOnline: false
  },
  {
    id: "user7",
    username: "George Brown",
    email: "george@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=George",
    isOnline: true
  },
  {
    id: "currentUser",
    username: "You",
    email: "you@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    isOnline: true
  }
];

// Helper function to create a message
const createMessage = (
  id: string, 
  text: string, 
  senderId: string, 
  channelId: string, 
  timestamp: Date,
  attachments?: any[],
  reactions?: any[]
): Message => ({
  id,
  text,
  sender: mockUsers.find(u => u.id === senderId)!,
  timestamp,
  channelId,
  attachments,
  reactions
});

// Generate mock messages for channels
const generateMockMessages = (channelId: string): Message[] => {
  const now = new Date();
  const channelMessages: Message[] = [];

  // Different mock conversations based on channel
  switch(channelId) {
    case "channel1": // general channel
      channelMessages.push(
        createMessage("msg1", "Welcome to the general channel!", "user1", channelId, new Date(now.getTime() - 86400000 * 3)),
        createMessage("msg2", "Thanks! Excited to be here.", "user3", channelId, new Date(now.getTime() - 86400000 * 3 + 3600000)),
        createMessage("msg3", "What projects are we working on this week?", "user2", channelId, new Date(now.getTime() - 86400000 * 2)),
        createMessage("msg4", "I'm starting the new design system implementation.", "user1", channelId, new Date(now.getTime() - 86400000 * 2 + 3600000)),
        createMessage("msg5", "Sounds great! Looking forward to seeing it.", "user4", channelId, new Date(now.getTime() - 86400000 * 1)),
        createMessage("msg6", "I'll be sharing the prototype by Friday.", "user1", channelId, new Date(now.getTime() - 3600000 * 5), undefined, [
          { emoji: "👍", count: 3, users: ["user2", "user3", "user4"] },
          { emoji: "🎉", count: 2, users: ["user2", "user5"] }
        ])
      );
      break;
    
    case "channel2": // design channel
      channelMessages.push(
        createMessage("msg7", "I've uploaded the new logo designs for review", "user1", channelId, new Date(now.getTime() - 86400000 * 2), [
          {
            id: "attachment1",
            type: "image",
            url: "https://via.placeholder.com/800x600?text=Logo+Design",
            name: "logo-concepts.png",
            size: 2450000
          }
        ]),
        createMessage("msg8", "These look amazing! I especially like the third variant.", "user4", channelId, new Date(now.getTime() - 86400000 * 2 + 3600000)),
        createMessage("msg9", "Thanks! I'll refine the third one based on yesterday's feedback.", "user1", channelId, new Date(now.getTime() - 86400000 * 1)),
        createMessage("msg10", "Can we schedule a design review meeting tomorrow?", "user5", channelId, new Date(now.getTime() - 3600000 * 8))
      );
      break;
    
    case "channel3": // development channel
      channelMessages.push(
        createMessage("msg11", "Has anyone set up the new build pipeline yet?", "user3", channelId, new Date(now.getTime() - 86400000 * 2)),
        createMessage("msg12", "I'm working on it now. Should be ready for testing in a few hours.", "user2", channelId, new Date(now.getTime() - 86400000 * 2 + 3600000)),
        createMessage("msg13", "Here's the documentation for our new API endpoints", "user2", channelId, new Date(now.getTime() - 86400000 * 1), [
          {
            id: "attachment2",
            type: "file",
            url: "#",
            name: "api-documentation.pdf",
            size: 1230000
          }
        ]),
        createMessage("msg14", "Thanks for this! I'm reviewing it now and will follow up with questions.", "user7", channelId, new Date(now.getTime() - 3600000 * 2))
      );
      break;
    
    case "channel4": // Direct message with Alice
      channelMessages.push(
        createMessage("msg15", "Hi! Do you have a moment to discuss the analytics dashboard?", "user1", channelId, new Date(now.getTime() - 86400000 * 1)),
        createMessage("msg16", "Sure, what's up?", "currentUser", channelId, new Date(now.getTime() - 86400000 * 1 + 3600000)),
        createMessage("msg17", "I'm noticing that the real-time data isn't updating correctly.", "user1", channelId, new Date(now.getTime() - 86400000 * 1 + 3600000 * 2)),
        createMessage("msg18", "Let me check that for you. Can you send me a screenshot of what you're seeing?", "currentUser", channelId, new Date(now.getTime() - 86400000 * 1 + 3600000 * 3)),
        createMessage("msg19", "Here it is. Notice how the charts are stuck at yesterday's data.", "user1", channelId, new Date(now.getTime() - 86400000 * 1 + 3600000 * 4), [
          {
            id: "attachment3",
            type: "image",
            url: "https://via.placeholder.com/1200x800?text=Dashboard+Screenshot",
            name: "dashboard-issue.png",
            size: 1850000
          }
        ])
      );
      break;

    case "channel5": // Direct message with Bob
      channelMessages.push(
        createMessage("msg20", "Hi there! Just checking if you'll be at the team lunch tomorrow?", "currentUser", channelId, new Date(now.getTime() - 86400000 * 2)),
        createMessage("msg21", "Yes, I'll be there! Looking forward to it.", "user2", channelId, new Date(now.getTime() - 86400000 * 2 + 3600000)),
        createMessage("msg22", "Great! I heard the new restaurant has an amazing menu.", "currentUser", channelId, new Date(now.getTime() - 86400000 * 2 + 3600000 * 2)),
        createMessage("msg23", "I recorded a voice note with directions to the place", "user2", channelId, new Date(now.getTime() - 3600000 * 4), [
          {
            id: "attachment4",
            type: "file",
            url: "#",
            name: "voice-message.wav",
            size: 950000
          }
        ])
      );
      break;
      
    default:
      // Empty channel
      break;
  }

  return channelMessages;
};

// Mock Channels
export const mockChannels: Channel[] = [
  {
    id: "channel1",
    name: "general",
    description: "General discussions and announcements",
    isPrivate: false,
    type: "group",
    members: mockUsers,
    createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
    unreadCount: 3,
    lastMessage: generateMockMessages("channel1").slice(-1)[0]
  },
  {
    id: "channel2",
    name: "design",
    description: "All things design related",
    isPrivate: false,
    type: "group",
    members: [mockUsers[0], mockUsers[3], mockUsers[4], mockUsers[7]],
    createdAt: new Date(Date.now() - 86400000 * 25), // 25 days ago
    unreadCount: 1,
    lastMessage: generateMockMessages("channel2").slice(-1)[0]
  },
  {
    id: "channel3",
    name: "development",
    description: "Code discussions and technical topics",
    isPrivate: false,
    type: "group",
    members: [mockUsers[1], mockUsers[2], mockUsers[6], mockUsers[7]],
    createdAt: new Date(Date.now() - 86400000 * 20), // 20 days ago
    unreadCount: 0,
    lastMessage: generateMockMessages("channel3").slice(-1)[0]
  },
  {
    id: "channel4",
    name: "Alice Johnson, You",
    isPrivate: true,
    type: "direct",
    members: [mockUsers[0], mockUsers[7]],
    createdAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
    unreadCount: 2,
    lastMessage: generateMockMessages("channel4").slice(-1)[0]
  },
  {
    id: "channel5",
    name: "Bob Smith, You",
    isPrivate: true,
    type: "direct",
    members: [mockUsers[1], mockUsers[7]],
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    unreadCount: 0,
    lastMessage: generateMockMessages("channel5").slice(-1)[0]
  }
];

// Get messages for a specific channel
export const getMockMessages = (channelId: string): Message[] => {
  return generateMockMessages(channelId);
};
