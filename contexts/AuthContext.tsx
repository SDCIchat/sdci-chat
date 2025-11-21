import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService, User } from "@/utils/storage";

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
    initializeSampleData();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await StorageService.getUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSampleData = async () => {
    const existingUsers = await StorageService.getAllUsers();
    if (existingUsers.length === 0) {
      const sampleUsers: User[] = [
        { id: "1", username: "alex_dev", displayName: "Alex Developer" },
        { id: "2", username: "sarah_design", displayName: "Sarah Designer" },
        { id: "3", username: "mike_pm", displayName: "Mike Product" },
        { id: "4", username: "emily_eng", displayName: "Emily Engineer" },
        { id: "5", username: "chris_ops", displayName: "Chris DevOps" },
      ];
      await StorageService.setAllUsers(sampleUsers);
    }
  };

  const signIn = async (username: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      displayName: username,
    };
    await StorageService.setUser(newUser);
    setUser(newUser);
  };

  const signUp = async (username: string, displayName: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      displayName,
    };
    await StorageService.setUser(newUser);
    setUser(newUser);
  };

  const signOut = async () => {
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
