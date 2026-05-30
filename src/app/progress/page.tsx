"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { Scale, TrendingDown, Sparkles, BarChart2, Zap, HelpCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightLogs, meals, targets, onboardingData, logWeight } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Weight logging input
  const [newWeight, setNewWeight] = useState("");
  const [weightLoggedSuccess, setWeightLoggedSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route Protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user || !targets) return null;

  // 1. Current weight math
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : onboardingData?.currentWeight || 70;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight : onboardingData?.currentWeight || 70;
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // 2. Weight progress data formatter for AreaChart
  const weightChartData = weightLogs.map((log) => {
    const formattedDate = new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      date: formattedDate,
      weight: log.weight
    };
  });

  // Fallback mock history if no logs logged yet
  const chartData = weightChartData.length > 0 ? weightChartData : [
    { date: "Base", weight: initialWeight },
    { date: "Current", weight: currentWeight }
  ];

  // 3. Daily average calories logged in the last 7 days
  const calculateAverageCalories = (): number => {
    if (meals.length === 0) return 0;
    
    // Group meals by date
    const dateCalories: Record<string, number> = {};
    meals.forEach((m) => {
      if (m && m.loggedDate) {
        dateCalories[m.loggedDate] = (dateCalories[m.loggedDate] || 0) + (m.calories * m.servings);
      }
    });

    const dailyIntakes = Object.values(dateCalories);
    const sum = dailyIntakes.reduce((acc, c) => acc + c, 0);
    return dailyIntakes.length > 0 ? Math.round(sum / dailyIntakes.length) : 0;
  };

  const avgCalories = calculateAverageCalories();

  // 4. BMI math
  const heightInMeters = (onboardingData?.height || 175) / 100;
  const rawBmi = currentWeight / (heightInMeters * heightInMeters);
  const bmiIndex = Math.round(rawBmi * 10) / 10;

  const getBmiCategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-amber-500 bg-amber-500/10" };
    if (bmi < 25) return { label: "Normal weight", color: "text-emerald-500 bg-emerald-500/10" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-500 bg-orange-500/10" };
    return { label: "Obese", color: "text-rose-500 bg-rose-500/10" };
  };

  const bmiCategory = getBmiCategory(bmiIndex);

  // 5. Weight Logger Submit Handler
  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 30 && w < 250) {
      logWeight(w);
      setNewWeight("");
      setWeightLoggedSuccess(true);
      setTimeout(() => setWeightLoggedSuccess(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111111] bg-white min-h-screen pb-32">
      
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span> Reports & Progress
        </h1>
        <p className="text-xs text-slate-400">
          Clean isolated dashboard tracks weight shifts, expenditure, and biological index rates.
        </p>
      </div>

      {/* 1. Weight Changes (Delta shift metric) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-slate-100 rounded-2xl p-4 bg-white text-left shadow-xs flex flex-col justify-between h-24">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Weight Change</span>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">
              {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
            </h3>
            <span className="text-[8px] text-slate-400 font-semibold block">Net change overall</span>
          </div>
        </div>

        {/* 2. BMI Index Metric Card */}
        <div className="border border-slate-100 rounded-2xl p-4 bg-white text-left shadow-xs flex flex-col justify-between h-24">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Your BMI</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${bmiCategory.color}`}>
              {bmiCategory.label}
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">
              {bmiIndex}
            </h3>
            <span className="text-[8px] text-slate-400 font-semibold block">Body Mass Index rate</span>
          </div>
        </div>
      </div>

      {/* 3. Weight Progress Chart (Beautiful Area Chart) */}
      <div className="border border-slate-100 rounded-3xl p-5 bg-white shadow-xs text-left space-y-4">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Weight Progress Chart</span>
        
        {mounted && (
          <div className="h-44 w-full text-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightColor" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#111115" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#111115" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                <Tooltip contentStyle={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "10px", fontWeight: "bold" }} />
                <Area type="monotone" dataKey="weight" stroke="#111115" strokeWidth={2.5} fillOpacity={1} fill="url(#weightColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Current Body Weight Logger Card */}
      <div className="border border-slate-100 rounded-3xl p-5 bg-white shadow-xs text-left space-y-3">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Log Current Body Weight</span>
        
        <form onSubmit={handleLogWeightSubmit} className="flex gap-2 text-xs font-bold">
          <input
            type="number"
            step="0.1"
            required
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 focus:outline-none focus:border-slate-400 font-semibold"
            placeholder={`Log weight (current: ${currentWeight}kg)...`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-xs shrink-0"
          >
            Log Weight
          </button>
        </form>
        {weightLoggedSuccess && (
          <p className="text-[9px] text-emerald-600 font-bold text-center">✓ Weight logged successfully!</p>
        )}
      </div>

      {/* 5. Daily Average Calories & Expenditure Metrics */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Daily average calories */}
        <div className="border border-slate-100 rounded-2xl p-4 bg-white text-left shadow-xs flex flex-col justify-between h-24">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Daily Average Intake</span>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">
              {avgCalories > 0 ? `${avgCalories} kcal` : "---"}
            </h3>
            <span className="text-[8px] text-slate-400 font-semibold block">Based on logged days</span>
          </div>
        </div>

        {/* Expenditure Changes (BMR/TDEE tracking) */}
        <div className="border border-slate-100 rounded-2xl p-4 bg-white text-left shadow-xs flex flex-col justify-between h-24">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Daily Expenditure</span>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">
              {targets.tdee} kcal
            </h3>
            <span className="text-[8px] text-slate-400 font-semibold block">BMR limit: {targets.bmr} kcal</span>
          </div>
        </div>

      </div>

    </div>
  );
}
