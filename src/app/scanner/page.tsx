"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Camera, Image as ImageIcon, Check, Play, Edit3, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScannerPage() {
  const { user } = useAuth();
  const { logMeal } = useApp();
  const router = useRouter();

  // Screen Sub-States
  const [scanState, setScanState] = useState<"viewport" | "analyzing" | "results">("viewport");
  
  // Results form states
  const [foodName, setFoodName] = useState("Paneer Butter Masala & 2 Wheat Roti");
  const [calories, setCalories] = useState("450");
  const [protein, setProtein] = useState("22");
  const [carbs, setCarbs] = useState("38");
  const [fat, setFat] = useState("14");
  const [servings, setServings] = useState("1");

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) return null;

  const handleCapturePhoto = () => {
    setScanState("analyzing");
    setTimeout(() => {
      setScanState("results");
    }, 2500); // 2.5s simulated Gemini Vision analysis
  };

  const handleGalleryUpload = () => {
    setScanState("analyzing");
    setTimeout(() => {
      setScanState("results");
    }, 2500);
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseInt(calories) || 0;
    const pro = parseInt(protein) || 0;
    const carb = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    const serv = parseFloat(servings) || 1;

    logMeal(
      foodName,
      "Lunch",
      cal,
      pro,
      carb,
      f,
      serv
    );

    // Navigate back to home dashboard
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111827] bg-[#F8F8FA] min-h-screen pb-32">
      
      {/* Brand Header */}
      <div className="text-left">
        <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>📷</span> AI Food Scanner
        </h1>
        <p className="text-xs text-slate-400">
          Powered by Gemini 2.5 Flash Vision. Estimate portion and macros automatically.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: SIMULATED CAMERA VIEWPORT */}
        {scanState === "viewport" && (
          <motion.div
            key="viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Viewport container */}
            <div className="h-96 w-full bg-[#111115] rounded-[32px] overflow-hidden relative flex flex-col justify-between p-6 border-4 border-slate-900 shadow-md">
              <div className="flex justify-between items-center text-white/50 text-[10px] font-mono">
                <span>[ 4K UHD SCANNER ]</span>
                <span className="animate-pulse text-[#14B8A6] font-bold">● REC LIVE</span>
              </div>

              {/* Align grid brackets in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="h-44 w-44 border-2 border-white rounded-2xl" />
              </div>

              {/* Overlay simulation context */}
              <div className="text-center z-10 text-white/60 space-y-1">
                <p className="text-xs font-bold">Simulated Camera Viewport</p>
                <p className="text-[9px] max-w-[200px] mx-auto">
                  Position your plate in the center frame to compute Mifflin macros automatically.
                </p>
              </div>

              {/* Footer capture buttons */}
              <div className="flex justify-around items-center pt-4 z-10">
                {/* Gallery Option */}
                <button
                  onClick={handleGalleryUpload}
                  className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
                  title="Gallery Upload"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>

                {/* Main Capture Trigger */}
                <button
                  onClick={handleCapturePhoto}
                  className="h-16 w-16 rounded-full bg-[#111827] border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Capture Plate"
                >
                  <div className="h-8 w-8 rounded-full bg-[#14B8A6]" />
                </button>

                {/* Manual entry fallback */}
                <button
                  onClick={() => setScanState("results")}
                  className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
                  title="Manual Entry"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: GEMINI AI VISION ANALYZING */}
        {scanState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-96 w-full bg-white border border-slate-100 rounded-[32px] flex flex-col items-center justify-center space-y-6 p-8 text-center shadow-xs"
          >
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="h-7 w-7 text-[#14B8A6] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-md font-extrabold text-slate-800">Gemini 2.5 Flash Vision</h3>
              <p className="text-[10px] text-slate-400 font-mono pulse-light">Parsing plate boundary & estimating Indian staples catalog...</p>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: SHOW EDITABLE ESTIMATION RESULTS */}
        {scanState === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-slate-100 rounded-[32px] p-6 text-left shadow-xs space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">AI Estimation Sheet</span>
                <h3 className="font-outfit text-sm font-extrabold text-slate-800">Confirm Log Details</h3>
              </div>
              <button
                onClick={() => setScanState("viewport")}
                className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-4 text-xs font-bold text-slate-700">
              
              <div className="space-y-1">
                <label>Food Item Description</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Portion (Servings)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label>Total Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px]">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px]">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px]">Fat (g)</label>
                  <input
                    type="number"
                    required
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all text-center flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>Save Meal to Dashboard</span>
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
