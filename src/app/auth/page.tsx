"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/GlassCard";
import { Mail, Lock, User as UserIcon, Sparkles, Shield, AlertCircle, Phone, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuthPageContent() {
  const { user, login, signup, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth Flow state: "splash" | "welcome" | "method" | "phone_entry" | "phone_otp" | "email_form"
  const [flowState, setFlowState] = useState<"splash" | "welcome" | "method" | "phone_entry" | "phone_otp" | "email_form">("splash");
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiLoadingText, setApiLoadingText] = useState("");

  // Splash Screen timer (1.5 seconds)
  useEffect(() => {
    if (flowState === "splash") {
      const timer = setTimeout(() => {
        setFlowState("welcome");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [flowState]);

  // Handle examiner backdoor overrides
  useEffect(() => {
    if (searchParams.get("admin") === "true") {
      setEmail("admin@nutriai.com");
      setPassword("admin123");
      setIsLogin(true);
      setFlowState("email_form");
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (!success) setError("Login failed. Check your credentials.");
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    setApiLoadingText("Sending secure OTP verification code...");
    setTimeout(() => {
      setApiLoadingText("");
      setOtpSent(true);
      setFlowState("phone_otp");
    }, 1200);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setError(null);
    setApiLoadingText("Authenticating One-Time Password...");
    setTimeout(async () => {
      setApiLoadingText("");
      // Log in with simulated phone username
      await login("rahul@bca.edu", "rahul123");
    }, 1200);
  };

  const handleThirdPartyLogin = (provider: "google" | "apple") => {
    setError(null);
    setApiLoadingText(`Connecting to secure ${provider} gateway...`);
    setTimeout(async () => {
      setApiLoadingText("");
      // Seeded premium user fast log
      await login("rahul@bca.edu", "rahul123");
    }, 1000);
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#F8F8FA] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.015)_0%,transparent_80%)] -z-10" />

      <AnimatePresence mode="wait">
        {/* Screen 1: Splash Screen */}
        {flowState === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 flex items-center justify-center text-white shadow-md animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-outfit text-3xl font-extrabold text-[#111111] tracking-tight">
              NutriTrack <span className="bg-gradient-to-tr from-sky-400 to-purple-500 bg-clip-text text-transparent">AI</span>
            </h1>
            <span className="text-[10px] font-mono text-[#8D8D92] tracking-widest uppercase font-semibold">
              autophagy & calorie systems
            </span>
          </motion.div>
        )}

        {/* Screen 2: Welcome Screen */}
        {flowState === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-md text-center"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-8 space-y-6 shadow-sm">
              <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-[#ECECEF] mx-auto">
                <Sparkles className="h-6 w-6 text-[#111111]" />
              </div>
              <div className="space-y-2">
                <h2 className="font-outfit text-2xl font-bold text-[#111111]">Meet your AI Health Coach</h2>
                <p className="text-xs text-[#8D8D92] leading-relaxed max-w-xs mx-auto">
                  Log foods with photos, monitor intermittent fasting hours, and sync exercise metrics inside an ultra-minimal premium interface.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFlowState("method")}
                className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-xs hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Begin Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Screen 3: Choose Login Method Screen */}
        {flowState === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-md"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="text-center space-y-1">
                <h2 className="font-outfit text-2xl font-bold text-[#111111]">Create Account</h2>
                <p className="text-xs text-[#8D8D92]">Authentication is mandatory before using the tracker.</p>
              </div>

              {apiLoadingText && (
                <div className="p-3 text-center rounded-2xl bg-purple-50 text-purple-700 text-xs font-mono animate-pulse">
                  {apiLoadingText}
                </div>
              )}

              <div className="space-y-3">
                {/* Google login */}
                <button
                  onClick={() => handleThirdPartyLogin("google")}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-xs font-bold text-[#111111] flex items-center justify-center space-x-2 transition-all"
                >
                  <span className="text-base">🌐</span>
                  <span>Continue with Google</span>
                </button>

                {/* Apple login */}
                <button
                  onClick={() => handleThirdPartyLogin("apple")}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-xs font-bold text-[#111111] flex items-center justify-center space-x-2 transition-all"
                >
                  <span className="text-base">🍎</span>
                  <span>Continue with Apple</span>
                </button>

                {/* Phone login */}
                <button
                  onClick={() => setFlowState("phone_entry")}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-xs font-bold text-[#111111] flex items-center justify-center space-x-2 transition-all"
                >
                  <Phone className="h-4 w-4 text-sky-500" />
                  <span>Continue with Phone Number</span>
                </button>

                {/* Email login */}
                <button
                  onClick={() => setFlowState("email_form")}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-xs font-bold text-[#111111] flex items-center justify-center space-x-2 transition-all"
                >
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>Continue with Email</span>
                </button>
              </div>

              {/* Backdoor panel */}
              <div className="border-t border-[#F1F1F4] pt-5 space-y-2.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Fast backdoors
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerFastLogin("user")}
                    className="p-2.5 rounded-xl border border-[#ECECEF] bg-slate-50 text-[10px] font-bold text-emerald-600 hover:bg-slate-100 transition-colors"
                  >
                    User Login Backdoor
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFastLogin("admin")}
                    className="p-2.5 rounded-xl border border-[#ECECEF] bg-slate-50 text-[10px] font-bold text-indigo-600 hover:bg-slate-100 transition-colors"
                  >
                    Admin Login Backdoor
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Screen 4: Phone entry */}
        {flowState === "phone_entry" && (
          <motion.div
            key="phone_entry"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: -15 }}
            className="w-full max-w-md"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 md:p-8 space-y-5 shadow-sm text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F1F4]">
                <h3 className="font-outfit font-bold text-[#111111]">Phone Login</h3>
                <button onClick={() => setFlowState("method")} className="text-xs text-[#8D8D92] hover:text-[#111111]">Cancel</button>
              </div>

              {apiLoadingText && (
                <div className="p-3 text-center rounded-2xl bg-purple-50 text-purple-700 text-xs font-mono animate-pulse">
                  {apiLoadingText}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">{error}</div>
              )}

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#8D8D92] uppercase block tracking-wider">Mobile Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-[#111111]">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-14 pr-4 text-sm text-[#111111] font-bold focus:outline-none focus:border-purple-400/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-xs hover:scale-[1.01] transition-all"
                >
                  Send OTP Code
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Screen 5: Phone OTP Verification */}
        {flowState === "phone_otp" && (
          <motion.div
            key="phone_otp"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: -15 }}
            className="w-full max-w-md"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 md:p-8 space-y-5 shadow-sm text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F1F4]">
                <h3 className="font-outfit font-bold text-[#111111]">Verify OTP Code</h3>
                <button onClick={() => setFlowState("phone_entry")} className="text-xs text-[#8D8D92] hover:text-[#111111]">Back</button>
              </div>

              {apiLoadingText && (
                <div className="p-3 text-center rounded-2xl bg-purple-50 text-purple-700 text-xs font-mono animate-pulse">
                  {apiLoadingText}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">{error}</div>
              )}

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#8D8D92] uppercase block tracking-wider">Verification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit code..."
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 px-4 text-center text-lg font-mono font-bold tracking-widest text-[#111111] focus:outline-none focus:border-purple-400/50"
                  />
                  <p className="text-[10px] text-[#8D8D92] italic text-center">We simulated a secure OTP code to +91 {phoneNumber}. You can type any 6 digits.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-xs hover:scale-[1.01] transition-all"
                >
                  Verify & Continue
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Screen 6: Email authentication form */}
        {flowState === "email_form" && (
          <motion.div
            key="email_form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-md"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 md:p-8 space-y-5 shadow-sm text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F1F4]">
                <h3 className="font-outfit font-bold text-[#111111]">{isLogin ? "Sign In" : "Register"}</h3>
                <button onClick={() => setFlowState("method")} className="text-xs text-[#8D8D92] hover:text-[#111111]">Change Method</button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[#111111] focus:outline-none focus:border-purple-400/50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[#111111] focus:outline-none focus:border-purple-400/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[#111111] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-xs hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm"
                >
                  {loading ? "Verifying..." : isLogin ? "Login to Profile" : "Register Profile"}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-purple-600 font-bold hover:underline"
                >
                  {isLogin ? "Need a new account? Register here" : "Already registered? Login instead"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-bold text-[#8D8D92] italic">
        Loading Auth Framework...
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
