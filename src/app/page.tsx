"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Camera, 
  Search, 
  Plus, 
  Droplet, 
  LineChart, 
  ChevronRight, 
  Check, 
  Mail, 
  User, 
  MessageSquare, 
  Send,
  Flame,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the ZenLog AI Food Scanner work?",
      a: "ZenLog leverages Gemini 2.5 Flash Vision models. Simply capture a photo of your meal or upload a picture from your gallery. The AI automatically detects the food boundary, estimates portion weights, and breaks down the exact calories, protein, carbs, and fats instantly."
    },
    {
      q: "What is the calorie auto-adjustment feature?",
      a: "If you eat more or less than your target calorie budget on any given day, ZenLog automatically carries over the surplus or deficit to the next day. Today's calorie limits and target macronutrient splits will scale dynamically to keep your weekly progress balanced."
    },
    {
      q: "Is there a custom food database?",
      a: "Yes. ZenLog hosts a fully searchable regional Indian and global catalog preloaded with favorites like Roti, Paneer Tikka, and Dal Tadka, alongside major Indian and international packaged food brands."
    },
    {
      q: "Is my personal weight progress data secure?",
      a: "Absolutely. ZenLog isolates every user session securely. Your physical profiles (height, weight, age) are saved in secure isolated database rows ensuring total privacy."
    }
  ];

  const handleToggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="relative overflow-hidden bg-[#F8F8FA] min-h-screen text-[#111111] pb-16">
      {/* Floating Decorative Mesh backdrops */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-teal-400/5 blur-[120px] -z-10 pointer-events-none aurora-blur" />
      <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-sky-400/5 blur-[150px] -z-10 pointer-events-none aurora-blur" />

      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 text-xs font-bold text-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-[#14B8A6] animate-pulse" />
              <span>Premium AI Powered Nutrition Coach</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight text-[#111827] leading-[1.05]">
              ZenLog <br />
              <span className="bg-gradient-to-r from-[#14B8A6] to-indigo-600 bg-clip-text text-transparent">AI Powered Nutrition</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
              Scan meals instantly with visual intelligence, log custom Indian foods and brands, and experience smart weekly budget balancing inside a stunning minimal interface.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="/NutriAI.apk"
                download
                className="px-8 py-4 rounded-2xl bg-[#111827] text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] flex items-center space-x-2"
              >
                <span>🚀 Download Android App (.apk)</span>
                <ChevronRight className="h-4 w-4" />
              </a>
              <button
                disabled
                className="px-8 py-4 rounded-2xl border border-slate-200 bg-slate-100/50 text-slate-400 font-bold text-xs cursor-not-allowed"
              >
                iOS App (Coming Soon)
              </button>
            </div>
          </div>

          {/* Right Hero Column: Premium Live Interactive Mobile Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative mx-auto w-[290px] h-[580px] bg-[#111115] rounded-[48px] p-3 shadow-[0_24px_50px_rgba(0,0,0,0.15)] border-4 border-[#E4E4E8]">
              {/* iPhone screen canvas */}
              <div className="w-full h-full bg-[#F8F8FA] rounded-[38px] overflow-hidden relative flex flex-col justify-between p-4 border border-[#ECECEF] select-none pointer-events-none">
                
                {/* Simulated Header */}
                <div className="flex justify-between items-center pt-3 pb-2 border-b border-slate-100 text-[8px] font-bold text-slate-400">
                  <span>9:41 📡</span>
                  <span className="uppercase font-mono tracking-widest bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-[7px]">ZenLog</span>
                </div>

                {/* Dashboard simulation */}
                <div className="space-y-3.5 flex-grow pt-4 text-left overflow-y-auto scrollbar-none">
                  
                  {/* Calorie Card */}
                  <div className="p-4 bg-white border border-[#ECECEF] rounded-[24px] flex flex-col items-center shadow-xs">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Remaining Balance</span>
                    <div className="relative h-20 w-20 flex items-center justify-center mt-2.5">
                      <svg className="absolute h-full w-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                        <circle cx="40" cy="40" r="34" stroke="#111827" strokeWidth="4.5" fill="transparent" strokeDasharray={213} strokeDashoffset={60} />
                      </svg>
                      <div className="text-center z-10">
                        <span className="text-xs font-extrabold text-[#111827]">1,680</span>
                        <span className="text-[6px] text-slate-400 block uppercase font-bold">kcal left</span>
                      </div>
                    </div>
                  </div>

                  {/* Water Tracker */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] shadow-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplet className="h-3.5 w-3.5 text-sky-500" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-800">Hydration level</p>
                        <span className="text-[7px] text-[#8D8D92] block">1,250ml logged today</span>
                      </div>
                    </div>
                  </div>

                  {/* Indian Meal item */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] shadow-xs space-y-1.5">
                    <span className="text-[7px] uppercase tracking-wider font-extrabold text-slate-400 block">Logged Meal</span>
                    <div className="flex justify-between items-center text-[8px] bg-slate-50 border border-[#ECECEF] p-1.5 rounded-lg">
                      <span className="font-bold text-slate-700">🥗 2 Paneer Roti Split</span>
                      <span className="text-emerald-600 font-extrabold">+320 kcal</span>
                    </div>
                  </div>

                </div>

                {/* Simulated Bottom Nav */}
                <div className="flex justify-around items-center pt-2 border-t border-slate-100 bg-white/70 rounded-b-2xl h-10">
                  <span className="text-[7px] font-bold text-[#111827]">Home</span>
                  <span className="text-[7px] font-bold text-slate-400">Progress</span>
                  <span className="text-[7px] font-bold text-slate-400">Scan</span>
                  <span className="text-[7px] font-bold text-slate-400">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111827]">
            ZenLog App Features
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to manage your nutrition is packed cleanly inside our simple interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Camera, 
              title: "AI Meal Scan", 
              desc: "Capture food photos or upload to gallery to estimate calories and macronutrients instantly via Gemini 2.5 Flash Vision.", 
              color: "text-emerald-500 bg-emerald-50" 
            },
            { 
              icon: Search, 
              title: "Fuzzy Food Search", 
              desc: "Query standard Indian favorites and custom brands with synonym mappings, autocorrect, and typos correction.", 
              color: "text-indigo-500 bg-indigo-50" 
            },
            { 
              icon: Plus, 
              title: "Smart Calorie Adjustment", 
              desc: "Automatically roll over yesterday's surplus or deficit to today's budgets, scaling Protein, Carbs, and Fats proportionally.", 
              color: "text-orange-500 bg-orange-50" 
            },
            { 
              icon: Droplet, 
              title: "Personalized Goals", 
              desc: "Calibrate BMR and TDEE calorie limits dynamically using Mifflin-St Jeor equations based on target timelines.", 
              color: "text-sky-500 bg-sky-50" 
            },
            { 
              icon: LineChart, 
              title: "Progress Tracking", 
              desc: "Visualize weight trends, average calories, body index calculations, and macro progress bars cleanly.", 
              color: "text-purple-500 bg-purple-50" 
            },
            { 
              icon: Sparkles, 
              title: "Gemini AI Coach", 
              desc: "Receive smart real-time motivation, macro adjustments recommendations, and clinical advice dynamically.", 
              color: "text-teal-500 bg-teal-50" 
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-[24px] border border-[#ECECEF] bg-white space-y-4 text-left shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-outfit text-sm font-bold text-[#111827]">{item.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. APP SCREENSHOT PREVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111827]">Application Screen Showcases</h2>
          <p className="text-slate-400 text-xs sm:text-sm">High-fidelity look inside the mobile interface layouts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
          {[
            { title: "Home Dashboard", desc: "Circular budget dials, protein splits, and water fluids trackers all inside a clean white canvas." },
            { title: "Full Screen Camera Scan", desc: "Take a food picture, trigger Gemini Vision estimations, edit values, and save to logs immediately." },
            { title: "Progress Dashboard", desc: "Isolated Weight charts, body weights logger logs, expenditure logs, and live BMI assessments." }
          ].map((scr, idx) => (
            <div key={idx} className="p-4 bg-white border border-[#ECECEF] rounded-[32px] text-left space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="h-44 w-full bg-[#111115] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">Screen preview</div>
                <div className="h-32 w-24 bg-[#F8F8FA] rounded-xl border border-slate-800 p-2 text-[6px] space-y-1 relative">
                  <div className="h-2 w-full bg-slate-200 rounded" />
                  <div className="h-2 w-2/3 bg-slate-200 rounded" />
                  <div className="h-8 w-8 rounded-full border border-[#14B8A6] border-2 mx-auto mt-2 animate-pulse" />
                  <div className="h-2 w-full bg-slate-200 rounded mt-2" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{scr.title}</h4>
              <p className="text-[10px] text-slate-400 leading-normal">{scr.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2.5">
          <h2 className="font-outfit text-3xl font-bold text-[#111827]">
            Common Queries
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to know about the ZenLog platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isFaqActive = activeFaq === idx;
            return (
              <div key={idx} className="border border-[#ECECEF] rounded-2xl bg-white overflow-hidden transition-all">
                <button
                  onClick={() => handleToggleFaq(idx)}
                  className="w-full p-5 text-left text-xs font-bold flex justify-between items-center transition-colors hover:bg-slate-50 outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg text-[#14B8A6] font-mono leading-none">{isFaqActive ? "−" : "+"}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isFaqActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#F1F1F4] bg-[#F8F8FA]/50"
                    >
                      <p className="p-5 text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DOWNLOAD APP BUTTONS */}
      <section id="download" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="p-8 md:p-14 bg-[#111827] text-white rounded-[32px] text-center space-y-6 relative overflow-hidden shadow-lg border border-white/5">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-[60px]" />

          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Download ZenLog on your Android device to unlock BMR assessment targets, Gemini Vision food scanners, and auto calorie rollover algorithms.
          </p>

          <div className="flex justify-center pt-4">
            <a
              href="/NutriAI.apk"
              download
              className="px-8 py-4 rounded-2xl bg-white text-[#111827] font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md pulse-light flex items-center space-x-2"
            >
              <span>🚀 Download Android App (.apk)</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
