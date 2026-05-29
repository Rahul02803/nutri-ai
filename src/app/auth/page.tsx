"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/GlassCard";
import { Mail, Lock, User as UserIcon, Sparkles, Shield, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuthPageContent() {
  const { user, login, signup, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If a URL parameter specifies admin simulator, preset credentials
  useEffect(() => {
    if (searchParams.get("admin") === "true") {
      setEmail("admin@nutriai.com");
      setPassword("admin123");
      setIsLogin(true);
    }
  }, [searchParams]);

  // Route protection inside Auth Page
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.isOnboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (!success) setError("Login failed. Check your connection.");
      } else {
        if (!name) {
          setError("Name is required for registration.");
          return;
        }
        const success = await signup(email, name);
        if (!success) setError("Registration failed.");
      }
    } catch (err: any) {
      setError(err?.message || "An authentication error occurred.");
    }
  };

  const triggerFastLogin = async (role: "user" | "admin") => {
    setError(null);
    if (role === "admin") {
      await login("admin@nutriai.com", "admin123");
    } else {
      await login("rahul@bca.edu", "rahul123");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_0%,transparent_60%)] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard glow glowColor="emerald" className="p-8 space-y-6">
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="font-outfit text-3xl font-bold tracking-tight text-slate-900">
              {isLogin ? "Welcome Back" : "Begin Journey"}
            </h2>
            <p className="text-sm text-slate-500">
              {isLogin ? "Sign in to track your physique statistics" : "Create an account to unlock custom meal engines"}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-50 border border-slate-100">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isLogin
                  ? "bg-white text-emerald-600 border border-slate-200/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                !isLogin
                  ? "bg-white text-emerald-600 border border-slate-200/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Credentials Input Forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-slate-400 hover:text-emerald-600 font-medium">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-300 shadow-sm"
            >
              {loading ? "Synchronizing Session..." : isLogin ? "Access Dashboard" : "Register & Complete Profile"}
            </button>
          </form>

          {/* Quick Sandbox Buttons for Examiners */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-center">
              ⚡ BCA Examiner Quick-Login Backdoor
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerFastLogin("user")}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-emerald-600 hover:bg-slate-100 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Demo User Login</span>
              </button>

              <button
                type="button"
                onClick={() => triggerFastLogin("admin")}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Demo Admin Login</span>
              </button>
            </div>
          </div>

        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-sm font-semibold text-slate-500 italic">
        Syncing Sandbox Session...
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
