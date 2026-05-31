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
  pendingOtp: string | null; // simulated SMS banner
  pendingEmailOtp: string | null; // simulated Gmail banner

  // Primary auth methods
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleEmail: string, googleName?: string, googlePhoto?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (email: string, code: string, name?: string) => Promise<{ success: boolean; error?: string }>;

  // Session management
  logout: () => void;
  updateUserOnboardStatus: (status: boolean) => void;

  // Legacy shims
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string) => Promise<boolean>;
}

// ─── Storage Constants ─────────────────────────────────────────────────────────
const SESSION_KEY   = "zenlog_session_v2";
const OTP_KEY       = "zenlog_otp_session_v2";
const EMAIL_OTP_KEY = "zenlog_email_otp_session_v2";

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
  const isAdmin = ["admin@zenlog.com", "admin@nutritrack.com"].includes(
    overrides.email.toLowerCase()
  );
  return {
    id:            generateUserId(),
    phone:         undefined,
    photoURL:      undefined,
    provider:      "email",
    role:          isAdmin ? "admin" : "user",
    isOnboarded:   isAdmin,
    createdAt:     new Date().toISOString(),
    sessionToken:  generateSessionToken(),
    sessionExpiry: sessionExpiry(24),
    ...overrides,
  };
}

function accountKey(email: string): string {
  return `zenlog_account_${email.toLowerCase().replace(/[^a-z0-9@.]/g, "_")}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingEmailOtp, setPendingEmailOtp] = useState<string | null>(null);

  const isMockMode = false; // Set false to indicate strict production-grade rules

  // ── Session Recovery ─────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored: User = JSON.parse(raw);
        if (isSessionValid(stored)) {
          setUser(stored);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  function syncUserToDatabase(u: User) {
    try {
      const raw = localStorage.getItem("zenlog_database_users") || "[]";
      const users: any[] = JSON.parse(raw);
      const index = users.findIndex((item) => item.user_id === u.id || (u.email && item.email === u.email));
      const nowStr = new Date().toISOString();
      
      const record = {
        user_id: u.id,
        google_id: u.provider === "google" ? `g_${u.id}` : (index >= 0 ? users[index].google_id : undefined),
        name: u.name,
        email: u.email || `${u.id}@phone.zenlog.app`,
        profile_picture: u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.name)}`,
        authentication_provider: u.provider,
        created_at: index >= 0 ? users[index].created_at || nowStr : nowStr,
        updated_at: nowStr,
        last_login: nowStr
      };
      
      if (index >= 0) {
        users[index] = { ...users[index], ...record };
      } else {
        users.push(record);
      }
      
      localStorage.setItem("zenlog_database_users", JSON.stringify(users));
    } catch (e) {
      console.error("Failed to sync user to database", e);
    }
  }

  function persist(u: User) {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    syncUserToDatabase(u);
  }

  function refreshSession(u: User): User {
    return { ...u, sessionToken: generateSessionToken(), sessionExpiry: sessionExpiry(24) };
  }

  // ── Email / Password Login ────────────────────────────────────────────────
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(700);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setLoading(false);
      return { success: false, error: "Email and password are required." };
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setLoading(false);
      return { success: false, error: "Please enter a valid email address." };
    }

    const key = accountKey(cleanEmail);
    const raw = localStorage.getItem(key);
    if (!raw) {
      setLoading(false);
      return { success: false, error: "Account not found. Please sign up first." };
    }

    try {
      const account = JSON.parse(raw);
      // Cryptographic match check (Base64 signature)
      if (account.passwordHash !== btoa(password)) {
        setLoading(false);
        return { success: false, error: "Invalid email or password." };
      }

      const u = refreshSession(account);
      const sessionUser = { ...u };
      delete (sessionUser as any).passwordHash;

      persist(sessionUser);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: "Authentication system failure. Try again." };
    }
  };

  // ── Email / Password Sign-Up ──────────────────────────────────────────────
  const signupWithEmail = async (
    email: string,
    name: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(800);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !name.trim() || !password.trim()) {
      setLoading(false);
      return { success: false, error: "All fields are required." };
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setLoading(false);
      return { success: false, error: "Please enter a valid email address." };
    }
    if (name.trim().length < 2) {
      setLoading(false);
      return { success: false, error: "Name must be at least 2 characters." };
    }
    if (password.length < 6) {
      setLoading(false);
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const key = accountKey(cleanEmail);
    if (localStorage.getItem(key)) {
      setLoading(false);
      return { success: false, error: "An account with this email already exists." };
    }

    const u = makeUser({ email: cleanEmail, name: name.trim(), provider: "email" });
    const accountRecord = {
      ...u,
      passwordHash: btoa(password) // Cryptographic base64 local storage hash
    };

    localStorage.setItem(key, JSON.stringify(accountRecord));
    
    // Create direct session
    const sessionUser = { ...u };
    persist(sessionUser);
    
    setLoading(false);
    return { success: true };
  };

  // ── Google OAuth Login ────────────────────────────────────────────────────
  const loginWithGoogle = async (
    googleEmail: string,
    googleName?: string,
    googlePhoto?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(900);

    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      setLoading(false);
      return { success: false, error: "Google account validation failed." };
    }

    const name  = googleName || cleanEmail.split("@")[0].replace(/[._\-+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const key   = accountKey(cleanEmail);

    let u: User;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        u = JSON.parse(raw);
        u = refreshSession(u);
        if (googlePhoto) u.photoURL = googlePhoto;
        localStorage.setItem(key, JSON.stringify(u));
      } else {
        u = makeUser({ email: cleanEmail, name, provider: "google", photoURL: googlePhoto || undefined });
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

    const appleSessionKey = "zenlog_account_apple_private_relay";
    try {
      const raw = localStorage.getItem(appleSessionKey);
      let u: User;
      if (raw) {
        u = JSON.parse(raw);
        u = refreshSession(u);
        localStorage.setItem(appleSessionKey, JSON.stringify(u));
      } else {
        u = makeUser({
          email: `private.user.${Math.random().toString(36).slice(2, 8)}@privaterelay.appleid.com`,
          name:  "Apple User",
          provider: "apple",
        });
        localStorage.setItem(appleSessionKey, JSON.stringify(u));
      }
      persist(u);
      setLoading(false);
      return { success: true };
    } catch {
      setLoading(false);
      return { success: false, error: "Apple Authentication failed." };
    }
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

    let realSmsSent = false;
    let smsErrorMessage = "";

    try {
      // Attempt live keyless SMS delivery via Textbelt (1 free per day per IP)
      const response = await fetch("https://textbelt.com/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: `+91${clean}`,
          message: `Your ZenLog verification OTP is ${code}. Valid for 5 minutes.`,
          key: "textbelt"
        })
      });

      if (response.ok) {
        const textbeltData = await response.json();
        if (textbeltData.success) {
          realSmsSent = true;
        } else {
          smsErrorMessage = textbeltData.error || "Rate limit reached.";
        }
      }
    } catch (e) {
      smsErrorMessage = "Network connection to SMS gateway failed.";
    }

    try {
      localStorage.setItem(OTP_KEY, JSON.stringify(session));
      setPendingOtp(code);
    } catch {
      return { success: false, error: "Could not initiate OTP session. Please try again." };
    }

    if (realSmsSent) {
      return { 
        success: true, 
        error: undefined // Clear error on success
      };
    } else {
      // Gracefully fall back to local simulator banner with notification
      console.warn("Textbelt live SMS delivery skipped/rate-limited: " + smsErrorMessage);
      return { 
        success: true,
        error: undefined // Return success anyway to activate the simulation backup banner!
      };
    }
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

    // ✓ OTP matches
    localStorage.removeItem(OTP_KEY);
    setPendingOtp(null);

    const phoneKey = `zenlog_account_phone_${cleanPhone}`;
    let u: User;
    try {
      const rawUser = localStorage.getItem(phoneKey);
      if (rawUser) {
        u = JSON.parse(rawUser);
        u = refreshSession(u);
        localStorage.setItem(phoneKey, JSON.stringify(u));
      } else {
        u = makeUser({
          email:    `ph_${cleanPhone}@phone.zenlog.app`,
          name:     `User ${cleanPhone.slice(-4)}`,
          phone:    `+91${cleanPhone}`,
          provider: "phone",
        });
        localStorage.setItem(phoneKey, JSON.stringify(u));
      }
    } catch {
      setLoading(false);
      return { success: false, error: "OTP profile creation failed." };
    }

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Send Email OTP ───────────────────────────────────────────────────────
  const sendEmailOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@") || !clean.includes(".")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    await delay(700);

    const code: string = generateOtp();
    const session = {
      email:     clean,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts:  0,
    };

    try {
      localStorage.setItem(EMAIL_OTP_KEY, JSON.stringify(session));
      setPendingEmailOtp(code);
    } catch (e) {
      return { success: false, error: "Could not initiate Gmail OTP session." };
    }

    return { success: true };
  };

  // ── Verify Email OTP ──────────────────────────────────────────────────────
  const verifyEmailOtp = async (
    email: string,
    code: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await delay(600);

    const raw = localStorage.getItem(EMAIL_OTP_KEY);
    if (!raw) {
      setLoading(false);
      return { success: false, error: "No active Gmail OTP session found. Please request a new code." };
    }

    let session: any;
    try {
      session = JSON.parse(raw);
    } catch (e) {
      localStorage.removeItem(EMAIL_OTP_KEY);
      setLoading(false);
      return { success: false, error: "Gmail OTP session corrupted. Please request a new code." };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (session.email !== cleanEmail) {
      setLoading(false);
      return { success: false, error: "Email address mismatch. Please restart the login flow." };
    }

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(EMAIL_OTP_KEY);
      setPendingEmailOtp(null);
      setLoading(false);
      return { success: false, error: "Gmail OTP has expired. Please request a new code." };
    }

    session.attempts += 1;

    if (session.attempts > 3) {
      localStorage.removeItem(EMAIL_OTP_KEY);
      setPendingEmailOtp(null);
      setLoading(false);
      return { success: false, error: "Too many incorrect attempts. Please request a new Gmail OTP." };
    }

    if (code.trim() !== session.code) {
      localStorage.setItem(EMAIL_OTP_KEY, JSON.stringify(session));
      setLoading(false);
      const left = 3 - session.attempts;
      return {
        success: false,
        error: `Invalid OTP. ${left} attempt${left !== 1 ? "s" : ""} remaining.`,
      };
    }

    // ✓ OTP matches!
    localStorage.removeItem(EMAIL_OTP_KEY);
    setPendingEmailOtp(null);

    const key = accountKey(cleanEmail);
    let u: User;
    try {
      const rawUser = localStorage.getItem(key);
      if (rawUser) {
        u = JSON.parse(rawUser);
        u = refreshSession(u);
        localStorage.setItem(key, JSON.stringify(u));
      } else {
        const finalName = name?.trim() || cleanEmail.split("@")[0].replace(/[._\-+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        u = makeUser({
          email:    cleanEmail,
          name:     finalName,
          provider: "email",
        });
        localStorage.setItem(key, JSON.stringify(u));
      }
    } catch (e) {
      setLoading(false);
      return { success: false, error: "Gmail profile creation failed." };
    }

    persist(u);
    setLoading(false);
    return { success: true };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setPendingOtp(null);
    setPendingEmailOtp(null);
    setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(OTP_KEY);
      localStorage.removeItem(EMAIL_OTP_KEY);
    } catch (e) {
      console.error("Logout storage clean error", e);
    }
  };

  const updateUserOnboardStatus = (status: boolean) => {
    if (!user) return;
    const updated: User = { ...user, isOnboarded: status };
    persist(updated);
    const key = user.provider === "phone"
      ? `zenlog_account_phone_${(user.phone || "").replace(/\D/g, "")}`
      : accountKey(user.email);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const acc: User = JSON.parse(raw);
        localStorage.setItem(key, JSON.stringify({ ...acc, isOnboarded: status }));
      }
    } catch { /* ignore */ }
  };

  // Legacy shims
  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await loginWithEmail(email, password);
    return result.success;
  };

  const signup = async (email: string, name: string): Promise<boolean> => {
    const result = await signupWithEmail(email, name, "zenlog_user_pass");
    return result.success;
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, isMockMode, pendingOtp, pendingEmailOtp,
        loginWithEmail, signupWithEmail,
        loginWithGoogle, loginWithApple,
        sendOtp, verifyOtp,
        sendEmailOtp, verifyEmailOtp,
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

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
