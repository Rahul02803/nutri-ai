"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, Lock, User as UserIcon, Sparkles, Phone,
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle,
  RefreshCw, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Google Account Picker Presets ────────────────────────────────────────────
const GOOGLE_ACCOUNTS = [
  { email: "rahul.sharma@gmail.com",   name: "Rahul Sharma",   avatar: "#7c3aed", initial: "R" },
  { email: "priya.wellness@gmail.com", name: "Priya Wellness", avatar: "#0ea5e9", initial: "P" },
  { email: "amit.fitness@gmail.com",   name: "Amit Fitness",  avatar: "#10b981", initial: "A" },
];

// ─── Flow State Type ──────────────────────────────────────────────────────────
type FlowState = "splash" | "welcome" | "method" | "google_picker" | "phone_entry" | "phone_otp" | "email_form";

// ─── Main Auth Content ────────────────────────────────────────────────────────
function AuthPageContent() {
  const {
    user, loading, pendingOtp,
    loginWithEmail, signupWithEmail,
    loginWithGoogle, loginWithApple,
    sendOtp, verifyOtp,
  } = useAuth();

  const router       = useRouter();
  const searchParams = useSearchParams();

  const [flowState, setFlowState] = useState<FlowState>("splash");
  const [isLogin, setIsLogin]     = useState(true);

  // Email form state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [showPass, setShowPass] = useState(false);

  // Google picker state
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  // Phone OTP state
  const [phone,      setPhone]      = useState("");
  const [otpDigits,  setOtpDigits]  = useState(["", "", "", "", "", ""]);
  const [countdown,  setCountdown]  = useState(0);
  const [canResend,  setCanResend]  = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Global UI state
  const [error,    setError]    = useState<string | null>(null);
  const [info,     setInfo]     = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);
  const [busyText, setBusyText] = useState("");

  // ── Splash Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (flowState !== "splash") return;
    const t = setTimeout(() => setFlowState("welcome"), 1700);
    return () => clearTimeout(t);
  }, [flowState]);

  // ── Route Protection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin")    router.push("/admin");
      else if (user.isOnboarded)   router.push("/dashboard");
      else                         router.push("/onboarding");
    }
  }, [user, loading, router]);

  // ── Admin URL Backdoor ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get("admin") === "true") {
      setEmail("admin@nutriai.com");
      setPassword("admin123");
      setIsLogin(true);
      setFlowState("email_form");
    }
  }, [searchParams]);

  // ── OTP Countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      if (flowState === "phone_otp") setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, flowState]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const startBusy = (text: string) => {
    setBusy(true); setBusyText(text); setError(null); setInfo(null);
  };
  const stopBusy = () => { setBusy(false); setBusyText(""); };
  const goBack   = (to: FlowState) => { setError(null); setInfo(null); setFlowState(to); };

  // ── Google Login ─────────────────────────────────────────────────────────
  const handleGoogleSelect = async (gEmail: string, gName: string) => {
    startBusy("Connecting to Google…");
    const result = await loginWithGoogle(gEmail, gName);
    stopBusy();
    if (!result.success) { setError(result.error || "Google authentication failed."); setFlowState("method"); }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.includes("@")) { setError("Please enter a valid email address."); return; }
    await handleGoogleSelect(customGoogleEmail, "");
  };

  // ── Apple Login ──────────────────────────────────────────────────────────
  const handleAppleLogin = async () => {
    startBusy("Connecting to Apple ID…");
    const result = await loginWithApple();
    stopBusy();
    if (!result.success) setError(result.error || "Apple authentication failed.");
  };

  // ── Phone OTP Send ───────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { setError("Please enter a valid 10-digit number."); return; }
    startBusy("Sending OTP to +91 " + phone + "…");
    const result = await sendOtp(phone);
    stopBusy();
    if (result.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      setError(null);
      setInfo("OTP sent to +91 " + phone);
      setFlowState("phone_otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 250);
    } else {
      setError(result.error || "Failed to send OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    startBusy("Resending OTP…");
    const result = await sendOtp(phone);
    stopBusy();
    if (result.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      setInfo("New OTP sent.");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      setError(result.error || "Failed to resend OTP.");
    }
  };

  // ── OTP Box Inputs ───────────────────────────────────────────────────────
  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otpDigits]; next[idx] = digit; setOtpDigits(next);
    setError(null);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── OTP Verify ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    startBusy("Verifying OTP…");
    const result = await verifyOtp(phone, code);
    stopBusy();
    if (!result.success) {
      setError(result.error || "OTP verification failed.");
      if (result.error?.includes("expired") || result.error?.includes("Too many")) {
        setOtpDigits(["", "", "", "", "", ""]);
        setFlowState("phone_entry");
      }
    }
  };

  // ── Email Submit ─────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLogin) {
      startBusy("Signing in…");
      const r = await loginWithEmail(email, password);
      stopBusy();
      if (!r.success) setError(r.error || "Login failed.");
    } else {
      if (!name.trim()) { setError("Please enter your full name."); return; }
      startBusy("Creating account…");
      const r = await signupWithEmail(email, name, password);
      stopBusy();
      if (!r.success) setError(r.error || "Registration failed.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#F8F8FA]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] -z-10 pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* ═══════════════════════ SPLASH ═══════════════════════ */}
        {flowState === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center space-y-5 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-200"
            >
              <Sparkles className="h-9 w-9 text-white" />
            </motion.div>
            <div>
              <h1 className="font-outfit text-4xl font-extrabold text-[#111111] tracking-tight">
                NutriTrack <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-[11px] font-mono text-[#8D8D92] tracking-widest uppercase mt-1.5">Calorie Intelligence · Autophagy</p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ WELCOME ══════════════════════ */}
        {flowState === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] p-8 space-y-6 shadow-sm text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100/80 flex items-center justify-center mx-auto">
                <Sparkles className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="space-y-2">
                <h2 className="font-outfit text-2xl font-bold text-[#111111]">Your AI Health Coach</h2>
                <p className="text-xs text-[#8D8D92] leading-relaxed max-w-[260px] mx-auto">
                  Scan meals with your camera, track macros, fast smarter, and reach your goals with AI-powered precision.
                </p>
              </div>
              <button
                onClick={() => { setError(null); setFlowState("method"); }}
                className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-sm flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[10px] text-[#8D8D92]">
                By continuing you agree to our{" "}
                <span className="text-indigo-600 font-semibold">Terms</span> &amp;{" "}
                <span className="text-indigo-600 font-semibold">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ METHOD PICKER ════════════════ */}
        {flowState === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] p-7 space-y-5 shadow-sm">
              <div className="text-center space-y-1">
                <h2 className="font-outfit text-xl font-bold text-[#111111]">Sign In or Create Account</h2>
                <p className="text-[11px] text-[#8D8D92]">Choose how you&apos;d like to continue</p>
              </div>

              {busy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 text-center rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-mono animate-pulse"
                >
                  {busyText}
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex items-start gap-2"
                >
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2.5">
                {/* Google */}
                <button
                  disabled={busy}
                  onClick={() => { setError(null); setShowCustomGoogle(false); setCustomGoogleEmail(""); setFlowState("google_picker"); }}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-sm font-semibold text-[#111111] flex items-center space-x-3 px-5 transition-all disabled:opacity-50 shadow-xs active:scale-[0.98]"
                >
                  <GoogleLogo />
                  <span>Continue with Google</span>
                </button>

                {/* Apple */}
                <button
                  disabled={busy}
                  onClick={handleAppleLogin}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-sm font-semibold text-[#111111] flex items-center space-x-3 px-5 transition-all disabled:opacity-50 shadow-xs active:scale-[0.98]"
                >
                  <AppleLogo />
                  <span>Continue with Apple</span>
                </button>

                {/* Phone */}
                <button
                  disabled={busy}
                  onClick={() => { setError(null); setPhone(""); setFlowState("phone_entry"); }}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-white hover:bg-slate-50 text-sm font-semibold text-[#111111] flex items-center space-x-3 px-5 transition-all disabled:opacity-50 shadow-xs active:scale-[0.98]"
                >
                  <div className="h-[18px] w-[18px] rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Phone className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>Continue with Phone Number</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#F1F1F4]" />
                  <span className="text-[10px] text-[#C8C8CE] font-medium">or</span>
                  <div className="flex-1 h-px bg-[#F1F1F4]" />
                </div>

                {/* Email */}
                <button
                  disabled={busy}
                  onClick={() => { setError(null); setFlowState("email_form"); }}
                  className="w-full py-3.5 rounded-2xl border border-[#ECECEF] bg-[#F8F8FA] hover:bg-slate-100 text-xs font-bold text-[#8D8D92] flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  <span>Continue with Email</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ GOOGLE PICKER ════════════════ */}
        {flowState === "google_picker" && (
          <motion.div
            key="google_picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] overflow-hidden shadow-md">
              {/* Google Header */}
              <div className="px-7 pt-7 pb-5 border-b border-[#F1F1F4] text-center space-y-2">
                <GoogleWordmarkSvg />
                <p className="text-sm font-semibold text-slate-700 mt-2">Choose an account</p>
                <p className="text-[11px] text-slate-400">to continue to NutriTrack AI</p>
              </div>

              {busy && (
                <div className="px-6 py-2.5 bg-blue-50 text-blue-700 text-xs font-mono text-center animate-pulse">{busyText}</div>
              )}
              {error && (
                <div className="px-6 py-2.5 bg-rose-50 text-rose-700 text-xs font-semibold text-center">⚠️ {error}</div>
              )}

              {/* Preset Accounts */}
              <div className="py-1.5">
                {GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={busy}
                    onClick={() => handleGoogleSelect(acc.email, acc.name)}
                    className="w-full px-6 py-3.5 flex items-center space-x-4 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: acc.avatar }}
                    >
                      {acc.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{acc.name}</p>
                      <p className="text-[11px] text-[#8D8D92]">{acc.email}</p>
                    </div>
                  </button>
                ))}

                <div className="border-t border-[#F1F1F4] my-1" />

                {!showCustomGoogle ? (
                  <button
                    disabled={busy}
                    onClick={() => setShowCustomGoogle(true)}
                    className="w-full px-6 py-3.5 flex items-center space-x-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                      <span className="text-slate-400 text-lg leading-none">+</span>
                    </div>
                    <p className="text-sm font-semibold text-[#111111]">Use another account</p>
                  </button>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="px-6 py-4 space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your Gmail address"
                      value={customGoogleEmail}
                      onChange={(e) => { setCustomGoogleEmail(e.target.value); setError(null); }}
                      autoFocus
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-xl py-2.5 px-3.5 text-sm text-[#111111] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all"
                    />
                    {error && <p className="text-[10px] text-rose-600 font-semibold">⚠️ {error}</p>}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-2.5 rounded-xl bg-[#1a73e8] text-white font-semibold text-sm hover:bg-[#1557b0] transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 pt-2 border-t border-[#F1F1F4] flex justify-between items-center">
                <button
                  onClick={() => goBack("method")}
                  className="text-[11px] text-[#1a73e8] font-semibold hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
                <p className="text-[10px] text-[#8D8D92]">Protected by Google</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ PHONE ENTRY ══════════════════ */}
        {flowState === "phone_entry" && (
          <motion.div
            key="phone_entry"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] p-7 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => goBack("method")}
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-outfit font-bold text-[#111111] text-lg">Enter Mobile Number</h3>
                  <p className="text-[11px] text-[#8D8D92]">A 6-digit OTP will be sent via SMS</p>
                </div>
              </div>

              {busy && (
                <div className="p-3 rounded-2xl bg-green-50 text-green-700 text-xs font-mono text-center animate-pulse">{busyText}</div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">⚠️ {error}</div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">
                    Mobile Number
                  </label>
                  <div className="flex items-stretch border border-[#ECECEF] rounded-2xl overflow-hidden bg-[#F8F8FA] focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400/20 transition-all">
                    <div className="px-4 py-3 border-r border-[#ECECEF] flex items-center space-x-1.5 bg-white shrink-0">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="text-sm font-bold text-[#111111]">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(null); }}
                      className="flex-1 bg-transparent py-3 px-4 text-sm font-bold text-[#111111] focus:outline-none placeholder:font-normal placeholder:text-[#C8C8CE]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy || phone.length < 10}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-sm flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:scale-100"
                >
                  <span>Send OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ PHONE OTP ════════════════════ */}
        {flowState === "phone_otp" && (
          <motion.div
            key="phone_otp"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] p-7 space-y-5 shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => goBack("phone_entry")}
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-outfit font-bold text-[#111111] text-lg">Verify Your Number</h3>
                  <p className="text-[11px] text-[#8D8D92]">Code sent to +91 {phone}</p>
                </div>
              </div>

              {/* SMS Preview Banner */}
              {pendingOtp && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Message received · +91 {phone}
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    &quot;Your NutriTrack AI OTP is{" "}
                    <span className="font-mono font-extrabold text-emerald-900 text-[15px] tracking-[0.25em]">
                      {pendingOtp}
                    </span>
                    . Valid for 5 minutes. Do not share.&quot;
                  </p>
                </motion.div>
              )}

              {busy && (
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-mono text-center animate-pulse">{busyText}</div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold"
                >
                  ⚠️ {error}
                </motion.div>
              )}
              {info && !error && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
                  ✓ {info}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">
                    6-Digit Verification Code
                  </label>
                  {/* 6-box OTP input */}
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border-2 transition-all focus:outline-none ${
                          digit
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-[#ECECEF] bg-[#F8F8FA] text-[#111111] focus:border-indigo-400 focus:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8D8D92]">
                    {canResend ? "Didn't receive it?" : `Resend in ${countdown}s`}
                  </span>
                  <button
                    type="button"
                    disabled={!canResend || busy}
                    onClick={handleResendOtp}
                    className={`font-bold flex items-center gap-1 transition-colors ${
                      canResend && !busy ? "text-indigo-600 hover:text-indigo-800" : "text-[#ECECEF] cursor-not-allowed"
                    }`}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy || otpDigits.join("").length < 6}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-sm flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:scale-100"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify &amp; Continue</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ EMAIL FORM ═══════════════════ */}
        {flowState === "email_form" && (
          <motion.div
            key="email_form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[28px] p-7 space-y-5 shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => goBack("method")}
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-outfit font-bold text-[#111111] text-lg">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h3>
                  <p className="text-[11px] text-[#8D8D92]">
                    {isLogin ? "Welcome back" : "Start your health journey"}
                  </p>
                </div>
              </div>

              {busy && (
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-mono text-center animate-pulse">{busyText}</div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold"
                >
                  ⚠️ {error}
                </motion.div>
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
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(null); }}
                        className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[#111111] focus:outline-none focus:border-indigo-400/70 focus:ring-1 focus:ring-indigo-400/20 transition-all"
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
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-4 text-sm text-[#111111] focus:outline-none focus:border-indigo-400/70 focus:ring-1 focus:ring-indigo-400/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-2xl py-2.5 pl-11 pr-11 text-sm text-[#111111] focus:outline-none focus:border-indigo-400/70 focus:ring-1 focus:ring-indigo-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-sm hover:scale-[1.01] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:scale-100"
                >
                  {busy ? busyText : isLogin ? "Sign In" : "Create Account"}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => { setIsLogin((v) => !v); setError(null); setName(""); }}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  {isLogin ? "New to NutriTrack? Create account →" : "Already have an account? Sign in →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── SVG Brand Assets ─────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" className="shrink-0" fill="#111111">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  );
}

function GoogleWordmarkSvg() {
  return (
    <svg width="74" height="24" viewBox="0 0 74 24" className="mx-auto" aria-label="Google">
      <text x="0" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#4285F4">G</text>
      <text x="16" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#EA4335">o</text>
      <text x="29" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#FBBC05">o</text>
      <text x="42" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#4285F4">g</text>
      <text x="54" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#34A853">l</text>
      <text x="61" y="20" fontFamily="'Product Sans', Arial, sans-serif" fontSize="22" fontWeight="400" fill="#EA4335">e</text>
    </svg>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-100 animate-pulse" />
          <p className="text-xs font-bold text-[#8D8D92]">Loading…</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
