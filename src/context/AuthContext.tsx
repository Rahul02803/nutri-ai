"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  isOnboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUserOnboardStatus: (status: boolean) => void;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(true);

  useEffect(() => {
    // Check if there's a stored session
    const storedUser = localStorage.getItem("nutriai_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Create a default demo user for instant wow factor on initial load
      const demoUser: User = {
        id: "demo-user-123",
        email: "student@bca.edu",
        name: "Rahul Sharma",
        role: "user",
        isOnboarded: false, // forces onboarding on first login, excellent for demos!
      };
      setUser(demoUser);
      localStorage.setItem("nutriai_user", JSON.stringify(demoUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Admin email backdoor for examiners to test admin analytics
    const role = email.toLowerCase().includes("admin") ? "admin" : "user";
    const loggedUser: User = {
      id: role === "admin" ? "admin-id-999" : "user-id-" + Math.floor(Math.random() * 10000),
      email: email,
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role: role,
      isOnboarded: role === "admin" ? true : false, // Admins bypass onboarding
    };

    setUser(loggedUser);
    localStorage.setItem("nutriai_user", JSON.stringify(loggedUser));
    setLoading(false);
    return true;
  };

  const signup = async (email: string, name: string): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: "user-id-" + Math.floor(Math.random() * 10000),
      email: email,
      name: name,
      role: "user",
      isOnboarded: false,
    };

    setUser(newUser);
    localStorage.setItem("nutriai_user", JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("nutriai_user");
    localStorage.removeItem("nutriai_onboarding_answers");
    localStorage.removeItem("nutriai_meals");
    localStorage.removeItem("nutriai_water");
    localStorage.removeItem("nutriai_weights");
  };

  const updateUserOnboardStatus = (status: boolean) => {
    if (user) {
      const updated = { ...user, isOnboarded: status };
      setUser(updated);
      localStorage.setItem("nutriai_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserOnboardStatus, isMockMode }}>
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
