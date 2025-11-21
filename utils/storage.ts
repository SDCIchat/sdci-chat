import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: "online" | "offline";
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatar?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  readBy?: string[];
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessage?: Message;
  unreadCount: number;
  participants: string[];
  avatar?: string;
  isClassGroup?: boolean;
  period?: string;
  subject?: string;
  teacher?: string;
}

const KEYS = {
  USER: "@user",
  FRIENDS: "@friends",
  FRIEND_REQUESTS: "@friend_requests",
  CONVERSATIONS: "@conversations",
  MESSAGES: "@messages",
  ALL_USERS: "@all_users",
  USER_STATUS: "@user_status",
};

export const StorageService = {
  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async getFriends(): Promise<Friend[]> {
    const data = await AsyncStorage.getItem(KEYS.FRIENDS);
    return data ? JSON.parse(data) : [];
  },

  async setFriends(friends: Friend[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIENDS, JSON.stringify(friends));
  },

  async addFriend(friend: Friend): Promise<void> {
    const friends = await this.getFriends();
    friends.push(friend);
    await this.setFriends(friends);
  },

  async removeFriend(friendId: string): Promise<void> {
    const friends = await this.getFriends();
    const filtered = friends.filter((f) => f.id !== friendId);
    await this.setFriends(filtered);
  },

  async getFriendRequests(): Promise<FriendRequest[]> {
    const data = await AsyncStorage.getItem(KEYS.FRIEND_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  async setFriendRequests(requests: FriendRequest[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  },

  async addFriendRequest(request: FriendRequest): Promise<void> {
    const requests = await this.getFriendRequests();
    requests.push(request);
    await this.setFriendRequests(requests);
  },

  async removeFriendRequest(requestId: string): Promise<void> {
    const requests = await this.getFriendRequests();
    const filtered = requests.filter((r) => r.id !== requestId);
    await this.setFriendRequests(filtered);
  },

  async getConversations(): Promise<Conversation[]> {
    const data = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },

  async setConversations(conversations: Conversation[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.getConversations();
    return conversations.find((c) => c.id === id) || null;
  },

  async addConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.getConversations();
    conversations.push(conversation);
    await this.setConversations(conversations);
  },

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const conversations = await this.getConversations();
    const index = conversations.findIndex((c) => c.id === id);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates };
      await this.setConversations(conversations);
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const data = await AsyncStorage.getItem(`${KEYS.MESSAGES}_${conversationId}`);
    return data ? JSON.parse(data) : [];
  },

  async setMessages(conversationId: string, messages: Message[]): Promise<void> {
    await AsyncStorage.setItem(`${KEYS.MESSAGES}_${conversationId}`, JSON.stringify(messages));
  },

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const messages = await this.getMessages(conversationId);
    messages.push(message);
    await this.setMessages(conversationId, messages);
  },

  async getAllUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(KEYS.ALL_USERS);
    return data ? JSON.parse(data) : [];
  },

  async setAllUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.clear();
  },

  async getUserStatus(userId: string): Promise<"online" | "offline"> {
    const data = await AsyncStorage.getItem(`${KEYS.USER_STATUS}_${userId}`);
    return data ? JSON.parse(data) : "offline";
  },

  async setUserStatus(userId: string, status: "online" | "offline"): Promise<void> {
    await AsyncStorage.setItem(`${KEYS.USER_STATUS}_${userId}`, JSON.stringify(status));
  },

  async updateMessageReadBy(conversationId: string, messageId: string, userId: string): Promise<void> {
    const messages = await this.getMessages(conversationId);
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      if (!message.readBy) {
        message.readBy = [];
      }
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await this.setMessages(conversationId, messages);
      }
    }
  },

  async getClassGroups(): Promise<Conversation[]> {
    const conversations = await this.getConversations();
    return conversations.filter((c) => c.isClassGroup);
  },

  async removeConversation(conversationId: string): Promise<void> {
    const conversations = await this.getConversations();
    const filtered = conversations.filter((c) => c.id !== conversationId);
    await this.setConversations(filtered);
    await AsyncStorage.removeItem(`${KEYS.MESSAGES}_${conversationId}`);
  },

  async removeUserFromConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (conversation) {
      conversation.participants = conversation.participants.filter((id) => id !== userId);
      if (conversation.participants.length === 0) {
        await this.removeConversation(conversationId);
      } else {
        await this.updateConversation(conversationId, conversation);
      }
    }
  },
};
