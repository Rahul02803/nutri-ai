"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Camera, Image as ImageIcon, Check, Play, Edit3, X, Sparkles, Key, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScannerPage() {
  const { user } = useAuth();
  const { logMeal } = useApp();
  const router = useRouter();

  // Screen Sub-States
  const [scanState, setScanState] = useState<"viewport" | "analyzing" | "results">("viewport");
  const [clientApiKey, setClientApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Results form states
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("0");
  const [protein, setProtein] = useState("0");
  const [carbs, setCarbs] = useState("0");
  const [fat, setFat] = useState("0");
  const [servings, setServings] = useState("1");
  const [unit, setUnit] = useState("serving");

  // Base values for live macro recalculations
  const [baseCalories, setBaseCalories] = useState(0);
  const [baseProtein, setBaseProtein] = useState(0);
  const [baseCarbs, setBaseCarbs] = useState(0);
  const [baseFat, setBaseFat] = useState(0);

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

  // Live macro scaling when servings or portion is edited
  useEffect(() => {
    const factor = parseFloat(servings) || 0;
    setCalories(Math.round(baseCalories * factor).toString());
    setProtein(Math.round(baseProtein * factor).toString());
    setCarbs(Math.round(baseCarbs * factor).toString());
    setFat(Math.round(baseFat * factor).toString());
  }, [servings, baseCalories, baseProtein, baseCarbs, baseFat]);

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

      if (resData.success && resData.data) {
        const parsed = resData.data;
        const conf = parsed.confidence !== undefined ? parsed.confidence : 1;

        setFoodName(parsed.foodName || "Estimated Meal");
        setBaseCalories(parsed.calories || 300);
        setBaseProtein(parsed.protein || 10);
        setBaseCarbs(parsed.carbs || 35);
        setBaseFat(parsed.fat || 8);
        setConfidence(conf);
        setLowConfidenceWarning(conf < 0.70); // <70% triggers warning block
        setServings("1");
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

    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111827] bg-[#F8F8FA] min-h-screen pb-32">
      
      {/* Brand Header */}
      <div className="text-left flex justify-between items-start">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📷</span> AI Food Scanner
          </h1>
          <p className="text-xs text-slate-400">
            Powered by live Gemini 1.5 Flash Vision.
          </p>
        </div>

        {/* API Key Toggle Indicator */}
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
            isKeySaved 
              ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
              : "bg-amber-50 text-amber-600 border-amber-200"
          }`}
          title="Configure Gemini API Key"
        >
          <Key className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* API Key Configuration Dropdown */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={saveApiKeyToLocal} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs text-xs font-bold text-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span>Gemini API Key Setup</span>
                {isKeySaved && (
                  <button type="button" onClick={handleClearApiKey} className="text-rose-500 text-[10px] hover:underline">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 text-center"
              >
                Save key to browser
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error notification banner */}
      {errorText && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3.5 text-xs text-left flex items-start space-x-2 text-rose-700">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Scan Failed</p>
            <p className="text-[10px] text-rose-600 mt-0.5">{errorText}</p>
            {!isKeySaved && (
              <button 
                onClick={() => setShowKeyInput(true)} 
                className="text-[10px] text-[#14B8A6] font-bold underline mt-1 block"
              >
                Configure your Gemini API Key first
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: CAMERA VIEWPORT */}
        {scanState === "viewport" && (
          <motion.div
            key="viewport"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="h-96 w-full bg-[#111115] rounded-[32px] overflow-hidden relative flex flex-col justify-between p-6 border-4 border-slate-900 shadow-md">
              <div className="flex justify-between items-center text-white/50 text-[10px] font-mono">
                <span>[ 4K MULTIMODAL SCAN ]</span>
                <span className="animate-pulse text-[#14B8A6] font-bold">● ONLINE READY</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="h-44 w-44 border-2 border-white rounded-2xl" />
              </div>

              <div className="text-center z-10 text-white/60 space-y-1">
                <p className="text-xs font-bold">ZenLog Visual Assessment</p>
                <p className="text-[9px] max-w-[200px] mx-auto">
                  Click gallery or capture to feed base64 image data directly to Google Generative AI endpoints.
                </p>
              </div>

              <div className="flex justify-around items-center pt-4 z-10">
                <button
                  onClick={triggerFileInput}
                  className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
                  title="Gallery Upload"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={triggerFileInput}
                  className="h-16 w-16 rounded-full bg-[#111827] border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Capture Plate"
                >
                  <div className="h-8 w-8 rounded-full bg-[#3B82F6]" />
                </button>

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

        {/* VIEW 2: AI VISION ANALYZING */}
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
              <Sparkles className="h-7 w-7 text-[#3B82F6] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-md font-extrabold text-slate-800">Gemini 1.5 Flash Vision</h3>
              <p className="text-[10px] text-slate-400 font-mono pulse-light">Scanning food items & matching against nutrition database...</p>
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

            {/* Low Confidence warning block */}
            {lowConfidenceWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start space-x-2.5 text-amber-800 text-[10.5px]">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-extrabold">Not Fully Confident ({Math.round(confidence * 100)}%)</p>
                  <p className="text-amber-700 mt-0.5 leading-relaxed">
                    We are not fully confident. Please confirm or correct the food selection below.
                  </p>
                </div>
              </div>
            )}

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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label>Serving Size</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label>Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 focus:outline-none font-bold"
                  >
                    <option value="serving">serving</option>
                    <option value="grams">g</option>
                    <option value="bowl">bowl</option>
                    <option value="plate">plate</option>
                    <option value="pieces">pcs</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <label>Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none font-mono"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px]">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px]">Fat (g)</label>
                  <input
                    type="number"
                    required
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 focus:outline-none text-center font-mono"
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
