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
  ArrowRight,
  TrendingDown,
  Settings,
  Scale
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

  // Live BMR Calculator state
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcWeight, setCalcWeight] = useState("72");
  const [calcHeight, setCalcHeight] = useState("175");
  const [calcAge, setCalcAge] = useState("24");
  const [calcActivity, setCalcActivity] = useState("1.375"); // Lightly active
  const [calculatedBmr, setCalculatedBmr] = useState<number | null>(null);
  const [calculatedTdee, setCalculatedTdee] = useState<number | null>(null);

  // Live Phone Simulator State
  const [simMeals, setSimMeals] = useState<Array<{ name: string; cal: number }>>([
    { name: "🍳 2 Egg Bhurji", cal: 180 },
    { name: "🍞 Whole Wheat Roti", cal: 120 }
  ]);
  const [simWater, setSimWater] = useState(1200); // ml
  const [simWeight, setSimWeight] = useState(72.5);

  const calculateBmrTdee = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(calcWeight);
    const h = parseFloat(calcHeight);
    const a = parseFloat(calcAge);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    // Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    if (calcGender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * parseFloat(calcActivity);
    setCalculatedBmr(Math.round(bmr));
    setCalculatedTdee(Math.round(tdee));
  };

  const handleSimAddFood = (name: string, cal: number) => {
    setSimMeals(prev => [...prev, { name, cal }]);
  };

  const handleSimClearMeals = () => {
    setSimMeals([]);
  };

  const simLoggedCalories = simMeals.reduce((acc, curr) => acc + curr.cal, 0);
  const simCalorieBudget = 2000;
  const simCalorieRemaining = Math.max(0, simCalorieBudget - simLoggedCalories);
  const simCaloriePercent = Math.min(100, (simLoggedCalories / simCalorieBudget) * 100);

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
      {/* Premium Floating Auroras */}
      <div className="absolute top-0 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-400/10 blur-[130px] -z-10 pointer-events-none aurora-blur" />
      <div className="absolute bottom-1/3 right-1/4 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-sky-400/10 blur-[150px] -z-10 pointer-events-none aurora-blur" />

      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-100/30 text-xs font-bold text-emerald-700 shadow-sm pulse-light">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>BCA Final Year Major Project Showcase</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.05]">
              Track Nutrition <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">Smarter with AI</span>
            </h1>

            <p className="text-sm sm:text-base text-[#8D8D92] max-w-xl leading-relaxed">
              Scan meals instantly, calculate personalized targets using Mifflin-St Jeor formulas, and leverage calorie rollover rules inside our beautiful ultra-premium mobile experience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="/NutriAI.apk"
                download
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.15)] flex items-center space-x-2 group"
              >
                <span>🚀 Download Android App (.apk)</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#bmr-calculator"
                className="px-8 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
              >
                Estimate BMR Target
              </a>
            </div>
          </div>

          {/* Right Hero Column: Premium Live Interactive Mobile Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative mx-auto w-[310px] h-[610px] bg-[#111115] rounded-[48px] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border-4 border-[#E4E4E8]">
              {/* iPhone top dynamic island */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 h-5 w-24 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-slate-800 rounded-full mr-2" />
                <div className="h-1 w-1 bg-slate-900 rounded-full" />
              </div>

              {/* iPhone screen canvas */}
              <div className="w-full h-full bg-[#F8F8FA] rounded-[36px] overflow-hidden relative flex flex-col justify-between p-4 border border-[#ECECEF] select-none text-left">
                
                {/* Simulated Device Status bar */}
                <div className="flex justify-between items-center pt-3 pb-2 px-1 text-[9px] font-bold text-slate-400">
                  <span>9:41 🔋</span>
                  <span className="uppercase font-mono tracking-widest bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-[8px]">PRO MAX</span>
                </div>

                {/* Dashboard simulation */}
                <div className="space-y-4 flex-grow pt-2 overflow-y-auto scrollbar-none">
                  
                  {/* Calorie Circular Gauge Card */}
                  <div className="p-4 bg-white border border-[#ECECEF] rounded-[24px] shadow-xs flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center space-x-1 text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="h-2 w-2" />
                      <span>Calorie Rollover Active</span>
                    </div>

                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">Daily Calories</span>
                    
                    <div className="relative h-24 w-24 flex items-center justify-center mt-3">
                      <svg className="absolute h-full w-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="url(#simGrad)" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={251} 
                          strokeDashoffset={251 - (251 * simCaloriePercent) / 100}
                          className="transition-all duration-500 ease-out"
                        />
                        <defs>
                          <linearGradient id="simGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      <div className="text-center z-10">
                        <span className="text-sm font-extrabold text-[#111111]">{simCalorieRemaining}</span>
                        <span className="text-[7px] text-[#8D8D92] block uppercase font-bold">kcal left</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[8px]">
                      <div className="text-center">
                        <span className="text-slate-400 block">Logged</span>
                        <span className="font-bold text-slate-800">{simLoggedCalories} kcal</span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-400 block">Target</span>
                        <span className="font-bold text-slate-800">{simCalorieBudget} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Water Wave Tracker inside phone */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] shadow-xs flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Droplet className="h-3.5 w-3.5 text-sky-500" />
                        <span className="text-[9px] font-bold text-slate-700">Water Logged</span>
                      </div>
                      <span className="text-[9px] font-extrabold text-sky-600">{simWater} ml</span>
                    </div>

                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (simWater / 3000) * 100)}%` }}
                      />
                    </div>

                    {/* Interactive slider inside the mockup! */}
                    <div className="flex items-center justify-between text-[7px] text-slate-400">
                      <span>Add Fluids:</span>
                      <div className="flex space-x-1.5">
                        <button 
                          onClick={() => setSimWater(prev => Math.min(3000, prev + 250))}
                          className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 font-bold active:scale-95 transition-all"
                        >
                          +250ml
                        </button>
                        <button 
                          onClick={() => setSimWater(1200)}
                          className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 font-bold active:scale-95 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Food Logger Simulator inside phone */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[20px] shadow-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400">Simulate Meal Logs</span>
                      {simMeals.length > 0 && (
                        <button 
                          onClick={handleSimClearMeals}
                          className="text-[8px] text-rose-500 font-bold hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Meal list */}
                    <div className="space-y-1.5 max-h-20 overflow-y-auto scrollbar-none">
                      {simMeals.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[8px] bg-slate-50 border border-slate-100 p-1.5 rounded-lg">
                          <span className="font-semibold text-slate-700">{m.name}</span>
                          <span className="text-emerald-600 font-extrabold">+{m.cal} kcal</span>
                        </div>
                      ))}
                      {simMeals.length === 0 && (
                        <p className="text-[7px] text-slate-400 italic text-center py-2">No meals logged yet. Click below to add!</p>
                      )}
                    </div>

                    {/* Addable food chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: "🥗 Roti Sabji", cal: 240 },
                        { label: "🍚 Paneer Rice", cal: 380 },
                        { label: "🥛 Whey Shake", cal: 140 }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSimAddFood(item.label, item.cal)}
                          className="text-[8px] bg-slate-900 text-white font-bold px-2 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-1"
                        >
                          <span>{item.label}</span>
                          <span className="opacity-70">+{item.cal}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Bottom Nav */}
                <div className="flex justify-around items-center pt-2.5 border-t border-slate-100 bg-white rounded-b-2xl h-12 shadow-xs">
                  <span className="text-[8px] font-extrabold text-[#111111] flex flex-col items-center">
                    <Flame className="h-3 w-3 text-emerald-500" />
                    <span>Home</span>
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 flex flex-col items-center">
                    <LineChart className="h-3 w-3" />
                    <span>Progress</span>
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 flex flex-col items-center">
                    <User className="h-3 w-3" />
                    <span>Profile</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME BMR & BUDGET ESTIMATOR WIDGET */}
      <section id="bmr-calculator" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="glass-premium border border-white/60 p-8 rounded-[36px] shadow-sm space-y-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
              <Scale className="h-3 w-3" />
              <span>Mifflin-St Jeor Clinical Calculator</span>
            </div>
            <h2 className="font-outfit text-3xl font-extrabold text-slate-900">
              Personalized Targets Assessment
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Compute your exact Basal Metabolic Rate (BMR) and daily calorie budgets based on activity splits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <form onSubmit={calculateBmrTdee} className="md:col-span-7 space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Gender Selection</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcGender("male")}
                      className={`py-2.5 rounded-xl border font-bold transition-all ${
                        calcGender === "male" 
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcGender("female")}
                      className={`py-2.5 rounded-xl border font-bold transition-all ${
                        calcGender === "female" 
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="calc-age">Age (Years)</label>
                  <input
                    id="calc-age"
                    type="number"
                    required
                    value={calcAge}
                    onChange={(e) => setCalcAge(e.target.value)}
                    className="w-full bg-white/70 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-slate-400"
                    placeholder="e.g. 24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="calc-weight">Weight (kg)</label>
                  <input
                    id="calc-weight"
                    type="number"
                    required
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full bg-white/70 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-slate-400"
                    placeholder="e.g. 72"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="calc-height">Height (cm)</label>
                  <input
                    id="calc-height"
                    type="number"
                    required
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full bg-white/70 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-slate-400"
                    placeholder="e.g. 175"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="calc-activity">Daily Activity Coefficient</label>
                <select
                  id="calc-activity"
                  value={calcActivity}
                  onChange={(e) => setCalcActivity(e.target.value)}
                  className="w-full bg-white/70 border border-slate-200 rounded-xl py-2.5 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                >
                  <option value="1.2">Sedentary (No formal workout)</option>
                  <option value="1.375">Lightly Active (1-2 days/week)</option>
                  <option value="1.55">Moderately Active (3-5 days/week)</option>
                  <option value="1.725">Very Active (6-7 days intense work)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Calculate Biological Splits</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            <div className="md:col-span-5 bg-white border border-slate-200/60 p-6 rounded-2xl space-y-4 h-full flex flex-col justify-between shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Assessment Target Results</span>
              
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-bold block">Basal Metabolic Rate</span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {calculatedBmr ? `${calculatedBmr} kcal` : "---"}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[10px]">BMR</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-bold block">Total Daily Energy Expenditure</span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {calculatedTdee ? `${calculatedTdee} kcal` : "---"}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px]">TDEE</div>
                </div>
              </div>

              <p className="text-[10px] text-[#8D8D92] leading-normal italic">
                * Mifflin-St Jeor represents the clinical medicine standard for high-accuracy energy expenditure estimates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE APPLICATION */}
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
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800">Calorie & Macro Budgets</h4>
                  <p className="text-[#8D8D92] text-[11px] mt-0.5">Dynamic formula configurations for BMR (Basal Metabolic Rate) and TDEE targets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800">Computer Vision Scanning</h4>
                  <p className="text-[#8D8D92] text-[11px] mt-0.5">Computer-assisted food photo uploads with calorie estimation logic.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <div className="h-5 w-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800">Database Persistence</h4>
                  <p className="text-[#8D8D92] text-[11px] mt-0.5">Persistent structured database saving user weights, water intakes, and meal categories securely.</p>
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

      {/* 4. FEATURES OVERVIEW */}
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
              desc: "Query 500,000+ USDA and local preset Indian items with autocorrect and synonym maps.", 
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
              <div key={idx} className="p-6 rounded-[24px] border border-[#ECECEF] bg-white space-y-4 text-left shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
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

      {/* 5. APP SCREENSHOTS CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="font-outfit text-3xl font-bold text-[#111111]">App Screen Showcases</h2>
          <p className="text-[#8D8D92] text-xs sm:text-sm">High-fidelity look inside the mobile interface layouts</p>
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
            <div key={idx} className="p-4 bg-white border border-[#ECECEF] rounded-[32px] text-left space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="h-44 w-full bg-[#111115] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">Device screen preview</div>
                <div className="h-32 w-24 bg-[#F8F8FA] rounded-xl border border-slate-800 p-2 text-[6px] space-y-1 relative">
                  <div className="h-2 w-full bg-slate-200 rounded" />
                  <div className="h-2 w-2/3 bg-slate-200 rounded" />
                  <div className="h-8 w-8 rounded-full border-emerald-500 border-2 mx-auto mt-2" />
                  <div className="h-2 w-full bg-slate-200 rounded mt-2" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{scr.title}</h4>
              <p className="text-[10px] text-[#8D8D92] leading-normal">{scr.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
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

      {/* 7. FAQ SECTION */}
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

      {/* 8. CONTACT SECTION */}
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
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
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
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
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
              <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
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
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-extrabold hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center space-x-1.5 disabled:bg-slate-300"
          >
            <Send className="h-4 w-4" />
            <span>{contactSubmitted ? "Submitting..." : "Send Message"}</span>
          </button>
        </form>
      </section>

      {/* 9. DOWNLOAD APP CTA SECTION */}
      <section id="download" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="p-8 md:p-14 bg-[#111115] text-white rounded-[32px] text-center space-y-6 relative overflow-hidden shadow-lg border border-white/5">
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
              className="px-8 py-4 rounded-2xl bg-white text-[#111111] font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md pulse-light flex items-center space-x-2"
            >
              <span>🚀 Download Android App (.apk)</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
