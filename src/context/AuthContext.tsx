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

// Helper to wrap promises in a timeout to prevent hanging on Firestore or network calls
function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return false;
    }
    return true;
  });

  // Sync user state on Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Verify Custom Claims via JWT token
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = tokenResult.claims.role === "admin" ? "admin" : "user";

          // Sync with Firestore (wrapped in timeout to prevent hanging if API is disabled or offline)
          const userRef = doc(db, "users", firebaseUser.uid);
          
          let isOnboarded = false;
          let createdAt = new Date().toISOString();

          try {
            console.log("Syncing user profile with Firestore...");
            // Limit Firestore read to 4 seconds
            const userSnap = await promiseTimeout(getDoc(userRef), 4000);

            if (userSnap.exists()) {
              const data = userSnap.data();
              isOnboarded = data.onboardingCompleted || data.isOnboarded || false;
              createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt || createdAt;

              // Restore onboarding details from Firestore to local storage
              if (isOnboarded && data.weight !== undefined) {
                const onboardingData = {
                  gender: data.gender || "male",
                  age: data.age || 25,
                  height: data.height || 170,
                  currentWeight: data.weight || data.currentWeight || 70,
                  targetWeight: data.targetWeight || 70,
                  goal: data.goal || "maintain",
                  activityLevel: data.activityLevel || "moderate",
                };
                localStorage.setItem(`zenlog_onboarding_${firebaseUser.uid}`, JSON.stringify(onboardingData));
              }
            } else {
              // New user registration (Limit Firestore write to 4 seconds)
              await promiseTimeout(setDoc(userRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
                role: role,
                isOnboarded: role === "admin", // Admin bypass onboarding
                onboardingCompleted: role === "admin",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }), 4000);
              isOnboarded = role === "admin";
            }
          } catch (firestoreError: any) {
            console.warn("Firestore sync failed or timed out. Falling back to local/auth profile.", firestoreError.message);
            // Fallback: If Firestore fails or times out, try to get onboarding status from localStorage
            const localOnboarding = localStorage.getItem(`zenlog_onboarding_${firebaseUser.uid}`);
            const localSession = localStorage.getItem(SESSION_KEY);
            if (localOnboarding) {
              isOnboarded = true;
            } else if (localSession) {
              try {
                const parsed = JSON.parse(localSession);
                if (parsed && parsed.id === firebaseUser.uid) {
                  isOnboarded = parsed.isOnboarded || false;
                }
              } catch (e) {}
            } else {
              isOnboarded = role === "admin";
            }
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
          console.error("Auth state processing error", e);
          setUser(null);
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
    
    // Create a 15-second timeout promise
    const timeoutPromise = new Promise<{ success: boolean; error: string }>((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), 15000);
    });

    try {
      const isCapacitor = typeof window !== "undefined" && (window as any).Capacitor !== undefined;

      const authPromise = (async () => {
        if (isCapacitor) {
          // Native Google Sign-In using Capawesome
          const { GoogleSignIn } = await import("@capawesome/capacitor-google-sign-in");
          
          // Retrieve Web Client ID from environment variables
          const webClientId = process.env.NEXT_PUBLIC_FIREBASE_WEB_CLIENT_ID;

          // Initialize Capawesome Google Sign-In
          await GoogleSignIn.initialize({
            clientId: webClientId || "219812492800-7ippsfdik24c7mma24c6s0hrgc2csgsh.apps.googleusercontent.com", // Live Web client ID
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
          
          return { success: true };
        } else {
          // Standard Web Google Sign-In popup
          await signInWithPopup(auth, googleProvider);
          return { success: true };
        }
      })();

      // Race authentication against the 15-second timeout
      const result = await Promise.race([authPromise, timeoutPromise]);
      setLoading(false);
      return result;

    } catch (e: any) {
      setLoading(false);
      console.error("Authentication Error Details:", e);
      
      let errorMsg = "Unable to complete Google Sign-In. Please try again.";
      if (e.message === "TIMEOUT") {
        errorMsg = "Unable to complete Google Sign-In. Please try again.";
      } else if (e.code === "auth/popup-closed-by-user" || e.message?.includes("cancelled") || e.code === "12501" || e.message?.includes("12501")) {
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
