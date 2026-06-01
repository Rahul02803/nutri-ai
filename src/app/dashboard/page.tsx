"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp, LoggedMeal } from "@/context/AppContext";
import {
  Flame,
  Droplet,
  Trash2,
  Sparkles,
  Search,
  Plus,
  X,
  Scale,
  Brain,
  Timer,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchFoodsOfflineOnline } from "@/lib/foodSearchService";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    targets,
    meals,
    waterLogged,
    logMeal,
    deleteMeal,
    logWater,
    isRolloverEnabled,
    rolloverCalories
  } = useApp();
  const router = useRouter();

  // Calendar dates setup (Last 7 days ending today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [calendarDays, setCalendarDays] = useState<Array<{ name: string; dateNum: string; fullDate: string }>>([]);

  // Search & Logging Modal States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<LoggedMeal["mealType"]>("Breakfast");

  // Portion Customizer Dialog
  const [showPortionDialog, setShowPortionDialog] = useState(false);
  const [selectedFoodForLog, setSelectedFoodForLog] = useState<any | null>(null);
  const [loggedServings, setLoggedServings] = useState("1");

  useEffect(() => {
    // Generate last 7 days calendar
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = weekdays[d.getDay()];
      const dateNum = d.getDate().toString();
      const fullDate = d.toISOString().split("T")[0];
      days.push({ name: dayName, dateNum, fullDate });
    }
    setCalendarDays(days);
    const todayStr = new Date().toISOString().split("T")[0];
    setSelectedDateStr(todayStr);
  }, []);

  // Listen to bottom navigation plus button click trigger
  useEffect(() => {
    const handleOpenFoodLogger = () => {
      setShowSearchModal(true);
    };
    window.addEventListener("open-food-logger", handleOpenFoodLogger);
    return () => window.removeEventListener("open-food-logger", handleOpenFoodLogger);
  }, []);

  // Fuzzy food search handler
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
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!user || !targets) return null;

  // Gather calorie splits and filter meals for the SELECTED calendar day
  const dayMeals = meals.filter((m) => m && m.loggedDate === selectedDateStr);

  const loggedCalories = dayMeals.reduce((acc, m) => acc + (m.calories * (m.servings || 1)), 0);
  const loggedProtein = dayMeals.reduce((acc, m) => acc + (m.protein * (m.servings || 1)), 0);
  const loggedCarbs = dayMeals.reduce((acc, m) => acc + (m.carbs * (m.servings || 1)), 0);
  const loggedFat = dayMeals.reduce((acc, m) => acc + (m.fat * (m.servings || 1)), 0);

  // Auto adjustment calculations
  const todayCalorieTarget = isRolloverEnabled 
    ? targets.targetCalories + rolloverCalories 
    : targets.targetCalories;

  const remainingCalories = Math.max(0, Math.round(todayCalorieTarget - loggedCalories));
  const caloriePercent = Math.min(100, Math.round((loggedCalories / todayCalorieTarget) * 100));

  // Dynamic macros adjustment: Scale targets in proportion to adjusted calorie budget
  const calorieRatio = todayCalorieTarget / targets.targetCalories;
  const targetProtein = Math.max(20, Math.round(targets.targetProtein * calorieRatio));
  const targetCarbs = Math.max(20, Math.round(targets.targetCarbs * calorieRatio));
  const targetFat = Math.max(10, Math.round(targets.targetFat * calorieRatio));

  const proteinPercent = Math.min(100, Math.round((loggedProtein / targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((loggedCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((loggedFat / targetFat) * 100));

  const handleOpenPortion = (food: any) => {
    setSelectedFoodForLog(food);
    setLoggedServings("1");
    setShowPortionDialog(true);
  };

  const handleConfirmLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodForLog) return;
    const servingsVal = parseFloat(loggedServings) || 1;

    logMeal(
      selectedFoodForLog.name,
      selectedMealType,
      selectedFoodForLog.calories,
      selectedFoodForLog.protein,
      selectedFoodForLog.carbs,
      selectedFoodForLog.fat,
      servingsVal
    );

    // Patch logged date to selected date
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(`zenlog_meals_${user.id}`);
        if (stored) {
          const parsed: LoggedMeal[] = JSON.parse(stored);
          if (parsed.length > 0 && parsed[parsed.length - 1].loggedDate !== selectedDateStr) {
            parsed[parsed.length - 1].loggedDate = selectedDateStr;
            localStorage.setItem(`zenlog_meals_${user.id}`, JSON.stringify(parsed));
            // Trigger local reload or state update
            window.location.reload();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 100);

    setSearchQuery("");
    setShowPortionDialog(false);
    setShowSearchModal(false);
    setSelectedFoodForLog(null);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-8 space-y-8 text-black bg-[#FFFFFF] min-h-screen pb-36 font-inter selection:bg-black/10 select-none">
      
      {/* 1. ULTRA-MINIMAL HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 font-mono">
            {new Date(selectedDateStr).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl font-black tracking-tight font-outfit mt-0.5 text-black">
            ZenLog
          </h1>
        </div>

        {/* Streak active badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-black text-black">
          <Flame className="h-4 w-4 text-black" />
          <span>{meals.length > 0 ? "1 day streak" : "No streak"}</span>
        </div>
      </div>

      {/* 2. CALORIES REMAINING BLOCK (Cal AI Minimalist Style) */}
      <div className="py-6 text-left space-y-1">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-mono">
          Calories remaining
        </span>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-7xl font-black text-black tracking-tighter font-outfit">
            {remainingCalories.toLocaleString()}
          </h2>
          <span className="text-sm font-bold text-slate-400">kcal</span>
        </div>
        
        {/* Sleek single black progress line */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-black rounded-full transition-all duration-500 ease-out"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 pt-1 font-mono uppercase">
          <span>{loggedCalories.toLocaleString()} kcal consumed</span>
          <span>Target: {todayCalorieTarget.toLocaleString()} kcal</span>
        </div>
      </div>

      {/* 3. DYNAMIC MACROS PROGRESS BARS */}
      <div className="space-y-4 pt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
          Macronutrient progress
        </span>

        <div className="grid grid-cols-1 gap-3">
          {/* Protein Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-slate-800 flex items-center gap-1.5">🥩 Protein</span>
              <span className="text-black">{Math.round(loggedProtein)} / {targetProtein}g</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-slate-800 flex items-center gap-1.5">🌾 Carbs</span>
              <span className="text-black">{Math.round(loggedCarbs)} / {targetCarbs}g</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Fat Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-slate-800 flex items-center gap-1.5">🥑 Fats</span>
              <span className="text-black">{Math.round(loggedFat)} / {targetFat}g</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MANDATORY MANUAL FOOD SEARCH (Embedded search bar) */}
      <div className="space-y-3 pt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
          Quick search catalog
        </span>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search: Paneer, Rice, Chicken, Dal, Roti..."
            onClick={() => setShowSearchModal(true)}
            readOnly
            className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 pl-11 pr-4 focus:outline-none cursor-pointer text-xs font-bold text-slate-500 hover:bg-[#E8E8EC] transition-all"
          />
        </div>
      </div>

      {/* 5. TODAY'S MEALS LIST */}
      <div className="space-y-4 pt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
          Today's logged meals
        </span>

        {dayMeals.length === 0 ? (
          <div className="bg-[#F4F4F5] rounded-[24px] p-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200">
            <span className="text-2xl">🥗</span>
            <p className="text-xs font-bold text-slate-400">
              No meals logged for today. Tap the scan button to start.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-[20px] transition-all text-xs font-bold"
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-xl">🥗</span>
                  <div>
                    <h4 className="font-extrabold text-black text-sm">{meal.name}</h4>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">
                      {meal.mealType} • {meal.servings} serving
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-black text-black">+{Math.round(meal.calories * meal.servings)} kcal</span>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 rounded-full bg-white border border-slate-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. LARGE MEAL SCAN CTA BUTTON (Primary Action) */}
      <div className="pt-4">
        <button
          onClick={() => router.push("/scanner")}
          className="w-full py-4.5 rounded-[20px] bg-black text-white font-extrabold text-sm shadow-sm hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center space-x-2.5 border border-black"
        >
          <Camera className="h-5 w-5" />
          <span>Camera Meal Scan</span>
        </button>
      </div>

      {/* ==================== OVERLAY SEARCH MODAL ==================== */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end justify-center px-4 pb-4"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="bg-white rounded-[32px] w-full max-w-md p-6 space-y-4 shadow-xl text-left text-xs font-bold text-slate-700"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-extrabold text-black font-outfit uppercase tracking-widest font-mono text-[10px] text-slate-400">Search Food Database</span>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Meal Type selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedMealType(t)}
                    className={`py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider ${
                      selectedMealType === t 
                        ? "bg-black border-black text-white" 
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search input field */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query Paneer, Rice, Chicken, Jalebi, Dal, Roti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[20px] py-3.5 pl-11 pr-4 focus:outline-none focus:border-slate-300 font-bold text-black"
                />
              </div>

              {/* Results list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none pt-1">
                {searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOpenPortion(food)}
                    className="w-full flex items-center justify-between p-3 rounded-[20px] border border-slate-100 hover:bg-slate-50 text-left bg-slate-50/50"
                  >
                    <div>
                      <p className="font-extrabold text-black">{food.name}</p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                        {food.servingSize} • P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                      </span>
                    </div>
                    <span className="text-black font-black text-xs">+{food.calories} kcal</span>
                  </button>
                ))}
                {searchLoading && <p className="text-center text-slate-400 py-3 font-mono text-[10px] uppercase animate-pulse">Searching catalog...</p>}
                {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-center text-slate-400 py-3 font-mono text-[10px] uppercase">No matching preset foods found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PORTION CUSTOMIZER DIALOG ==================== */}
      <AnimatePresence>
        {showPortionDialog && selectedFoodForLog && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
            <form
              onSubmit={handleConfirmLog}
              className="bg-white rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-xl text-left text-xs font-bold text-slate-700 border border-slate-100"
            >
              <div className="space-y-1 text-center border-b border-slate-100 pb-2">
                <h4 className="text-sm font-extrabold text-black">{selectedFoodForLog.name}</h4>
                <p className="text-[10px] text-slate-400">{selectedFoodForLog.servingSize} base split</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Number of Servings</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={loggedServings}
                  onChange={(e) => setLoggedServings(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-transparent rounded-[16px] py-2.5 px-3 focus:outline-none text-black font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-black text-white font-extrabold hover:bg-slate-800 transition-all text-center"
              >
                Log to Dashboard
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
