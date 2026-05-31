"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Camera, 
  Search, 
  Plus, 
  Droplet, 
  LineChart, 
  ChevronRight, 
  Check, 
  Star,
  MessageSquare,
  ShieldCheck,
  Brain,
  Sliders,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [interactiveGrams, setInteractiveGrams] = useState(100);

  // Food base specs (per 1 gram)
  const baseSpecs = {
    calories: 2.1,
    protein: 0.12,
    carbs: 0.05,
    fat: 0.15,
    fiber: 0.02
  };

  // Recalculated live values based on interactive landing page slider!
  const liveCal = Math.round(baseSpecs.calories * interactiveGrams);
  const livePro = Math.round(baseSpecs.protein * interactiveGrams * 10) / 10;
  const liveCarb = Math.round(baseSpecs.carbs * interactiveGrams * 10) / 10;
  const liveFat = Math.round(baseSpecs.fat * interactiveGrams * 10) / 10;
  const liveFib = Math.round(baseSpecs.fiber * interactiveGrams * 10) / 10;

  const faqs = [
    {
      q: "How does the ZenLog AI Vision Scanner work?",
      a: "ZenLog integrates official Gemini 2.5 Flash Vision models. Take a snap of your dish or upload an image. The AI boundaries the portions, estimates sizes, and pulls full caloric distributions, fiber, and micronutrients immediately with no input delay."
    },
    {
      q: "What is the Serving Size Recalculation Engine?",
      a: "Our core serving conversion matrix translates portions instantly across 15+ standard units (g, oz, kg, ml) and custom regional presets (paneer cube = 25g, 1 egg = 50g, 1 roti = 40g). Adjusting portions recalculates all macros and micros instantly without server API queries."
    },
    {
      q: "How does the Automatic Goal Calibration work?",
      a: "ZenLog tracks changes between subsequent check-ins. Under cutting timelines, if weight loss drops below 0.25kg, the Mifflin-St Jeor engine trims 100 calories from your daily limits; if loss exceeds 1kg, it raises limits to prevent muscle wasting, reallocating macros proportionally."
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
    <div className="relative overflow-hidden bg-[#F8F8FA] min-h-screen text-[#111111] pb-24">
      {/* Aurora Blurs */}
      <div className="absolute top-0 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-400/5 blur-[120px] -z-10 pointer-events-none aurora-move" />
      <div className="absolute bottom-1/4 right-1/4 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-sky-400/5 blur-[150px] -z-10 pointer-events-none aurora-move" />

      {/* Hero Container */}
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 text-xs font-black text-slate-800 tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#14B8A6] animate-pulse" />
              <span>Premium AI Powered Nutrition Coach</span>
            </div>

            <h1 className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight text-[#111827] leading-[1.02]">
              ZenLog <br />
              <span className="bg-gradient-to-r from-[#14B8A6] to-[#4F46E5] bg-clip-text text-transparent">Premium Cal AI Alternative</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed font-medium">
              Scan meals instantly with visual intelligence, log custom Indian foods, adjust portions in real-time, and experience automated weekly weight goal calibrations inside a stunning, luxury minimalist canvas.
            </p>

            {/* Glowing App Download Badges (Cal AI Style) */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">
                Download ZenLog Mobile App
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Authentic App Store Badge */}
                <a 
                  href="#" 
                  className="flex items-center bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/5"
                >
                  <svg className="h-6 w-6 fill-current text-white mr-3" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.28,.05-1.69-.73-3.15-.73s-1.92,.73-3.15,.73c-1.33,0-2.31-1.29-3.15-2.5C4.5,17.06,3.19,12,4.95,9C5.83,7.5,7.37,6.56,9,6.54c1.28-.02,2.49,.87,3.28,.87s2.21-1.07,3.75-.91c.64,.03,2.46,.26,3.62,1.96a5.55,5.55,0,0,0-2.69,4.72c0,3.8,3.29,5.16,3.33,5.18C20.26,17.29,19.55,18.28,18.71,19.5ZM15.95,4.17c.66-.81,1.11-1.93,.99-3.06-1,.04-2.17,.67-2.89,1.51-.62,.72-1.16,1.86-1.02,2.97C14.15,5.63,15.29,4.98,15.95,4.17Z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-slate-400">Download on the</p>
                    <p className="text-xs font-extrabold font-outfit">App Store</p>
                  </div>
                </a>

                {/* Authentic Google Play Badge */}
                <a 
                  href="#" 
                  className="flex items-center bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/5"
                >
                  <svg className="h-6 w-6 fill-current text-white mr-3" viewBox="0 0 24 24">
                    <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M17.5,12L12,17.5L6.5,12H10.5V7H13.5V12H17.5Z" className="hidden" />
                    <path d="M3.25,2.46C3.08,2.63,3,2.9,3,3.23V20.77C3,21.1,3.08,21.37,3.25,21.54L3.31,21.6L12.87,12.04V11.96L3.31,2.4L3.25,2.46M16.03,9.29L13.14,11.96V12.04L16.03,14.71L16.1,14.67L19.5,12.73C20.48,12.18,20.48,11.82,19.5,11.27L16.1,9.33L16.03,9.29M12.87,11.96L3.31,21.6C3.62,21.91,4.14,21.93,4.72,21.6L16.03,14.71L12.87,11.96M12.87,12.04L16.03,9.29L4.72,2.4C4.14,2.07,3.62,2.09,3.31,2.4L12.87,12.04Z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[7px] uppercase font-bold tracking-widest text-slate-400">Get it on</p>
                    <p className="text-xs font-extrabold font-outfit">Google Play</p>
                  </div>
                </a>

                {/* Direct Android APK download action */}
                <a
                  href="/ZenLog.apk"
                  download
                  className="px-6 py-3 rounded-2xl bg-[#14B8A6] text-white font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(20,184,166,0.25)] flex items-center space-x-2 border border-[#14B8A6]"
                >
                  <span>🚀 Download APK</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Premium Interactive Cal-AI Slider Mobile Simulator */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Coach Chat Bubble floating next to phone */}
            <div className="absolute -left-12 top-20 z-20 max-w-[150px] p-3.5 rounded-[22px] bg-[#111827] text-white text-[9px] font-bold shadow-xl border border-white/5 text-left hidden md:block">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Brain className="h-3.5 w-3.5 text-[#14B8A6]" />
                <span className="text-[7px] text-emerald-400 uppercase font-black tracking-widest">ZenLog Coach</span>
              </div>
              "Excellent choice! Paneer contains leucine targets supporting your cut profile perfectly."
            </div>

            <div className="relative mx-auto w-[295px] h-[590px] bg-[#111115] rounded-[48px] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.15)] border-4 border-[#E4E4E8]">
              {/* iPhone screen canvas */}
              <div className="w-full h-full bg-[#F8F8FA] rounded-[38px] overflow-hidden relative flex flex-col justify-between p-4 border border-[#ECECEF] select-none">
                
                {/* Simulated Header */}
                <div className="flex justify-between items-center pt-3 pb-2 border-b border-slate-100 text-[8px] font-bold text-[#8D8D92]">
                  <span>9:41 📶</span>
                  <span className="uppercase font-black tracking-widest bg-slate-900/5 text-slate-800 px-1.5 py-0.5 rounded text-[7px]">ZenLog</span>
                </div>

                {/* Dashboard simulation */}
                <div className="space-y-3.5 flex-grow pt-4 text-left overflow-y-auto scrollbar-none">
                  
                  {/* Calorie Card */}
                  <div className="p-3 bg-white border border-[#ECECEF] rounded-[24px] flex flex-col items-center">
                    <span className="text-[7px] uppercase tracking-widest font-black text-slate-400">Interactive Simulator</span>
                    
                    <div className="flex items-center justify-between w-full mt-2 border-b border-slate-50 pb-2">
                      <span className="text-[10px] font-black text-[#111827]">🍱 Paneer Tikka</span>
                      <span className="text-[10px] font-black text-[#14B8A6]">+{liveCal} kcal</span>
                    </div>

                    {/* Interactive Serving Slider inside Simulator! */}
                    <div className="w-full mt-3 space-y-1.5">
                      <div className="flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Quantity (grams)</span>
                        <span className="text-[#111827]">{interactiveGrams}g</span>
                      </div>
                      
                      {/* REAL-TIME WEBSITE SLIDER */}
                      <input 
                        type="range"
                        min="50"
                        max="200"
                        step="25"
                        value={interactiveGrams}
                        onChange={(e) => setInteractiveGrams(parseInt(e.target.value))}
                        className="w-full pointer-events-auto cursor-pointer"
                        style={{ accentColor: "#14B8A6" }}
                      />
                    </div>
                  </div>

                  {/* Recalculating Macro Grid inside Phone! */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Protein */}
                    <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                      <span className="text-[6px] text-slate-400 uppercase font-black">Protein</span>
                      <span className="text-[11px] font-black text-rose-500 mt-1">{livePro}g</span>
                    </div>
                    {/* Carbs */}
                    <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                      <span className="text-[6px] text-slate-400 uppercase font-black">Carbs</span>
                      <span className="text-[11px] font-black text-amber-500 mt-1">{liveCarb}g</span>
                    </div>
                    {/* Fat */}
                    <div className="p-2.5 bg-white border border-[#ECECEF] rounded-xl flex flex-col items-center">
                      <span className="text-[6px] text-slate-400 uppercase font-black">Fats</span>
                      <span className="text-[11px] font-black text-sky-500 mt-1">{liveFat}g</span>
                    </div>
                  </div>

                  {/* Micros Info Card */}
                  <div className="p-3.5 bg-white border border-[#ECECEF] rounded-[24px] space-y-2">
                    <span className="text-[7px] uppercase tracking-widest font-black text-slate-400 block">Estimated Micros</span>
                    <div className="flex justify-between items-center text-[8px] bg-slate-50 border border-[#ECECEF] p-2 rounded-xl">
                      <span className="font-bold text-slate-600">🥦 Dietary Fiber</span>
                      <span className="text-slate-800 font-black">{liveFib}g</span>
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

      {/* 2. SPECIFIC STATISTICS TAPE (AS SEEN ON STYLE) */}
      <section className="bg-slate-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-[#14B8A6]">0.85+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Vision Accuracy Confidence</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-[#14B8A6]">10k+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Verified Indian Dishes</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-[#14B8A6]">15+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Units Scaled Instantly</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-[#14B8A6]">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">GDPR Private & Isolated</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. APP FEATURES DEEP SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-left space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-outfit text-4xl font-extrabold tracking-tight text-[#111827]">
            ZenLog Core Features
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Engineered with luxury minimalism. Powered by official Gemini 2.5 Flash.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-[#ECECEF] rounded-[32px] p-8 space-y-4 hover:translate-y-[-2px] transition-all shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#14B8A6] flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">AI Camera Meal Scan</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Snap food photos to identify dishes, retrieve BMR ratios, and break down precise calories, protein, carbs, and fats instantly via Gemini 2.5 Flash Vision.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-[#ECECEF] rounded-[32px] p-8 space-y-4 hover:translate-y-[-2px] transition-all shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Dynamic Serving Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Convert food weight dynamically across 15+ standard metrics or custom options (Paneer cube = 25g, Roti = 40g). Recalculates all macros and micros on the client instantly with zero network delay.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-[#ECECEF] rounded-[32px] p-8 space-y-4 hover:translate-y-[-2px] transition-all shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#111827]">Weekly Auto-Calibration</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              ZenLog evaluates weight check-ins every 7 days. If your cutting pace falls off, target calories automatically adjust up or down by 100 kcal to protect lean muscle tissue.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PREMIUM ACCORDION FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 text-left space-y-12">
        <h2 className="font-outfit text-3xl font-extrabold text-center text-[#111827]">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white border border-[#ECECEF] rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => handleToggleFaq(idx)}
                className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-sm text-slate-800"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`h-4 w-4 text-slate-400 transform transition-transform duration-300 ${activeFaq === idx ? "rotate-90" : ""}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-xs text-slate-400 font-semibold leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 5. USER REVIEWS CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-100 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-outfit text-3xl font-extrabold text-[#111827]">What Members Say</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Join thousands transforming their physiques with ZenLog</p>
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
            <div key={idx} className="bg-white border border-[#ECECEF] rounded-[28px] p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-1">
                {[...Array(item.stars)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium italic">"{item.review}"</p>
              <div className="flex items-center space-x-2 pt-2">
                <div className="h-8 w-8 rounded-full bg-slate-900/5 flex items-center justify-center font-bold text-xs">
                  {item.name[0]}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 flex items-center">
                    {item.name}
                    <ShieldCheck className="h-3 w-3 text-emerald-500 ml-1" />
                  </h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
