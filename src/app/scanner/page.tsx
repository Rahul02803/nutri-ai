"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ChevronLeft, 
  Scale, 
  Check, 
  Flame,
  ArrowRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { visualMealPhotoScan } from "@/lib/foodSearchService";

export default function ScannerPage() {
  const { user } = useAuth();
  const { logMeal } = useApp();
  const router = useRouter();

  // Navigation Protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  // Scanner UI States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState("");
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [logMealType, setLogMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");
  const [portionServings, setPortionServings] = useState("1");

  if (!user) return null;

  // Handles simulated snapping of meals (Egg bhurji, Salad, Burger, Pizza)
  const handleSimulateSnap = (mealKeyword: string) => {
    let mockImg = "";
    let mockName = "";
    if (mealKeyword === "salad") {
      mockImg = "Salad Photo Uploaded";
      mockName = "salad_plate_2026.jpg";
    } else if (mealKeyword === "pizza") {
      mockImg = "Pizza Photo Uploaded";
      mockName = "pepperoni_pizza_slice.jpg";
    } else if (mealKeyword === "burger") {
      mockImg = "Burger Photo Uploaded";
      mockName = "double_cheeseburger_combo.jpg";
    } else {
      mockImg = "Scrambled Eggs Photo Uploaded";
      mockName = "scrambled_eggs_toast.jpg";
    }
    
    setSelectedImage(mockImg);
    setSelectedImageName(mockName);
    triggerScanSequence(mockImg, mockName);
  };

  // Handles direct file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedImageName(file.name);
        triggerScanSequence(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Visual Scanning Animations
  const triggerScanSequence = async (imgData: string, imgName: string) => {
    setIsScanning(true);
    setShowAnalysisResults(false);
    setPortionServings("1");

    const steps = [
      "📷 Initializing camera sensors...",
      "🔍 Identifying visual food boundaries...",
      "🧠 Fetching clinical portions context...",
      "📊 Calibrating exact calorie & micro metrics..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStepText(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    try {
      const data = await visualMealPhotoScan(imgData, imgName);
      setAnalysisData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
      setShowAnalysisResults(true);
    }
  };

  const handleConfirmLog = () => {
    if (!analysisData) return;
    const scale = parseFloat(portionServings) || 1;

    // Build micro details object
    const extraMetrics = {
      fiber: analysisData.fiber,
      sugar: analysisData.sugar,
      sodium: analysisData.sodium,
      potassium: analysisData.potassium,
      vitaminA: analysisData.vitaminA,
      vitaminC: analysisData.vitaminC,
      calcium: analysisData.calcium,
      iron: analysisData.iron
    };

    logMeal(
      `${analysisData.name} (AI Scan)`,
      logMealType,
      analysisData.calories,
      analysisData.protein,
      analysisData.carbs,
      analysisData.fat,
      scale,
      extraMetrics
    );

    router.push("/dashboard");
  };

  const handleResetScanner = () => {
    setSelectedImage(null);
    setSelectedImageName("");
    setShowAnalysisResults(false);
    setAnalysisData(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-white relative">
      
      {/* Header Panel */}
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-900 flex items-center gap-2">
            AI Meal Photo Scanner <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400">Identify meals, estimate weights, and log macros automatically using visual intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Viewfinder & Action Snap selectors */}
        <div className="md:col-span-6 space-y-6">
          
          <GlassCard glow glowColor="emerald" className="p-4 flex flex-col items-center justify-center relative overflow-hidden h-[360px]">
            {selectedImage ? (
              /* Image display area */
              <div className="h-full w-full relative flex flex-col justify-center items-center">
                {selectedImage.startsWith("data:") ? (
                  // Real base64 upload
                  <img src={selectedImage} alt="Logged Meal" className="h-64 w-full object-cover rounded-2xl shadow-sm" />
                ) : (
                  // Seeded simulation display
                  <div className="h-64 w-full bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3 p-4 text-center">
                    <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 animate-bounce">
                      <Camera className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{selectedImageName}</p>
                      <span className="text-[10px] text-slate-400">High-Fidelity AI Capture Active</span>
                    </div>
                  </div>
                )}
                
                {/* Visual scanner pulses overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin" />
                      <Sparkles className="h-7 w-7 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs font-mono text-emerald-600 animate-pulse font-bold">{scanStepText}</p>
                    <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.4, repeat: Infinity }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Viewfinder placeholder when empty */
              <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Camera className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Camera Viewfinder Active</p>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Upload an image of your plate or choose a demo quick-snaps preset below to test visual estimations.
                  </p>
                </div>

                <label className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Choose Plate Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </GlassCard>

          {/* Quick snaps simulator selectors */}
          <div className="space-y-3.5 text-left">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Test Camera Snapping Demos
            </span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "salad", label: "Avocado Salad 🥑", desc: "Healthy vegan bowl" },
                { id: "pizza", label: "Pepperoni Pizza 🍕", desc: "Heavy carb counts" },
                { id: "burger", label: "Double Burger 🍔", desc: "Global fast food review" },
                { id: "eggs", label: "Eggs & Toast 🍳", desc: "High protein breakfast" }
              ].map((demo) => (
                <button
                  key={demo.id}
                  disabled={isScanning}
                  onClick={() => handleSimulateSnap(demo.id)}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/20 hover:border-emerald-200/50 text-left transition-all active:scale-[0.98]"
                >
                  <p className="text-xs font-bold text-slate-800">{demo.label}</p>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{demo.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Portion calibration & Macro/Micro reviews */}
        <div className="md:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {showAnalysisResults && analysisData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                
                {/* Result Overview */}
                <GlassCard glow glowColor="emerald" className="p-6 space-y-6">
                  
                  {/* Title & confidence indicator */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                        AI Confidence: {analysisData.confidence}%
                      </span>
                      <h3 className="font-outfit text-lg font-bold text-slate-800 leading-tight">
                        {analysisData.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Reference Portions: {analysisData.servingSize}</p>
                    </div>
                    <button
                      onClick={handleResetScanner}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      title="Scan new photo"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Dynamic Serving adjust controls */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1.5 col-span-2">
                      <label htmlFor="scanner-meal-type" className="text-xs text-slate-600 font-semibold">Log Under Meal Period</label>
                      <select
                        id="scanner-meal-type"
                        value={logMealType}
                        onChange={(e: any) => setLogMealType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label htmlFor="scanner-servings" className="text-xs text-slate-600 font-semibold">Portions Adjuster (Servings multiplier)</label>
                      <input
                        id="scanner-servings"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={portionServings}
                        onChange={(e) => setPortionServings(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 font-bold focus:outline-none focus:border-emerald-500/50"
                        placeholder="e.g. 1.0"
                      />
                    </div>
                  </div>

                  {/* Real-time calculated previews */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-4">
                    
                    {/* Calorie preview */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600">Total Calories:</span>
                      <span className="font-outfit text-xl font-extrabold text-emerald-600 flex items-center gap-1">
                        <Flame className="h-5 w-5 text-emerald-500" />
                        {Math.round(analysisData.calories * (parseFloat(portionServings) || 1))} kcal
                      </span>
                    </div>

                    {/* Macros grid */}
                    <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-100 pt-3 text-[11px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Protein</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(analysisData.protein * (parseFloat(portionServings) || 1) * 10) / 10}g
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Carbs</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(analysisData.carbs * (parseFloat(portionServings) || 1) * 10) / 10}g
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Fat</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(analysisData.fat * (parseFloat(portionServings) || 1) * 10) / 10}g
                        </p>
                      </div>
                    </div>

                    {/* Micros list */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-3 text-left">
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.fiber || 0) * (parseFloat(portionServings) || 1) * 10) / 10}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sugar:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.sugar || 0) * (parseFloat(portionServings) || 1) * 10) / 10}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sodium:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.sodium || 0) * (parseFloat(portionServings) || 1))} mg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potassium:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.potassium || 0) * (parseFloat(portionServings) || 1))} mg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calcium:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.calcium || 0) * (parseFloat(portionServings) || 1))} mg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Iron:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round((analysisData.iron || 0) * (parseFloat(portionServings) || 1) * 10) / 10} mg
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Add action */}
                  <button
                    onClick={handleConfirmLog}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Log Visual Scanned Dish</span>
                  </button>

                </GlassCard>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/20 text-center min-h-[300px]">
                <Scale className="h-8 w-8 text-slate-400 mb-3" />
                <p className="text-xs font-bold text-slate-600">Nutrition Analysis Result Panel</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed mt-1">
                  Once a photo is uploaded or simulated, visual portion estimates and calorie calculations appear here.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
