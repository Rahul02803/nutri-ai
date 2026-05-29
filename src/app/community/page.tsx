"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { Users, Award, Flame, Heart, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard" | "groups">("feed");

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user) return null;

  const mockFeed = [
    {
      id: "f1",
      name: "Abhishek Sharma",
      badge: "🏅 Elite tracker",
      action: "logged a meal",
      detail: "Double Egg Bhurji with Roti 🍳",
      calories: 320,
      protein: 22,
      time: "20m ago",
      likes: 12,
      comments: 2
    },
    {
      id: "f2",
      name: "Sneha Patel",
      badge: "⏳ Fasting Pro",
      action: "completed a fast",
      detail: "Completed a 16:8 Lean Fast cycle!",
      calories: 0,
      protein: 0,
      time: "1h ago",
      likes: 24,
      comments: 4
    },
    {
      id: "f3",
      name: "James Miller",
      badge: "💪 Iron Will",
      action: "logged a workout",
      detail: "Lower Body strength session (45 mins)",
      calories: 320,
      protein: 0,
      time: "3h ago",
      likes: 8,
      comments: 1
    }
  ];

  const mockLeaderboard = [
    { rank: 1, name: "Rahul Sharma (You)", score: "96%", streak: 12, icon: "🥇" },
    { rank: 2, name: "Sneha Patel", score: "94%", streak: 9, icon: "🥈" },
    { rank: 3, name: "Vikram Malhotra", score: "91%", streak: 7, icon: "🥉" },
    { rank: 4, name: "Priya Rao", score: "89%", streak: 5, icon: "4" },
    { rank: 5, name: "Amit Gupta", score: "88%", streak: 3, icon: "5" }
  ];

  const mockGroups = [
    { name: "Low-Carb Staple Fans 🌾", members: 4200, desc: "Swapping rice with cauliflower and finding rich alternatives.", joined: true },
    { name: "16:8 Fasting Warriors ⏳", members: 8900, desc: "Motivating each other through daily circadian fasting windows.", joined: false },
    { name: "High-Protein Indian Vegetarians 🥦", members: 12500, desc: "Sharing recipe hacks for tofu, soya, paneer and dals.", joined: true }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-[#F8F8FA] relative">
      
      {/* Title Panel */}
      <div className="text-left border-b border-[#ECECEF] pb-4 flex justify-between items-center">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-[#111111] flex items-center gap-2">
            Community Hub <Users className="h-6 w-6 text-purple-500 animate-pulse" />
          </h1>
          <p className="text-sm text-[#8D8D92]">Interact, compare scores, and share meal insights with elite members</p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-white border border-[#ECECEF] max-w-md mx-auto">
        {[
          { id: "feed", label: "Social Feed" },
          { id: "leaderboard", label: "Leaderboard" },
          { id: "groups", label: "Groups" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-[#111111] text-white shadow-xs"
                : "text-[#8D8D92] hover:text-[#111111]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Viewport */}
      <div className="space-y-4">
        {/* 1. Social Feed Tab */}
        {activeTab === "feed" && (
          <div className="space-y-4 max-w-xl mx-auto text-left">
            {mockFeed.map((item) => (
              <GlassCard key={item.id} className="p-5 space-y-4 bg-white border border-[#ECECEF] rounded-[24px]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                        {item.name} <span className="text-[10px] font-normal text-[#8D8D92]">{item.badge}</span>
                      </h4>
                      <span className="text-[9px] text-[#8D8D92] block">{item.time} • {item.action}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF] text-xs font-semibold text-[#111111] flex justify-between items-center">
                  <span>{item.detail}</span>
                  {item.calories > 0 && <span className="text-purple-600 font-bold font-mono">{item.calories} kcal</span>}
                </div>

                <div className="flex items-center space-x-4 text-xs font-bold text-[#8D8D92] border-t border-[#F1F1F4] pt-3">
                  <button className="flex items-center space-x-1 hover:text-rose-500">
                    <Heart className="h-4 w-4" />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-purple-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{item.comments}</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* 2. Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="max-w-xl mx-auto">
            <GlassCard className="p-6 space-y-4 bg-white border border-[#ECECEF] rounded-[28px] text-left">
              <span className="font-outfit text-xs font-bold text-[#8D8D92] uppercase block tracking-wider border-b border-[#F1F1F4] pb-2 flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-500" /> Weekly Adherence Rankings
              </span>

              <div className="space-y-2">
                {mockLeaderboard.map((item) => (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-2xl border flex justify-between items-center transition-all ${
                      item.rank === 1
                        ? "bg-purple-50/50 border-purple-200"
                        : "bg-[#F8F8FA] border-[#ECECEF]"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold w-5 text-center">{item.icon}</span>
                      <span className="text-xs font-bold text-[#111111]">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-[#8D8D92]">Streak: <strong className="text-[#111111] font-mono">{item.streak}d</strong></span>
                      <span className="font-bold text-purple-600 font-mono">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* 3. Groups Tab */}
        {activeTab === "groups" && (
          <div className="space-y-4 max-w-xl mx-auto text-left">
            {mockGroups.map((group, idx) => (
              <GlassCard key={idx} className="p-5 space-y-3 bg-white border border-[#ECECEF] rounded-[24px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">{group.name}</h4>
                    <span className="text-[9px] text-[#8D8D92] font-mono">{group.members.toLocaleString()} members joined</span>
                  </div>
                  <button
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                      group.joined
                        ? "bg-slate-100 border-[#ECECEF] text-[#8D8D92]"
                        : "bg-[#111111] border-[#111111] text-white hover:scale-[1.01]"
                    }`}
                  >
                    {group.joined ? "Joined" : "+ Join Group"}
                  </button>
                </div>
                <p className="text-[11px] text-[#8D8D92] leading-relaxed italic">{group.desc}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
