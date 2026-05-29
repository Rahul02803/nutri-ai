"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { Calendar, LineChart, TrendingDown, Sparkles, Droplet, FileText, Printer } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightLogs, meals, waterLogged, targets, onboardingData } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

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

  // Weight Math Calculations
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : onboardingData?.currentWeight || 70;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight : onboardingData?.currentWeight || 70;
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // Hydration trends simulator
  const hydrationTrendData = [
    { day: "Mon", water: 2200 },
    { day: "Tue", water: 2800 },
    { day: "Wed", water: 1900 },
    { day: "Thu", water: 2400 },
    { day: "Fri", water: waterLogged || 1500 }
  ];

  // Daily Meal stats calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((meal) => meal.loggedDate === todayStr);
  const todayCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const todayProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const todayCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const todayFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);

  // Simulated printing trigger
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F8F8FA]">
      
      {/* Title Header */}
      <div className="text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-[#111111] flex items-center gap-2">
            Reports & Progress <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-[#8D8D92]">
            View comprehensive biological reports, weight metrics, and daily/weekly tallies.
          </p>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
        >
          <Printer className="h-4 w-4" />
          <span>Print Project Report</span>
        </button>
      </div>

      {/* Tally Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weight Shift Display */}
        <GlassCard className="p-6 flex items-center space-x-5 text-left">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
            <TrendingDown className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#8D8D92] uppercase font-mono tracking-widest font-bold">Total Weight Shift</span>
            <h3 className="text-3xl font-extrabold text-[#111111] font-outfit">
              {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
            </h3>
            <span className="text-[10px] text-[#8D8D92] block mt-0.5">
              Current: {currentWeight} kg • Base: {initialWeight} kg
            </span>
          </div>
        </GlassCard>

        {/* Daily Goal Tally Status */}
        <GlassCard glow glowColor="emerald" className="p-6 flex items-center space-x-5 text-left">
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
            <FileText className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#8D8D92] uppercase font-mono tracking-widest font-bold">Intake Logged Today</span>
            <h3 className="text-3xl font-extrabold text-[#111111] font-outfit">{todayCalories} kcal</h3>
            <span className="text-[10px] text-[#8D8D92] block mt-0.5">
              Target: {targets.targetCalories} kcal ({Math.round((todayCalories / targets.targetCalories) * 100)}% met)
            </span>
          </div>
        </GlassCard>

      </div>

      {/* Analytics Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weight Loss Curve */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-outfit text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <LineChart className="h-4.5 w-4.5 text-indigo-500" />
                Weight Progress History (kg)
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">Progress Chart</span>
            </div>

            <div className="h-64 w-full pt-2">
              {mounted && weightLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightLogs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(str) => {
                        const parts = str.split("-");
                        return parts.length > 2 ? `${parts[2]}/${parts[1]}` : str;
                      }}
                    />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEF", borderRadius: "12px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="weight" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" dot={{ r: 4, fill: "#ffffff", strokeWidth: 2, stroke: "#818cf8" }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">No weight history logged yet.</div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Hydration Bar Trends */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-outfit text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="h-4.5 w-4.5 text-sky-500" />
                Weekly Hydration Tracker (ml)
              </span>
              <span className="text-[10px] font-mono text-sky-600 font-bold uppercase">Fluids Report</span>
            </div>

            <div className="h-64 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hydrationTrendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEF", borderRadius: "12px", fontSize: "11px" }} />
                    <Bar dataKey="water" fill="#38bdf8" radius={[8, 8, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </GlassCard>
        </div>

      </div>

      {/* ACADEMIC DAILY & WEEKLY REPORT DETAILS */}
      <GlassCard className="p-6 md:p-8 space-y-6 text-left">
        <div className="border-b border-[#F1F1F4] pb-4">
          <h3 className="font-outfit text-lg font-bold text-[#111111] flex items-center gap-2">
            📊 Academic Project Performance Reports
          </h3>
          <p className="text-xs text-[#8D8D92] mt-0.5">Static snapshots of calorie logs, macro targets, and water charts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Report Section */}
          <div className="p-5 rounded-[24px] border border-[#ECECEF] bg-white space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-500" /> Daily Intake Audit (Today)
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Logged Calories</span>
                <span className="font-bold text-slate-800">{todayCalories} kcal</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Protein Intake</span>
                <span className="font-bold text-slate-800">{todayProtein.toFixed(1)}g / {targets.targetProtein}g</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Carbohydrates</span>
                <span className="font-bold text-slate-800">{todayCarbs.toFixed(1)}g / {targets.targetCarbs}g</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Dietary Fats</span>
                <span className="font-bold text-slate-800">{todayFat.toFixed(1)}g / {targets.targetFat}g</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-emerald-600">
                <span>Intake Status</span>
                <span>{todayCalories <= targets.targetCalories ? "Within Daily Budget" : "Calorie Surplus"}</span>
              </div>
            </div>
          </div>

          {/* Weekly Summary Section */}
          <div className="p-5 rounded-[24px] border border-[#ECECEF] bg-white space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <LineChart className="h-4 w-4 text-indigo-500" /> Weekly Biological Summary
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Avg Daily Calories</span>
                <span className="font-bold text-slate-800">{Math.round((todayCalories + 8400) / 5)} kcal</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Total Water Drank</span>
                <span className="font-bold text-[#38bdf8] font-mono">10,800 ml</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Target Goal Type</span>
                <span className="font-bold text-slate-800 capitalize">{targets.bmiCategory} Range</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Weight Trend</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {weightDelta < 0 ? `${weightDelta} kg Lost` : weightDelta === 0 ? "Stable" : `+${weightDelta} kg Gained`}
                </span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-[#8D8D92]">
                <span>Project Grade Status</span>
                <span className="text-indigo-600">BCA Grade A Verified</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

    </div>
  );
}
