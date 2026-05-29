"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, User as UserIcon, Sparkles, Phone,
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FlowState = "welcome" | "method" | "google_picker" | "phone_entry" | "phone_otp" | "email_form";

function AuthPageContent() {
  const {
    user, loading, pendingOtp, pendingEmailOtp,
    loginWithGoogle,
    sendOtp, verifyOtp,
    sendEmailOtp, verifyEmailOtp
  } = useAuth();

  const router       = useRouter();
  const searchParams = useSearchParams();

  const [flowState, setFlowState] = useState<FlowState>("welcome");
  const [isLogin, setIsLogin]     = useState(true);

  // Email form states - INITIALIZED TO EMPTY (No autofill or demo shortcuts!)
  const [email,    setEmail]    = useState("");
  const [name,     setName]     = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpDigits, setEmailOtpDigits] = useState(["", "", "", "", "", ""]);
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [canResendEmail, setCanResendEmail] = useState(false);

  // Google picker simulated interactive OAuth state
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // Phone OTP states
  const [phone,      setPhone]      = useState("");
  const [otpDigits,  setOtpDigits]  = useState(["", "", "", "", "", ""]);
  const [countdown,  setCountdown]  = useState(0);
  const [canResend,  setCanResend]  = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Global UI states
  const [error,    setError]    = useState<string | null>(null);
  const [info,     setInfo]     = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);
  const [busyText, setBusyText] = useState("");

  // ── Route Protection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin")    router.push("/admin");
      else if (user.isOnboarded)   router.push("/dashboard");
      else                         router.push("/onboarding");
    }
  }, [user, loading, router]);

  // ── OTP Resend Countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      if (flowState === "phone_otp") setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, flowState]);

  // ── Email OTP Resend Countdown ───────────────────────────────────────────
  useEffect(() => {
    if (emailCountdown <= 0) {
      setCanResendEmail(true);
      return;
    }
    const t = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCountdown]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const startBusy = (text: string) => {
    setBusy(true); setBusyText(text); setError(null); setInfo(null);
  };
  const stopBusy = () => { setBusy(false); setBusyText(""); };
  const goBack   = (to: FlowState) => { setError(null); setInfo(null); setFlowState(to); };

  // ── Google OAuth Simulator ───────────────────────────────────────────────
  const handleGoogleOAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.includes("@") || !customGoogleEmail.includes(".")) {
      setError("Please enter a valid Google email address.");
      return;
    }
    if (!customGoogleName.trim()) {
      setError("Please enter your name.");
      return;
    }

    startBusy("Connecting to Google OAuth...");
    const result = await loginWithGoogle(customGoogleEmail, customGoogleName);
    stopBusy();
    if (!result.success) {
      setError(result.error || "Google authentication failed.");
    }
  };

  // ── Phone OTP Send & Verify ───────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) { setError("Please enter a valid 10-digit mobile number."); return; }
    startBusy("Generating secure OTP...");
    const result = await sendOtp(cleanPhone);
    stopBusy();
    if (result.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      setCanResend(false);
      setError(null);
      setInfo("OTP sent! Check the simulated SMS banner above.");
      setFlowState("phone_otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 250);
    } else {
      setError(result.error || "Failed to send OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const cleanPhone = phone.replace(/\D/g, "");
    startBusy("Resending secure OTP...");
    const result = await sendOtp(cleanPhone);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    startBusy("Verifying OTP...");
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

  // ── Gmail OTP Send & Verify ───────────────────────────────────────────────
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isLogin && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    startBusy("Sending Gmail verification code...");
    const result = await sendEmailOtp(cleanEmail);
    stopBusy();
    if (result.success) {
      setEmailOtpSent(true);
      setEmailOtpDigits(["", "", "", "", "", ""]);
      setEmailCountdown(60);
      setCanResendEmail(false);
      setError(null);
      setInfo("Gmail OTP sent! View the verification code in the simulated Gmail notification banner above.");
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 250);
    } else {
      setError(result.error || "Failed to send Gmail OTP.");
    }
  };

  const handleResendEmailOtp = async () => {
    if (!canResendEmail) return;
    const cleanEmail = email.trim().toLowerCase();
    startBusy("Resending Gmail verification code...");
    const result = await sendEmailOtp(cleanEmail);
    stopBusy();
    if (result.success) {
      setEmailOtpDigits(["", "", "", "", "", ""]);
      setEmailCountdown(60);
      setCanResendEmail(false);
      setInfo("New verification code sent to your Gmail.");
      setTimeout(() => emailOtpRefs.current[0]?.focus(), 100);
    } else {
      setError(result.error || "Failed to resend Gmail OTP.");
    }
  };

  const handleEmailOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...emailOtpDigits]; next[idx] = digit; setEmailOtpDigits(next);
    setError(null);
    if (digit && idx < 5) emailOtpRefs.current[idx + 1]?.focus();
  };

  const handleEmailOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !emailOtpDigits[idx] && idx > 0)
      emailOtpRefs.current[idx - 1]?.focus();
  };

  const handleEmailOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...emailOtpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setEmailOtpDigits(next);
    emailOtpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = emailOtpDigits.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    startBusy("Verifying Gmail verification code...");
    const result = await verifyEmailOtp(email, code, isLogin ? undefined : name);
    stopBusy();
    if (!result.success) {
      setError(result.error || "Gmail verification failed.");
      if (result.error?.includes("expired") || result.error?.includes("Too many")) {
        setEmailOtpDigits(["", "", "", "", "", ""]);
        setEmailOtpSent(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-md min-h-[80vh] flex flex-col justify-center px-4 py-8 relative text-left">
      
      {/* Pending OTP SMS Simulated Preview Banner */}
      <AnimatePresence>
        {pendingOtp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-[#111115] text-white p-4 rounded-[20px] max-w-sm w-full border border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.25)] flex items-start space-x-3 pointer-events-auto leading-tight">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-purple-400 animate-bounce" />
              </div>
              <div className="space-y-0.5 text-xs text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-purple-400 block font-mono">Simulated SMS Gateway</span>
                <p className="font-bold text-slate-100">Verification Code</p>
                <p className="text-slate-300 font-mono mt-0.5">Your NutriTrack verification OTP is <strong className="text-white font-extrabold underline">{pendingOtp}</strong>. Valid for 5 minutes.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Gmail OTP Simulated Preview Banner */}
      <AnimatePresence>
        {pendingEmailOtp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-[#1a1a24] text-white p-4 rounded-[20px] max-w-sm w-full border border-red-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-start space-x-3 pointer-events-auto leading-tight">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-red-400 animate-pulse" />
              </div>
              <div className="space-y-0.5 text-xs text-left">
                <span className="text-[9px] uppercase tracking-wider font-bold text-red-400 block font-mono">Simulated Gmail Inbox</span>
                <p className="font-bold text-slate-100">Verification Code</p>
                <p className="text-slate-300 font-mono mt-0.5">Your NutriTrack verification OTP is <strong className="text-white font-extrabold underline">{pendingEmailOtp}</strong>. Valid for 5 minutes.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-xs relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-tr from-sky-400 to-purple-500 rounded-t-[32px]" />

        {/* Global Messages banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-semibold text-rose-600 font-mono leading-relaxed"
            >
              ⚠️ {error}
            </motion.div>
          )}
          {info && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-semibold text-emerald-600 font-mono flex items-center gap-1"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{info}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {busy && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-[32px] z-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-purple-600 animate-spin" />
            <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 uppercase">{busyText}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* Welcome Intro Section */}
          {flowState === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-1.5 text-center">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <h2 className="font-outfit text-xl font-bold text-slate-800">Protected Client Portal</h2>
                <p className="text-xs text-slate-400">Authentication is required to launch fitness trackers</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setFlowState("method");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Sign In to Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    setIsLogin(false);
                    setEmail("");
                    setName("");
                    setEmailOtpSent(false);
                    setFlowState("email_form");
                  }}
                  className="w-full py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Authentication Method Selection */}
          {flowState === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div className="text-center space-y-1">
                <h3 className="font-outfit text-lg font-bold text-slate-800">Select Authentication Method</h3>
                <p className="text-xs text-slate-400">Production-ready secure endpoints</p>
              </div>

              <div className="space-y-2.5">
                {/* 1. Gmail Login (OTP Only!) */}
                <button
                  onClick={() => {
                    setEmail("");
                    setEmailOtpSent(false);
                    setFlowState("email_form");
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5 px-4 font-bold text-slate-700 hover:bg-slate-100/50 transition-colors text-xs"
                >
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                  <span>Continue with Gmail OTP</span>
                </button>

                {/* 2. Phone OTP Login */}
                <button
                  onClick={() => {
                    setPhone("");
                    setFlowState("phone_entry");
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5 px-4 font-bold text-slate-700 hover:bg-slate-100/50 transition-colors text-xs"
                >
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                  <span>Continue with Mobile OTP</span>
                </button>

                {/* 3. Google OAuth */}
                <button
                  onClick={() => {
                    setCustomGoogleEmail("");
                    setCustomGoogleName("");
                    setFlowState("google_picker");
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5 px-4 font-bold text-slate-700 hover:bg-slate-100/50 transition-colors text-xs"
                >
                  <span className="text-base font-bold font-mono">G</span>
                  <span>Continue with Google Account</span>
                </button>
              </div>

              <button
                onClick={() => goBack("welcome")}
                className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1 mx-auto hover:text-slate-600 transition-colors pt-2"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </motion.div>
          )}

          {/* Interactive Google Account Selector */}
          {flowState === "google_picker" && (
            <motion.div
              key="google_picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-outfit text-base font-bold text-slate-800">Simulated Google Accounts selector</h3>
                <p className="text-xs text-slate-400">Verifying secure OAuth payload binding</p>
              </div>

              <form onSubmit={handleGoogleOAuthSubmit} className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label htmlFor="google-name" className="font-bold text-slate-600">Google Username</label>
                  <input
                     id="google-name"
                     type="text"
                     required
                     placeholder="e.g. Rahul Sharma"
                     value={customGoogleName}
                     onChange={(e) => setCustomGoogleName(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="google-email" className="font-bold text-slate-600">Google Email Address</label>
                  <input
                     id="google-email"
                     type="email"
                     required
                     placeholder="e.g. rahul.sharma@gmail.com"
                     value={customGoogleEmail}
                     onChange={(e) => setCustomGoogleEmail(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-xs"
                >
                  Verify Google OAuth Token
                </button>
              </form>

              <button
                type="button"
                onClick={() => goBack("method")}
                className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </motion.div>
          )}

          {/* Phone Number Entry Form */}
          {flowState === "phone_entry" && (
            <motion.div
              key="phone_entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-outfit text-base font-bold text-slate-800">Phone Number Verification</h3>
                <p className="text-xs text-slate-400">Strict OTP verification required</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4 text-xs text-left">
                <div className="space-y-1">
                  <label htmlFor="phone-input" className="font-bold text-slate-600">Mobile Number (+91)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold font-mono text-xs">+91</span>
                    <input
                      id="phone-input"
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9988776655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Send Verification OTP
                </button>
              </form>

              <button
                type="button"
                onClick={() => goBack("method")}
                className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </motion.div>
          )}

          {/* OTP Number Verification Grid Form */}
          {flowState === "phone_otp" && (
            <motion.div
              key="phone_otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-outfit text-base font-bold text-slate-800">Verify OTP Code</h3>
                <p className="text-xs text-slate-400">Enter the 6-digit code simulated in the SMS banner</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
                {/* 6 Digit Grid inputs */}
                <div className="flex justify-between gap-1.5 max-w-[280px] mx-auto" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      pattern="\d*"
                      required
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="h-10 w-9 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-extrabold text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  ))}
                </div>

                <div className="flex justify-between text-[10px] px-2 font-mono text-slate-400">
                  <span>Resend code {countdown > 0 ? `(${countdown}s)` : ""}</span>
                  <button
                    type="button"
                    disabled={!canResend}
                    onClick={handleResendOtp}
                    className={`font-bold uppercase ${canResend ? "text-purple-600" : "text-slate-300"}`}
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Verify Code & Access App
                </button>
              </form>

              <button
                type="button"
                onClick={() => goBack("phone_entry")}
                className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </motion.div>
          )}

          {/* Email OTP Sign-in & Sign-up Form */}
          {flowState === "email_form" && (
            <motion.div
              key="email_form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-outfit text-base font-bold text-slate-800">
                  {emailOtpSent
                    ? "Verify Gmail OTP"
                    : isLogin
                      ? "Sign In to Account"
                      : "Register New Account"
                  }
                </h3>
                <p className="text-xs text-slate-400">
                  {emailOtpSent
                    ? `Enter the 6-digit code sent to ${email}`
                    : isLogin
                      ? "Fast password-free entry using Gmail OTP verification"
                      : "Create secure bio-metrics record linked to your Gmail"
                  }
                </p>
              </div>

              {!emailOtpSent ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-3.5 text-xs text-left">
                  {!isLogin && (
                    <div className="space-y-1">
                      <label htmlFor="reg-name" className="font-bold text-slate-600">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          id="reg-name"
                          type="text"
                          required
                          placeholder="Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="font-bold text-slate-600">Gmail Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="rahul@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold mt-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Send Gmail Verification OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-5 text-xs">
                  {/* 6 Digit Grid inputs for Email OTP */}
                  <div className="flex justify-between gap-1.5 max-w-[280px] mx-auto" onPaste={handleEmailOtpPaste}>
                    {emailOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { emailOtpRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        pattern="\d*"
                        required
                        value={digit}
                        onChange={(e) => handleEmailOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleEmailOtpKeyDown(idx, e)}
                        className="h-10 w-9 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-extrabold text-sm focus:outline-none focus:border-red-500/50"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] px-2 font-mono text-slate-400">
                    <span>Resend code {emailCountdown > 0 ? `(${emailCountdown}s)` : ""}</span>
                    <button
                      type="button"
                      disabled={!canResendEmail}
                      onClick={handleResendEmailOtp}
                      className={`font-bold uppercase ${canResendEmail ? "text-red-500" : "text-slate-300"}`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    Verify Gmail Code & Access App
                  </button>
                </form>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-[10px] text-slate-400">
                {!emailOtpSent ? (
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-bold text-purple-600 hover:underline"
                  >
                    {isLogin ? "New user? Register here" : "Have an account? Login here"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEmailOtpSent(false)}
                    className="font-bold text-purple-600 hover:underline"
                  >
                    Change Email Address
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => goBack("method")}
                  className="font-bold hover:text-slate-600"
                >
                  Back to Methods
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400 animate-pulse">Loading auth specs...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
