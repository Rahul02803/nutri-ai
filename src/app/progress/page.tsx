"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Scale, TrendingDown, Sparkles, BarChart2, Calendar, Target, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, LineChart, Line } from "recharts";

type ProgressTab = "weight" | "calories" | "macros" | "goals" | "weekly";
type TimelineRange = "7d" | "30d" | "90d" | "1y";

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightLogs, meals, targets, onboardingData } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Filter States
  const [activeTab, setActiveTab] = useState<ProgressTab>("weight");
  const [timeline, setTimeline] = useState<TimelineRange>("7d");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route Protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (user.isOnboarded === false) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user || !targets) return null;

  // 1. Weight Math
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : onboardingData?.currentWeight || 75;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight : onboardingData?.currentWeight || 75;
  const targetWeight = onboardingData?.targetWeight || 70;
  
  const totalToLose = Math.abs(initialWeight - targetWeight);
  const lostSoFar = Math.abs(initialWeight - currentWeight);
  const progressPercent = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 0;
  
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // 2. Data Formatter for charts
  const rawChartData = weightLogs.map((log) => {
    const d = new Date(log.date);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: log.weight,
      calories: meals.filter(m => m.loggedDate === log.date).reduce((sum, m) => sum + (m.calories * m.servings), 0) || 1800,
      protein: meals.filter(m => m.loggedDate === log.date).reduce((sum, m) => sum + (m.protein * m.servings), 0) || 120,
    };
  });

  const chartData = rawChartData.length > 0 ? rawChartData : [
    { date: "Mon", weight: initialWeight, calories: 1750, protein: 110 },
    { date: "Tue", weight: initialWeight - 0.2, calories: 1900, protein: 135 },
    { date: "Wed", weight: initialWeight - 0.3, calories: 1650, protein: 120 },
    { date: "Thu", weight: initialWeight - 0.5, calories: 2100, protein: 145 },
    { date: "Fri", weight: currentWeight, calories: 1800, protein: 125 }
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111827] bg-[#F8F8FA] min-h-screen pb-32">
      
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span> ZenLog Analytics
        </h1>
        <p className="text-xs text-slate-400">
          Clean isolated dashboard tracks calorie targets, weight charts, and macro metrics.
        </p>
      </div>

      {/* 1. TABS DOCK (Exactly 5 tabs as requested) */}
      <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        {[
          { id: "weight" as const, label: "Weight" },
          { id: "calories" as const, label: "Calories" },
          { id: "macros" as const, label: "Macros" },
          { id: "goals" as const, label: "Goals" },
          { id: "weekly" as const, label: "Weekly" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[#111827] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. TIMELINE RANGE SELECTOR */}
      <div className="flex justify-start space-x-1.5 text-[9px] font-extrabold text-slate-400">
        {[
          { id: "7d" as const, label: "7 DAYS" },
          { id: "30d" as const, label: "30 DAYS" },
          { id: "90d" as const, label: "90 DAYS" },
          { id: "1y" as const, label: "1 YEAR" }
        ].map((range) => (
          <button
            key={range.id}
            onClick={() => setTimeline(range.id)}
            className={`py-1 px-2.5 rounded-lg border transition-all ${
              timeline === range.id
                ? "bg-[#111827] border-[#111827] text-white"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* 3. DYNAMIC CHART AREA */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left space-y-4">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
          {activeTab.toUpperCase()} ANALYTICS CHART ({timeline.toUpperCase()})
        </span>
        
        {mounted && (
          <div className="h-44 w-full text-slate-700">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === "weight" ? (
                /* Area Weight Chart */
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "10px", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="weight" stroke="#111827" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              ) : activeTab === "calories" ? (
                /* Bar Calories Chart */
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "10px", fontWeight: "bold" }} />
                  <Bar dataKey="calories" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                /* Line Macros/Weekly/Goals Chart */
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "10px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="protein" stroke="#FF6B81" strokeWidth={2.5} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. CLINICAL WEIGHT PROGRESS METRICS BLOCK */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 text-left">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">Transformation Specs</span>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">Current Weight</span>
            <span className="text-sm font-extrabold text-slate-800">{currentWeight} kg</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">Goal Weight</span>
            <span className="text-sm font-extrabold text-slate-800">{targetWeight} kg</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">Completion</span>
            <span className="text-sm font-extrabold text-[#14B8A6]">{progressPercent}%</span>
          </div>
        </div>

        {/* Delta change text */}
        <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-600 border border-slate-100">
          <span className="flex items-center gap-1.5">
            <TrendingDown className="h-4.5 w-4.5 text-emerald-500" />
            <span>Net weight differential:</span>
          </span>
          <span className="text-slate-800 font-extrabold">{weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg</span>
        </div>
      </div>

    </div>
  );
}
