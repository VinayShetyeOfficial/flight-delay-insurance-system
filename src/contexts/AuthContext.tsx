import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  navigateToChat: () => void;
  navigateToAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Mock database for demo purposes
const USERS_STORAGE_KEY = "auth_users";
const CURRENT_USER_KEY = "current_user";
const TOKEN_KEY = "auth_token";

// Initialize mock users if none exist
const initMockUsers = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    initMockUsers();
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const navigateToChat = () => navigate("/chat");
  const navigateToAuth = () => navigate("/auth");

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get users from storage
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");

      // Find user
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;

      // Store auth data
      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(userWithoutPassword)
      );
      localStorage.setItem(TOKEN_KEY, "mock-jwt-token");

      setUser(userWithoutPassword);
      navigateToChat();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get users from storage
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");

      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("User with this email already exists");
      }

      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        username,
        email,
        password, // In a real app, this would be hashed
      };

      // Add to users array
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Create user object without password
      const { password: _, ...userWithoutPassword } = newUser;

      // Store auth data
      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(userWithoutPassword)
      );
      localStorage.setItem(TOKEN_KEY, "mock-jwt-token");

      setUser(userWithoutPassword);
      navigateToChat();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear auth data
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);

      setUser(null);
      navigateToAuth();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
    navigateToChat,
    navigateToAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
