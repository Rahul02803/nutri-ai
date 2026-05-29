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
  Plus,
  Trash2,
  ListPlus
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
  const [foodDescription, setFoodDescription] = useState("");
  const [plateFoods, setPlateFoods] = useState<any[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [showAddNewItem, setShowAddNewItem] = useState(false);

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
      const data = await visualMealPhotoScan(imgData, imgName, foodDescription);
      setAnalysisData(data);
      setPlateFoods(data.foods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
      setShowAnalysisResults(true);
    }
  };

  const handleConfirmLog = () => {
    if (plateFoods.length === 0) return;
    
    plateFoods.forEach((food) => {
      const q = food.quantity_grams;
      logMeal(
        `${food.name} (${q}g) (AI Scan)`,
        logMealType,
        Math.round(food.calories * q),
        Math.round(food.protein * q * 10) / 10,
        Math.round(food.carbs * q * 10) / 10,
        Math.round(food.fat * q * 10) / 10,
        1,
        {
          fiber: Math.round((food.fiber || 0) * q * 10) / 10,
          sugar: Math.round((food.sugar || 0) * q * 10) / 10,
          sodium: Math.round((food.sodium || 0) * q),
          potassium: Math.round((food.potassium || 0) * q),
          vitaminA: food.vitaminA ? Math.round(food.vitaminA * q) : undefined,
          vitaminC: food.vitaminC ? Math.round(food.vitaminC * q * 10) / 10 : undefined,
          calcium: food.calcium ? Math.round(food.calcium * q) : undefined,
          iron: food.iron ? Math.round(food.iron * q * 10) / 10 : undefined,
        }
      );
    });

    router.push("/dashboard");
  };

  const handleUpdateFoodGrams = (index: number, val: number) => {
    setPlateFoods((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity_grams: val };
      return copy;
    });
  };

  const handleDeleteFoodItem = (index: number) => {
    setPlateFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomFoodItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;
    const clean = newFoodName.toLowerCase().trim();
    let caloriesPerGram = 1.5;
    let proteinPerGram = 0.08;
    let carbsPerGram = 0.2;
    let fatPerGram = 0.04;

    if (clean.includes("rice") || clean.includes("bread") || clean.includes("roti") || clean.includes("naan")) {
      caloriesPerGram = 2.0; proteinPerGram = 0.06; carbsPerGram = 0.45; fatPerGram = 0.01;
    } else if (clean.includes("chicken") || clean.includes("paneer") || clean.includes("egg") || clean.includes("meat") || clean.includes("fish")) {
      caloriesPerGram = 2.2; proteinPerGram = 0.22; carbsPerGram = 0.02; fatPerGram = 0.12;
    } else if (clean.includes("salad") || clean.includes("veg") || clean.includes("broccoli") || clean.includes("spinach")) {
      caloriesPerGram = 0.4; proteinPerGram = 0.02; carbsPerGram = 0.08; fatPerGram = 0.005;
    }

    const newItem = {
      name: newFoodName.trim(),
      quantity_grams: 100,
      calories: caloriesPerGram,
      protein: proteinPerGram,
      carbs: carbsPerGram,
      fat: fatPerGram,
      fiber: clean.includes("veg") ? 0.04 : 0.01,
      sugar: clean.includes("fruit") ? 0.08 : 0.01,
      sodium: fatPerGram * 25 + 20,
      potassium: proteinPerGram * 12 + 15
    };
    setPlateFoods((prev) => [...prev, newItem]);
    setNewFoodName("");
    setShowAddNewItem(false);
  };

  const handleResetScanner = () => {
    setSelectedImage(null);
    setSelectedImageName("");
    setShowAnalysisResults(false);
    setAnalysisData(null);
    setFoodDescription("");
    setPlateFoods([]);
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

          {/* Cal AI Text Calibration input */}
          <div className="space-y-2 text-left bg-white/60 backdrop-blur-xl p-4.5 rounded-[24px] border border-slate-100 shadow-xs">
            <label htmlFor="food-desc-input" className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse animate-duration-1000" />
              What is on your plate? (Optional AI calibration)
            </label>
            <p className="text-[10px] text-slate-400 leading-normal">
              Type details of your meal (e.g., &ldquo;Oats with almond milk and banana&rdquo; or &ldquo;Paneer roll&rdquo;) to guide the scanner for perfect Cal AI portion and macro calculations.
            </p>
            <input
              id="food-desc-input"
              type="text"
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              placeholder="Auto-detect meal photo OR enter dish details..."
              disabled={isScanning}
              className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-xl py-3 px-4 text-xs font-semibold text-[#111111] focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all placeholder:text-[#8D8D92] placeholder:font-normal"
            />
          </div>

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
            {showAnalysisResults && plateFoods.length > 0 ? (
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
                        AI Detected Plate Contents
                      </span>
                      <h3 className="font-outfit text-lg font-bold text-slate-800 leading-tight">
                        Thali Portion Calibrator
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Calibrate weight in grams per item in real-time</p>
                    </div>
                    <button
                      onClick={handleResetScanner}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      title="Scan new photo"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Meal Period Selection */}
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="scanner-meal-type" className="text-xs text-slate-600 font-bold">Log Under Meal Period</label>
                    <select
                      id="scanner-meal-type"
                      value={logMealType}
                      onChange={(e: any) => setLogMealType(e.target.value)}
                      className="w-full bg-[#F8F8FA] border border-[#ECECEF] rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>

                  {/* Interactive Detected Foods List */}
                  <div className="space-y-3.5 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Plate Items Checklist
                      </span>
                      <button
                        onClick={() => setShowAddNewItem(!showAddNewItem)}
                        className="text-[10px] text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                        Add Item
                      </button>
                    </div>

                    {/* Popover form for adding a custom food */}
                    {showAddNewItem && (
                      <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAddCustomFoodItem}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <p className="text-[10px] text-slate-500 font-medium">Type item name (e.g. &quot;Samosa&quot;, &quot;Paneer Butter Masala&quot;)</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFoodName}
                            onChange={(e) => setNewFoodName(e.target.value)}
                            placeholder="e.g. Samosa"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 rounded-lg"
                          >
                            Add
                          </button>
                        </div>
                      </motion.form>
                    )}

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {plateFoods.map((food, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#F8F8FA] hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-800 truncate">{food.name}</p>
                            <div className="flex gap-2 text-[9px] font-mono text-slate-400">
                              <span>{Math.round(food.calories * food.quantity_grams)} kcal</span>
                              <span>P: {Math.round(food.protein * food.quantity_grams * 10) / 10}g</span>
                              <span>C: {Math.round(food.carbs * food.quantity_grams * 10) / 10}g</span>
                              <span>F: {Math.round(food.fat * food.quantity_grams * 10) / 10}g</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={food.quantity_grams}
                                onChange={(e) => handleUpdateFoodGrams(idx, Math.max(1, Number(e.target.value)))}
                                className="w-16 bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-center text-xs font-bold text-slate-800 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-slate-400 ml-1">g</span>
                            </div>
                            <button
                              onClick={() => handleDeleteFoodItem(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time calculated plate totals cockpit */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-4 text-left">
                    
                    {/* Calorie preview */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">Total Plate Calories:</span>
                      <span className="font-outfit text-xl font-extrabold text-emerald-600 flex items-center gap-1">
                        <Flame className="h-5 w-5 text-emerald-500" />
                        {Math.round(plateFoods.reduce((sum, f) => sum + (f.calories * f.quantity_grams), 0))} kcal
                      </span>
                    </div>

                    {/* Macros grid */}
                    <div className="grid grid-cols-4 gap-3 text-center border-t border-slate-100 pt-3 text-[11px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Protein</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + (f.protein * f.quantity_grams), 0) * 10) / 10}g
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Carbs</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + (f.carbs * f.quantity_grams), 0) * 10) / 10}g
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Fat</span>
                        <p className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + (f.fat * f.quantity_grams), 0) * 10) / 10}g
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Fiber</span>
                        <p className="font-bold text-emerald-600">
                          {Math.round(plateFoods.reduce((sum, f) => sum + ((f.fiber || 0) * f.quantity_grams), 0) * 10) / 10}g
                        </p>
                      </div>
                    </div>

                    {/* Micros list */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span>Sugar:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + ((f.sugar || 0) * f.quantity_grams), 0) * 10) / 10}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sodium:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + ((f.sodium || 0) * f.quantity_grams), 0))} mg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potassium:</span>
                        <span className="font-bold text-slate-700">
                          {Math.round(plateFoods.reduce((sum, f) => sum + ((f.potassium || 0) * f.quantity_grams), 0))} mg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-bold text-slate-700">
                          {plateFoods.length} items
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Confirm Action */}
                  <button
                    onClick={handleConfirmLog}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Check className="h-4.5 w-4.5" />
                    <span>Confirm & Log Plate Meal</span>
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
