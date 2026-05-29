"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { Award, Flame, Calendar, LineChart, TrendingDown, ArrowRight, Sparkles, Droplet } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function ProgressPage() {
  const { user } = useAuth();
  const { weightLogs, meals, waterLogged, streakCount, unlockedBadges, targets } = useApp();
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

  // Pre-configured list of all possible achievements/badges
  const ALL_BADGES = [
    { id: "first_meal", name: "First Step 🥗", desc: "Logged your first meal on NutriTrack AI", icon: "🥗" },
    { id: "water_champ", name: "Hydration Hero 💧", desc: "Drank 3,000ml+ of water in a day", icon: "💧" },
    { id: "streak_3", name: "Consistent Builder 🔥", desc: "3 consecutive days of tracking", icon: "🔥" },
    { id: "streak_7", name: "Health Devotee 👑", desc: "7 consecutive days of tracking", icon: "👑" },
    { id: "fasting_champion", name: "Autophagy Hero ⏳", desc: "Successfully completed a fasting window", icon: "⏳" },
    { id: "workout_warrior", name: "Iron Will 💪", desc: "Logged your first workout session", icon: "💪" },
  ];

  // Weight Math Calculations
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weight : 0;
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // Hydration trends simulator
  const hydrationTrendData = [
    { day: "Mon", water: 2250 },
    { day: "Tue", water: 3100 },
    { day: "Wed", water: 1800 },
    { day: "Thu", water: 2500 },
    { day: "Fri", water: waterLogged || 1250 }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F8F8FA]">
      
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-outfit text-3xl font-bold text-[#111111] flex items-center gap-2">
          Analytics & Progress <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
        </h1>
        <p className="text-sm text-[#8D8D92]">
          Unlock your biological insights and achievements dashboards.
        </p>
      </div>

      {/* Streaks & Delta Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Scoreboard */}
        <GlassCard glow glowColor="emerald" className="p-6 flex items-center space-x-5 text-left">
          <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100/50">
            <Flame className="h-7 w-7 text-orange-500 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] text-[#8D8D92] uppercase font-mono tracking-widest font-bold">Active Logging Streak</span>
            <h3 className="text-3xl font-extrabold text-[#111111] font-outfit">{streakCount} Days</h3>
            <span className="text-[10px] text-[#8D8D92] block mt-0.5">Keep logging daily to lock your streak!</span>
          </div>
        </GlassCard>

        {/* Weight Delta Display */}
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

        {/* Badges Count Tally */}
        <GlassCard className="p-6 flex items-center space-x-5 text-left">
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
            <Award className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#8D8D92] uppercase font-mono tracking-widest font-bold">Badges Unlocked</span>
            <h3 className="text-3xl font-extrabold text-[#111111] font-outfit">
              {unlockedBadges.length} / {ALL_BADGES.length}
            </h3>
            <span className="text-[10px] text-[#8D8D92] block mt-0.5">
              Complete wellness tasks to unlock more badges.
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
                Weight Loss Curve Area
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">Dynamic Metric Preset</span>
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
                Hydration Fluids Trends (ml)
              </span>
              <span className="text-[10px] font-mono text-sky-600 font-bold uppercase">Weekly Logs</span>
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

      {/* Gamified Achievements Scoreboard */}
      <GlassCard className="p-6 md:p-8 space-y-6 text-left">
        <div className="border-b border-[#F1F1F4] pb-4 flex justify-between items-center">
          <h3 className="font-outfit text-lg font-bold text-[#111111] flex items-center gap-2">
            🏆 Gamified Badges Room
          </h3>
          <span className="text-xs text-[#8D8D92]">
            {unlockedBadges.length} of {ALL_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.some((b) => b.id === badge.id);
            const matchingUnlock = unlockedBadges.find((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-[28px] border transition-all duration-300 flex items-start space-x-4 ${
                  isUnlocked
                    ? "bg-white border-[#ECECEF] shadow-xs opacity-100"
                    : "bg-[#F8F8FA]/80 border-slate-100/60 opacity-60 filter grayscale"
                }`}
              >
                <span className="text-4xl">{badge.icon}</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#111111]">{badge.name}</h4>
                  <p className="text-[11px] text-[#8D8D92] leading-tight">{badge.desc}</p>
                  {isUnlocked && matchingUnlock && (
                    <span className="text-[9px] font-mono text-purple-600 font-bold block mt-1.5">
                      Unlocked on {matchingUnlock.unlockedDate}
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="text-[9px] font-mono text-slate-400 font-semibold block mt-1.5">
                      🔒 Locked Action
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}
