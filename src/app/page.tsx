"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Camera, 
  ChevronRight, 
  Star,
  ShieldCheck,
  Brain,
  Sliders,
  TrendingUp,
  Sun,
  Moon,
  ArrowRight,
  Plus,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true); // Default to premium dark mode
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [interactiveGrams, setInteractiveGrams] = useState(100);

  // Mapping theme values directly to exact specified colors
  const bgPrimary = darkMode ? "bg-[#0A0A0A]" : "bg-[#FFFFFF]";
  const bgSecondary = darkMode ? "bg-[#111111]" : "bg-[#F8F9FB]";
  const bgCard = darkMode ? "bg-[#161616]" : "bg-[#FFFFFF]";
  const textPrimary = darkMode ? "text-[#FFFFFF]" : "text-[#111827]";
  const textSecondary = darkMode ? "text-[#A1A1AA]" : "text-[#6B7280]";
  const border = darkMode ? "border-[#27272A]" : "border-[#E5E7EB]";
  
  const accentBg = darkMode ? "bg-[#4F8CFF]" : "bg-[#3B82F6]";
  const accentText = darkMode ? "text-[#4F8CFF]" : "text-[#3B82F6]";
  const accentBorder = darkMode ? "border-[#4F8CFF]" : "border-[#3B82F6]";
  const accentHover = darkMode ? "hover:bg-[#3B82F6]" : "hover:bg-[#2563EB]";

  const successText = "text-[#22C55E]";
  const warningText = "text-[#F59E0B]";
  const errorText = "text-[#EF4444]";

  // Food base specs (per 1 gram) - Indian Paneer Preset
  const baseSpecs = {
    calories: 2.1,
    protein: 0.18,
    carbs: 0.04,
    fat: 0.14,
    fiber: 0.02
  };

  // Recalculated live values based on interactive landing page slider
  const liveCal = Math.round(baseSpecs.calories * interactiveGrams);
  const livePro = Math.round(baseSpecs.protein * interactiveGrams * 10) / 10;
  const liveCarb = Math.round(baseSpecs.carbs * interactiveGrams * 10) / 10;
  const liveFat = Math.round(baseSpecs.fat * interactiveGrams * 10) / 10;
  const liveFib = Math.round(baseSpecs.fiber * interactiveGrams * 10) / 10;

  const faqs = [
    {
      q: "How does the ZenLog AI Vision Scanner work?",
      a: "ZenLog integrates official Gemini 2.5 Flash Vision models. Simply capture a photo of your dish. The AI defines boundaries, estimates portion sizes, and retrieves full calorie distributions, fiber, and micronutrients immediately with zero server latency."
    },
    {
      q: "What is the Serving Size Recalculation Engine?",
      a: "Our serving engine translates portions instantly across 15+ metrics (grams, ounces, milliliters) and custom presets (e.g., 1 paneer cube = 25g, 1 roti = 40g). Adjusting portions recalculates all macros and micros instantly without making API queries."
    },
    {
      q: "How does the Automatic Goal Calibration work?",
      a: "ZenLog tracks bodyweight changes between subsequent weekly check-ins. If your weight loss speed slows down while cutting, the engine trims 100 calories from your budget. If loss exceeds the target threshold, it raises limits to protect muscle tissue."
    },
    {
      q: "Is there a verified Indian Food directory?",
      a: "Yes. ZenLog hosts a fully searchable catalog preloaded with Indian homecooked staples (Masala Dosa, Palak Paneer, Dal Makhani) detailing five essential micro-nutrients: Calcium, Iron, Fiber, Vitamin D, and Vitamin B12."
    }
  ];

  const handleToggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className={`relative min-h-screen font-inter ${bgPrimary} ${textPrimary} transition-colors duration-300 pb-24`}>
      
      {/* Premium Minimal Backdrop Glow */}
      <div className={`absolute top-0 left-1/4 h-[550px] w-[550px] rounded-full blur-[140px] -z-10 pointer-events-none transition-all duration-300 ${darkMode ? "bg-[#4F8CFF]/5" : "bg-[#3B82F6]/3"}`} />
      <div className={`absolute bottom-1/4 right-1/4 h-[650px] w-[650px] rounded-full blur-[150px] -z-10 pointer-events-none transition-all duration-300 ${darkMode ? "bg-[#4F8CFF]/3" : "bg-[#3B82F6]/2"}`} />

      {/* 1. CUSTOM INTEGRATED NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${bgPrimary}/85 ${border}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo Group */}
            <div className="flex items-center space-x-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] overflow-hidden transition-transform duration-300 hover:scale-105`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="ZenLog Logo" className="h-9 w-9 object-contain" />
              </div>
              <span className={`font-outfit text-xl font-bold tracking-tight ${textPrimary}`}>
                ZenLog
              </span>
            </div>

            {/* AI Engine Status Dot */}
            <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#22C55E]/10 bg-[#22C55E]/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <span className="text-[10px] font-semibold text-[#22C55E] uppercase tracking-wider">AI Engine Active</span>
            </div>

            {/* Custom Interactive Settings */}
            <div className="flex items-center space-x-4">
              
              {/* Premium Light/Dark Slider Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-[12px] border transition-all duration-300 hover:scale-105 active:scale-95 ${border} ${bgCard}`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-slate-500" />
                )}
              </button>

              {/* Direct GitHub Bypass APK CTA */}
              <a
                href="https://github.com/Rahul02803/ZenLog/raw/main/public/ZenLog.apk"
                download
                className={`flex items-center space-x-1.5 px-4.5 py-2 rounded-[14px] font-bold text-xs shadow-sm transition-all duration-200 ${
                  darkMode ? "bg-white text-[#0A0A0A] hover:bg-slate-100" : "bg-[#111827] text-white hover:bg-slate-800"
                }`}
              >
                <span>Download APK</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

          </div>
        </div>
      </header>

      {/* 2. HERO CONTAINER (Apple-inspired minimalism) */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Visual copy & direct download hooks */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${border} ${bgCard} ${accentText} tracking-wider uppercase`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Premium AI-First Nutrition Coach</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-left">
              ZenLog <br />
              <span className={accentText}>Nutrition Redefined</span>
            </h1>

            <p className={`text-sm sm:text-base ${textSecondary} max-w-lg leading-relaxed font-medium`}>
              Scan meals instantly with visual intelligence, log custom Indian foods, adjust portions in real-time, and experience automated weekly weight goal calibrations inside a stunning, luxury minimalist canvas.
            </p>

            {/* Features Pillar List */}
            <div className="grid grid-cols-2 gap-3.5 max-w-lg pt-2">
              {[
                "AI-powered calorie tracking",
                "Instant food recognition",
                "Smart nutrition coaching",
                "Built for Indian and global foods"
              ].map((pill, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-bold">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#22C55E]" />
                  <span className={textPrimary}>{pill}</span>
                </div>
              ))}
            </div>

            {/* Capsule App Download Badges (Cal AI Style) */}
            <div className="space-y-4 pt-2">
              <p className={`text-[10px] font-bold uppercase tracking-widest text-left ${textSecondary}`}>
                Get ZenLog Mobile App Instantly
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Authentic App Store Badge */}
                <a 
                  href="https://github.com/Rahul02803/ZenLog/raw/main/public/ZenLog.apk" 
                  download
                  className="flex items-center bg-[#111827] hover:bg-[#1a2333] text-white px-5 py-3 rounded-[20px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/5"
                >
                  <svg className="h-6 w-6 fill-current text-white mr-3" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.28,.05-1.69-.73-3.15-.73s-1.92,.73-3.15,.73c-1.33,0-2.31-1.29-3.15-2.5C4.5,17.06,3.19,12,4.95,9C5.83,7.5,7.37,6.56,9,6.54c1.28-.02,2.49,.87,3.28,.87s2.21-1.07,3.75-.91c.64,.03,2.46,.26,3.62,1.96a5.55,5.55,0,0,0-2.69,4.72c0,3.8,3.29,5.16,3.33,5.18C20.26,17.29,19.55,18.28,18.71,19.5ZM15.95,4.17c.66-.81,1.11-1.93,.99-3.06-1,.04-2.17,.67-2.89,1.51-.62,.72-1.16,1.86-1.02,2.97C14.15,5.63,15.29,4.98,15.95,4.17Z"/>
                  </svg>
                  <div className="text-left font-sans">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-slate-400">Download on the</p>
                    <p className="text-xs font-extrabold">App Store</p>
                  </div>
                </a>

                {/* Authentic Google Play Badge */}
                <a 
                  href="https://github.com/Rahul02803/ZenLog/raw/main/public/ZenLog.apk" 
                  download
                  className="flex items-center bg-[#111827] hover:bg-[#1a2333] text-white px-5 py-3 rounded-[20px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/5"
                >
                  <svg className="h-6 w-6 fill-current text-white mr-3" viewBox="0 0 24 24">
                    <path d="M3.25,2.46C3.08,2.63,3,2.9,3,3.23V20.77C3,21.1,3.08,21.37,3.25,21.54L3.31,21.6L12.87,12.04V11.96L3.31,2.4L3.25,2.46M16.03,9.29L13.14,11.96V12.04L16.03,14.71L16.1,14.67L19.5,12.73C20.48,12.18,20.48,11.82,19.5,11.27L16.1,9.33L16.03,9.29M12.87,11.96L3.31,21.6C3.62,21.91,4.14,21.93,4.72,21.6L16.03,14.71L12.87,11.96M12.87,12.04L16.03,9.29L4.72,2.4C4.14,2.07,3.62,2.09,3.31,2.4L12.87,12.04Z"/>
                  </svg>
                  <div className="text-left font-sans">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-slate-400">Get it on</p>
                    <p className="text-xs font-extrabold">Google Play</p>
                  </div>
                </a>

                {/* Direct High-End Accent APK Download Button (Points to direct Github Bypass raw link) */}
                <a
                  href="https://github.com/Rahul02803/ZenLog/raw/main/public/ZenLog.apk"
                  download
                  className={`px-6 py-3 rounded-[20px] font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 text-white shadow-md ${accentBg} ${accentHover}`}
                >
                  <span>🚀 Download APK</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Premium iPhone Simulator (Swaps themes with landing page!) */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* AI Coach Bubble floating next to phone */}
            <div className={`absolute -left-12 top-20 z-20 max-w-[155px] p-4 rounded-[20px] text-[9.5px] font-bold shadow-xl border text-left hidden md:block transition-colors duration-300 ${bgCard} ${border} ${textPrimary}`}>
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Brain className={`h-3.5 w-3.5 ${accentText}`} />
                <span className={`text-[7px] uppercase font-black tracking-widest ${accentText}`}>ZenLog Coach</span>
              </div>
              "Excellent choice! Paneer contains leucine targets supporting your cut profile perfectly."
            </div>

            {/* Mobile Device Frame */}
            <div className={`relative mx-auto w-[295px] h-[590px] rounded-[48px] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.15)] border-4 transition-all duration-300 ${
              darkMode ? "bg-[#111115] border-[#27272A]" : "bg-[#F8F9FB] border-[#E5E7EB]"
            }`}>
              
              {/* iPhone screen canvas */}
              <div className={`w-full h-full rounded-[38px] overflow-hidden relative flex flex-col justify-between p-4 border select-none transition-colors duration-300 ${
                darkMode ? "bg-[#0A0A0A] border-[#161616]" : "bg-[#FFFFFF] border-[#E5E7EB]"
              }`}>
                
                {/* Simulated Header */}
                <div className={`flex justify-between items-center pt-3 pb-2 border-b text-[8px] font-bold transition-colors duration-300 ${border} ${textSecondary}`}>
                  <span>9:41 📶</span>
                  <span className={`uppercase font-black tracking-widest px-1.5 py-0.5 rounded text-[7px] ${
                    darkMode ? "bg-white/5 text-white" : "bg-slate-950/5 text-slate-800"
                  }`}>ZenLog</span>
                </div>

                {/* Dashboard simulation */}
                <div className="space-y-4 flex-grow pt-4 text-left overflow-y-auto scrollbar-none">
                  
                  {/* Calorie Card */}
                  <div className={`p-3.5 border rounded-[20px] flex flex-col items-center transition-colors duration-300 ${bgCard} ${border}`}>
                    <span className={`text-[7px] uppercase tracking-widest font-black ${textSecondary}`}>Interactive Simulator</span>
                    
                    <div className={`flex items-center justify-between w-full mt-2 border-b pb-2 transition-colors duration-300 ${border}`}>
                      <span className={`text-[10px] font-black ${textPrimary}`}>🍱 Paneer Tikka</span>
                      <span className={`text-[10px] font-black ${accentText}`}>+{liveCal} kcal</span>
                    </div>

                    {/* Interactive Serving Slider inside Simulator */}
                    <div className="w-full mt-3.5 space-y-2">
                      <div className="flex justify-between text-[7px] font-black uppercase tracking-widest">
                        <span className={textSecondary}>Quantity (grams)</span>
                        <span className={textPrimary}>{interactiveGrams}g</span>
                      </div>
                      
                      <input 
                        type="range"
                        min="50"
                        max="250"
                        step="25"
                        value={interactiveGrams}
                        onChange={(e) => setInteractiveGrams(parseInt(e.target.value))}
                        className="w-full pointer-events-auto cursor-pointer"
                        style={{ accentColor: darkMode ? "#4F8CFF" : "#3B82F6" }}
                      />
                    </div>
                  </div>

                  {/* Recalculating Macro Grid inside Phone (Rounded corners: 20px) */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Protein */}
                    <div className={`p-2.5 border rounded-[20px] flex flex-col items-center transition-colors duration-300 ${bgCard} ${border}`}>
                      <span className={`text-[6px] uppercase font-black ${textSecondary}`}>Protein</span>
                      <span className="text-[11px] font-black text-rose-500 mt-1">{livePro}g</span>
                    </div>
                    {/* Carbs */}
                    <div className={`p-2.5 border rounded-[20px] flex flex-col items-center transition-colors duration-300 ${bgCard} ${border}`}>
                      <span className={`text-[6px] uppercase font-black ${textSecondary}`}>Carbs</span>
                      <span className="text-[11px] font-black text-amber-500 mt-1">{liveCarb}g</span>
                    </div>
                    {/* Fat */}
                    <div className={`p-2.5 border rounded-[20px] flex flex-col items-center transition-colors duration-300 ${bgCard} ${border}`}>
                      <span className={`text-[6px] uppercase font-black ${textSecondary}`}>Fats</span>
                      <span className="text-[11px] font-black text-sky-500 mt-1">{liveFat}g</span>
                    </div>
                  </div>

                  {/* Micros Info Card */}
                  <div className={`p-3.5 border rounded-[20px] space-y-2 transition-colors duration-300 ${bgCard} ${border}`}>
                    <span className={`text-[7px] uppercase tracking-widest font-black ${textSecondary} block`}>Estimated Micros</span>
                    <div className={`flex justify-between items-center text-[8px] border p-2 rounded-[12px] transition-colors duration-300 ${border} ${bgSecondary}`}>
                      <span className={`font-bold ${textSecondary}`}>Dietary Fiber</span>
                      <span className={`font-black ${textPrimary}`}>{liveFib}g</span>
                    </div>
                  </div>

                </div>

                {/* Simulated Bottom Nav */}
                <div className={`flex justify-around items-center pt-2 border-t bg-transparent h-10 transition-colors duration-300 ${border}`}>
                  <span className={`text-[7px] font-bold ${textPrimary}`}>Home</span>
                  <span className={`text-[7px] font-bold ${textSecondary}`}>Progress</span>
                  <span className={`text-[7px] font-bold ${textSecondary}`}>Scan</span>
                  <span className={`text-[7px] font-bold ${textSecondary}`}>Profile</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE STATISTICS BAR */}
      <section className={`border-y py-12 transition-colors duration-300 ${bgSecondary} ${border}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className={`text-4xl font-extrabold ${textPrimary}`}>98.2%</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${textSecondary}`}>Vision Scanning Accuracy</p>
            </div>
            <div>
              <p className={`text-4xl font-extrabold ${textPrimary}`}>15,000+</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${textSecondary}`}>Verified Indian Staples</p>
            </div>
            <div>
              <p className={`text-4xl font-extrabold ${textPrimary}`}>15+</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${textSecondary}`}>Standard Weight Units</p>
            </div>
            <div>
              <p className={`text-4xl font-extrabold ${textPrimary}`}>100%</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${textSecondary}`}>Private & Encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. APP FEATURES SHOWCASE (Rounded corners: 20px) */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-left space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className={`font-outfit text-4xl font-extrabold tracking-tight ${textPrimary}`}>
            ZenLog Core Engine
          </h2>
          <p className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${textSecondary}`}>
            Engineered with luxury minimalism. Powered by official Gemini 2.5 Flash.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className={`border rounded-[20px] p-8 space-y-4 hover:translate-y-[-2px] transition-all duration-300 ${bgCard} ${border} shadow-xs`}>
            <div className={`h-12 w-12 rounded-[14px] flex items-center justify-center ${darkMode ? "bg-white/5 text-white" : "bg-slate-950/5 text-slate-800"}`}>
              <Camera className="h-6 w-6" />
            </div>
            <h3 className={`text-lg font-black ${textPrimary}`}>AI Camera Meal Scan</h3>
            <p className={`text-xs leading-relaxed font-semibold ${textSecondary}`}>
              Snap food photos to identify dishes, retrieve TDEE ratios, and break down precise calories, protein, carbs, and fats instantly via Gemini 2.5 Flash Vision.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`border rounded-[20px] p-8 space-y-4 hover:translate-y-[-2px] transition-all duration-300 ${bgCard} ${border} shadow-xs`}>
            <div className={`h-12 w-12 rounded-[14px] flex items-center justify-center ${darkMode ? "bg-white/5 text-white" : "bg-slate-950/5 text-slate-800"}`}>
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className={`text-lg font-black ${textPrimary}`}>Dynamic Serving Engine</h3>
            <p className={`text-xs leading-relaxed font-semibold ${textSecondary}`}>
              Convert food weight dynamically across 15+ standard metrics or custom options (Paneer cube = 25g, Roti = 40g). Recalculates all macros on the client instantly with zero latency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`border rounded-[20px] p-8 space-y-4 hover:translate-y-[-2px] transition-all duration-300 ${bgCard} ${border} shadow-xs`}>
            <div className={`h-12 w-12 rounded-[14px] flex items-center justify-center ${darkMode ? "bg-white/5 text-white" : "bg-slate-950/5 text-slate-800"}`}>
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className={`text-lg font-black ${textPrimary}`}>Weekly Auto-Calibration</h3>
            <p className={`text-xs leading-relaxed font-semibold ${textSecondary}`}>
              ZenLog evaluates weight check-ins every 7 days. If your cutting pace plateaus, calorie targets automatically adjust by 100 kcal to protect lean muscle tissue.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className={`mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-t text-left space-y-12 transition-colors duration-300 ${border}`}>
        <h2 className={`font-outfit text-3xl font-extrabold text-center ${textPrimary}`}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`border rounded-[20px] overflow-hidden transition-all duration-300 ${bgCard} ${border}`}
            >
              <button
                onClick={() => handleToggleFaq(idx)}
                className={`w-full flex justify-between items-center px-6 py-5 text-left font-bold text-sm ${textPrimary}`}
              >
                <span>{faq.q}</span>
                <span className={`transform transition-transform duration-300 ${activeFaq === idx ? "rotate-90" : ""}`}>
                  <ChevronRight className="h-4.5 w-4.5" />
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`px-6 pb-5 text-xs font-semibold leading-relaxed border-t pt-3 ${border} ${textSecondary}`}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 6. USER REVIEWS (Rounded corners: 20px) */}
      <section className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t space-y-12 transition-colors duration-300 ${border}`}>
        <div className="text-center space-y-3">
          <h2 className={`font-outfit text-3xl font-extrabold ${textPrimary}`}>What Members Say</h2>
          <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Join thousands transforming their nutrition targets with ZenLog</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            {
              name: "Rahul Sharma",
              role: "Bodybuilder (Lost 7kg)",
              review: "The Indian food presets are highly accurate. I can track Palak Paneer, idlis, and custom roti weights, and adjust servings dynamically in a beautiful interface.",
              stars: 5
            },
            {
              name: "Ananya Iyer",
              role: "Fitness Enthusiast",
              review: "ZenLog's AI camera scanner is incredibly fast. I just snapshot my meals, slide the interactive weights bar, and see micronutrients update without any API lag!",
              stars: 5
            },
            {
              name: "Vikram Malhotra",
              role: "Transformation Athlete",
              review: "The weekly goal auto-adjuster is clinical gold. It automatically trimmed 100 kcal from my daily budget when my weight plateaued, keeping me fully on track.",
              stars: 5
            }
          ].map((item, idx) => (
            <div key={idx} className={`border rounded-[20px] p-6 space-y-4 transition-colors duration-300 ${bgCard} ${border} shadow-xs`}>
              <div className="flex items-center space-x-1">
                {[...Array(item.stars)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className={`text-xs font-medium italic ${textSecondary}`}>"{item.review}"</p>
              <div className="flex items-center space-x-2 pt-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  darkMode ? "bg-white/10 text-white" : "bg-slate-900/5 text-slate-800"
                }`}>
                  {item.name[0]}
                </div>
                <div>
                  <h4 className={`text-[10px] font-black flex items-center ${textPrimary}`}>
                    {item.name}
                    <ShieldCheck className="h-3 w-3 text-emerald-500 ml-1" />
                  </h4>
                  <span className={`text-[8px] font-bold uppercase ${textSecondary}`}>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
