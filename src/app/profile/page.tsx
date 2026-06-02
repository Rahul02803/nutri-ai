"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { User, Mail, Phone, Scale, Award, Heart, Shield, LogOut, Edit2, Check, X } from "lucide-react";
import { OnboardingData } from "@/lib/calculations";
import { AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, logout, updateUserOnboardStatus } = useAuth();
  const { onboardingData, weightLogs, targets, saveOnboarding } = useApp();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form States
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("24");
  const [editGender, setEditGender] = useState<OnboardingData["gender"]>("male");
  const [editHeight, setEditHeight] = useState("175");
  const [editWeight, setEditWeight] = useState("75");
  const [editTargetWeight, setEditTargetWeight] = useState("70");
  const [editGoal, setEditGoal] = useState<OnboardingData["goal"]>("maintain");
  const [editActivity, setEditActivity] = useState<OnboardingData["activityLevel"]>("moderate");

  // Populate form states when editing starts or onboardingData changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
    }
    if (onboardingData) {
      setEditAge(onboardingData.age.toString());
      setEditGender(onboardingData.gender);
      setEditHeight(onboardingData.height.toString());
      setEditWeight(onboardingData.currentWeight.toString());
      setEditTargetWeight(onboardingData.targetWeight.toString());
      setEditGoal(onboardingData.goal);
      setEditActivity(onboardingData.activityLevel);
    }
  }, [onboardingData, user, isEditing]);

  if (!user) return null;

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : onboardingData?.currentWeight || 75;

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedData: OnboardingData = {
      gender: editGender,
      age: parseInt(editAge) || 25,
      height: parseInt(editHeight) || 170,
      currentWeight: parseFloat(editWeight) || 75,
      targetWeight: parseFloat(editTargetWeight) || 70,
      goal: editGoal,
      activityLevel: editActivity,
      // preserve other onboarding properties
      workoutFrequency: onboardingData?.workoutFrequency || "3 days/week",
      fitnessExperience: onboardingData?.fitnessExperience || "Beginner",
      dietPreference: onboardingData?.dietPreference || "vegetarian",
      allergies: onboardingData?.allergies || [],
      mealsPerDay: onboardingData?.mealsPerDay || 3,
      timeline: onboardingData?.timeline || "12 weeks",
      challenge: onboardingData?.challenge || "Consistency",
      dreamPhysique: onboardingData?.dreamPhysique || (editGoal === "lose_fat" ? "Lean & Toned" : "Athletic"),
      goalSpeed: onboardingData?.goalSpeed || "moderate"
    };

    saveOnboarding(updatedData);
    await updateUserOnboardStatus(true, editName);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-8 space-y-8 text-black bg-[#FFFFFF] min-h-screen pb-36 font-inter selection:bg-black/10 select-none">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 font-mono">ZenLog Settings</span>
          <h1 className="text-2xl font-black tracking-tight font-outfit mt-0.5 text-black">Profile</h1>
        </div>
        
        {/* Toggle Edit Button */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-black text-black hover:bg-slate-100 transition-all"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleSave} className="space-y-6 text-xs font-bold text-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
            
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Display Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none focus:border-slate-300 font-bold text-black text-sm"
              />
            </div>

            {/* Age, Height, Current Weight */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Age</label>
                <input
                  type="number"
                  required
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Height (cm)</label>
                <input
                  type="number"
                  required
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Weight (kg)</label>
                <input
                  type="number"
                  required
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
                />
              </div>
            </div>

            {/* Target Weight & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Target Weight (kg)</label>
                <input
                  type="number"
                  required
                  value={editTargetWeight}
                  onChange={(e) => setEditTargetWeight(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Gender</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as any)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Transformation Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Transformation Goal</label>
              <select
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value as any)}
                className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
              >
                <option value="lose_fat">Lose Weight (Cut)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain_muscle">Gain Muscle (Bulk)</option>
                <option value="body_recomp">Body Recomposition</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Activity Level</label>
              <select
                value={editActivity}
                onChange={(e) => setEditActivity(e.target.value as any)}
                className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 px-4 focus:outline-none text-black text-sm font-extrabold"
              >
                <option value="sedentary">Sedentary (No workouts)</option>
                <option value="light">Lightly Active (1-2 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
                <option value="extreme">Athlete (Intense training)</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-4 rounded-[20px] border border-slate-200 bg-white text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all flex items-center justify-center space-x-1.5"
              >
                <X className="h-4.5 w-4.5" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="w-full py-4 rounded-[20px] bg-black text-white font-extrabold text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5"
              >
                <Check className="h-4.5 w-4.5" />
                <span>Save Profile</span>
              </button>
            </div>

          </form>
        ) : (
          /* DISPLAY READ-ONLY PROFILE CARD */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. PROFILE PROFILE CARD */}
            <div className="bg-[#F4F4F5] rounded-[24px] p-6 flex items-center space-x-4 relative overflow-hidden text-left">
              <div className="h-16 w-16 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || "ZenLog")}`}
                  alt="Avatar"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
              
              <div className="text-left space-y-0.5">
                <h3 className="text-lg font-black text-black font-outfit">{user.name}</h3>
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block font-mono">
                  🍃 ZenLog Premium Member
                </span>
              </div>
            </div>

            {/* 2. BIOLOGICAL PARAMETERS DIRECTORY */}
            <div className="bg-[#F4F4F5] rounded-[24px] p-6 text-left space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 block font-mono">Biological Parameters</span>
              
              <div className="space-y-3.5 text-xs font-bold text-slate-700">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Mail className="h-4 w-4" /> Email</span>
                  <span className="text-slate-800 font-mono text-[11px]">{user.email}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Phone className="h-4 w-4" /> Auth Protocol</span>
                  <span className="text-slate-800">Google OAuth 2.0 Secure</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Scale className="h-4 w-4" /> Target Weight</span>
                  <span className="text-slate-800">{onboardingData?.targetWeight || 70} kg (Current: {currentWeight}kg)</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Award className="h-4 w-4" /> Transformation Goal</span>
                  <span className="text-slate-800 capitalize">{onboardingData?.goal?.replace("_", " ") || "Lose Weight"}</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">⚡ Daily Calorie Target</span>
                  <span className="text-black font-mono font-extrabold">{targets?.targetCalories || 2000} kcal</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">🥩 Daily Protein Goal</span>
                  <span className="text-slate-800 font-mono font-extrabold">{targets?.targetProtein || 140} g</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Heart className="h-4 w-4" /> Food Preference</span>
                  <span className="text-slate-800 capitalize">{onboardingData?.dietPreference || "Vegetarian"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5"><Shield className="h-4 w-4" /> Activity Level</span>
                  <span className="text-slate-800 capitalize">{onboardingData?.activityLevel || "Moderately Active"}</span>
                </div>
              </div>
            </div>

            {/* 3. CLINICAL LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-[20px] border border-rose-200 bg-rose-50 text-rose-600 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm hover:bg-rose-100"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Logout ZenLog Session</span>
            </button>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
