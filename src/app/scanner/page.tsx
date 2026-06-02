"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Camera, Image as ImageIcon, Check, Play, Edit3, X, Sparkles, Key, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ScannedFoodItem {
  id: string;
  name: string;
  estimatedWeightG: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: number;
  servings: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}

export default function ScannerPage() {
  const { user } = useAuth();
  const { logMeal } = useApp();
  const router = useRouter();

  // Screen Sub-States
  const [scanState, setScanState] = useState<"viewport" | "analyzing" | "results">("viewport");
  const [clientApiKey, setClientApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Scanned foods result list
  const [scannedFoods, setScannedFoods] = useState<ScannedFoodItem[]>([]);

  // Confidence & Warning
  const [confidence, setConfidence] = useState(1);
  const [lowConfidenceWarning, setLowConfidenceWarning] = useState(false);

  // Error/Info Banner States
  const [errorText, setErrorText] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load client API key from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("zenlog_client_gemini_api_key");
      if (savedKey) {
        setClientApiKey(savedKey);
        setIsKeySaved(true);
      }
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) return null;

  const saveApiKeyToLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("zenlog_client_gemini_api_key", clientApiKey);
      setIsKeySaved(true);
      setShowKeyInput(false);
    }
  };

  const handleClearApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zenlog_client_gemini_api_key");
      setClientApiKey("");
      setIsKeySaved(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    setErrorText(null);
    setScanState("analyzing");

    // Convert file to base64 string
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setBase64Image(base64);
      await performGeminiScan(base64, file.type);
    };
    reader.onerror = () => {
      setErrorText("Failed to read image file.");
      setScanState("viewport");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const performGeminiScan = async (base64Str: string, fileType: string) => {
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Str,
          mimeType: fileType,
          clientApiKey: clientApiKey || undefined
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to scan image.");
      }

      if (resData.success && resData.foods) {
        const list = resData.foods.map((f: any) => ({
          ...f,
          servings: 1,
          baseCalories: f.calories,
          baseProtein: f.protein,
          baseCarbs: f.carbs,
          baseFat: f.fat
        }));
        setScannedFoods(list);

        // Compute average confidence
        const totalConf = list.reduce((sum: number, f: any) => sum + (f.confidence || 0.8), 0);
        const avgConf = list.length > 0 ? (totalConf / list.length) : 0.8;
        setConfidence(avgConf);
        setLowConfidenceWarning(avgConf < 0.70);
        setScanState("results");
      } else {
        throw new Error("Unable to parse food nutrition details from image.");
      }

    } catch (e: any) {
      console.error(e);
      setErrorText(e?.message || "Visual scanning error. Make sure your Gemini API key is correct.");
      setScanState("viewport");
    }
  };

  const handleUpdateServings = (idx: number, val: string) => {
    const factor = parseFloat(val) || 0;
    setScannedFoods(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        servings: factor,
        calories: Math.round(updated[idx].baseCalories * factor),
        protein: Math.round(updated[idx].baseProtein * factor * 10) / 10,
        carbs: Math.round(updated[idx].baseCarbs * factor * 10) / 10,
        fat: Math.round(updated[idx].baseFat * factor * 10) / 10
      };
      return updated;
    });
  };

  const handleUpdateName = (idx: number, name: string) => {
    setScannedFoods(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        name
      };
      return updated;
    });
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannedFoods.length === 0) return;

    scannedFoods.forEach((food) => {
      logMeal(
        food.name,
        "Lunch",
        food.baseCalories,
        food.baseProtein,
        food.baseCarbs,
        food.baseFat,
        food.servings
      );
    });

    router.push("/dashboard");
  };

  return (
    <div className="relative flex flex-col justify-between bg-black text-white min-h-screen font-inter select-none overflow-hidden pb-12">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: FULL SCREEN CAMERA VIEWPORT */}
        {scanState === "viewport" && (
          <motion.div
            key="viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-6 z-10"
          >
            {/* Top Row: Close and Key Setup */}
            <div className="flex justify-between items-center pt-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/5 active:scale-95 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                  isKeySaved 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-white/10 border-white/5 text-white"
                }`}
              >
                <Key className="h-5 w-5" />
              </button>
            </div>

            {/* API Key Configuration Card */}
            <AnimatePresence>
              {showKeyInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 z-50 absolute left-6 right-6 top-20"
                >
                  <form onSubmit={saveApiKeyToLocal} className="bg-neutral-900 border border-neutral-800 p-5 rounded-[24px] text-xs font-bold text-slate-300 space-y-3 shadow-2xl">
                    <div className="flex justify-between items-center text-white uppercase tracking-wider font-mono text-[9px]">
                      <span>Gemini API Key Setup</span>
                      {isKeySaved && (
                        <button type="button" onClick={handleClearApiKey} className="text-rose-400 font-extrabold lowercase hover:underline">
                          Clear Saved Key
                        </button>
                      )}
                    </div>

                    <input
                      type="password"
                      required
                      value={clientApiKey}
                      onChange={(e) => setClientApiKey(e.target.value)}
                      placeholder="Paste your API key starting with AIzaSy..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 focus:outline-none text-white text-xs"
                    />

                    <button
                      type="submit"
                      className="w-full py-3 bg-white text-black rounded-xl font-black hover:bg-neutral-200 text-center uppercase tracking-wider font-mono text-[10px]"
                    >
                      Save key to browser
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications */}
            {errorText && (
              <div className="absolute left-6 right-6 top-24 rounded-2xl bg-rose-950/80 border border-rose-900/50 backdrop-blur-md p-4 text-xs text-left flex items-start space-x-2.5 text-rose-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-rose-100">Scan Failed</p>
                  <p className="text-[10px] text-rose-300 mt-0.5 leading-relaxed">{errorText}</p>
                </div>
              </div>
            )}

            {/* Central scanning brackets */}
            <div className="flex-grow flex items-center justify-center pointer-events-none opacity-30 my-16">
              <div className="relative h-64 w-64 border-2 border-dashed border-white rounded-[32px] flex items-center justify-center">
                <div className="h-10 w-10 border-t-2 border-l-2 border-white absolute top-0 left-0 rounded-tl-xl" />
                <div className="h-10 w-10 border-t-2 border-r-2 border-white absolute top-0 right-0 rounded-tr-xl" />
                <div className="h-10 w-10 border-b-2 border-l-2 border-white absolute bottom-0 left-0 rounded-bl-xl" />
                <div className="h-10 w-10 border-b-2 border-r-2 border-white absolute bottom-0 right-0 rounded-br-xl" />
              </div>
            </div>

            {/* Bottom Shutter Row */}
            <div className="flex justify-around items-center pb-8">
              {/* Gallery upload */}
              <button
                onClick={triggerFileInput}
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-white flex items-center justify-center active:scale-95 transition-all"
                title="Gallery Upload"
              >
                <ImageIcon className="h-5.5 w-5.5" />
              </button>

              {/* Shutter button */}
              <button
                onClick={triggerFileInput}
                className="h-20 w-20 rounded-full bg-transparent border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                title="Capture Plate"
              >
                <div className="h-14 w-14 rounded-full bg-white" />
              </button>

              {/* Manual input fallback */}
              <button
                onClick={() => {
                  setScannedFoods([
                    {
                      id: "manual-entry-1",
                      name: "Custom Meal",
                      estimatedWeightG: 150,
                      calories: 320,
                      protein: 10,
                      carbs: 45,
                      fat: 8,
                      servingSize: "150g",
                      confidence: 1.0,
                      servings: 1,
                      baseCalories: 320,
                      baseProtein: 10,
                      baseCarbs: 45,
                      baseFat: 8
                    }
                  ]);
                  setScanState("results");
                }}
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-white flex items-center justify-center active:scale-95 transition-all"
                title="Manual Entry"
              >
                <Edit3 className="h-5.5 w-5.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: AI VISION ANALYZING */}
        {scanState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-6 p-8 text-center"
          >
            <div className="relative h-24 w-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-lg font-black text-white uppercase tracking-wider font-mono text-sm">ZenLog AI Vision</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest animate-pulse">Detecting food items & estimating portion weight...</p>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: SHOW EDITABLE ESTIMATION RESULTS */}
        {scanState === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute inset-x-0 bottom-0 bg-white text-black rounded-t-[40px] p-8 space-y-6 shadow-2xl z-20 max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 font-mono">AI Food Scanner</span>
                <h3 className="font-outfit text-xl font-black text-black">Confirm Portion & Weight</h3>
              </div>
              <button
                onClick={() => setScanState("viewport")}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Low Confidence warning block */}
            {lowConfidenceWarning && (
              <div className="p-4 rounded-[20px] bg-amber-50 border border-amber-100 flex items-start space-x-2.5 text-amber-800 text-xs shrink-0">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-extrabold text-amber-900">Estimation confidence low ({Math.round(confidence * 100)}%)</p>
                  <p className="text-amber-700 mt-1 leading-relaxed">
                    Verify portion weight and description carefully before saving.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveMeal} className="space-y-6 text-xs font-bold text-slate-700 overflow-y-auto pr-1 flex-grow pb-8">
              {scannedFoods.map((food, idx) => (
                <div key={food.id || idx} className="p-4 rounded-[24px] bg-[#F4F4F5] border border-slate-100 space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                      Item #{idx + 1} ({Math.round(food.confidence * 100)}% Match)
                    </span>
                    <button
                      type="button"
                      onClick={() => setScannedFoods(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Food Description</label>
                    <input
                      type="text"
                      required
                      value={food.name}
                      onChange={(e) => handleUpdateName(idx, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 font-bold text-black text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Portions</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={food.servings}
                        onChange={(e) => handleUpdateServings(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-black text-xs font-extrabold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Weight (Est)</label>
                      <div className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 px-3 text-slate-500 text-xs font-mono font-bold">
                        {Math.round(food.estimatedWeightG * food.servings)}g
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Calories</label>
                      <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl py-2.5 px-3 text-emerald-600 text-xs font-black font-mono">
                        {food.calories} kcal
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50">
                    <div className="text-center text-[10px] text-slate-500">
                      🥩 Pro: <span className="font-extrabold text-black">{food.protein}g</span>
                    </div>
                    <div className="text-center text-[10px] text-slate-500">
                      🌾 Carb: <span className="font-extrabold text-black">{food.carbs}g</span>
                    </div>
                    <div className="text-center text-[10px] text-slate-500">
                      🥑 Fat: <span className="font-extrabold text-black">{food.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                id="btn-save-scanned-meals"
                className="w-full py-4 rounded-[20px] bg-black text-white font-extrabold hover:bg-slate-800 transition-all text-center flex items-center justify-center space-x-2 text-sm mt-4 shadow-md shrink-0"
              >
                <Check className="h-5 w-5" />
                <span>Save {scannedFoods.length} Items to Dashboard</span>
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
