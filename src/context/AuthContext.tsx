"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  provider: "email" | "google" | "phone" | "apple";
  role: "user" | "admin";
  isOnboarded: boolean;
  createdAt: string;
  sessionToken: string;
  sessionExpiry: string; // ISO – 24h after login
}

interface OtpSession {
  phone: string;
  code: string;
  expiresAt: number; // Unix ms timestamp
  attempts: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMockMode: boolean;
  pendingOtp: string | null; // the generated OTP (shown in demo banner)

  // Primary auth methods
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleEmail?: string, googleName?: string, googlePhoto?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;

  // Session management
  logout: () => void;
  updateUserOnboardStatus: (status: boolean) => void;

  // Legacy shims (kept for backward compatibility with admin page, etc.)
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string) => Promise<boolean>;
}

// ─── Storage Constants ─────────────────────────────────────────────────────────
const SESSION_KEY = "nutriai_session_v2";
const OTP_KEY     = "nutriai_otp_session_v2";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateUserId(): string {
  const ts  = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `usr_${ts}_${rnd}`;
}

function generateSessionToken(): string {
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ iat: Date.now(), rnd: Math.random() }));
  const sig     = Math.random().toString(36).slice(2, 20);
  return `${header}.${payload}.${sig}`;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sessionExpiry(hours = 24): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

function isSessionValid(u: User): boolean {
  try {
    return new Date(u.sessionExpiry) > new Date();
  } catch {
    return false;
  }
}

function makeUser(overrides: Partial<User> & { email: string; name: string }): User {
  const isAdmin = ["admin@nutriai.com", "admin@nutritrack.com"].includes(
    overrides.email.toLowerCase()
  );
  return {
    id:            generateUserId(),
    phone:         undefined,
    photoURL:      undefined,
    provider:      "email",
    role:          isAdmin ? "admin" : "user",
    isOnboarded:   isAdmin, // admins skip onboarding
    createdAt:     new Date().toISOString(),
    sessionToken:  generateSessionToken(),
    sessionExpiry: sessionExpiry(24),
    ...overrides,
  };
}

function accountKey(email: string): string {
  return `nutriai_account_${email.toLowerCase().replace(/[^a-z0-9@.]/g, "_")}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);

  // isMockMode is always true – no real backend (static export)
  const isMockMode = true;

  // ── Session Recovery ─────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored: User = JSON.parse(raw);
        if (isSessionValid(stored)) {
          setUser(stored);
        } else {
          // Session expired → clear silently
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  // ── Internal helpers ─────────────────────────────────────────────────────
  function persist(u: User) {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  }

  function refreshSession(u: User): User {
    return { ...u, sessionToken: generateSessionToken(), sessionExpiry: sessionExpiry(24) };
  }

  function resolveOrCreate(key: string, defaults: Partial<User> & { email: string; name: string }): User {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const existing: User = JSON.parse(raw);
        const updated = refreshSession(existing);
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      }
    } catch { /* fall through */ }
    const newUser = makeUser(defaults);
    localStorage.setItem(key, JSON.stringify(newUser));
    return newUser;
  }

  // ── Email / Password Login ────────────────────────────────────────────────
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(700);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setLoading(false);
      return { success: false, error: "Email and password are required." };
    }
    if (!email.includes("@") || !email.includes(".")) {
      setLoading(false);
      return { success: false, error: "Please enter a valid email address." };
    }
    if (password.length < 6) {
      setLoading(false);
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const key  = accountKey(email);
    const name = email.split("@")[0]
      .replace(/[._\-+]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const u = resolveOrCreate(key, { email: email.toLowerCase(), name, provider: "email" });

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Email / Password Sign-Up ──────────────────────────────────────────────
  const signupWithEmail = async (
    email: string,
    name: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(800);

    if (!email.trim() || !name.trim() || !password.trim()) {
      setLoading(false);
      return { success: false, error: "All fields are required." };
    }
    if (!email.includes("@") || !email.includes(".")) {
      setLoading(false);
      return { success: false, error: "Please enter a valid email address." };
    }
    if (name.trim().length < 2) {
      setLoading(false);
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }
    if (password.length < 6) {
      setLoading(false);
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const key = accountKey(email);
    const u   = makeUser({ email: email.toLowerCase(), name: name.trim(), provider: "email" });
    localStorage.setItem(key, JSON.stringify(u));
    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Google OAuth Login ────────────────────────────────────────────────────
  const loginWithGoogle = async (
    googleEmail?: string,
    googleName?:  string,
    googlePhoto?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(900);

    const email = (googleEmail || "user@gmail.com").toLowerCase();
    const name  = googleName  ||
      email.split("@")[0].replace(/[._\-+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const key = accountKey(email);

    let u: User;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        u = JSON.parse(raw);
        u = refreshSession(u);
        if (googlePhoto) u.photoURL = googlePhoto;
        localStorage.setItem(key, JSON.stringify(u));
      } else {
        u = makeUser({ email, name, provider: "google", photoURL: googlePhoto });
        localStorage.setItem(key, JSON.stringify(u));
      }
    } catch {
      setLoading(false);
      return { success: false, error: "Google authentication failed. Please try again." };
    }

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Apple Sign-In ─────────────────────────────────────────────────────────
  const loginWithApple = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(900);

    const appleSessionKey = "nutriai_account_apple_private_relay";
    const u = resolveOrCreate(appleSessionKey, {
      email: `private.user.${Math.random().toString(36).slice(2, 8)}@privaterelay.appleid.com`,
      name:  "Apple User",
      provider: "apple",
    });

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const sendOtp = async (
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    await delay(700);

    const code: string = generateOtp();
    const session: OtpSession = {
      phone:     clean,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts:  0,
    };

    try {
      localStorage.setItem(OTP_KEY, JSON.stringify(session));
      setPendingOtp(code);
    } catch {
      return { success: false, error: "Could not initiate OTP session. Please try again." };
    }

    return { success: true };
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const verifyOtp = async (
    phone: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(600);

    const raw = localStorage.getItem(OTP_KEY);
    if (!raw) {
      setLoading(false);
      return { success: false, error: "No active OTP session found. Please request a new code." };
    }

    let session: OtpSession;
    try {
      session = JSON.parse(raw);
    } catch {
      localStorage.removeItem(OTP_KEY);
      setLoading(false);
      return { success: false, error: "OTP session corrupted. Please request a new code." };
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (session.phone !== cleanPhone) {
      setLoading(false);
      return { success: false, error: "Phone number mismatch. Please restart the login flow." };
    }

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(OTP_KEY);
      setPendingOtp(null);
      setLoading(false);
      return { success: false, error: "OTP has expired (valid for 5 minutes). Please request a new code." };
    }

    session.attempts += 1;

    if (session.attempts > 3) {
      localStorage.removeItem(OTP_KEY);
      setPendingOtp(null);
      setLoading(false);
      return { success: false, error: "Too many incorrect attempts. Please request a new OTP." };
    }

    if (code.trim() !== session.code) {
      localStorage.setItem(OTP_KEY, JSON.stringify(session));
      setLoading(false);
      const left = 3 - session.attempts;
      return {
        success: false,
        error: `Invalid OTP. ${left} attempt${left !== 1 ? "s" : ""} remaining.`,
      };
    }

    // ✓ OTP valid
    localStorage.removeItem(OTP_KEY);
    setPendingOtp(null);

    const phoneKey = `nutriai_account_phone_${cleanPhone}`;
    const u = resolveOrCreate(phoneKey, {
      email:    `ph_${cleanPhone}@phone.nutriai.app`,
      name:     `User ${cleanPhone.slice(-4)}`,
      phone:    `+91${cleanPhone}`,
      provider: "phone",
    });

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    if (user) {
      [
        SESSION_KEY,
        OTP_KEY,
        // User-scoped data
        `nutriai_onboarding_${user.id}`,
        `nutriai_meals_${user.id}`,
        `nutriai_water_${user.id}`,
        `nutriai_weights_${user.id}`,
        `nutriai_workouts_${user.id}`,
        `nutriai_fasting_${user.id}`,
        `nutriai_steps_${user.id}`,
        `nutriai_manual_targets_${user.id}`,
        `nutriai_favorites_${user.id}`,
        `nutriai_custom_foods_${user.id}`,
        `nutriai_badges_${user.id}`,
        `nutriai_recent_searches_${user.id}`,
        // Legacy keys from old mock auth
        "nutriai_user",
        "nutriai_onboarding_answers",
        "nutriai_meals",
        "nutriai_water",
        "nutriai_weights",
      ].forEach((k) => {
        try { localStorage.removeItem(k); } catch { /* ignore */ }
      });
    }
    setPendingOtp(null);
    setUser(null);
  };

  // ── Update Onboard Status ─────────────────────────────────────────────────
  const updateUserOnboardStatus = (status: boolean) => {
    if (!user) return;
    const updated: User = { ...user, isOnboarded: status };
    persist(updated);
    // Keep account record in sync
    const key = user.provider === "phone"
      ? `nutriai_account_phone_${(user.phone || "").replace(/\D/g, "")}`
      : accountKey(user.email);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const acc: User = JSON.parse(raw);
        localStorage.setItem(key, JSON.stringify({ ...acc, isOnboarded: status }));
      }
    } catch { /* ignore */ }
  };

  // ── Legacy shims ──────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginWithEmail(email, password);
    return result.success;
  };

  const signup = async (email: string, name: string): Promise<boolean> => {
    const result = await signupWithEmail(email, name, "nutriai_user_pass");
    return result.success;
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, isMockMode, pendingOtp,
        loginWithEmail, signupWithEmail,
        loginWithGoogle, loginWithApple,
        sendOtp, verifyOtp,
        logout, updateUserOnboardStatus,
        login, signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
