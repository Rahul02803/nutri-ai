"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { OnboardingData } from "@/lib/calculations";
import { ChevronRight, ChevronLeft, Sparkles, Scale, Heart, User, Check, Dumbbell, Calendar } from "lucide-react";
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

  // Onboarding Wizard - Exactly 10 steps
  const [step, setStep] = useState(1);

  // States for the 10 Questions
  const [goal, setGoal] = useState<OnboardingData["goal"]>("lose_fat");
  const [gender, setGender] = useState<OnboardingData["gender"]>("male");
  const [age, setAge] = useState<number>(24);
  const [height, setHeight] = useState<number>(175);
  const [currentWeight, setCurrentWeight] = useState<number>(75);
  const [targetWeight, setTargetWeight] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<OnboardingData["activityLevel"]>("moderate");
  const [dietPreference, setDietPreference] = useState<OnboardingData["dietPreference"]>("vegetarian");
  const [workoutFrequency, setWorkoutFrequency] = useState("3"); // days/week
  const [timeline, setTimeline] = useState("12"); // weeks

  // Simulation loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleNext = () => {
    if (step < 10) {
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
      "Deconstructing physical biology parameters...",
      "Calibrating Mifflin-St Jeor metabolic expenditure models...",
      "Allocating dynamic calorie budgets...",
      "Calculating target Protein, Carbs, and Fats splits...",
      "Configuring smart carryover auto-adjusters...",
      "Activating Gemini 2.5 Flash Coach..."
    ];

    for (let i = 0; i < analysisSteps.length; i++) {
      setLoadingText(analysisSteps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const payload: OnboardingData = {
      goal,
      gender,
      age,
      height,
      currentWeight,
      targetWeight,
      activityLevel,
      dietPreference,
      workoutFrequency: `${workoutFrequency} days/week`,
      timeline: `${timeline} weeks`,
      allergies: [],
      mealsPerDay: 3,
      challenge: "Consistency",
      fitnessExperience: "Beginner",
      dreamPhysique: goal === "lose_fat" ? "Lean & Toned" : "Athletic",
      goalSpeed: "moderate"
    };

    saveOnboarding(payload);
    setIsAnalyzing(false);
    updateUserOnboardStatus(true);
    router.push("/dashboard");
  };

  const progressPercent = Math.round((step / 10) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#F8F8FA] text-[#111111]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.015)_0%,transparent_80%)] -z-10" />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-[36px] text-center space-y-6 shadow-sm"
          >
            <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="h-7 w-7 text-[#14B8A6] animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-outfit text-xl font-extrabold text-slate-800">Calibrating ZenLog Coach</h3>
              <p className="text-xs text-slate-400 font-mono pulse-light">{loadingText}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-[36px] shadow-sm text-left relative overflow-hidden"
          >
            {/* Top Indicator bar */}
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-6">
              <span>Question {step} of 10</span>
              <span>{progressPercent}% Complete</span>
            </div>

            <div className="w-full h-1 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Steps Rendering */}
            <div className="min-h-[220px]">
              <AnimatePresence mode="wait">
                
                {/* Q1: Goal */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">What is your primary fitness goal?</h3>
                    <div className="space-y-2 pt-1 text-xs font-bold text-slate-700">
                      {[
                        { id: "lose_fat" as const, label: "📉 Lose Weight" },
                        { id: "gain_muscle" as const, label: "💪 Gain Muscle" },
                        { id: "maintain" as const, label: "⚖️ Maintain Weight" },
                        { id: "body_recomp" as const, label: "🔄 Body Recomposition" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setGoal(opt.id)}
                          className={`w-full py-3.5 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            goal === opt.id 
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {goal === opt.id && <Check className="h-4.5 w-4.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q2: Gender */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">Select Biological Gender</h3>
                    <div className="space-y-2 pt-1 text-xs font-bold text-slate-700">
                      {[
                        { id: "male" as const, label: "Male" },
                        { id: "female" as const, label: "Female" },
                        { id: "other" as const, label: "Prefer not to say" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setGender(opt.id)}
                          className={`w-full py-3.5 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            gender === opt.id 
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {gender === opt.id && <Check className="h-4.5 w-4.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q3: Age */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">How old are you?</h3>
                    <p className="text-[10px] text-slate-400">Used to estimate BMR formulas correctly.</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={age || ""}
                        onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="Age in years..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Q4: Height */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">What is your height?</h3>
                    <p className="text-[10px] text-slate-400">Measured in centimeters.</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={height || ""}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="Height in cm..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Q5: Current Weight */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">What is your current weight?</h3>
                    <p className="text-[10px] text-slate-400">Measured in kilograms.</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={currentWeight || ""}
                        onChange={(e) => setCurrentWeight(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="Weight in kg..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Q6: Goal Weight */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">What is your target weight?</h3>
                    <p className="text-[10px] text-slate-400">ZenLog AI will configure daily energy shifts based on this weight.</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={targetWeight || ""}
                        onChange={(e) => setTargetWeight(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="Target weight in kg..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Q7: Activity Level */}
                {step === 7 && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">What is your activity level?</h3>
                    <div className="space-y-2 pt-1 text-xs font-bold text-slate-700">
                      {[
                        { id: "sedentary" as const, label: "🛋️ Sedentary (No workouts)" },
                        { id: "light" as const, label: "🚶 Lightly Active (1-2 days/week)" },
                        { id: "moderate" as const, label: "🏃 Moderately Active (3-5 days/week)" },
                        { id: "active" as const, label: "🏋️ Very Active (6-7 days/week)" },
                        { id: "extreme" as const, label: "🐆 Athlete (Intense daily training)" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setActivityLevel(opt.id)}
                          className={`w-full py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            activityLevel === opt.id 
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {activityLevel === opt.id && <Check className="h-4.5 w-4.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q8: Food Preference */}
                {step === 8 && (
                  <motion.div
                    key="step8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">Food Preferences</h3>
                    <div className="space-y-2 pt-1 text-xs font-bold text-slate-700">
                      {[
                        { id: "vegetarian" as const, label: "🥦 Vegetarian" },
                        { id: "non_vegetarian" as const, label: "🍗 Non-Vegetarian" },
                        { id: "vegan" as const, label: "🌱 Vegan" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setDietPreference(opt.id)}
                          className={`w-full py-3.5 px-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            dietPreference === opt.id 
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {dietPreference === opt.id && <Check className="h-4.5 w-4.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Q9: Workout Frequency */}
                {step === 9 && (
                  <motion.div
                    key="step9"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">Workout Frequency</h3>
                    <p className="text-[10px] text-slate-400">How many days do you work out per week?</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={workoutFrequency || ""}
                        onChange={(e) => setWorkoutFrequency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="e.g. 3 days/week..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Q10: Timeline */}
                {step === 10 && (
                  <motion.div
                    key="step10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="font-outfit text-xl font-extrabold text-slate-900">Target Timeline</h3>
                    <p className="text-[10px] text-slate-400">By when do you plan to achieve this goal?</p>
                    <div className="space-y-2 pt-2 text-xs font-bold">
                      <input
                        type="number"
                        required
                        value={timeline || ""}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:border-slate-400 font-semibold"
                        placeholder="Timeline in weeks (e.g. 12)..."
                      />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-1 py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 py-2 px-5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xs"
              >
                <span>{step === 10 ? "Finish Calibration" : "Next Option"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
