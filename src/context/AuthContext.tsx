
import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/lib/types";
import { users } from "@/lib/data";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll use mock data and accept any password
    try {
      const user = users.find((u) => u.email === email);
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        toast.success("Logged in successfully!");
        return true;
      } else {
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      toast.error("Login failed");
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    // For demo purposes, we'll just pretend to register
    try {
      const existingUser = users.find(
        (u) => u.email === email || u.username === username
      );
      
      if (existingUser) {
        toast.error("Email or username already exists");
        return false;
      }

      // In a real app, we would create a new user in the database
      const newUser: User = {
        id: (users.length + 1).toString(),
        name,
        username,
        email,
        avatar: `https://i.pravatar.cc/150?img=${users.length + 4}`,
        bio: "",
        followers: 0,
        following: 0,
      };
      
      users.push(newUser);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      toast.success("Registered successfully!");
      return true;
    } catch (error) {
      toast.error("Registration failed");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
