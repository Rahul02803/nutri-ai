"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import {
  Users,
  Database,
  Flame,
  Plus,
  Trash2,
  TrendingUp,
  Activity,
  Layers,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminPage() {
  const { user } = useAuth();
  const { foodCatalog, addNewFoodToCatalog, deleteFoodFromCatalog } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("nutriai_database_users") || "[]";
      setUsersList(JSON.parse(raw));
    } catch (e) {
      setUsersList([]);
    }
  }, []);

  // Route security block
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Form states for creating new food item
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("100g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [category, setCategory] = useState<any>("Lunch/Dinner");
  const [successMsg, setSuccessMsg] = useState("");

  if (!user || user.role !== "admin") return null;

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories || !protein || !carbs || !fat) return;

    addNewFoodToCatalog({
      name,
      servingSize,
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      category,
    });

    setSuccessMsg(`Successfully preseeded "${name}" to search catalog!`);
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Mock aggregated metric analytics datasets
  const systemMetrics = {
    totalUsers: Math.max(usersList.length, 3), // Show active count or base visual minimum
    activeDaily: Math.max(Math.floor(usersList.length * 0.7), 2),
    avgCalorieDeficit: 485,
    dbItemsCount: foodCatalog.length,
  };

  // Analytics Chart 1: Average Calorie Distribution across meal types
  const calorieDistributionData = [
    { name: "Breakfast", kcal: 320, fill: "#6366f1" },
    { name: "Lunch", kcal: 580, fill: "#10b981" },
    { name: "Dinner", kcal: 490, fill: "#f59e0b" },
    { name: "Snacks", kcal: 220, fill: "#a855f7" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="font-outfit text-3xl font-bold text-slate-100 flex items-center gap-2">
          System Administration Cockpit <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">Monitor active user registrations and manage preseeded food listings.</p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <GlassCard className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-mono">Platform Members</p>
            <p className="text-xl font-bold text-slate-200">{systemMetrics.totalUsers}</p>
            <span className="text-[9px] text-emerald-400 font-bold">+18% growth</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-mono">Active Users Today</p>
            <p className="text-xl font-bold text-slate-200">{systemMetrics.activeDaily}</p>
            <span className="text-[9px] text-emerald-400 font-bold">66.2% engagement</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-mono">Avg Deficit Tiers</p>
            <p className="text-xl font-bold text-slate-200">{systemMetrics.avgCalorieDeficit} kcal</p>
            <span className="text-[9px] text-indigo-400 font-bold">Body recomp sync</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-mono">Food Inventory Count</p>
            <p className="text-xl font-bold text-slate-200">{systemMetrics.dbItemsCount}</p>
            <span className="text-[9px] text-slate-500">Relational SQLite schema</span>
          </div>
        </GlassCard>

      </div>

      {/* Grid: Database Inventory Management Form vs Recharts Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inventory Add Form */}
        <div className="lg:col-span-7">
          <GlassCard glow glowColor="secondary" className="p-6 md:p-8 space-y-6">
            <div>
              <span className="font-outfit text-sm font-bold text-slate-400 uppercase tracking-wider block border-b border-white/[0.04] pb-4">
                Seed Custom Dish Database
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Entries added here apply instantly to the active search database catalog queried on user dashboards.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Food Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masala Paneer Tikka"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Standard Serving Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 plate (150g)"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Kcal</label>
                  <input
                    type="number"
                    required
                    placeholder="Calories"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Prot"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Carb"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Fat"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Meal Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/[0.06] rounded-xl py-2.5 px-4 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch/Dinner">Lunch/Dinner</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Breads">Breads</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-500 font-bold text-xs text-slate-100 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Authorize & Seed Food</span>
                  </button>
                </div>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Analytics Charts */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between">
            <span className="font-outfit text-sm font-bold text-slate-400 uppercase tracking-wider block border-b border-white/[0.04] pb-4">
              Avg Meal Calories Tally
            </span>

            <div className="h-56 w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieDistributionData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="kcal" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <p className="text-[10px] text-slate-500 italic text-center">
              Recharts analytical bar displays representing average calorie profiles per logged meal type.
            </p>
          </GlassCard>
        </div>

      </div>

      {/* Registered User Directory Table */}
      <GlassCard className="p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
          <span className="font-outfit text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            Registered User Directory ({usersList.length} Active Profiles)
          </span>
          <span className="text-[10px] text-slate-500 italic">Centralized local user accounts database table</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 font-mono font-bold uppercase tracking-wider text-[9px]">
                <th className="pb-3 pl-2">User / Avatar</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Signup Date</th>
                <th className="pb-3">Last Login</th>
                <th className="pb-3 pr-2 text-right">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic font-mono">
                    No active user profiles registered yet.
                  </td>
                </tr>
              ) : (
                usersList.map((usr) => (
                  <tr key={usr.user_id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 pl-2 flex items-center space-x-3">
                      <img
                        src={usr.profile_picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(usr.name)}`}
                        alt={usr.name}
                        className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <span className="font-bold text-slate-200">{usr.name}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-300">{usr.email}</td>
                    <td className="py-3 text-slate-400">{usr.created_at ? new Date(usr.created_at).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 text-slate-400">{usr.last_login ? new Date(usr.last_login).toLocaleString() : "N/A"}</td>
                    <td className="py-3 pr-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        usr.authentication_provider === "google"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : usr.authentication_provider === "phone"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {usr.authentication_provider}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Grid: Preloaded Catalog Viewer with delete option */}
      <GlassCard className="p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-4">
          <span className="font-outfit text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-indigo-400" />
            Active Food Database Catalog ({foodCatalog.length} Items)
          </span>
          <span className="text-[10px] text-slate-500 italic">Scroll to inspect database list</span>
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foodCatalog.map((food) => (
              <div
                key={food.id}
                className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/[0.02] flex items-center justify-between group hover:bg-slate-900 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-200">{food.name}</p>
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-slate-800 text-slate-500 px-1 py-0.25 rounded border border-white/5">
                      {food.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Serving: {food.servingSize} • Kcal: {food.calories} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                  </span>
                </div>
                
                <button
                  onClick={() => deleteFoodFromCatalog(food.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete food item from database"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

    </div>
  );
}
