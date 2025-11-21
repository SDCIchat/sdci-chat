import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use localhost:3000 for development (works when backend is running on same machine)
// For web browser access, the backend must be on the same port or use a proxy
const BACKEND_URL = 'http://localhost:3000';

// Fallback for common development scenarios
const API_TIMEOUT = 10000;
let socket: Socket | null = null;
let token: string | null = null;

export const ApiService = {
  // Auth
  async register(username: string, displayName: string, password: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      if (data.token) {
        token = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
        this.connectSocket();
      }
      return data;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw new Error(error.message || 'Failed to connect to server. Make sure the backend is running on localhost:3000');
    }
  },

  async login(username: string, password: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      if (data.token) {
        token = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
        this.connectSocket();
      }
      return data;
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw new Error(error.message || 'Failed to connect to server. Make sure the backend is running on localhost:3000');
    }
  },

  async logout() {
    token = null;
    await AsyncStorage.removeItem('auth_token');
    if (socket) socket.disconnect();
  },

  async restoreToken() {
    const savedToken = await AsyncStorage.getItem('auth_token');
    if (savedToken) {
      token = savedToken;
      this.connectSocket();
    }
    return savedToken;
  },

  // Search
  async searchUsers(query: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Friends
  async sendFriendRequest(toUserId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toUserId }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async acceptFriendRequest(requestId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Socket.io
  connectSocket() {
    if (socket) return socket;
    
    socket = io(BACKEND_URL, {
      auth: { token },
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return socket;
  },

  getSocket() {
    return socket;
  },

  onUserOnline(callback: (data: any) => void) {
    if (socket) socket.on('user_status_changed', callback);
  },

  onUserTyping(callback: (data: any) => void) {
    if (socket) socket.on('user_typing', callback);
  },

  onMessageReceived(callback: (data: any) => void) {
    if (socket) socket.on('message_received', callback);
  },

  emitUserOnline(userId: string) {
    if (socket) socket.emit('user_online', { userId });
  },

  emitTyping(data: any) {
    if (socket) socket.emit('typing', data);
  },

  emitSendMessage(conversationId: string, senderId: string, text: string) {
    if (socket) socket.emit('send_message', { conversationId, senderId, text });
  },
};
