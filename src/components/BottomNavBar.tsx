"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Home, LineChart, Plus, Users, User, Camera, Barcode, Mic, Pencil, X, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNavBar() {
  const { user } = useAuth();
  const { logMeal } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Menu toggles
  const [showMenu, setShowMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("Tap to speak meal...");

  // Hide nav if user is not logged in, not onboarded, or on onboarding / welcome landing pages
  if (!user || !user.isOnboarded || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Progress", href: "/progress", icon: LineChart },
    { label: "Community", href: "/community", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // Simulated Voice Logging Parser
  const startRecording = () => {
    setIsRecording(true);
    setRecordingStatus("Listening to your voice...");
    
    // Simulate speaking
    setTimeout(() => {
      setRecordingStatus("Analyzing speech patterns...");
    }, 1800);

    setTimeout(() => {
      setVoiceText("I had a large Cappuccino and one chocolate chip Cookie");
      setIsRecording(false);
      setRecordingStatus("Converting to biological logs...");
    }, 3200);
  };

  const handleConfirmVoiceLog = () => {
    // Log the voice recognized meal into the system!
    // Cappuccino (120 kcal, 4g P) + Cookie (220 kcal, 2.5g P)
    logMeal("Cappuccino with Chocolate Cookie (Voice Logged)", "Snack", 340, 6.5, 45, 12, 1);
    setVoiceSuccess(true);
    setTimeout(() => {
      setVoiceSuccess(false);
      setShowVoiceModal(false);
      setVoiceText("");
      setRecordingStatus("Tap to speak meal...");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="relative w-full max-w-md flex justify-center">
          
          {/* Popover Action Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-20 bg-white/90 backdrop-blur-xl border border-[#ECECEF] rounded-[28px] p-4 w-[280px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] pointer-events-auto flex flex-col gap-2.5 z-50"
              >
                <div className="flex justify-between items-center px-2 pb-2 border-b border-[#F1F1F4]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D8D92]">Quick Logs Menu</span>
                  <button onClick={() => setShowMenu(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* 1. Scan meal photo */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/scanner");
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-[#111111]"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Camera className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p>AI Meal Scan</p>
                    <span className="text-[9px] text-[#8D8D92] block font-normal">Detect macros with camera</span>
                  </div>
                </button>



                {/* 3. Voice Logging */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowVoiceModal(true);
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-[#111111]"
                >
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Mic className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p>Voice Logging</p>
                    <span className="text-[9px] text-[#8D8D92] block font-normal">Speak what you ate</span>
                  </div>
                </button>

                {/* 4. Manual Food Log */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/dashboard");
                  }}
                  className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-[#111111]"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Pencil className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p>Log Manually</p>
                    <span className="text-[9px] text-[#8D8D92] block font-normal">Type and search database</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Bar */}
          <nav className="flex items-center justify-between w-full bg-white/75 backdrop-blur-xl border border-white/20 rounded-[32px] px-6 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.06)] pointer-events-auto transition-transform duration-300 active:scale-[0.99] z-40">
            {/* Left Nav items */}
            <div className="flex space-x-6">
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl group"
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? "text-[#111111] scale-110" : "text-[#8D8D92] group-hover:text-[#111111]"
                      }`}
                    />
                    <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-[#111111]" : "text-[#8D8D92]"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Central Floating Action Trigger Button */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 text-white shadow-lg border-4 border-[#F8F8FA] transition-all duration-300 outline-none hover:scale-105 active:scale-95 ${
                  showMenu ? "rotate-45" : "rotate-0"
                }`}
              >
                <Plus className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Right Nav items */}
            <div className="flex space-x-6">
              {navItems.slice(2, 4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl group"
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ${
                        isActive ? "text-[#111111] scale-110" : "text-[#8D8D92] group-hover:text-[#111111]"
                      }`}
                    />
                    <span className={`text-[10px] mt-1 font-semibold ${isActive ? "text-[#111111]" : "text-[#8D8D92]"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Voice capture simulator modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 space-y-6 shadow-xl relative overflow-hidden text-center">
                <div className="absolute top-0 inset-x-0 h-1 bg-purple-500" />
                
                <div className="flex justify-between items-center border-b border-[#F1F1F4] pb-3 text-left">
                  <span className="font-outfit font-bold text-[#111111] flex items-center gap-1.5">
                    <Mic className="h-4.5 w-4.5 text-purple-500 animate-pulse" />
                    AI Voice Calorie Logger
                  </span>
                  <button onClick={() => setShowVoiceModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-8 rounded-[24px] bg-[#F8F8FA] border border-[#ECECEF] flex flex-col items-center justify-center space-y-4">
                  {/* Waveform simulator */}
                  <div className="flex items-center space-x-1.5 h-8">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, idx) => (
                      <motion.div
                        key={idx}
                        className="w-1 bg-purple-500 rounded-full"
                        animate={{ height: isRecording ? [8, val * 8, 8] : 8 }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.08 }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                      isRecording ? "bg-purple-400 scale-95" : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
                    }`}
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                  <span className="text-[10px] font-mono text-[#8D8D92] tracking-wide uppercase font-semibold">
                    {recordingStatus}
                  </span>
                </div>

                <AnimatePresence>
                  {voiceText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/50 text-xs text-[#111111] leading-relaxed">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-purple-600 block mb-1 font-mono">Recognized Speech</span>
                        &ldquo;{voiceText}&rdquo;
                      </div>

                      <div className="p-3 bg-slate-50 border border-[#ECECEF] rounded-xl text-[10px] text-[#8D8D92] leading-relaxed flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-500 shrink-0 animate-pulse" />
                        AI estimated: 1x Cappuccino (120 kcal) + 1x Chocochip Cookie (220 kcal). Total: 340 kcal.
                      </div>

                      {voiceSuccess ? (
                        <div className="py-2 text-center text-xs font-bold text-emerald-600 flex items-center justify-center space-x-1.5">
                          <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100 p-0.5" />
                          <span>Intake successfully logged!</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleConfirmVoiceLog}
                          className="w-full py-3 rounded-2xl bg-[#111111] text-white text-xs font-bold hover:scale-[1.01] active:scale-[0.98] transition-all"
                        >
                          Confirm & Log 340 kcal
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
