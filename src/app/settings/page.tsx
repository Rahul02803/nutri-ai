"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { 
  Settings, 
  User, 
  Target, 
  Flame, 
  Scale, 
  RotateCcw, 
  ChevronLeft, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    onboardingData, 
    targets, 
    saveOnboarding, 
    manuallySetTargets, 
    resetAllData,
    isRolloverEnabled,
    toggleRollover,
    rolloverCalories
  } = useApp();
  const router = useRouter();

  // Settings Forms states
  const [goalMode, setGoalMode] = useState<string>("maintain");
  const [manualCal, setManualCal] = useState("");
  const [manualPro, setManualPro] = useState("");
  const [manualCarb, setManualCarb] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load targets into manual boxes on mount
  useEffect(() => {
    if (targets) {
      setManualCal(targets.targetCalories.toString());
      setManualPro(targets.targetProtein.toString());
      setManualCarb(targets.targetCarbs.toString());
      setManualFat(targets.targetFat.toString());
    }
    if (onboardingData) {
      setGoalMode(onboardingData.goal);
    }
  }, [targets, onboardingData]);

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user || !targets) return null;

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(manualCal);
    const p = parseInt(manualPro);
    const cb = parseInt(manualCarb);
    const f = parseInt(manualFat);

    if (!isNaN(c) && !isNaN(p) && !isNaN(cb) && !isNaN(f)) {
      manuallySetTargets(c, p, cb, f);
      triggerSuccessToast();
    }
  };

  const handleModeChange = (mode: "lose_fat" | "gain_muscle" | "maintain" | "body_recomp") => {
    if (!onboardingData) return;
    setGoalMode(mode);
    const updatedOnboard = {
      ...onboardingData,
      goal: mode
    };
    saveOnboarding(updatedOnboard);
    triggerSuccessToast();
  };

  const triggerSuccessToast = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleHardReset = () => {
    if (window.confirm("Are you absolutely sure you want to reset all physical logs, nutrition history, and onboarding profiles? This action cannot be undone.")) {
      resetAllData();
      router.push("/onboarding");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-white relative">
      
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-emerald-500 text-white px-5 py-3 rounded-2xl flex items-center space-x-2 shadow-lg text-sm font-semibold pointer-events-auto">
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Targets and preferences successfully saved!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
              Goals & Settings <Settings className="h-5 w-5 text-emerald-500 animate-spin-slow" />
            </h1>
            <p className="text-xs text-slate-400">Manage biological limits, calorie surplus/deficits, and manual resets</p>
          </div>
        </div>
        <span className="text-[10px] tracking-wider uppercase font-mono bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200">
          BCA Project
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Biological Summary & Transformation Modes */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Profile Overview */}
          {onboardingData && (
            <GlassCard className="p-6 space-y-4">
              <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <User className="h-4 w-4 text-emerald-500" />
                Biological Profile
              </span>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Gender</span>
                  <p className="font-bold text-slate-700 capitalize">{onboardingData.gender}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Age</span>
                  <p className="font-bold text-slate-700">{onboardingData.age} Years</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Height</span>
                  <p className="font-bold text-slate-700">{onboardingData.height} cm</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Weight (Current)</span>
                  <p className="font-bold text-slate-700">{onboardingData.currentWeight} kg</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Transformation Goals Selector */}
          <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Target className="h-4 w-4 text-emerald-500" />
              Transformation Mode
            </span>

            <div className="space-y-2">
              {[
                { id: "lose_fat", name: "Weight Loss Mode", desc: "Standard 500 kcal deficit to promote body fat burn." },
                { id: "gain_muscle", name: "Muscle Gain Mode", desc: "300 kcal calorie surplus to foster muscle development." },
                { id: "maintain", name: "Maintenance Mode", desc: "Stabilizes calories to perfectly balance daily TDEE." },
                { id: "body_recomp", name: "Body Recomposition", desc: "Mild deficit & high protein to burn fat & build lean tissue." }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleModeChange(item.id as any)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 ${
                    goalMode === item.id 
                      ? "bg-emerald-50 border-emerald-200 shadow-sm"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-xs font-bold ${goalMode === item.id ? "text-emerald-700" : "text-slate-700"}`}>
                      {item.name}
                    </span>
                    {goalMode === item.id && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Dynamic Targets Manual Override Form */}
        <div className="md:col-span-7 space-y-6">
          
          <GlassCard className="p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Flame className="h-4 w-4 text-emerald-500" />
                Targets Override Calibrator
              </span>
              <p className="text-[10px] text-slate-400">Avoid automatic calculators. Direct typing updates calorie budgets and dashboard gauges instantly.</p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label htmlFor="settings-calories" className="text-xs text-slate-600 font-semibold">Daily Calories Goal (kcal)</label>
                <input
                  id="settings-calories"
                  type="number"
                  required
                  value={manualCal}
                  onChange={(e) => setManualCal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="e.g. 2100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3.5 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="settings-protein" className="text-xs text-slate-600 font-semibold">Protein (g)</label>
                  <input
                    id="settings-protein"
                    type="number"
                    required
                    value={manualPro}
                    onChange={(e) => setManualPro(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. 140"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-carbs" className="text-xs text-slate-600 font-semibold">Carbohydrates (g)</label>
                  <input
                    id="settings-carbs"
                    type="number"
                    required
                    value={manualCarb}
                    onChange={(e) => setManualCarb(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. 210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="settings-fat" className="text-xs text-slate-600 font-semibold">Fat (g)</label>
                  <input
                    id="settings-fat"
                    type="number"
                    required
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. 65"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Update Nutrient Override Targets</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Calorie Rollover Intelligence Panel */}
          <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Scale className="h-4 w-4 text-emerald-500" />
              Advanced Calorie Intelligence
            </span>
            <div className="flex justify-between items-center gap-3">
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold text-slate-800">Carry Over Remaining Calories</p>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[280px]">
                  Roll over yesterday's unused calories to today's budget or subtract any excess to stay perfectly balanced over weekly intervals.
                </p>
                {isRolloverEnabled && (
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 font-mono text-[9px] font-bold">
                    {rolloverCalories >= 0 
                      ? `🟢 Rollover active: +${rolloverCalories} kcal carries over today`
                      : `🔴 Deficit active: ${rolloverCalories} kcal subtracted today`
                    }
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={toggleRollover}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isRolloverEnabled ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isRolloverEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </GlassCard>

          {/* Critical resets logs panel */}
          <GlassCard className="p-6 border-rose-100 bg-rose-50/20 space-y-4">
            <span className="font-outfit text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100/50 pb-2">
              <RotateCcw className="h-4 w-4" />
              Danger Zone Operations
            </span>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">Clear Cache & Profiles</p>
                <span className="text-[10px] text-slate-400 block">Deletes local storage databases, onboarding, and logs.</span>
              </div>
              <button
                onClick={handleHardReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
              >
                Reset Database
              </button>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
}
