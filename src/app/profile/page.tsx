"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { User, Mail, Phone, Scale, ShieldCheck, LogOut, RotateCcw, Heart, Flame, Settings, CloudLightning } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { onboardingData, targets, resetAllData } = useApp();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user || !targets) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleHardReset = () => {
    if (window.confirm("Are you absolutely sure you want to delete your biological profiles, fasting history, and weight logs? This action is permanent.")) {
      resetAllData();
      router.push("/onboarding");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F8F8FA] relative">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#ECECEF]">
        <div className="text-left flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-[#111111]">{user.name}</h1>
            <p className="text-xs text-[#8D8D92] flex items-center gap-1.5 mt-0.5">
              <CloudLightning className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              Cloud Sync: Connected with Google Fit
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors shadow-xs"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Account details & Bio statistics */}
        <div className="md:col-span-5 space-y-6 text-left">
          {/* Account Details Card */}
          <GlassCard className="p-6 space-y-4">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-[#111111]" />
              Account Credentials
            </span>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center bg-[#F8F8FA] border border-[#ECECEF] p-3 rounded-2xl">
                <span className="text-[#8D8D92]">Username</span>
                <span className="font-bold text-[#111111]">{user.name}</span>
              </div>
              <div className="flex justify-between items-center bg-[#F8F8FA] border border-[#ECECEF] p-3 rounded-2xl">
                <span className="text-[#8D8D92] flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</span>
                <span className="font-bold text-[#111111] truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="flex justify-between items-center bg-[#F8F8FA] border border-[#ECECEF] p-3 rounded-2xl">
                <span className="text-[#8D8D92] flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Mobile</span>
                <span className="font-bold text-[#111111]">+91 99887 76655</span>
              </div>
            </div>
          </GlassCard>

          {/* Biological Stats Card */}
          {onboardingData && (
            <GlassCard className="p-6 space-y-4">
              <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <Scale className="h-4 w-4 text-[#111111]" />
                Biological Specs
              </span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                  <span className="text-[#8D8D92] block mb-0.5">Gender</span>
                  <p className="font-bold text-[#111111] capitalize">{onboardingData.gender}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                  <span className="text-[#8D8D92] block mb-0.5">Age</span>
                  <p className="font-bold text-[#111111]">{onboardingData.age} Years</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                  <span className="text-[#8D8D92] block mb-0.5">Height</span>
                  <p className="font-bold text-[#111111]">{onboardingData.height} cm</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                  <span className="text-[#8D8D92] block mb-0.5">Weight</span>
                  <p className="font-bold text-[#111111]">{onboardingData.currentWeight} kg</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Goal limits override & resets */}
        <div className="md:col-span-7 space-y-6 text-left">
          {/* Target Limits Overview */}
          <GlassCard glow glowColor="primary" className="p-6 md:p-8 space-y-4">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Flame className="h-4 w-4 text-purple-500 animate-pulse" />
              Calculated Calorie & Macro Target Limits
            </span>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#8D8D92] block mb-0.5">Calorie Intake</span>
                <p className="text-xl font-extrabold text-purple-600 font-outfit">{targets.targetCalories} kcal</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-[#ECECEF]">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#8D8D92] block mb-0.5">Target BMI</span>
                <p className="text-xl font-extrabold text-[#111111] font-outfit">{targets.bmi} ({targets.bmiCategory})</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs border-t border-[#F1F1F4] pt-4">
              <div>
                <span className="text-[#8D8D92] block mb-0.5">Protein</span>
                <p className="font-bold text-[#111111]">{targets.targetProtein}g</p>
              </div>
              <div>
                <span className="text-[#8D8D92] block mb-0.5">Carbs</span>
                <p className="font-bold text-[#111111]">{targets.targetCarbs}g</p>
              </div>
              <div>
                <span className="text-[#8D8D92] block mb-0.5">Fat</span>
                <p className="font-bold text-[#111111]">{targets.targetFat}g</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => router.push("/settings")}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#ECECEF] bg-[#F8F8FA] text-[10px] font-bold text-[#8D8D92] hover:bg-slate-50 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Adjust Macro Ratios</span>
              </button>
            </div>
          </GlassCard>

          {/* Danger zone */}
          <GlassCard className="p-6 border-rose-100 bg-rose-50/20 space-y-4">
            <span className="font-outfit text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100/50 pb-2">
              <RotateCcw className="h-4 w-4" />
              Danger Zone Operations
            </span>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Clear Cache & Reset Profiles</p>
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
