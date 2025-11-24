import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine backend URL based on environment
let BACKEND_URL: string;

// Check for environment variable first (for deployed backend)
const envBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

if (envBackendUrl) {
  // Use deployed backend URL from environment
  BACKEND_URL = envBackendUrl;
} else if (typeof window !== 'undefined') {
  // Browser environment - use the same domain but different port
  const host = window.location.hostname;
  BACKEND_URL = `http://${host}:4000`;
} else {
  // Native environment (Expo) - default to localhost for development
  // In production, set EXPO_PUBLIC_BACKEND_URL environment variable
  BACKEND_URL = 'http://localhost:4000';
}

console.log('API Service initialized. Backend URL:', BACKEND_URL);

const API_TIMEOUT = 30000;
let socket: Socket | null = null;
let token: string | null = null;

const parseJSON = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Server response is not valid JSON. Received: ${text.substring(0, 100)}`);
  }
};

export const ApiService = {
  // Auth
  async register(username: string, displayName: string, password: string) {
    try {
      console.log('Attempting to register at:', `${BACKEND_URL}/api/auth/register`);
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
        const errorData = await parseJSON(response);
        throw new Error(errorData.error || `Registration failed with status ${response.status}`);
      }

      const data = await parseJSON(response);
      if (data.token) {
        token = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
        this.connectSocket();
      }
      return data;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw new Error(error.message || 'Failed to connect to backend. Check that it is deployed on Render and running.');
    }
  },

  async login(username: string, password: string) {
    try {
      console.log('Attempting to login at:', `${BACKEND_URL}/api/auth/login`);
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
        const errorData = await parseJSON(response);
        throw new Error(errorData.error || `Login failed with status ${response.status}`);
      }

      const data = await parseJSON(response);
      if (data.token) {
        token = data.token;
        await AsyncStorage.setItem('auth_token', data.token);
        this.connectSocket();
      }
      return data;
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw new Error(error.message || 'Failed to connect to backend. Check that it is deployed on Render and running.');
    }
  },

  async logout() {
    token = null;
    await AsyncStorage.removeItem('auth_token');
    if (socket) {
      socket.disconnect();
      socket = null;
    }
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