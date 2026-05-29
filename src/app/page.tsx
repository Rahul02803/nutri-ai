"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Sparkles, Shield, Flame, Activity, Brain, Users, ArrowRight, Star, Layers, Download, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [sliderWeight, setSliderWeight] = useState(75);
  const [sliderHeight, setSliderHeight] = useState(175);

  // Fast on-screen BMI/Calorie estimator widget
  const heightMeters = sliderHeight / 100;
  const computedBmi = Math.round((sliderWeight / (heightMeters * heightMeters)) * 10) / 10;
  
  let bmiCategory = "Normal";
  let bmiColor = "text-emerald-600";
  if (computedBmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-amber-600";
  } else if (computedBmi >= 25 && computedBmi < 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "text-orange-600";
  } else if (computedBmi >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-rose-600";
  }

  // Active feature selector state for "What does NutriAI include?"
  const [activeFeature, setActiveFeature] = useState(0);

  const featuresList = [
    {
      title: "Track Your Food With Just a Picture & Text",
      description:
        "Describe your meal or log custom regional dishes, and our AI analyzes and breaks down your meal to determine calories, protein, carbs, and fat proportionally.",
      highlights: "CalAI scan speed simulated online"
    },
    {
      title: "Search Our Database of Popular Global Foods",
      description:
        "Quickly find and log foods from our extensive regional database. Loaded with Starbucks, McDonald's, Pizza Hut, Subway, and classic regional staples.",
      highlights: "Over 100+ pre-seeded items"
    },
    {
      title: "Complete Progress Tracking and AI suggestions",
      description:
        "Monitor your weight, target limits, and nutrition goals. Get personalized daily AI suggestions from Coach AI to stay on track and optimize your diet.",
      highlights: "Dynamic Recharts Integration"
    },
    {
      title: "Keep track of your water and daily weight logs",
      description:
        "Log your water intake and daily weight effortlessly. NutriAI helps you stay hydrated and active with beautiful interactive liquid waves.",
      highlights: "Zero-Slider numeric input boxes"
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a04_1px,transparent_1px),linear-gradient(to_bottom,#0f172a04_1px,transparent_1px)] bg-[size:40px_40px] -z-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold"
            >
              <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
              <span>Loved by 5M users with ⭐ 4.9 rating</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-outfit text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              Meet NutriAI. <br />
              <span className="font-medium text-slate-500">Track your calories <br />with modern AI speed</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed"
            >
              Meet NutriAI, the AI-powered app for easy calorie tracking. Snap a photo, log regional dishes, or describe your meal and get instant calorie and nutrient info.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <Link
                href="/auth"
                className="flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm"
              >
                <span>Track Calories Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <a
                href="/NutriAI.apk"
                download
                className="flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] transition-all duration-200"
              >
                <Download className="h-5 w-5 text-emerald-600" />
                <span>Download Android APK</span>
              </a>
            </motion.div>
          </div>

          {/* Hero Right: CalAI-Style Live Estimator Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <GlassCard glow glowColor="primary" className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    <span className="font-outfit text-sm font-semibold tracking-wider text-slate-500 uppercase">Interactive Scanner</span>
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded bg-slate-50 text-emerald-700 border border-emerald-100">
                    Live Diagnostics
                  </div>
                </div>

                {/* Weight Input Box */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="landing-weight" className="text-slate-600 font-medium">Your Weight</label>
                    <span className="text-xs font-mono text-slate-400">kg</span>
                  </div>
                  <input
                    id="landing-weight"
                    type="number"
                    min="40"
                    max="150"
                    value={sliderWeight || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setSliderWeight(Math.min(150, Math.max(0, val)));
                      } else {
                        setSliderWeight(0);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all placeholder-slate-400"
                    placeholder="e.g. 75"
                  />
                </div>

                {/* Height Input Box */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="landing-height" className="text-slate-600 font-medium">Your Height</label>
                    <span className="text-xs font-mono text-slate-400">cm</span>
                  </div>
                  <input
                    id="landing-height"
                    type="number"
                    min="120"
                    max="220"
                    value={sliderHeight || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setSliderHeight(Math.min(220, Math.max(0, val)));
                      } else {
                        setSliderHeight(0);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all placeholder-slate-400"
                    placeholder="e.g. 175"
                  />
                </div>

                {/* Calculation Results Panel */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Estimated BMI</p>
                    <p className="text-2xl font-bold font-outfit text-slate-800">{computedBmi}</p>
                    <span className={`text-[10px] font-bold ${bmiColor}`}>{bmiCategory}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Daily Calorie Goal</p>
                    <p className="text-2xl font-bold font-outfit text-emerald-600">{Math.round((sliderWeight || 75) * 24 * 1.3 - 300)}</p>
                    <span className="text-[10px] font-bold text-slate-400">Fat Loss Deficit</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Fitness Influencers Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900">
            Used by your favorite fitness influencers 👀
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Join millions of users logging dishes daily and hitting their target macros effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <GlassCard className="p-6 space-y-4 hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
                JJ
              </div>
              <div>
                <h4 className="font-outfit text-sm font-bold text-slate-800">Jeremiah Jones</h4>
                <span className="text-[10px] text-slate-400">Fitness Athlete</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;Make a healthier choice for your latenight snack and use the NutriAI app to track your calories.&rdquo;
            </p>
          </GlassCard>

          {/* Testimonial 2 */}
          <GlassCard className="p-6 space-y-4 hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center font-bold text-amber-600">
                AE
              </div>
              <div>
                <h4 className="font-outfit text-sm font-bold text-slate-800">Alex Eubank</h4>
                <span className="text-[10px] text-slate-400">Bodybuilder</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;NutriAI is literally the best calorie tracker. Fastest and most accurate I&apos;ve ever used.&rdquo;
            </p>
          </GlassCard>

          {/* Testimonial 3 */}
          <GlassCard className="p-6 space-y-4 hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                HF
              </div>
              <div>
                <h4 className="font-outfit text-sm font-bold text-slate-800">Hussein Farhat</h4>
                <span className="text-[10px] text-slate-400">Transformation Coach</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;If you&apos;re tracking your calories and macros correctly with NutriAI, you can get away with eating almost anything and still get in shape.&rdquo;
            </p>
          </GlassCard>
        </div>
      </section>

      {/* What does NutriAI Include? Interactive Features Panel */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900">
            What does NutriAI include?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Modern AI components engineered to make nutrition logging fast and effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Features Selector Columns (Left) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {featuresList.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  activeFeature === idx
                    ? "bg-slate-50 border-emerald-200 shadow-sm"
                    : "bg-white border-slate-100 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-outfit text-base sm:text-lg font-bold text-slate-800">{feature.title}</h3>
                  {activeFeature === idx && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase">Active</span>}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">{feature.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[9px] font-mono text-slate-400">📌 {feature.highlights}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feature Visualizers (Right) */}
          <div className="lg:col-span-5 flex justify-center">
            <GlassCard glow glowColor="emerald" className="p-6 md:p-8 w-full max-w-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Module Preview</span>
                <Brain className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
              </div>

              {activeFeature === 0 && (
                <div className="space-y-4 text-left">
                  <p className="text-xs text-slate-500">Mock scanner successfully identified:</p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Paneer Tikka Masala</p>
                      <span className="text-[10px] text-slate-400">1 bowl (150g)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">280 kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-500">
                    <div className="p-2 rounded bg-slate-100/70 border border-slate-200/50">P: 14g</div>
                    <div className="p-2 rounded bg-slate-100/70 border border-slate-200/50">C: 12g</div>
                    <div className="p-2 rounded bg-slate-100/70 border border-slate-200/50">F: 20g</div>
                  </div>
                </div>
              )}

              {activeFeature === 1 && (
                <div className="space-y-4 text-left">
                  <p className="text-xs text-slate-500">Search globally or locally instantly:</p>
                  <div className="space-y-2">
                    {["McDonalds Cheeseburger", "Starbucks Iced Caramel Macchiato", "Pizza Hut Pepperoni Pizza"].map((f, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex justify-between">
                        <span>{f}</span>
                        <span className="text-emerald-600 font-bold">+ Log</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                <div className="space-y-3 text-left">
                  <p className="text-xs text-slate-500">Coach AI analysis preview:</p>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-relaxed italic text-slate-600">
                    &ldquo;Your protein is running steady today. Let&apos;s hit your customized targets. Hydrate with another 500ml water!&rdquo;
                  </div>
                </div>
              )}

              {activeFeature === 3 && (
                <div className="space-y-4 text-center py-4">
                  <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-indigo-50 border-t border-indigo-100" />
                    <span className="text-xs font-bold text-indigo-600 z-10 font-mono">1750 ml logged</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Dynamic hydration wave animation preview</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Why Choose NutriAI section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900">
            Why choose NutriAI?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            NutriAI is the most advanced online calorie and physique optimizer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <GlassCard className="p-8 space-y-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-800">Free up your time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              NutriAI automatically calculates your calories, protein, carbs, and fat. You can also customize exact serving weights or manually calibrate target macro limits. So no need to calculate calories manually.
            </p>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard className="p-8 space-y-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-800">Integrate with your fitness</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              NutriAI tracks your calories, protein, carbs, and fat alongside daily water logs and weight charts. Ideal for comprehensive body transformations and major project evaluations.
            </p>
          </GlassCard>

          {/* Card 3 */}
          <GlassCard className="p-8 space-y-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-800">Lose weight effortlessly</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter daily logs, follow the clean visual macro bars, and check real-time coach feedback. Stay motivated and track weight fluctuations dynamically using the built-in Recharts graph.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Ratings Trust Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-100 text-center">
        <GlassCard className="p-8 md:p-12 relative overflow-hidden bg-slate-50/50">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[80px] -z-10" />
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center space-x-1 text-2xl text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-slate-900">
              Over 100k 5-star ratings
            </h2>

            <div className="flex justify-center gap-6 text-sm text-slate-500 font-mono">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> App Store 4.8/5</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Google Play 4.7/5</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth"
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all duration-300"
              >
                Claim My Free Trial Now
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
