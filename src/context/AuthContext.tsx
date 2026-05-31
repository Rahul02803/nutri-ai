"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  provider: "google";
  role: "user" | "admin";
  isOnboarded: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserOnboardStatus: (status: boolean) => void;
}

const SESSION_KEY = "zenlog_session_v3";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user state on Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Verify Custom Claims via JWT token
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = tokenResult.claims.role === "admin" ? "admin" : "user";

          // Sync with Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          let isOnboarded = false;
          let createdAt = new Date().toISOString();

          if (userSnap.exists()) {
            const data = userSnap.data();
            isOnboarded = data.isOnboarded || false;
            createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt || createdAt;
          } else {
            // New user registration
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
              role: role,
              isOnboarded: role === "admin", // Admin bypass onboarding
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            isOnboarded = role === "admin";
          }

          const u: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            photoURL: firebaseUser.photoURL || undefined,
            provider: "google",
            role: role,
            isOnboarded: isOnboarded,
            createdAt: createdAt
          };

          setUser(u);
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        } catch (e) {
          console.error("Firestore user sync error", e);
          // Graceful fallback to localstorage session if Firebase credentials are mock or offline
          const cached = localStorage.getItem(SESSION_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      // Direct Secure Firebase Google Sign-In popup
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await signInWithPopup(auth, googleProvider);
        setLoading(false);
        return { success: true };
      } else {
        // Safe Google Sign-In Simulation for test/local environments with NO configuration keys
        const mockUid = `google_${Math.random().toString(36).substring(2, 9)}`;
        const mockEmail = "user@gmail.com";
        const mockName = "Google User";
        const mockPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUid}`;

        const u: User = {
          id: mockUid,
          email: mockEmail,
          name: mockName,
          photoURL: mockPhoto,
          provider: "google",
          role: "user",
          isOnboarded: false,
          createdAt: new Date().toISOString()
        };

        // Simulated DB Sync
        const raw = localStorage.getItem("zenlog_database_users") || "[]";
        const users: any[] = JSON.parse(raw);
        const index = users.findIndex((item) => item.email === mockEmail);
        const record = {
          user_id: mockUid,
          google_id: `g_${mockUid}`,
          name: mockName,
          email: mockEmail,
          profile_picture: mockPhoto,
          authentication_provider: "google",
          created_at: index >= 0 ? users[index].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        if (index >= 0) {
          users[index] = { ...users[index], ...record };
        } else {
          users.push(record);
        }
        localStorage.setItem("zenlog_database_users", JSON.stringify(users));

        setUser(u);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setLoading(false);
        return { success: true };
      }
    } catch (e: any) {
      setLoading(false);
      console.error("Firebase Sign-In Error", e);
      let errorMsg = "Google Sign-In failed. Please try again.";
      if (e.code === "auth/popup-closed-by-user") {
        errorMsg = "Login was cancelled. Please complete the popup window to log in.";
      } else if (e.code === "auth/network-request-failed") {
        errorMsg = "A network error occurred. Please check your internet connection.";
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await signOut(auth);
      }
    } catch (e) {
      console.error("Firebase Sign-Out Error", e);
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateUserOnboardStatus = async (status: boolean) => {
    if (!user) return;
    const updated: User = { ...user, isOnboarded: status };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

    try {
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, { isOnboarded: status }, { merge: true });
    } catch (e) {
      console.error("Failed to save onboard status to firestore", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUserOnboardStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
