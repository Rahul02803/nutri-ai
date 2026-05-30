"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, User as UserIcon, Sparkles, Phone,
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle, Flame, Camera, Scale, Apple, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FlowState = "welcome" | "method" | "google_picker" | "phone_entry" | "phone_otp" | "email_form";

function AuthPageContent() {
  const {
    user, loading, pendingOtp, loginWithGoogle,
    sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [flowState, setFlowState] = useState<FlowState>("welcome");
  const [isLogin, setIsLogin] = useState(true);

  // Email form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState(""); // password simulation

  // Google picker simulated interactive OAuth state
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [googleSubState, setGoogleSubState] = useState<"list" | "form">("list");

  // Phone OTP states
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Global UI states
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyText, setBusyText] = useState("");

  // ── Route Protection ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.isOnboarded) router.push("/dashboard");
      else router.push("/onboarding");
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

  // ── Helpers ─────────────────────────────────────────────────────────────
  const startBusy = (text: string) => {
    setBusy(true); setBusyText(text); setError(null); setInfo(null);
  };
  const stopBusy = () => { setBusy(false); setBusyText(""); };
  const goBack = (to: FlowState) => { setError(null); setInfo(null); setFlowState(to); };

  // ── Google OAuth Simulator ───────────────────────────────────────────────
  const handleSelectMockGoogleAccount = async (name: string, email: string, avatar: string) => {
    startBusy(`Connecting to Google OAuth for ${email}...`);
    const result = await loginWithGoogle(email, name, avatar);
    stopBusy();
    if (!result.success) {
      setError(result.error || "Google authentication failed.");
    }
  };

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
      setInfo("Verification OTP is 762015. (Simulated SMS Banner)");
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
      setInfo("New OTP sent. Code: 762015");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      setError(result.error || "Failed to resend OTP.");
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[idx] = digit; setOtpDigits(next);
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
    }
  };

  // ── Email Password Login Simulator ───────────────────────────────
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    startBusy("Authorizing email credentials...");
    // Simulate login via standard contextual synchronization
    const simulatedAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;
    const result = await loginWithGoogle(email, name || email.split("@")[0], simulatedAvatar);
    stopBusy();
    if (!result.success) {
      setError(result.error || "Email authorization failed.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F8F8FA] p-4 text-[#111111]">
      
      {/* Dynamic welcome or SMS top banners */}
      {info && (
        <div className="absolute top-4 left-4 right-4 z-50 rounded-2xl bg-slate-900 border border-slate-800 text-white p-3.5 text-xs text-left flex items-start space-x-2.5 shadow-md">
          <CheckCircle className="h-4.5 w-4.5 text-[#14B8A6] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Simulated Notification</p>
            <p className="text-[10px] text-slate-300 mt-0.5">{info}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 rounded-2xl bg-rose-500 text-white p-3.5 text-xs text-left shadow-md">
          <p className="font-bold">Error Encountered</p>
          <p className="text-[10px] mt-0.5">{error}</p>
        </div>
      )}

      {/* Main card box container */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[36px] p-8 shadow-sm text-center relative overflow-hidden">
        
        {/* Busy Loader Cover */}
        {busy && (
          <div className="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-700">{busyText}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* FLOW STATE 1: WELCOME PREVIEW SCREEN */}
          {flowState === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 flex flex-col justify-between"
            >
              <div className="flex justify-center items-center space-x-2 font-bold text-2xl font-outfit text-slate-900">
                <span>🍎</span>
                <span>ZenLog</span>
              </div>

              {/* Looping preview showcase mockup */}
              <div className="h-44 w-full bg-[#111115] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden shadow-xs border border-slate-200/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 animate-pulse pointer-events-none" />
                
                <div className="text-center space-y-2 text-white z-10">
                  <div className="inline-flex space-x-2 justify-center">
                    <span className="text-[10px] font-bold bg-[#14B8A6] px-2 py-0.5 rounded-full">📷 Photo Scanner</span>
                    <span className="text-[10px] font-bold bg-indigo-600 px-2 py-0.5 rounded-full">📉 Charts</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">ZenLog Premium Assessment Preview</h4>
                  <p className="text-[8px] text-slate-400 max-w-[180px] mx-auto">
                    Looping Demo: Gemini 2.5 Flash calculates BMR target splits instantly.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Track calories, search Indian favorite food catalogs, scan meals, and adjust daily macros.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { setIsLogin(false); goBack("method"); }}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => { setIsLogin(true); goBack("method"); }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 block mx-auto py-1"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* FLOW STATE 2: METHOD SELECTION */}
          {flowState === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <button onClick={() => goBack("welcome")} className="p-1 rounded-lg hover:bg-slate-50">
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Method</span>
              </div>

              <h2 className="font-outfit text-xl font-extrabold text-slate-900">
                {isLogin ? "Sign In to ZenLog" : "Create ZenLog Account"}
              </h2>

              <div className="space-y-2.5 pt-1">
                {/* Google Provider Option */}
                <button
                  onClick={() => goBack("google_picker")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs"
                >
                  <span className="flex items-center space-x-2.5">
                    <span className="text-sm">🌐</span>
                    <span>Continue with Google</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                {/* Mobile OTP Option */}
                <button
                  onClick={() => goBack("phone_entry")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs"
                >
                  <span className="flex items-center space-x-2.5">
                    <Phone className="h-4 w-4 text-slate-700" />
                    <span>Continue with Mobile + OTP</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                {/* Email / Password Option */}
                <button
                  onClick={() => goBack("email_form")}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs"
                >
                  <span className="flex items-center space-x-2.5">
                    <Mail className="h-4 w-4 text-slate-700" />
                    <span>Continue with Email & Password</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}

          {/* FLOW STATE 3: GOOGLE ACCOUNT CHOOSER */}
          {flowState === "google_picker" && (
            <motion.div
              key="google"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center space-x-2">
                <button onClick={() => goBack("method")} className="p-1 rounded-lg hover:bg-slate-50">
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Google Sign-In</span>
              </div>

              {googleSubState === "list" ? (
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <span className="text-3xl">🌐</span>
                    <h3 className="font-outfit text-sm font-bold text-slate-800 mt-2">Select Google Account</h3>
                    <p className="text-[10px] text-slate-400">to continue to ZenLog AI</p>
                  </div>

                  <div className="space-y-2 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                    {[
                      { name: "Rahul Sharma", email: "rahul@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
                      { name: "Priya Patel", email: "priya@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
                      { name: "Amit Verma", email: "amit@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" }
                    ].map((acct, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMockGoogleAccount(acct.name, acct.email, acct.avatar)}
                        className="w-full flex items-center space-x-3 p-2.5 rounded-xl bg-white hover:bg-slate-50 text-left border border-slate-100 text-xs font-bold"
                      >
                        <img src={acct.avatar} alt="Avatar" className="h-7 w-7 rounded-full border" />
                        <div>
                          <p className="text-slate-800">{acct.name}</p>
                          <span className="text-[9px] text-slate-400 font-normal">{acct.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setGoogleSubState("form")}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-[#14B8A6] font-bold text-center text-xs hover:bg-slate-50"
                  >
                    + Use another google account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGoogleOAuthSubmit} className="space-y-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Input Google Credentials</span>
                  
                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block mb-1">Google Email</label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-bold block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleSubState("list")}
                      className="w-1/3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 text-center"
                    >
                      Proceed
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* FLOW STATE 4: MOBILE OTP NUMBER ENTRY */}
          {flowState === "phone_entry" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center space-x-2">
                <button onClick={() => goBack("method")} className="p-1 rounded-lg hover:bg-slate-50">
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Login</span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <h3 className="font-outfit text-md font-extrabold text-slate-800">Enter Mobile Number</h3>
                <p className="text-[10px] text-slate-400">We will send a 6-digit verification code via simulated SMS.</p>
                
                <div className="space-y-1">
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-slate-400 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Send OTP Code</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* FLOW STATE 5: MOBILE OTP PIN VERIFICATION */}
          {flowState === "phone_otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center space-x-2">
                <button onClick={() => goBack("phone_entry")} className="p-1 rounded-lg hover:bg-slate-50">
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SMS OTP Code</span>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <h3 className="font-outfit text-md font-extrabold text-slate-800">Verify Code</h3>
                <p className="text-[10px] text-slate-400">Enter the 6-digit code sent to mobile number.</p>

                <div className="flex justify-between gap-1.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      maxLength={1}
                      className="h-11 w-10 bg-slate-50 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 text-sm focus:outline-none focus:border-slate-400"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <span>Verify and Login</span>
                </button>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-1">
                  <span>Resend in {countdown > 0 ? `${countdown}s` : "0s"}</span>
                  {canResend ? (
                    <button type="button" onClick={handleResendOtp} className="text-[#14B8A6] hover:underline">
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-300">Resend Code</span>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* FLOW STATE 6: EMAIL & PASSWORD LOGIN FORM */}
          {flowState === "email_form" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center space-x-2">
                <button onClick={() => goBack("method")} className="p-1 rounded-lg hover:bg-slate-50">
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-400" />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Credential</span>
              </div>

              <form onSubmit={handleEmailFormSubmit} className="space-y-4">
                <h3 className="font-outfit text-md font-extrabold text-slate-800">Email Sign In</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[#111111] font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@bca.edu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-[#111111] font-bold">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[#111111] font-bold">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <span>{isLogin ? "Sign In" : "Register"}</span>
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<p className="text-center font-bold py-12">Loading Authentication Cockpit...</p>}>
      <AuthPageContent />
    </Suspense>
  );
}
