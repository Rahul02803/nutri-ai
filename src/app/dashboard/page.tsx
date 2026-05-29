"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp, LoggedMeal } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import {
  Flame,
  Droplet,
  TrendingDown,
  Search,
  Plus,
  Trash2,
  Brain,
  Sparkles,
  Calendar,
  Layers,
  Scale,
  Camera,
  Barcode,
  Heart,
  History,
  Apple,
  Dumbbell,
  Timer,
  Footprints
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { searchFoodsOfflineOnline, barcodeLookupOfflineOnline } from "@/lib/foodSearchService";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    targets,
    meals,
    waterLogged,
    weightLogs,
    foodCatalog,
    favorites,
    recentSearches,
    customFoods,
    logMeal,
    deleteMeal,
    logWater,
    logWeight,
    addNewFoodToCatalog,
    deleteFoodFromCatalog,
    toggleFavorite,
    addRecentSearch,
    manuallySetTargets,
    isFasting,
    fastingDuration,
    fastingStartTime,
    fastingElapsedTime,
    startFasting,
    stopFasting,
    cancelFasting,
    steps,
    syncSteps,
    workouts,
    logWorkout,
    deleteWorkout,
    streakCount,
    unlockedBadges
  } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tabs selection states
  const [activeTab, setActiveTab] = useState<"search" | "favorites" | "myFoods" | "quickAdd">("search");

  // Search & Logging States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<LoggedMeal["mealType"]>("Breakfast");
  const [customWeight, setCustomWeight] = useState("");
  const [showWeightDialog, setShowWeightDialog] = useState(false);

  // Form custom food logging state
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodCal, setCustomFoodCal] = useState("");
  const [customFoodPro, setCustomFoodPro] = useState("");
  const [customFoodCarb, setCustomFoodCarb] = useState("");
  const [customFoodFat, setCustomFoodFat] = useState("");
  const [customFoodFiber, setCustomFoodFiber] = useState("");
  const [customFoodSugar, setCustomFoodSugar] = useState("");
  const [customFoodSodium, setCustomFoodSodium] = useState("");

  // Quick Add macros state
  const [quickAddCal, setQuickAddCal] = useState("");
  const [quickAddPro, setQuickAddPro] = useState("");
  const [quickAddCarb, setQuickAddCarb] = useState("");
  const [quickAddFat, setQuickAddFat] = useState("");

  // Barcode Scanning simulator states
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [typedBarcode, setTypedBarcode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");

  // Custom Target Overwrite Dialog States
  const [showTargetsDialog, setShowTargetsDialog] = useState(false);
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");

  // Portion Customizer Dialog States
  const [showPortionDialog, setShowPortionDialog] = useState(false);
  const [selectedFoodForLog, setSelectedFoodForLog] = useState<any | null>(null);
  const [loggedGrams, setLoggedGrams] = useState("");
  const [loggedServings, setLoggedServings] = useState("1");

  // Dynamic USDA Search Hook
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchFoodsOfflineOnline(searchQuery);
        setSearchResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 450); // 450ms Debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getBaseWeightAndUnit = (servingSize: string) => {
    const match = servingSize.match(/(\d+)\s*(g|ml)/i);
    if (match) {
      return {
        weight: parseInt(match[1]),
        unit: match[2].toLowerCase(),
      };
    }
    return null;
  };

  const handleOpenPortionDialog = (food: any) => {
    setSelectedFoodForLog(food);
    const baseInfo = getBaseWeightAndUnit(food.servingSize);
    if (baseInfo) {
      setLoggedGrams(baseInfo.weight.toString());
      setLoggedServings("1");
    } else {
      setLoggedGrams("");
      setLoggedServings("1");
    }
    setShowPortionDialog(true);
  };

  const handleGramsChange = (valStr: string) => {
    setLoggedGrams(valStr);
    const val = parseFloat(valStr);
    if (selectedFoodForLog) {
      const baseInfo = getBaseWeightAndUnit(selectedFoodForLog.servingSize);
      if (baseInfo && !isNaN(val) && val > 0) {
        setLoggedServings((val / baseInfo.weight).toFixed(2));
      } else {
        setLoggedServings("");
      }
    }
  };

  const handleServingsChange = (valStr: string) => {
    setLoggedServings(valStr);
    const val = parseFloat(valStr);
    if (selectedFoodForLog) {
      const baseInfo = getBaseWeightAndUnit(selectedFoodForLog.servingSize);
      if (baseInfo && !isNaN(val) && val > 0) {
        setLoggedGrams(Math.round(val * baseInfo.weight).toString());
      } else {
        setLoggedGrams("");
      }
    }
  };

  const handleConfirmPortionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodForLog) return;
    const servings = parseFloat(loggedServings) || 1;
    
    let finalName = selectedFoodForLog.name;
    const baseInfo = getBaseWeightAndUnit(selectedFoodForLog.servingSize);
    if (baseInfo && loggedGrams) {
      finalName = `${selectedFoodForLog.name} (${loggedGrams}${baseInfo.unit})`;
    }

    // Extended micronutrients map
    const extraMetrics = {
      fiber: selectedFoodForLog.fiber,
      sugar: selectedFoodForLog.sugar,
      sodium: selectedFoodForLog.sodium,
      potassium: selectedFoodForLog.potassium,
      vitaminA: selectedFoodForLog.vitaminA,
      vitaminC: selectedFoodForLog.vitaminC,
      calcium: selectedFoodForLog.calcium,
      iron: selectedFoodForLog.iron,
      brand: selectedFoodForLog.brand,
      barcode: selectedFoodForLog.barcode
    };

    logMeal(
      finalName,
      selectedMealType,
      selectedFoodForLog.calories,
      selectedFoodForLog.protein,
      selectedFoodForLog.carbs,
      selectedFoodForLog.fat,
      servings,
      extraMetrics
    );

    // Save recent search if relevant
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }

    setSearchQuery("");
    setShowPortionDialog(false);
    setSelectedFoodForLog(null);
  };

  // Sync manual target inputs
  useEffect(() => {
    if (targets) {
      setManualCalories(targets.targetCalories.toString());
      setManualProtein(targets.targetProtein.toString());
      setManualCarbs(targets.targetCarbs.toString());
      setManualFat(targets.targetFat.toString());
    }
  }, [targets]);

  const handleSaveCustomTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const calNum = parseInt(manualCalories);
    const proNum = parseInt(manualProtein);
    const carbNum = parseInt(manualCarbs);
    const fatNum = parseInt(manualFat);
    if (!isNaN(calNum) && !isNaN(proNum) && !isNaN(carbNum) && !isNaN(fatNum)) {
      manuallySetTargets(calNum, proNum, carbNum, fatNum);
      setShowTargetsDialog(false);
    }
  };

  // Route protection
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (!user.isOnboarded) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user || !targets) return null;

  // 1. Calculate nutrient aggregates for today
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMeals = meals || [];
  const todayMeals = currentMeals.filter((meal) => meal && meal.loggedDate === todayStr);

  const loggedCalories = todayMeals.reduce((acc, m) => acc + (m?.calories || 0), 0);
  const loggedProtein = todayMeals.reduce((acc, m) => acc + (m?.protein || 0), 0);
  const loggedCarbs = todayMeals.reduce((acc, m) => acc + (m?.carbs || 0), 0);
  const loggedFat = todayMeals.reduce((acc, m) => acc + (m?.fat || 0), 0);

  // Micronutrient totals
  const loggedFiber = todayMeals.reduce((acc, m) => acc + (m?.fiber || 0), 0);
  const loggedSugar = todayMeals.reduce((acc, m) => acc + (m?.sugar || 0), 0);
  const loggedSodium = todayMeals.reduce((acc, m) => acc + (m?.sodium || 0), 0);
  const loggedPotassium = todayMeals.reduce((acc, m) => acc + (m?.potassium || 0), 0);
  const loggedVitaminA = todayMeals.reduce((acc, m) => acc + (m?.vitaminA || 0), 0);
  const loggedVitaminC = todayMeals.reduce((acc, m) => acc + (m?.vitaminC || 0), 0);
  const loggedCalcium = todayMeals.reduce((acc, m) => acc + (m?.calcium || 0), 0);
  const loggedIron = todayMeals.reduce((acc, m) => acc + (m?.iron || 0), 0);

  const remainingCalories = Math.max(0, targets.targetCalories - loggedCalories);
  const caloriePercent = Math.min(100, Math.round((loggedCalories / targets.targetCalories) * 100));

  // Log weight handler
  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(customWeight);
    if (!isNaN(weightNum) && weightNum > 30 && weightNum < 200) {
      logWeight(weightNum);
      setCustomWeight("");
      setShowWeightDialog(false);
    }
  };

  // Add Custom Food
  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName || !customFoodCal) return;

    const extra = {
      fiber: parseFloat(customFoodFiber) || 0,
      sugar: parseFloat(customFoodSugar) || 0,
      sodium: parseFloat(customFoodSodium) || 0,
    };

    addNewFoodToCatalog({
      name: customFoodName,
      servingSize: "100g",
      calories: parseFloat(customFoodCal),
      protein: parseFloat(customFoodPro || "0"),
      carbs: parseFloat(customFoodCarb || "0"),
      fat: parseFloat(customFoodFat || "0"),
      category: "Other",
      ...extra
    });

    // Reset Custom Form
    setCustomFoodName("");
    setCustomFoodCal("");
    setCustomFoodPro("");
    setCustomFoodCarb("");
    setCustomFoodFat("");
    setCustomFoodFiber("");
    setCustomFoodSugar("");
    setCustomFoodSodium("");
    
    // Switch to My Foods tab to see the saved entry
    setActiveTab("myFoods");
  };

  // Quick Add Macros
  const handleQuickAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseFloat(quickAddCal);
    if (isNaN(cal) || cal <= 0) return;

    const pro = parseFloat(quickAddPro) || 0;
    const carb = parseFloat(quickAddCarb) || 0;
    const fat = parseFloat(quickAddFat) || 0;

    logMeal(
      "Quick Logged Calories",
      selectedMealType,
      cal,
      pro,
      carb,
      fat,
      1
    );

    setQuickAddCal("");
    setQuickAddPro("");
    setQuickAddCarb("");
    setQuickAddFat("");
  };

  // Barcode query log trigger
  const handleBarcodeLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedBarcode.trim()) return;

    setBarcodeLoading(true);
    setBarcodeError("");

    try {
      const food = await barcodeLookupOfflineOnline(typedBarcode.trim());
      if (food && !("error" in food)) {
        setShowBarcodeDialog(false);
        setTypedBarcode("");
        handleOpenPortionDialog(food);
      } else {
        setBarcodeError("Product not found. Try a demo barcode!");
      }
    } catch (err) {
      setBarcodeError("Scanner system offline.");
    } finally {
      setBarcodeLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-white">
      
      {/* Welcome Title & Header Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="font-outfit text-3xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {user.name} <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500">
            Goal: <span className="capitalize font-semibold text-emerald-600">{targets.bmiCategory}</span> • Wellness Cockpit
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => router.push("/scanner")}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Meal Photo</span>
          </button>
          <button
            onClick={() => setShowTargetsDialog(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-700 transition-colors shadow-sm"
          >
            <Layers className="h-4 w-4" />
            <span>Adjust Targets</span>
          </button>
          <button
            onClick={() => setShowWeightDialog(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Scale className="h-4 w-4 text-emerald-600" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Row: Circular Calorie Meter, Macro Bars, Hydration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Calorie Ring Card */}
        <div className="md:col-span-4">
          <GlassCard className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Calorie Budget Cockpit
            </span>

            {/* Circular Progress Gauge */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 h-full w-full">
                <circle cx="88" cy="88" r="76" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={477}
                  strokeDashoffset={477 - (477 * caloriePercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              
              <div className="space-y-0.5 z-10">
                <span className="text-3xl font-extrabold text-slate-900 font-outfit block">{remainingCalories}</span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">kcal left</span>
                <span className="text-[10px] font-semibold text-slate-400 block">Logged: {loggedCalories} / {targets.targetCalories}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Macro Budgets Progress Gauges */}
        <div className="md:col-span-4">
          <GlassCard glow glowColor="emerald" className="p-6 md:p-8 space-y-6 h-full text-left">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">
              Daily Macronutrient Budgets
            </span>

            <div className="space-y-4.5">
              {/* Protein: Orange theme */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-orange-700 font-outfit">🥩 Muscle Protein</span>
                  <span className="text-slate-600 font-mono">{Math.round(loggedProtein)}g / {targets.targetProtein}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((loggedProtein / targets.targetProtein) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Carbs: Green theme */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700 font-outfit">🌾 Energy Carbs</span>
                  <span className="text-slate-600 font-mono">{Math.round(loggedCarbs)}g / {targets.targetCarbs}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((loggedCarbs / targets.targetCarbs) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Fats: Amber theme */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-700 font-outfit">🍳 Dietary Fats</span>
                  <span className="text-slate-600 font-mono">{Math.round(loggedFat)}g / {targets.targetFat}g</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((loggedFat / targets.targetFat) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Water Fluid Tracker */}
        <div className="md:col-span-4">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <span className="font-outfit text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-3">
              Hydration Fluid Tracker
            </span>

            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 animate-pulse">
                <Droplet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{waterLogged} ml</p>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase font-mono tracking-wider">
                  Target: {targets.waterTargetMl} ml
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => logWater(250)}
                className="flex-grow p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-indigo-700 hover:bg-slate-100 transition-colors"
              >
                + 250ml Glass
              </button>
              <button
                onClick={() => logWater(500)}
                className="flex-grow p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-indigo-700 hover:bg-slate-100 transition-colors"
              >
                + 500ml Shaker
              </button>
              <button
                onClick={() => logWater(-250)}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
              >
                -
              </button>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Intermittent Fasting & Daily Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Fasting Clock Widget */}
        <div className="md:col-span-6">
          <GlassCard glow glowColor="emerald" className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-[#F1F1F4] pb-3">
              <span className="font-outfit text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="h-4.5 w-4.5 text-purple-500 animate-pulse" />
                Intermittent Fasting (16:8 Tiers)
              </span>
              <span className="text-[10px] font-mono text-purple-600 font-bold uppercase">
                {isFasting ? "Autophagy Active" : "Fasting Idle"}
              </span>
            </div>

            {!isFasting ? (
              <div className="space-y-4 flex-grow flex flex-col justify-center">
                <p className="text-xs text-[#8D8D92]">
                  Intermittent fasting promotes metabolic flexibility, cellular autophagy, and cognitive focus. Choose a tier:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { hours: 16, label: "16:8 Lean" },
                    { hours: 18, label: "18:6 Power" },
                    { hours: 20, label: "20:4 Warrior" }
                  ].map((tier) => (
                    <button
                      key={tier.hours}
                      onClick={() => startFasting(tier.hours)}
                      className="py-2.5 rounded-xl border border-[#ECECEF] bg-[#F8F8FA] text-[11px] font-bold text-[#111111] hover:bg-slate-50 transition-all text-center"
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-between bg-purple-50/50 border border-purple-100/50 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-[#8D8D92] font-semibold uppercase tracking-wider block">Fasting Timer</span>
                    <span className="text-2xl font-bold font-mono text-purple-600">
                      {Math.floor(fastingElapsedTime / 3600).toString().padStart(2, "0")}:
                      {Math.floor((fastingElapsedTime % 3600) / 60).toString().padStart(2, "0")}:
                      {(fastingElapsedTime % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8D8D92] font-semibold uppercase tracking-wider block">Target Tier</span>
                    <span className="text-xs font-bold text-[#111111]">{fastingDuration} hours</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={stopFasting}
                    className="flex-grow py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-[11px] font-bold text-white transition-all shadow-xs active:scale-[0.98]"
                  >
                    Complete Fast & Log
                  </button>
                  <button
                    onClick={cancelFasting}
                    className="py-2.5 px-4 rounded-xl border border-[#ECECEF] text-[11px] font-bold text-[#8D8D92] hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Steps & Workout Logs Card */}
        <div className="md:col-span-6">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-[#F1F1F4] pb-3">
              <span className="font-outfit text-sm font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="h-4.5 w-4.5 text-sky-500" />
                Physical Activity & Workouts
              </span>
              <span className="text-[10px] text-sky-600 font-bold font-mono uppercase">
                Synchronized
              </span>
            </div>

            <div className="space-y-4 flex-grow flex flex-col justify-center">
              {/* Step counter progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#8D8D92]">Steps Tracker</span>
                  <span className="font-bold text-[#111111]">{steps.toLocaleString()} / 10,000 steps</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => syncSteps(steps + 1500)}
                    className="px-2.5 py-1 rounded-lg border border-[#ECECEF] bg-[#F8F8FA] hover:bg-slate-50 text-[10px] font-bold text-[#8D8D92] transition-all"
                  >
                    + Sync 1,500 Steps
                  </button>
                </div>
              </div>

              {/* Workout logs list */}
              <div className="space-y-2 border-t border-[#F1F1F4] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8D8D92] uppercase font-bold tracking-wider">Today&apos;s Workouts</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => logWorkout("Strength Push Session", "Strength", 45, 300)}
                      className="px-2 py-1 rounded-lg bg-[#111111] text-white text-[9px] font-bold hover:scale-[1.01]"
                    >
                      + Strength (300 kcal)
                    </button>
                    <button
                      onClick={() => logWorkout("Cardio Fast Run", "Cardio", 30, 250)}
                      className="px-2 py-1 rounded-lg bg-[#111111] text-white text-[9px] font-bold hover:scale-[1.01]"
                    >
                      + Cardio (250 kcal)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1">
                  {workouts.filter(w => w.loggedDate === todayStr).map((w) => (
                    <div key={w.id} className="flex justify-between items-center text-[10px] bg-[#F8F8FA] border border-[#ECECEF] p-2 rounded-xl">
                      <span className="font-semibold text-slate-700">💪 {w.name} ({w.duration}m)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600 font-bold">-{w.caloriesBurned} kcal</span>
                        <button
                          onClick={() => deleteWorkout(w.id)}
                          className="text-[9px] text-[#8D8D92] hover:text-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {workouts.filter(w => w.loggedDate === todayStr).length === 0 && (
                    <p className="text-[10px] text-[#8D8D92] italic">No active exercise logged today. Add metrics via quick triggers.</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Secondary Metrics Row: Weight Logs & Extended Micro Scoreboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recharts Analytics weight logs */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="font-outfit text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="h-4.5 w-4.5 text-emerald-600" />
                Weight Loss Curve (7 Days)
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Scale logs</span>
            </div>

            <div className="h-52 w-full pt-2">
              {mounted && (weightLogs || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightLogs || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(str) => {
                        const parts = str.split("-");
                        return parts.length > 2 ? `${parts[2]}/${parts[1]}` : str;
                      }}
                    />
                    <YAxis
                      domain={["dataMin - 1", "dataMax + 1"]}
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#0f172a",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#ffffff", strokeWidth: 2, stroke: "#10b981" }}
                      activeDot={{ r: 6, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </GlassCard>
        </div>

        {/* Extended Micro Nutrient Scoreboard */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-outfit text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                Extended Micro Scoreboard
              </span>
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                MyFitnessPal Grade
              </span>
            </div>

            {/* Micro progress scoreboard list */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 pt-1 text-[11px]">
              {/* Fiber */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Dietary Fiber</span>
                  <span className="font-bold">{loggedFiber.toFixed(1)}g / 30g</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${Math.min(100, (loggedFiber / 30) * 100)}%` }} />
                </div>
              </div>

              {/* Sugar */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Sugars Tally</span>
                  <span className={`font-bold ${loggedSugar > 50 ? "text-rose-600" : ""}`}>{loggedSugar.toFixed(1)}g / 50g</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${loggedSugar > 50 ? "bg-rose-500" : "bg-emerald-400"} transition-all duration-300`} style={{ width: `${Math.min(100, (loggedSugar / 50) * 100)}%` }} />
                </div>
              </div>

              {/* Sodium */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Sodium (Salt)</span>
                  <span className="font-bold">{loggedSodium}mg / 2300mg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 transition-all duration-300" style={{ width: `${Math.min(100, (loggedSodium / 2300) * 100)}%` }} />
                </div>
              </div>

              {/* Potassium */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Potassium</span>
                  <span className="font-bold">{loggedPotassium}mg / 3500mg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-300" style={{ width: `${Math.min(100, (loggedPotassium / 3500) * 100)}%` }} />
                </div>
              </div>

              {/* Calcium */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Calcium (Bone)</span>
                  <span className="font-bold">{loggedCalcium}mg / 1000mg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${Math.min(100, (loggedCalcium / 1000) * 100)}%` }} />
                </div>
              </div>

              {/* Iron */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Iron (Heme)</span>
                  <span className="font-bold">{loggedIron.toFixed(1)}mg / 18mg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 transition-all duration-300" style={{ width: `${Math.min(100, (loggedIron / 18) * 100)}%` }} />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Bottom Trackers Row: Tabbed Food Search/Log Drawer vs Daily Logs List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Complete tabbed search drawer system */}
        <div className="lg:col-span-7">
          <GlassCard glow glowColor="emerald" className="p-6 md:p-8 space-y-6">
            
            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                {[
                  { id: "search", label: "Search DB", icon: Search },
                  { id: "favorites", label: "Favorites & Recents", icon: Heart },
                  { id: "myFoods", label: "My Foods", icon: Apple },
                  { id: "quickAdd", label: "Quick Add", icon: Plus }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === t.id 
                          ? "bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Render Tab Contents */}
            <div className="text-left">
              <AnimatePresence mode="wait">
                
                {/* 1. Search Database Tab */}
                {activeTab === "search" && (
                  <motion.div
                    key="searchTab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Search Bar */}
                      <div className="sm:col-span-6 relative">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search generic & branded foods..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      {/* Scan Barcode Button */}
                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={() => setShowBarcodeDialog(true)}
                          className="w-full flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-700 transition-colors shadow-xs h-full"
                        >
                          <Barcode className="h-4 w-4" />
                          <span>Scan Barcode</span>
                        </button>
                      </div>
                      {/* Log Category */}
                      <div className="sm:col-span-3">
                        <select
                          value={selectedMealType}
                          onChange={(e: any) => setSelectedMealType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none h-full"
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>
                    </div>

                    {/* Results list */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {searchLoading ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-mono animate-pulse">
                          Querying USDA FDC & Local presets...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((food) => (
                          <div
                            key={food.id}
                            className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="space-y-0.5 text-left">
                              <p className="text-sm font-semibold text-slate-800 leading-snug">{food.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {food.servingSize} {food.brand ? `• Brand: ${food.brand}` : ""} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleFavorite(food)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  favorites.some((f) => f.name === food.name)
                                    ? "bg-rose-50 border-rose-100 text-rose-500"
                                    : "bg-white border-slate-200 text-slate-300 hover:text-rose-500"
                                }`}
                                title="Favorite Food"
                              >
                                <Heart className="h-3.5 w-3.5 fill-current" />
                              </button>
                              <button
                                onClick={() => handleOpenPortionDialog(food)}
                                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[10px] font-bold text-emerald-700 transition-colors shadow-xs"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Log</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : searchQuery ? (
                        <div className="text-center py-6 text-xs text-slate-400 italic">
                          No USDA matches. Custom log it in the My Foods tab!
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-slate-400 italic">
                          Type a food name (e.g. Chapati, Starbucks, Pizza) to scan the USDA central database!
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. Favorites & Recents Tab */}
                {activeTab === "favorites" && (
                  <motion.div
                    key="favoritesTab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-left"
                  >
                    {/* Favorite foods grid */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                        <Heart className="h-3 w-3 text-rose-500 fill-current" /> Favorited Foods
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {favorites.map((food) => (
                          <div
                            key={food.id}
                            className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-center"
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-bold text-slate-700 truncate">{food.name}</p>
                              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                {food.calories} kcal • P: {food.protein}g
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenPortionDialog(food)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[9px] font-bold text-emerald-700 shrink-0"
                            >
                              Log
                            </button>
                          </div>
                        ))}
                        {favorites.length === 0 && (
                          <div className="text-[10px] text-slate-400 italic col-span-2 py-2">
                            No favorites saved yet. Tap the heart icon on search results to save!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent searches history list */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                        <History className="h-3 w-3 text-slate-400" /> Recent Search Queries
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchQuery(q);
                              setActiveTab("search");
                            }}
                            className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-500 hover:text-slate-800"
                          >
                            {q}
                          </button>
                        ))}
                        {recentSearches.length === 0 && (
                          <span className="text-[10px] text-slate-400 italic py-1">No search history recorded.</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. My Foods (Custom Creator) Tab */}
                {activeTab === "myFoods" && (
                  <motion.div
                    key="myFoodsTab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left"
                  >
                    {/* Saved Custom Foods list */}
                    <div className="md:col-span-6 space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
                        Saved Dishes Inventory
                      </span>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {customFoods.map((food) => (
                          <div
                            key={food.id}
                            className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-700 leading-tight">{food.name}</p>
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                                {food.calories} kcal • P: {food.protein}g | C: {food.carbs}g
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleOpenPortionDialog(food)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-[9px] font-bold text-emerald-700 shrink-0"
                              >
                                Log
                              </button>
                              <button
                                onClick={() => deleteFoodFromCatalog(food.id)}
                                className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {customFoods.length === 0 && (
                          <div className="text-[10px] text-slate-400 italic py-6">
                            No custom dishes created yet. Save paneer or recipes using the creator next door!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom Food Creator Form */}
                    <form onSubmit={handleCreateCustomFood} className="md:col-span-6 space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 text-xs">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block mb-1">
                        Create & Save Custom Dish
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Dish Name (e.g. Moong Cheela)"
                          value={customFoodName}
                          onChange={(e) => setCustomFoodName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[11px] focus:outline-none"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Calories (kcal)"
                          value={customFoodCal}
                          onChange={(e) => setCustomFoodCal(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-[11px] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Protein (g)"
                          value={customFoodPro}
                          onChange={(e) => setCustomFoodPro(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Carbs (g)"
                          value={customFoodCarb}
                          onChange={(e) => setCustomFoodCarb(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Fat (g)"
                          value={customFoodFat}
                          onChange={(e) => setCustomFoodFat(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Fiber (g)"
                          value={customFoodFiber}
                          onChange={(e) => setCustomFoodFiber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Sugar (g)"
                          value={customFoodSugar}
                          onChange={(e) => setCustomFoodSugar(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Sodium (mg)"
                          value={customFoodSodium}
                          onChange={(e) => setCustomFoodSodium(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-[10px] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 shadow-xs"
                      >
                        Save & Catalog Custom Dish
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 4. Quick Add macros tab */}
                {activeTab === "quickAdd" && (
                  <motion.div
                    key="quickAddTab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="max-w-md space-y-4 text-xs"
                  >
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block mb-1">
                      Quick Log Raw Budgets
                    </span>

                    <form onSubmit={handleQuickAddLog} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="quick-calories" className="text-[11px] text-slate-600 font-semibold">Calories to log (kcal)</label>
                          <input
                            id="quick-calories"
                            type="number"
                            required
                            placeholder="e.g. 400"
                            value={quickAddCal}
                            onChange={(e) => setQuickAddCal(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="quick-meal-type" className="text-[11px] text-slate-600 font-semibold">Log Under Period</label>
                          <select
                            id="quick-meal-type"
                            value={selectedMealType}
                            onChange={(e: any) => setSelectedMealType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none"
                          >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 text-left">
                          <label htmlFor="quick-protein" className="text-[10px] text-slate-500">Protein (g)</label>
                          <input
                            id="quick-protein"
                            type="number"
                            placeholder="0"
                            value={quickAddPro}
                            onChange={(e) => setQuickAddPro(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label htmlFor="quick-carbs" className="text-[10px] text-slate-500">Carbs (g)</label>
                          <input
                            id="quick-carbs"
                            type="number"
                            placeholder="0"
                            value={quickAddCarb}
                            onChange={(e) => setQuickAddCarb(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label htmlFor="quick-fat" className="text-[10px] text-slate-500">Fat (g)</label>
                          <input
                            id="quick-fat"
                            type="number"
                            placeholder="0"
                            value={quickAddFat}
                            onChange={(e) => setQuickAddFat(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-xs"
                      >
                        1-Tap Quick Add Log
                      </button>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </GlassCard>
        </div>

        {/* Daily Food Log History */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 md:p-8 space-y-4 h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="font-outfit text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                Today&apos;s Logs
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {todayMeals.length} logged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 flex-grow">
              <AnimatePresence>
                {todayMeals.map((meal) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group shadow-sm"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{meal.name}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-1 py-0.5 rounded border border-slate-200/50">
                          {meal.mealType}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {meal.servings} serving • {meal.calories} kcal • P: {meal.protein}g | C: {meal.carbs}g
                      </span>
                    </div>

                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {todayMeals.length === 0 && (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 italic py-16">
                  No food entries logged today. Add items from database!
                </div>
              )}
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Floating Weight Log Modal */}
      <AnimatePresence>
        {showWeightDialog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-outfit font-bold text-slate-800">Log Daily Weight</span>
                  <button
                    onClick={() => setShowWeightDialog(false)}
                    className="text-xs text-slate-400 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleLogWeightSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="modal-weight" className="text-xs text-slate-600 font-semibold">Current Weight today (kg)</label>
                    <input
                      id="modal-weight"
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 78.4"
                      value={customWeight}
                      onChange={(e) => setCustomWeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 font-bold text-sm text-white hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    Save & Re-Calibrate Targets
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating targets adjustment dialog screen */}
      <AnimatePresence>
        {showTargetsDialog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="font-outfit font-bold text-slate-800">Adjust Calorie & Macro Targets</span>
                  <button
                    onClick={() => setShowTargetsDialog(false)}
                    className="text-xs text-slate-400 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSaveCustomTargets} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="custom-calories-db" className="text-xs text-slate-600 font-semibold">Calories Target (kcal)</label>
                    <input
                      id="custom-calories-db"
                      type="number"
                      required
                      placeholder="e.g. 2000"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div className="space-y-1.5">
                      <label htmlFor="custom-protein-db" className="text-xs text-slate-600 font-semibold">Protein (g)</label>
                      <input
                        id="custom-protein-db"
                        type="number"
                        required
                        placeholder="e.g. 140"
                        value={manualProtein}
                        onChange={(e) => setManualProtein(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="custom-carbs-db" className="text-xs text-slate-600 font-semibold">Carbs (g)</label>
                      <input
                        id="custom-carbs-db"
                        type="number"
                        required
                        placeholder="e.g. 210"
                        value={manualCarbs}
                        onChange={(e) => setManualCarbs(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="custom-fat-db" className="text-xs text-slate-600 font-semibold">Fat (g)</label>
                      <input
                        id="custom-fat-db"
                        type="number"
                        required
                        placeholder="e.g. 65"
                        value={manualFat}
                        onChange={(e) => setManualFat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Apply Custom Targets
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Portion Customizer Modal */}
      <AnimatePresence>
        {showPortionDialog && selectedFoodForLog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="space-y-0.5 text-left">
                    <span className="font-outfit font-bold text-slate-800 text-sm block">Configure Log Portion</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{selectedFoodForLog.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPortionDialog(false);
                      setSelectedFoodForLog(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleConfirmPortionLog} className="space-y-4">
                  {/* Base food details */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1 text-left">
                    <div className="flex justify-between">
                      <span>Base Serving Size:</span>
                      <span className="font-bold text-slate-700">{selectedFoodForLog.servingSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Macros (1x Portion):</span>
                      <span className="font-bold text-slate-700 text-right">
                        {selectedFoodForLog.calories} kcal • P: {selectedFoodForLog.protein}g | C: {selectedFoodForLog.carbs}g | F: {selectedFoodForLog.fat}g
                      </span>
                    </div>
                  </div>

                  {/* Weight adjust fields */}
                  {getBaseWeightAndUnit(selectedFoodForLog.servingSize) ? (
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <label htmlFor="grams-adjuster" className="text-xs text-slate-600 font-semibold">
                          Grams/Portion ({getBaseWeightAndUnit(selectedFoodForLog.servingSize)?.unit || "g"})
                        </label>
                        <input
                          id="grams-adjuster"
                          type="number"
                          min="1"
                          placeholder="e.g. 100"
                          value={loggedGrams}
                          onChange={(e) => handleGramsChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="servings-adjuster" className="text-xs text-slate-600 font-semibold">Servings Multiplier</label>
                        <input
                          id="servings-adjuster"
                          type="number"
                          step="0.05"
                          min="0.05"
                          placeholder="e.g. 1.0"
                          value={loggedServings}
                          onChange={(e) => handleServingsChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="servings-adjuster-simple" className="text-xs text-slate-600 font-semibold">Servings Multiplier</label>
                      <input
                        id="servings-adjuster-simple"
                        type="number"
                        step="0.05"
                        min="0.05"
                        placeholder="e.g. 1.0"
                        value={loggedServings}
                        onChange={(e) => handleServingsChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Real-time preview */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Scaled Intake Preview</p>
                    <p className="text-xl font-bold font-outfit text-emerald-600">
                      {Math.round(selectedFoodForLog.calories * (parseFloat(loggedServings) || 1))} kcal
                    </p>
                    <div className="flex justify-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>P: {Math.round(selectedFoodForLog.protein * (parseFloat(loggedServings) || 1) * 10) / 10}g</span>
                      <span>•</span>
                      <span>C: {Math.round(selectedFoodForLog.carbs * (parseFloat(loggedServings) || 1) * 10) / 10}g</span>
                      <span>•</span>
                      <span>F: {Math.round(selectedFoodForLog.fat * (parseFloat(loggedServings) || 1) * 10) / 10}g</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Confirm & Add to Today&apos;s Logs
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Barcode Scanner Dialog */}
      <AnimatePresence>
        {showBarcodeDialog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard glow glowColor="emerald" className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-left">
                    <Barcode className="h-5 w-5 text-emerald-500 animate-pulse" />
                    <span className="font-outfit font-bold text-slate-800">Scan Barcode (CORS USDA & OFF)</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowBarcodeDialog(false);
                      setTypedBarcode("");
                      setBarcodeError("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>

                {/* Neon scanline laser visual animation */}
                <div className="h-32 w-full bg-[#111115] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent)]" />
                  
                  {/* Laser line */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Mock Barcode graphics */}
                  <div className="flex items-center space-x-1 opacity-20">
                    {[1, 3, 2, 4, 1, 3, 2, 1, 4, 3, 2, 1, 2, 3, 4, 1, 2, 3].map((val, idx) => (
                      <div
                        key={idx}
                        className="bg-white h-12"
                        style={{ width: `${val * 2}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase mt-2 z-10 font-bold animate-pulse">
                    Laser scan view active
                  </span>
                </div>

                <form onSubmit={handleBarcodeLookupSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="typed-barcode-input" className="text-xs text-slate-600 font-semibold">Enter Barcode EAN/UPC Number</label>
                    <div className="relative">
                      <input
                        id="typed-barcode-input"
                        type="text"
                        required
                        placeholder="e.g. 5449000000996"
                        value={typedBarcode}
                        onChange={(e) => setTypedBarcode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    {barcodeError && (
                      <p className="text-[10px] text-rose-500 font-medium">{barcodeError}</p>
                    )}
                  </div>

                  {/* Quick-select test barcodes */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-left">
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Quick Test Demo Barcodes
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        { label: "Coca Cola Classic 🥤", code: "5449000000996" },
                        { label: "Kraft Mac & Cheese 🧀", code: "0021000612239" },
                        { label: "Oreo Original 🍪", code: "044000031226" },
                        { label: "Diet Coke Can 🥤", code: "5449000133335" }
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setTypedBarcode(item.code)}
                          className="p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50/20 hover:border-emerald-200 text-left transition-colors font-medium truncate"
                        >
                          <span className="block font-bold text-slate-700">{item.label}</span>
                          <span className="font-mono text-slate-400 text-[8px]">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={barcodeLoading}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:bg-slate-300"
                  >
                    <span>{barcodeLoading ? "Searching OpenFoodFacts..." : "Scan & Analyze Barcode"}</span>
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
