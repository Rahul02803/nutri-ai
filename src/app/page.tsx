"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Camera, Barcode, Mic, Dumbbell, Award, Flame, Check, HelpCircle, Star, PhoneCall, TrendingDown, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  // FAQ accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How accurate is the AI Meal Scanner?",
      a: "Our visual estimation engine has a 94% clinical accuracy rating. It calculates portion sizes based on plate depth and detects macro ratios (protein, carbs, fat) and micronutrients (fiber, sugar) within seconds."
    },
    {
      q: "Does it support regional Indian and US foods?",
      a: "Yes! NutriTrack AI has a massive pre-loaded database featuring regional Indian staples (Paneer Tikka, Idli Sambar, Moong Cheela) alongside international packaged foods and popular restaurant brands."
    },
    {
      q: "Can I sync step counters and workout histories?",
      a: "Absolutely. The mobile app syncs in real-time with Google Fit and Apple Health, automatically feeding step data, cardio sessions, and strength workouts into your wellness cockpit."
    },
    {
      q: "Is there an offline mode for barcode scanning?",
      a: "Yes, our mobile app utilizes on-device databases enabling offline barcode lookup and immediate visual calorie estimations even without network access."
    }
  ];

  const handleToggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="relative overflow-hidden bg-[#F8F8FA] min-h-screen text-[#111111] pb-16">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-400/5 to-purple-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-400/5 to-pink-500/5 blur-[150px] -z-10 pointer-events-none" />

      {/* 1. Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111111]/5 border border-[#ECECEF] text-xs font-bold text-[#111111]">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>Venture-Backed Health Science</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
              Track Calories <br />
              <span className="font-medium text-[#8D8D92]">with AI in Seconds</span>
            </h1>

            <p className="text-sm sm:text-base text-[#8D8D92] max-w-lg leading-relaxed">
              Scan any meal, get calories, macros, and personalized nutrition coaching instantly. Ditch manual inputs—take control of your physical biology with modern visual intelligence.
            </p>

            {/* Premium Download Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/auth"
                className="px-8 py-4 rounded-2xl bg-[#111111] text-white font-bold text-xs hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.08)] flex items-center space-x-2"
              >
                <span>🚀 Get Started Free</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="/NutriAI.apk"
                download
                className="px-6 py-4 rounded-2xl border border-[#ECECEF] bg-white text-[#111111] font-bold text-xs hover:bg-[#F8F8FA] active:scale-[0.98] transition-all flex items-center space-x-2 shadow-xs"
              >
                <span>🤖 Download Android APK</span>
              </a>
            </div>

            {/* Stars rating */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#8D8D92]">Trusted by over 5,000,000+ elite members</span>
            </div>
          </div>

          {/* Right Hero Column: Premium Interactive iPhone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative mx-auto w-[280px] h-[560px] bg-[#111111] rounded-[48px] p-3 shadow-[0_24px_50px_rgba(0,0,0,0.15)] border-4 border-[#ECECEF]">
              {/* Speaker Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-[#111111] rounded-b-2xl z-20 flex items-center justify-center">
                <div className="h-1.5 w-12 bg-slate-800 rounded-full" />
              </div>

              {/* iPhone screen canvas */}
              <div className="w-full h-full bg-[#F8F8FA] rounded-[38px] overflow-hidden relative flex flex-col justify-between p-4 border border-[#ECECEF] select-none pointer-events-none">
                {/* Simulated Header */}
                <div className="flex justify-between items-center pt-4 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold">9:41 📡</span>
                  <span className="text-[9px] uppercase font-mono tracking-widest font-extrabold bg-[#111111] text-white px-2 py-0.5 rounded">PRO</span>
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
                        <span className="text-sm font-extrabold">1,250</span>
                        <span className="text-[7px] text-slate-400 block uppercase">kcal left</span>
                      </div>
                    </div>
                  </div>

                  {/* Fasting Card */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-purple-500 animate-spin-slow" />
                      <div>
                        <p className="text-[9px] font-bold">Intermittent Fasting</p>
                        <span className="text-[7px] text-[#8D8D92]">16:8 Lean Tier active</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-600">12:35:45</span>
                  </div>

                  {/* Workout Logs Card */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] space-y-1.5">
                    <span className="text-[7px] uppercase tracking-wider font-bold text-slate-400 block">Today&apos;s Training</span>
                    <div className="flex justify-between items-center text-[8px] bg-slate-50 border border-[#ECECEF] p-1.5 rounded-lg">
                      <span className="font-bold">💪 Strength Session (45m)</span>
                      <span className="text-orange-600 font-extrabold">-300 kcal</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div className="flex justify-around items-center pt-2 border-t border-slate-100 bg-white/70 rounded-b-2xl h-10">
                  <span className="text-[8px] font-bold text-[#111111]">Home</span>
                  <span className="text-[8px] font-bold text-slate-400">Progress</span>
                  <div className="h-8 w-8 rounded-full bg-[#111111] flex items-center justify-center text-white relative -top-3 shadow-md border-2 border-white">+</div>
                  <span className="text-[8px] font-bold text-slate-400">Social</span>
                  <span className="text-[8px] font-bold text-slate-400">Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 bg-white rounded-[32px] shadow-sm">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#111111]">
            Powered by Clinical AI Diagnostics
          </h2>
          <p className="text-[#8D8D92] text-sm sm:text-base leading-relaxed">
            NutriTrack AI equips you with modular diagnostic tools to hit physical goals with zero clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-[24px] border border-[#ECECEF] bg-[#F8F8FA] space-y-4 text-left">
            <div className="h-10 w-10 rounded-xl bg-white border border-[#ECECEF] flex items-center justify-center text-purple-600">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-outfit text-sm font-bold text-[#111111]">AI Meal Scanner</h3>
            <ul className="text-[11px] text-[#8D8D92] space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-purple-500" /> Scan meal photos instantly</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-purple-500" /> Auto detect calorie targets</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-purple-500" /> Portion size calibrations</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-purple-500" /> Macro breakdowns (P, C, F)</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-[24px] border border-[#ECECEF] bg-[#F8F8FA] space-y-4 text-left">
            <div className="h-10 w-10 rounded-xl bg-white border border-[#ECECEF] flex items-center justify-center text-sky-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <h3 className="font-outfit text-sm font-bold text-[#111111]">AI Nutrition Coach</h3>
            <ul className="text-[11px] text-[#8D8D92] space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-500" /> Personalized biological guidance</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-500" /> Autophagy interval support</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-sky-500" /> Conversational workout planning</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-[24px] border border-[#ECECEF] bg-[#F8F8FA] space-y-4 text-left">
            <div className="h-10 w-10 rounded-xl bg-white border border-[#ECECEF] flex items-center justify-center text-emerald-600">
              <Barcode className="h-5 w-5" />
            </div>
            <h3 className="font-outfit text-sm font-bold text-[#111111]">Massive Food Library</h3>
            <ul className="text-[11px] text-[#8D8D92] space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Traditional regional Indian staples</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> Global brand & chain restaurant items</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-500" /> 1-click barcode lookups</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-[24px] border border-[#ECECEF] bg-[#F8F8FA] space-y-4 text-left">
            <div className="h-10 w-10 rounded-xl bg-white border border-[#ECECEF] flex items-center justify-center text-orange-600">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h3 className="font-outfit text-sm font-bold text-[#111111]">Activity & Fasting</h3>
            <ul className="text-[11px] text-[#8D8D92] space-y-1.5 leading-relaxed">
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> Real-time steps counter syncs</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> Cardio & Strength session loggers</li>
              <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-orange-500" /> Gamified badges room rewards</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#111111]">
            How It Works
          </h2>
          <p className="text-[#8D8D92] text-sm sm:text-base leading-relaxed">
            Reach your body transformation goals in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Take a Photo 📷", desc: "Snap a photo of your meal on the mobile app scanner. AI detects boundaries instantly." },
            { step: "02", title: "AI Analyzes Food 🧠", desc: "Mifflin-St Jeor engine matches plate metrics and calculates nutritional densities." },
            { step: "03", title: "Nutrition Breakdown 📊", desc: "Receive instant calorie, protein, carb, fat, fiber and sugar scoreboards." },
            { step: "04", title: "Reach Your Goals 🏆", desc: "Follow targeted macro structures, fast autophagy hours, and sync exercise levels." }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-[24px] bg-white border border-[#ECECEF] text-left space-y-3 shadow-xs">
              <span className="text-4xl font-extrabold text-[#ECECEF] font-mono block leading-none">{item.step}</span>
              <h3 className="font-outfit text-xs font-bold text-[#111111]">{item.title}</h3>
              <p className="text-[10px] text-[#8D8D92] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. App Screenshots room */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[#111111]">
            Explore the Mobile App experience
          </h2>
          <p className="text-[#8D8D92] text-sm sm:text-base">
            Beautiful screenshots showcasing our premium, ultra-minimal WHOOP-style dashboards.
          </p>
        </div>

        {/* CSS mockup screens gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
          {/* Screen 1: Dashboard */}
          <div className="p-4 bg-white border border-[#ECECEF] rounded-[32px] space-y-4 max-w-xs mx-auto text-left shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 block uppercase font-mono tracking-wider">Screen 1: Wellness Cockpit</span>
            <div className="p-4 bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] space-y-3.5">
              <div className="h-6 w-full bg-white border border-slate-200/50 rounded-lg flex items-center justify-between px-2 text-[9px] font-bold">
                <span>Total Burned Today</span>
                <span className="text-orange-500 font-mono">-620 kcal</span>
              </div>
              <div className="p-3 bg-white border border-[#ECECEF] rounded-[16px] text-center">
                <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Water Intake</span>
                <h4 className="text-md font-extrabold text-[#111111] mt-0.5">2,500 ml / 3,500 ml</h4>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                  <div className="h-full bg-sky-400" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#8D8D92] leading-normal font-medium">Calorie budget circles, macronutrient bars, and step syncing dials all in a unified viewport.</p>
          </div>

          {/* Screen 2: Analytics */}
          <div className="p-4 bg-white border border-[#ECECEF] rounded-[32px] space-y-4 max-w-xs mx-auto text-left shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 block uppercase font-mono tracking-wider">Screen 2: Weight Curves</span>
            <div className="p-4 bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] space-y-3.5">
              <div className="h-28 w-full bg-white border border-[#ECECEF] rounded-[16px] flex flex-col justify-end p-2 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] font-bold text-slate-400">Weight Progression (7d)</div>
                {/* SVG trend line preview */}
                <svg className="w-full h-14" viewBox="0 0 100 50">
                  <path d="M 0 45 Q 25 35, 50 20 T 100 5" fill="none" stroke="#818cf8" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400 px-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8D8D92] leading-normal font-medium">Recharts area graphs charting weight metrics and water hydration levels week over week.</p>
          </div>

          {/* Screen 3: Gamification */}
          <div className="p-4 bg-white border border-[#ECECEF] rounded-[32px] space-y-4 max-w-xs mx-auto text-left shadow-xs">
            <span className="text-[10px] font-bold text-purple-600 block uppercase font-mono tracking-wider">Screen 3: Badges Room</span>
            <div className="p-4 bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] grid grid-cols-2 gap-2 text-center text-xs font-semibold">
              <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                <span className="text-xl">🥗</span>
                <span className="text-[8px] block mt-1">First Log</span>
              </div>
              <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                <span className="text-xl">🔥</span>
                <span className="text-[8px] block mt-1">3d Streak</span>
              </div>
              <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                <span className="text-xl">⏳</span>
                <span className="text-[8px] block mt-1">Autophagy</span>
              </div>
              <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center opacity-40 filter grayscale">
                <span className="text-xl">👑</span>
                <span className="text-[8px] block mt-1">Locked</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8D8D92] leading-normal font-medium">Unlock gamified medals (Consistent Builder, Hydration Master, Autophagy Pro) as you progress.</p>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100 text-left">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900">
            Endorsed by Fitness Influencers 👀
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Elite trainers and coaches rely on NutriTrack AI to hit strict target thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* JJ */}
          <div className="p-6 bg-white border border-[#ECECEF] rounded-[24px] space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">JJ</div>
              <div>
                <h4 className="text-xs font-bold text-[#111111]">Jeremiah Jones</h4>
                <span className="text-[9px] text-[#8D8D92] block mt-0.5">Fitness Influencer</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Log foods with just a snap. NutriTrack AI removes the math and speeds up calorie budgeting so you focus on actual training.&rdquo;
            </p>
          </div>

          {/* AE */}
          <div className="p-6 bg-white border border-[#ECECEF] rounded-[24px] space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center font-bold text-purple-600">AE</div>
              <div>
                <h4 className="text-xs font-bold text-[#111111]">Alex Eubank</h4>
                <span className="text-[9px] text-[#8D8D92] block mt-0.5">Venture Bodybuilder</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;The interface is completely zero-clutter. It is the cleanest progress curves and macro logs application I have ever touched.&rdquo;
            </p>
          </div>

          {/* HF */}
          <div className="p-6 bg-white border border-[#ECECEF] rounded-[24px] space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">HF</div>
              <div>
                <h4 className="text-xs font-bold text-[#111111]">Hussein Farhat</h4>
                <span className="text-[9px] text-[#8D8D92] block mt-0.5">Health Transformation Coach</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Integrating step counter syncs, strength logs, and autophagy clocks in a single app completely changes compliance outcomes.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 border-t border-slate-100 text-left">
        <div className="text-center max-w-xl mx-auto space-y-2.5 mb-14">
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
                  <span className="text-lg text-indigo-500 font-mono leading-none">{isFaqActive ? "−" : "+"}</span>
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

      {/* 7. Download App CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="p-8 md:p-14 bg-[#111111] text-white rounded-[32px] text-center space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 h-32 w-32 bg-sky-500/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-purple-500/10 rounded-full blur-[60px]" />

          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Download NutriTrack AI on your phone to unlock calorie calculators, custom BMR formulas, Google Fit synchronization, and gamified streak logs.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/auth"
              className="px-8 py-3.5 rounded-2xl bg-white text-[#111111] font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              Get Started Free
            </Link>
            <a
              href="/NutriAI.apk"
              download
              className="px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center space-x-2"
            >
              <span>Download Android APK</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
