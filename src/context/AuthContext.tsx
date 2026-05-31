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
          // If Firestore is offline or fails, check if we have a valid cached session for THIS specific logged-in user ID
          const cached = localStorage.getItem(SESSION_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.id === firebaseUser.uid) {
              setUser(parsed);
            } else {
              setUser(null);
            }
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
      const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor !== undefined;

      if (isCapacitor) {
        // Native Google Sign-In using Capawesome
        const { GoogleSignIn } = await import("@capawesome/capacitor-google-sign-in");
        
        // Retrieve Web Client ID from environment variables
        const webClientId = process.env.NEXT_PUBLIC_FIREBASE_WEB_CLIENT_ID;

        // Initialize Capawesome Google Sign-In
        await GoogleSignIn.initialize({
          clientId: webClientId || "337076644265-d419p2v86k5b1h73489d0e744.apps.googleusercontent.com", // Web client ID
          scopes: ["profile", "email"],
        });

        // Trigger native Google Account Picker prompt inside the app
        const result = await GoogleSignIn.signIn();
        
        if (!result.idToken) {
          throw new Error("Failed to retrieve Google Auth ID Token from native prompt.");
        }

        // Authenticate into Firebase with the native credential
        const { GoogleAuthProvider, signInWithCredential } = await import("firebase/auth");
        const credential = GoogleAuthProvider.credential(result.idToken);
        await signInWithCredential(auth, credential);
        
        setLoading(false);
        return { success: true };
      } else {
        // Standard Web Google Sign-In popup
        await signInWithPopup(auth, googleProvider);
        setLoading(false);
        return { success: true };
      }
    } catch (e: any) {
      setLoading(false);
      console.error("Authentication Error Details:", e);
      
      let errorMsg = "Unable to sign in with Google. Please try again.";
      if (e.code === "auth/popup-closed-by-user" || e.message?.includes("cancelled") || e.code === "12501" || e.message?.includes("12501")) {
        // Code 12501 represents cancelled native login
        errorMsg = "Login was cancelled. Please select a Google account to log in.";
      } else if (e.code === "auth/network-request-failed" || e.message?.includes("network")) {
        errorMsg = "Authentication failed. Check your internet connection.";
      }
      
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
