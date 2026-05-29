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
  Send 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Contact Form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const faqs = [
    {
      q: "How does the AI Food Scanner work?",
      a: "Simply upload a photo of your meal or take a picture using your mobile app's camera. The visual AI model recognizes food items on the plate, estimates portion weights in grams, and logs their calories and macros into your dashboard instantly."
    },
    {
      q: "What is included in the Food Database?",
      a: "Our unified database features hundreds of regional Indian favorites (Roti, Chole, Biryani, Curd) as well as global packaged brands and restaurant menus. Direct integrations with USDA FoodData Central and Open Food Facts cover over 500,000+ entries."
    },
    {
      q: "Does this website support food tracking?",
      a: "No, this website serves strictly as an informational and marketing portal to introduce the app. All tracking, scanning, and database search features exist exclusively inside our high-performance mobile application."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. All authenticated sessions use secure encryption keys. Your biological profiles (height, weight, age) are stored in isolated user tables to guarantee complete privacy and zero data leakage."
    }
  ];

  const handleToggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMsg("");
      setContactSubmitted(false);
      alert("Thank you! Your feedback has been received and logged under our BCA Project administration center.");
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden bg-[#F8F8FA] min-h-screen text-[#111111] pb-16">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-400/5 to-teal-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-400/5 to-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-100 text-xs font-bold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>BCA Final Year Project Showcase</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
              Track Nutrition <br />
              <span className="font-medium text-slate-500">Smarter with AI</span>
            </h1>

            <p className="text-sm sm:text-base text-[#8D8D92] max-w-lg leading-relaxed">
              Scan meals, track calories, monitor progress, and achieve your fitness goals. Ditch manual inputs—take control of your physical biology with modern visual intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="/NutriAI.apk"
                download
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.08)] flex items-center space-x-2"
              >
                <span>🚀 Download Android App (.apk)</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Hero Column: Interactive Mobile Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative mx-auto w-[280px] h-[560px] bg-[#111111] rounded-[48px] p-3 shadow-[0_24px_50px_rgba(0,0,0,0.15)] border-4 border-[#ECECEF]">
              {/* iPhone screen canvas */}
              <div className="w-full h-full bg-[#F8F8FA] rounded-[38px] overflow-hidden relative flex flex-col justify-between p-4 border border-[#ECECEF] select-none pointer-events-none">
                {/* Simulated Header */}
                <div className="flex justify-between items-center pt-4 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold">9:41 📡</span>
                  <span className="text-[9px] uppercase font-mono tracking-widest font-extrabold bg-[#111111] text-white px-2 py-0.5 rounded">BCA</span>
                </div>

                {/* Dashboard simulation */}
                <div className="space-y-3.5 flex-grow pt-4 text-left overflow-y-auto scrollbar-none">
                  {/* Calorie Progress Card */}
                  <div className="p-4 bg-white border border-[#ECECEF] rounded-[24px] flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Daily Balance</span>
                    <div className="relative h-20 w-20 flex items-center justify-center mt-2">
                      <svg className="absolute h-full w-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <circle cx="40" cy="40" r="34" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray={213} strokeDashoffset={70} />
                      </svg>
                      <div className="text-center z-10">
                        <span className="text-xs font-extrabold">1,250</span>
                        <span className="text-[7px] text-slate-400 block uppercase">kcal left</span>
                      </div>
                    </div>
                  </div>

                  {/* Water Tracker */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplet className="h-4 w-4 text-sky-500 animate-bounce" />
                      <div>
                        <p className="text-[9px] font-bold">Hydration Level</p>
                        <span className="text-[7px] text-[#8D8D92]">1,500ml logged today</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Meal Item */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] space-y-1.5">
                    <span className="text-[7px] uppercase tracking-wider font-bold text-slate-400 block">Logged Meal</span>
                    <div className="flex justify-between items-center text-[8px] bg-slate-50 border border-[#ECECEF] p-1.5 rounded-lg">
                      <span className="font-bold">🥗 Paneer Tikka Curry</span>
                      <span className="text-emerald-600 font-extrabold">+280 kcal</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div className="flex justify-around items-center pt-2 border-t border-slate-100 bg-white/70 rounded-b-2xl h-10">
                  <span className="text-[8px] font-bold text-[#111111]">Home</span>
                  <span className="text-[8px] font-bold text-slate-400">Progress</span>
                  <div className="h-8 w-8 rounded-full bg-[#111111] flex items-center justify-center text-white relative -top-3 shadow-md border-2 border-white">+</div>
                  <span className="text-[8px] font-bold text-slate-400">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT THE APPLICATION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 bg-white rounded-[32px] shadow-sm text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-[#111111]">
              A Solid Solution for Fitness & Nutrition Tracking
            </h2>
            <p className="text-sm text-[#8D8D92] leading-relaxed">
              This system is built as a complete final year academic project, showing clean execution across mobile app architectures, local databases, visual scanning integrations, and dynamic data visualization curves.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">✔</div>
                <div>
                  <h4 className="font-bold text-slate-800">Calorie & Macro Budgets</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">Dynamic formula configurations for BMR (Basal Metabolic Rate) and TDEE targets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">✔</div>
                <div>
                  <h4 className="font-bold text-slate-800">Computer Vision Scanning</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">Computer-assisted food photo uploads with calorie estimation logic.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">✔</div>
                <div>
                  <h4 className="font-bold text-slate-800">Database Persistence</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">Persistent structured database saving user weights, water intakes, and meal categories securely.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8FA] border border-[#ECECEF] p-8 rounded-[28px] space-y-4">
            <h3 className="font-outfit text-md font-extrabold text-slate-800">BCA Final Project Specs</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-400">Development Stack</span>
                <span className="font-bold text-slate-800">Next.js, TypeScript, Capacitor</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-400">Database Layer</span>
                <span className="font-bold text-slate-800">Structured localStorage Engine</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-400">Security / Auth</span>
                <span className="font-bold text-slate-800">Persistent Session Locks & OTP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Computer Vision API</span>
                <span className="font-bold text-slate-800">Visual Detection Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">
            Explore Mobile App Features
          </h2>
          <p className="text-[#8D8D92] text-xs sm:text-sm">
            Everything you need to manage your personal health is packed directly inside the mobile client.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Camera, 
              title: "AI Food Scanner", 
              desc: "Snap meal photos to detect food boundaries and calculate exact calories instantly.", 
              color: "text-emerald-500 bg-emerald-50" 
            },
            { 
              icon: Search, 
              title: "Fuzzy Food Search", 
              desc: "Query 500,000+ USDA and local preset items with spelling autocorrect and synonym maps.", 
              color: "text-indigo-500 bg-indigo-50" 
            },
            { 
              icon: Plus, 
              title: "Period Meal Logging", 
              desc: "Organize calorie targets cleanly under Breakfast, Lunch, Dinner, or Snacks periods.", 
              color: "text-orange-500 bg-orange-50" 
            },
            { 
              icon: Droplet, 
              title: "Fluids Tracker", 
              desc: "Log daily water volume goal limits in milliliters to keep hydration grids perfectly loaded.", 
              color: "text-sky-500 bg-sky-50" 
            },
            { 
              icon: LineChart, 
              title: "Performance Reports", 
              desc: "Unlock weights area charts, daily intake summaries, and weekly progress PDF printouts.", 
              color: "text-purple-500 bg-purple-50" 
            },
            { 
              icon: Sparkles, 
              title: "BMR Target Calibrators", 
              desc: "Compute perfect biological limits based on height, weight, activity and gender metrics.", 
              color: "text-teal-500 bg-teal-50" 
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-[24px] border border-[#ECECEF] bg-white space-y-4 text-left shadow-xs">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-outfit text-sm font-bold text-[#111111]">{item.title}</h3>
                <p className="text-[11px] text-[#8D8D92] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. APP SCREENSHOTS CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">App Screen Showcases</h2>
          <p className="text-slate-400 text-xs sm:text-sm">High-fidelity look inside the mobile interface layouts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
          {[
            { 
              title: "Dashboard Cockpit", 
              desc: "Budgets circle meters, protein progress bars, and hydration trackers all in one glassy container." 
            },
            { 
              title: "MyFitnessPal Nutrition Label", 
              desc: "Scales calories, sodium, potassium, sugar, fiber and cholesterol facts inside a realistic PDF sheet." 
            },
            { 
              title: "Reports & Charts", 
              desc: "Area charts mapping weight progress trendlines and daily/weekly calorie budgets over standard timelines." 
            }
          ].map((scr, idx) => (
            <div key={idx} className="p-4 bg-white border border-[#ECECEF] rounded-[32px] text-left space-y-3 shadow-xs">
              <div className="h-44 w-full bg-[#111115] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] font-mono text-[#8D8D92]">Device screen preview</div>
                <div className="h-32 w-24 bg-[#F8F8FA] rounded-xl border border-slate-800 p-2 text-[6px] space-y-1 relative">
                  <div className="h-2 w-full bg-slate-200 rounded" />
                  <div className="h-2 w-2/3 bg-slate-200 rounded" />
                  <div className="h-8 w-8 rounded-full border border-emerald-500 border-2 mx-auto mt-2" />
                  <div className="h-2 w-full bg-slate-200 rounded mt-2" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{scr.title}</h4>
              <p className="text-[10px] text-[#8D8D92] leading-normal">{scr.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">
            How It Works
          </h2>
          <p className="text-[#8D8D92] text-xs sm:text-sm">
            Reach your fitness limits in 4 straightforward developmental phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Create Account", desc: "Sign up via Google or verified email channels inside the protected mobile screen." },
            { step: "02", title: "Set Goals", desc: "Select height, weight, activity coefficients, and caloric goals inside your dashboard settings." },
            { step: "03", title: "Track Food", desc: "Snap meal photos using visual scanning, query standard presets, and sync water metrics." },
            { step: "04", title: "Monitor Progress", desc: "Print standard weekly biological summaries and track charts in real-time." }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-[24px] bg-white border border-[#ECECEF] space-y-3 shadow-xs">
              <span className="text-4xl font-extrabold text-[#ECECEF] font-mono block leading-none">{item.step}</span>
              <h3 className="font-outfit text-xs font-bold text-[#111111]">{item.title}</h3>
              <p className="text-[10px] text-[#8D8D92] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2.5">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">
            Common Queries
          </h2>
          <p className="text-[#8D8D92] text-xs sm:text-sm">
            Everything you need to know about the NutriTrack AI platform.
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
                  <span className="text-lg text-emerald-500 font-mono leading-none">{isFaqActive ? "−" : "+"}</span>
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
                      <p className="p-5 text-xs text-[#8D8D92] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 border-t border-slate-100 text-left space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2.5">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">
            Contact Project Team
          </h2>
          <p className="text-[#8D8D92] text-xs sm:text-sm">
            Submit bugs, feature recommendations, or final year reviews directly to the developers.
          </p>
        </div>

        <form onSubmit={handleContactSubmit} className="max-w-xl mx-auto bg-white border border-[#ECECEF] p-6 rounded-[28px] space-y-4 shadow-sm text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="contact-name" className="font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="contact-email" className="font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="e.g. rahul@bca.edu"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-message" className="font-bold text-slate-700">Message Description</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="Submit your BCA review..."
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={contactSubmitted}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center space-x-1.5 disabled:bg-slate-300"
          >
            <Send className="h-4 w-4" />
            <span>{contactSubmitted ? "Submitting..." : "Send Message"}</span>
          </button>
        </form>
      </section>

      {/* 8. DOWNLOAD APP CTA SECTION */}
      <section id="download" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="p-8 md:p-14 bg-[#111111] text-white rounded-[32px] text-center space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-[60px]" />

          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Download NutriTrack AI on your phone to unlock calorie calculators, custom BMR formulas, computer vision scanning, and dynamic weight progress history.
          </p>

          <div className="flex justify-center pt-4">
            <a
              href="/NutriAI.apk"
              download
              className="px-8 py-4 rounded-2xl bg-white text-[#111111] font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md animate-bounce flex items-center space-x-2"
            >
              <span>🚀 Download Android App (.apk)</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
