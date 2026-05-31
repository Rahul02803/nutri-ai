"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { User, Mail, Phone, Scale, Award, Heart, Shield, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { onboardingData, weightLogs } = useApp();
  const router = useRouter();

  if (!user) return null;

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : onboardingData?.currentWeight || 75;

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111827] bg-[#F8F8FA] min-h-screen pb-32">
      
      {/* Title Header */}
      <div className="text-left">
        <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>👤</span> ZenLog Account
        </h1>
        <p className="text-xs text-slate-400">
          Manage your biological profile properties, coaching settings, and sessions.
        </p>
      </div>

      {/* 1. PROFILE PROFILE CARD */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center space-x-4 relative overflow-hidden">
        <div className="h-16 w-16 rounded-full bg-slate-100 border flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || "ZenLog")}`}
            alt="Avatar"
            className="h-14 w-14 rounded-full object-cover"
          />
        </div>
        
        <div className="text-left space-y-0.5">
          <h3 className="text-lg font-extrabold text-slate-800 font-outfit">{user.name}</h3>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
            🍃 ZenLog Premium Member
          </span>
        </div>
      </div>

      {/* 2. BIOLOGICAL PARAMETERS DIRECTORY */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left space-y-4">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">Biological Parameters</span>
        
        <div className="space-y-3 text-xs font-bold text-slate-700">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Mail className="h-4 w-4" /> Email</span>
            <span className="text-slate-800 font-mono text-[11px]">{user.email}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Phone className="h-4 w-4" /> Auth Protocol</span>
            <span className="text-slate-800">Google OAuth 2.0 Secure</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Scale className="h-4 w-4" /> Target Weight</span>
            <span className="text-slate-800">{onboardingData?.targetWeight || 70} kg (Current: {currentWeight}kg)</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Award className="h-4 w-4" /> Transformation Goal</span>
            <span className="text-slate-800 capitalize">{onboardingData?.goal?.replace("_", " ") || "Lose Weight"}</span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5"><Heart className="h-4 w-4" /> Food Preference</span>
            <span className="text-slate-800 capitalize">{onboardingData?.dietPreference || "Vegetarian"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5"><Shield className="h-4 w-4" /> Activity Level</span>
            <span className="text-slate-800 capitalize">{onboardingData?.activityLevel || "Moderately Active"}</span>
          </div>
        </div>
      </div>

      {/* 3. SETTINGS BLOCKS */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left space-y-4">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">App Configurations</span>
        
        <div className="space-y-3.5 text-xs font-bold text-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-800">Push Notifications</p>
              <span className="text-[9px] text-slate-400 font-normal">Receive meal reminders</span>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#14B8A6]" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-800">Privacy Sync Mode</p>
              <span className="text-[9px] text-slate-400 font-normal">Isolate credentials per session</span>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#14B8A6]" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-800">Coaching Language</p>
              <span className="text-[9px] text-slate-400 font-normal">Select coach voice</span>
            </div>
            <span className="text-slate-400 font-bold">English (US)</span>
          </div>
        </div>
      </div>

      {/* 4. CLINICAL LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-3xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-xs"
      >
        <LogOut className="h-4.5 w-4.5" />
        <span>Logout ZenLog Session</span>
      </button>

    </div>
  );
}
