import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService, User } from "@/utils/storage";
import { ApiService } from "@/utils/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, displayName: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = ApiService.getSocket();
    if (socket) {
      ApiService.emitUserOnline(user.id);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const token = await ApiService.restoreToken();
      if (token) {
        const userData = await StorageService.getUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const response = await ApiService.login(username, password);
      if (response.user) {
        const newUser: User = {
          id: response.user.id,
          username: response.user.username,
          displayName: response.user.display_name || response.user.username,
          bio: response.user.bio,
        };
        await StorageService.setUser(newUser);
        setUser(newUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (username: string, displayName: string, password: string) => {
    try {
      const response = await ApiService.register(username, displayName, password);
      if (response.user) {
        const newUser: User = {
          id: response.user.id,
          username: response.user.username,
          displayName: response.user.display_name || displayName,
        };
        await StorageService.setUser(newUser);
        setUser(newUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await ApiService.logout();
    await StorageService.removeUser();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await StorageService.setUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
