import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine backend URL based on environment
let BACKEND_URL: string;

if (typeof window !== 'undefined') {
  // Browser environment - use the same domain but different port
  const host = window.location.hostname;
  BACKEND_URL = `http://${host}:4000`;
} else {
  // Native environment (Expo) - for Android emulator use 10.0.2.2, for real devices use your computer's IP
  // For Android emulator: 10.0.2.2 is the special hostname that refers to the host machine
  // For real device: replace with your computer's actual IP address (e.g., http://192.168.x.x:4000)
  BACKEND_URL = 'http://10.0.2.2:4000';
}

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
