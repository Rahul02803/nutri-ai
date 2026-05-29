"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { OnboardingData } from "@/lib/calculations";
import { GlassCard } from "@/components/GlassCard";
import { ChevronRight, ChevronLeft, Sparkles, Scale, Heart, User, Check, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const { user, updateUserOnboardStatus } = useAuth();
  const { saveOnboarding } = useApp();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (user.isOnboarded) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Wizard form state variables
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(user?.name || "");
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<OnboardingData["gender"]>("male");
  const [motivation, setMotivation] = useState("Boost Energy ⚡");
  
  // Strict numeric parameters
  const [age, setAge] = useState<number>(24);
  const [height, setHeight] = useState<number>(175);
  const [currentWeight, setCurrentWeight] = useState<number>(78);
  const [targetWeight, setTargetWeight] = useState<number>(70);

  // Goal selectors
  const [goal, setGoal] = useState<OnboardingData["goal"]>("lose_fat");
  
  // Animal speed slider setting (only slider in onboarding flow)
  const [speedIndex, setSpeedIndex] = useState<number>(1); // 0=slow, 1=moderate, 2=aggressive
  
  // Routing preferences
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [timeline, setTimeline] = useState("2-3 months");
  const [activityLevel, setActivityLevel] = useState<OnboardingData["activityLevel"]>("moderate");
  const [dietPreference, setDietPreference] = useState<OnboardingData["dietPreference"]>("vegetarian");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  // Simulation loading status
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const speedOptions = [
    { value: "slow" as const, emoji: "🦥", name: "Sloth (Slow)", rate: "0.1 - 0.2 kg/week", desc: "Chill & sustainable. No stress, highly persistent." },
    { value: "moderate" as const, emoji: "🐇", name: "Rabbit (Moderate)", rate: "0.5 - 0.8 kg/week", desc: "Optimal balance. Standard recommended diet pace." },
    { value: "aggressive" as const, emoji: "🐆", name: "Panther (Aggressive)", rate: "1.2 - 1.5 kg/week", desc: "Intense drive. High calorie deficit, fast results." }
  ];

  const handleNext = () => {
    // Clamping values when moving past inputs
    if (step === 3) {
      setAge(Math.min(90, Math.max(14, age || 24)));
    }
    if (step === 4) {
      setHeight(Math.min(230, Math.max(100, height || 175)));
      setCurrentWeight(Math.min(180, Math.max(30, currentWeight || 78)));
      setTargetWeight(Math.min(180, Math.max(30, targetWeight || 70)));
    }

    if (step < 9) {
      setStep(step + 1);
    } else {
      triggerAIAnalysis();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const triggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    const analysisSteps = [
      "Deconstructing physical parameters...",
      "Calibrating Mifflin-St Jeor metabolic profiles...",
      "Setting caloric deficit boundaries...",
      "Formulating customized protein targets...",
      "Configuring intermittent fasting schedule templates...",
      "Generating dynamic weight analytics pathways..."
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      setLoadingText(analysisSteps[i]);
      await new Promise((resolve) => setTimeout(resolve, 850));
    }

    const goalSpeedValue = speedOptions[speedIndex].value;

    const payload: OnboardingData = {
      goal,
      gender,
      age,
      height,
      currentWeight,
      targetWeight,
      activityLevel,
      workoutFrequency: "3-4 days/week",
      fitnessExperience: "Beginner",
      dietPreference,
      allergies: selectedAllergies,
      mealsPerDay,
      timeline,
      challenge: "Consistency",
      dreamPhysique: goal === "lose_fat" ? "Lean & Toned" : "Athletic",
      goalSpeed: goalSpeedValue,
      motivation,
      weightUnit
    };

    saveOnboarding(payload);
    setIsAnalyzing(false);
    updateUserOnboardStatus(true);
    router.push("/dashboard");
  };

  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const progressPercent = Math.round((step / 9) * 100);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-[#F8F8FA]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.015)_0%,transparent_80%)] -z-10" />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-8 space-y-6 flex flex-col items-center shadow-[0_12px_40px_rgba(0,0,0,0.01)]">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-purple-500 animate-spin" />
                <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-outfit text-2xl font-bold text-[#111111]">Analyzing Physical Profile</h3>
                <p className="text-xs text-purple-600 font-mono tracking-wide transition-all duration-300">{loadingText}</p>
              </div>
              <p className="text-[11px] text-[#8D8D92] text-center max-w-xs leading-relaxed">
                We are configuring custom biological formulas inside our dietetic engine to align goals with your exact body composition thresholds.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white border border-[#ECECEF] rounded-[32px] p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              {/* Header indicator */}
              <div className="flex justify-between items-center pb-4 border-b border-[#F1F1F4]">
                <div>
                  <h1 className="font-outfit text-2xl font-bold text-[#111111]">Welcome to NutriTrack</h1>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#8D8D92] mt-1 font-semibold">
                    Step {step} of 9 • {progressPercent}% Completed
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-[#ECECEF]">
                  {step <= 3 ? <User className="h-4.5 w-4.5 text-[#111111]" /> : step <= 6 ? <Scale className="h-4.5 w-4.5 text-[#111111]" /> : <Heart className="h-4.5 w-4.5 text-[#111111]" />}
                </div>
              </div>

              {/* Minimal bar tracker */}
              <div className="w-full h-1 bg-[#ECECEF] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Form viewport */}
              <div className="min-h-[300px] flex flex-col justify-center py-2">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Let&apos;s start with the basics</h2>
                        <p className="text-xs text-[#8D8D92]">What should we call you and how do you identify?</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider">Your Name</label>
                          <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Type your name..."
                            className="w-full px-4 py-3 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF] text-sm text-[#111111] font-medium focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Biological Gender</label>
                          <div className="grid grid-cols-3 gap-3">
                            {(["male", "female", "other"] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`py-3 rounded-2xl text-xs font-bold border transition-all capitalize ${
                                  gender === g
                                    ? "bg-[#111111] border-[#111111] text-white"
                                    : "bg-white border-[#ECECEF] text-[#8D8D92] hover:bg-slate-50"
                                }`}
                              >
                                {g === "male" ? "Male ♂️" : g === "female" ? "Female ♀️" : "Other ⚧️"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Measurement Units</label>
                          <div className="grid grid-cols-2 gap-3">
                            {(["metric", "imperial"] as const).map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => setWeightUnit(unit)}
                                className={`py-3 rounded-2xl text-xs font-bold border transition-all capitalize ${
                                  weightUnit === unit
                                    ? "bg-[#111111] border-[#111111] text-white"
                                    : "bg-white border-[#ECECEF] text-[#8D8D92] hover:bg-slate-50"
                                }`}
                              >
                                {unit === "metric" ? "Metric (kg, cm)" : "Imperial (lbs, ft)"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">What is your primary motivation?</h2>
                        <p className="text-xs text-[#8D8D92]">Understanding your drive helps customize the AI insights.</p>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          "Boost Energy & Vitality ⚡",
                          "Build Body Confidence & Tone up ✨",
                          "Improve Longevity & Metabolic Markers 🧬",
                          "Enhance Athletic Performance 🏆",
                          "Establish Healthy Habits & Better Sleep 🌙"
                        ].map((mot) => (
                          <button
                            key={mot}
                            type="button"
                            onClick={() => setMotivation(mot)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs font-bold flex justify-between items-center transition-all ${
                              motivation === mot
                                ? "bg-purple-50/50 border-purple-200 text-purple-700 shadow-sm"
                                : "bg-white border-[#ECECEF] text-[#111111] hover:bg-slate-50"
                            }`}
                          >
                            <span>{mot}</span>
                            {motivation === mot && <Check className="h-4 w-4 text-purple-600" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">How old are you?</h2>
                        <p className="text-xs text-[#8D8D92]">BMR and active daily targets scale extensively with age.</p>
                      </div>

                      <div className="space-y-4 py-4">
                        <div className="bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] p-6 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#8D8D92]">Enter Age (Years)</span>
                            <span className="text-[10px] font-mono text-purple-500">Clinical boundaries: 14 - 90</span>
                          </div>
                          <input
                            type="number"
                            min="14"
                            max="90"
                            value={age || ""}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setAge(isNaN(v) ? 0 : v);
                            }}
                            className="w-full text-3xl font-bold bg-transparent text-[#111111] border-none focus:outline-none focus:ring-0 p-0"
                            placeholder="e.g. 24"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Let&apos;s map your physical coordinates</h2>
                        <p className="text-xs text-[#8D8D92]">Strict numerical values only for diagnostic calculations.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] p-5 space-y-2">
                          <label className="text-[11px] font-bold text-[#8D8D92] block uppercase tracking-wider">Height ({weightUnit === "metric" ? "cm" : "in"})</label>
                          <input
                            type="number"
                            min="100"
                            max="230"
                            value={height || ""}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setHeight(isNaN(v) ? 0 : v);
                            }}
                            className="w-full text-2xl font-bold bg-transparent text-[#111111] border-none focus:outline-none focus:ring-0 p-0"
                            placeholder={weightUnit === "metric" ? "175" : "69"}
                          />
                        </div>

                        <div className="bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] p-5 space-y-2">
                          <label className="text-[11px] font-bold text-[#8D8D92] block uppercase tracking-wider">Weight ({weightUnit === "metric" ? "kg" : "lbs"})</label>
                          <input
                            type="number"
                            min="30"
                            max="180"
                            value={currentWeight || ""}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              setCurrentWeight(isNaN(v) ? 0 : v);
                            }}
                            className="w-full text-2xl font-bold bg-transparent text-[#111111] border-none focus:outline-none focus:ring-0 p-0"
                            placeholder={weightUnit === "metric" ? "78" : "172"}
                          />
                        </div>
                      </div>

                      <div className="bg-[#F8F8FA] border border-[#ECECEF] rounded-[24px] p-5 space-y-2">
                        <label className="text-[11px] font-bold text-[#8D8D92] block uppercase tracking-wider">Target Weight ({weightUnit === "metric" ? "kg" : "lbs"})</label>
                        <input
                          type="number"
                          min="30"
                          max="180"
                          value={targetWeight || ""}
                          onChange={(e) => {
                            const v = parseInt(e.target.value);
                            setTargetWeight(isNaN(v) ? 0 : v);
                          }}
                          className="w-full text-2xl font-bold bg-transparent text-[#111111] border-none focus:outline-none focus:ring-0 p-0"
                          placeholder={weightUnit === "metric" ? "70" : "154"}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Choose your primary physique goal</h2>
                        <p className="text-xs text-[#8D8D92]">Matches the target goal structure of clinically healthy regimes.</p>
                      </div>

                      <div className="space-y-3.5">
                        {[
                          { id: "lose_fat", title: "Lose Weight", desc: "Burn extra fat, preserve lean mass, improve body indices.", emoji: "📉", color: "pastel-blue" },
                          { id: "maintain", title: "Maintain Weight", desc: "Solidify current biological threshold, sustain daily output.", emoji: "🥗", color: "pastel-purple" },
                          { id: "gain_muscle", title: "Gain Weight", desc: "Promote hypertrophic synthesis, expand strength outputs.", emoji: "📈", color: "pastel-pink" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGoal(item.id as any)}
                            className={`w-full p-5 rounded-[28px] text-left border flex items-center justify-between transition-all ${
                              goal === item.id
                                ? `bg-white border-[#111111] ring-1 ring-[#111111] shadow-md`
                                : "bg-white border-[#ECECEF] hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">{item.emoji}</span>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-[#111111]">{item.title}</p>
                                <span className="text-[11px] text-[#8D8D92] leading-tight block max-w-xs">{item.desc}</span>
                              </div>
                            </div>
                            <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${goal === item.id ? "bg-[#111111] border-[#111111]" : "border-[#ECECEF]"}`}>
                              {goal === item.id && <Check className="h-3.5 w-3.5 text-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 6 && (
                    <motion.div key="step6" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Select weekly adjustment speed</h2>
                        <p className="text-xs text-[#8D8D92]">The ONLY slider permitted. Toggle speeds equipped with friendly animal indicators.</p>
                      </div>

                      <div className="bg-white border border-[#ECECEF] rounded-[28px] p-6 space-y-6 shadow-sm">
                        {/* Animal Illustration Card */}
                        <div className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-[#F8F8FA] border border-[#ECECEF] space-y-3 min-h-[140px] transition-all duration-300">
                          <span className="text-5xl animate-bounce">{speedOptions[speedIndex].emoji}</span>
                          <div className="text-center">
                            <h3 className="font-outfit text-md font-bold text-[#111111]">{speedOptions[speedIndex].name}</h3>
                            <p className="text-xs font-bold text-purple-600 font-mono mt-0.5">{speedOptions[speedIndex].rate}</p>
                          </div>
                        </div>

                        {/* Speed Range Slider */}
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={speedIndex}
                            onChange={(e) => setSpeedIndex(parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#8D8D92] px-1">
                            <span>SLOW 🦥</span>
                            <span>MODERATE 🐇</span>
                            <span>AGGRESSIVE 🐆</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#8D8D92] text-center leading-relaxed italic">
                          &ldquo;{speedOptions[speedIndex].desc}&rdquo;
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {step === 7 && (
                    <motion.div key="step7" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Your routine & schedule preferences</h2>
                        <p className="text-xs text-[#8D8D92]">Configure the intermittent clocks and default calorie multipliers.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Meals preferred per day</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[2, 3, 4, 5].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setMealsPerDay(m)}
                                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                  mealsPerDay === m ? "bg-[#111111] border-[#111111] text-white" : "bg-white border-[#ECECEF] text-[#8D8D92]"
                                }`}
                              >
                                {m} Meals
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Timeline Target</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["2-4 weeks", "2-3 months", "6+ months"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTimeline(t)}
                                className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                                  timeline === t ? "bg-[#111111] border-[#111111] text-white" : "bg-white border-[#ECECEF] text-[#8D8D92]"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Daily Activity Routine</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "sedentary", label: "Sedentary 🛋️" },
                              { id: "light", label: "Light 🚶" },
                              { id: "moderate", label: "Moderate 🏃" },
                              { id: "active", label: "Active 🏋️" }
                            ].map((act) => (
                              <button
                                key={act.id}
                                type="button"
                                onClick={() => setActivityLevel(act.id as any)}
                                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                  activityLevel === act.id ? "bg-[#111111] border-[#111111] text-white" : "bg-white border-[#ECECEF] text-[#8D8D92]"
                                }`}
                              >
                                {act.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 8 && (
                    <motion.div key="step8" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Why track with NutriTrack AI?</h2>
                        <p className="text-xs text-[#8D8D92]">Visual success rates showing 2.5X effectiveness pitch.</p>
                      </div>

                      {/* Comparison Bar Graph Container */}
                      <div className="bg-[#F8F8FA] border border-[#ECECEF] rounded-[28px] p-6 space-y-6">
                        <div className="space-y-4">
                          {/* Shorter grey bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-[#8D8D92]">
                              <span>Without NutriTrack AI (Generic Dieting)</span>
                              <span>35% Success</span>
                            </div>
                            <div className="w-full h-8 bg-white border border-[#ECECEF] rounded-full overflow-hidden flex items-center px-1">
                              <div className="h-6 bg-[#D1D1D6] rounded-full" style={{ width: "35%" }} />
                            </div>
                          </div>

                          {/* Taller pastel gradient bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-[#111111]">
                              <span className="flex items-center space-x-1.5">
                                <Award className="h-4 w-4 text-indigo-500 animate-bounce" />
                                <span>With NutriTrack AI Coach</span>
                              </span>
                              <span className="text-indigo-600 font-mono font-bold">88% Success</span>
                            </div>
                            <div className="w-full h-8 bg-white border border-[#ECECEF] rounded-full overflow-hidden flex items-center px-1">
                              <div className="h-6 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 rounded-full" style={{ width: "88%" }} />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-[#ECECEF] rounded-[20px] p-4 text-center space-y-1.5">
                          <h4 className="text-xs font-bold text-[#111111]">2.5X More Likely to Hit Your Goal</h4>
                          <p className="text-[10px] text-[#8D8D92] leading-relaxed">
                            Combining clinical Mifflin-St Jeor math with native mobile fasting modules, workout loggers, and immediate AI food scanning.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 9 && (
                    <motion.div key="step9" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -15 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="font-outfit text-lg font-bold text-[#111111]">Diet preferences & sensitivities</h2>
                        <p className="text-xs text-[#8D8D92]">Fine-tune the custom menu recommendations inside the dashboard.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Diet Tier</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "vegetarian", label: "Vegetarian 🥦" },
                              { id: "eggetarian", label: "Eggetarian 🥚" },
                              { id: "non_vegetarian", label: "Non-Veg 🍗" },
                              { id: "vegan", label: "Vegan 🌱" }
                            ].map((tier) => (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() => setDietPreference(tier.id as any)}
                                className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                                  dietPreference === tier.id ? "bg-[#111111] border-[#111111] text-white" : "bg-white border-[#ECECEF] text-[#8D8D92]"
                                }`}
                              >
                                {tier.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#111111] uppercase tracking-wider block">Sensitivities / Allergies (Multi-select)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Dairy", "Gluten", "Nuts", "Soy", "Seafood", "None"].map((allergy) => {
                              const isSelected = selectedAllergies.includes(allergy);
                              return (
                                <button
                                  key={allergy}
                                  type="button"
                                  onClick={() => toggleAllergy(allergy)}
                                  className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${
                                    isSelected ? "bg-purple-50/50 border-purple-300 text-purple-700 font-bold" : "bg-white border-[#ECECEF] text-[#8D8D92]"
                                  }`}
                                >
                                  {allergy}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-[#F1F1F4]">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`flex items-center space-x-1 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    step === 1
                      ? "border-transparent text-slate-300 cursor-not-allowed"
                      : "border-[#ECECEF] bg-white text-[#8D8D92] hover:bg-slate-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
                >
                  <span>{step === 9 ? "Formulate Strategy" : "Continue"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
