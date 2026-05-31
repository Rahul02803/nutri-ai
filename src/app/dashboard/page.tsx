"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp, LoggedMeal } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
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
  Timer
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
    const handleOpenLogger = () => {
      setShowSearchModal(true);
    };
    window.addEventListener("open-food-logger", handleOpenLogger);
    return () => window.removeEventListener("open-food-logger", handleOpenLogger);
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

  // 1. Gather calorie splits and filter meals for the SELECTED calendar day
  const dayMeals = meals.filter((m) => m && m.loggedDate === selectedDateStr);

  const loggedCalories = dayMeals.reduce((acc, m) => acc + (m.calories * m.servings), 0);
  const loggedProtein = dayMeals.reduce((acc, m) => acc + (m.protein * m.servings), 0);
  const loggedCarbs = dayMeals.reduce((acc, m) => acc + (m.carbs * m.servings), 0);
  const loggedFat = dayMeals.reduce((acc, m) => acc + (m.fat * m.servings), 0);

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

  const remainingProtein = Math.max(0, Math.round(targetProtein - loggedProtein));
  const remainingCarbs = Math.max(0, Math.round(targetCarbs - loggedCarbs));
  const remainingFat = Math.max(0, Math.round(targetFat - loggedFat));

  const proteinPercent = Math.min(100, Math.round((loggedProtein / targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((loggedCarbs / targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((loggedFat / targetFat) * 100));

  // Gemini Coach recommendations based on splits
  const getAiRecommendation = () => {
    if (remainingProtein > 30) {
      return { msg: `Eat ${remainingProtein}g more protein today to hit your muscle recovery targets.`, type: "protein" };
    }
    if (waterLogged < 2500) {
      return { msg: "Drink 1.2L more water today to keep hydration levels optimized.", type: "water" };
    }
    return { msg: "Amazing! Today's calories and macros splits are perfectly balanced.", type: "perfect" };
  };

  const aiRec = getAiRecommendation();

  const handleOpenPortion = (food: any) => {
    setSelectedFoodForLog(food);
    setLoggedServings("1");
    setShowPortionDialog(true);
  };

  const handleConfirmLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodForLog) return;
    const servings = parseFloat(loggedServings) || 1;

    logMeal(
      selectedFoodForLog.name,
      selectedMealType,
      selectedFoodForLog.calories,
      selectedFoodForLog.protein,
      selectedFoodForLog.carbs,
      selectedFoodForLog.fat,
      servings
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
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 text-[#111827] bg-[#F8F8FA] min-h-screen pb-32">
      
      {/* 1. ZENLOG BRAND HEADER */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2 font-bold text-2xl font-outfit text-slate-900 tracking-tight">
          <span className="text-2xl">🍎</span>
          <span>ZenLog</span>
        </div>
        
        {/* Streak active badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-200/20 text-xs font-bold text-orange-600">
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          <span>{meals.length > 0 ? "1" : "0"}</span>
        </div>
      </div>

      {/* 2. HORIZONTAL DAYS CALENDAR STRIP */}
      <div className="flex justify-between items-center py-2 px-1">
        {calendarDays.map((day, idx) => {
          const isSelected = selectedDateStr === day.fullDate;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDateStr(day.fullDate)}
              className="flex flex-col items-center focus:outline-none transition-all"
            >
              <span className="text-[10px] font-bold text-slate-400 mb-1.5 block">{day.name}</span>
              {isSelected ? (
                <div className="h-10 w-9 rounded-full bg-[#111827] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                  {day.dateNum}
                </div>
              ) : (
                <div className="h-10 w-9 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-slate-500 font-semibold text-xs hover:border-slate-400">
                  {day.dateNum}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <hr className="border-slate-100" />

      {/* 3. CALORIES REMAINING CARD (Inspire by Cal AI) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 flex justify-between items-center shadow-xs relative overflow-hidden">
        <div className="space-y-1 text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-outfit">
            {remainingCalories}
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Calories left</span>
          
          {isRolloverEnabled && rolloverCalories !== 0 && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-100">
              {rolloverCalories > 0 ? `+${rolloverCalories} kcal auto adjustment` : `${rolloverCalories} kcal deficit`}
            </span>
          )}
        </div>

        {/* Circular progress meter */}
        <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
          <svg className="absolute h-full w-full transform -rotate-90">
            <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="5.5" fill="transparent" />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="#111827"
              strokeWidth="5.5"
              fill="transparent"
              strokeDasharray={213}
              strokeDashoffset={213 - (213 * caloriePercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <Flame className="h-5 w-5 text-[#111827] z-10" />
        </div>
      </div>

      {/* 4. MACRONUTRIENTS ROW (Proportional adjustments) */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Protein left", val: remainingProtein, total: targetProtein, percent: proteinPercent, icon: "🥩", color: "#FF6B81" },
          { label: "Carbs left", val: remainingCarbs, total: targetCarbs, percent: carbsPercent, icon: "🌾", color: "#F4A261" },
          { label: "Fats left", val: remainingFat, total: targetFat, percent: fatPercent, icon: "🥑", color: "#4A90E2" }
        ].map((macro, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-between space-y-3 shadow-xs text-center">
            <div className="text-center">
              <span className="text-base font-extrabold text-slate-900 block font-outfit">{macro.val}g</span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">{macro.label}</span>
            </div>
            
            {/* Small circular gauge inside card */}
            <div className="relative h-11 w-11 flex items-center justify-center">
              <svg className="absolute h-full w-full transform -rotate-90">
                <circle cx="22" cy="22" r="18" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke={macro.color}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * macro.percent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="text-[10px] z-10">{macro.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Page indicator pagination dots */}
      <div className="flex justify-center space-x-1 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
      </div>

      {/* 5. GEMINI AI COACH RECOMMENDATION CARD */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl text-left shadow-xs flex items-start space-x-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-16 w-16 bg-[#14B8A6]/5 rounded-full blur-xl" />
        <div className="h-10 w-10 bg-[#14B8A6]/10 text-[#14B8A6] rounded-2xl flex items-center justify-center shrink-0">
          <Brain className="h-5.5 w-5.5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Gemini 2.5 Flash Advice</span>
          <p className="text-xs font-bold text-slate-700 leading-relaxed">
            {aiRec.msg}
          </p>
        </div>
      </div>

      {/* 6. DYNAMIC RECENTLY UPLOADED LIST */}
      <div className="space-y-3.5 text-left">
        <h3 className="font-outfit text-md font-extrabold text-slate-800 tracking-tight">Recently uploaded</h3>
        
        {dayMeals.length === 0 ? (
          /* Empty placeholder exactly like the screenshot */
          <div className="border border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 shadow-xs">
            <div className="relative h-20 w-32 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-3 shadow-xs">
              <span className="text-3xl">🥗</span>
              <div className="absolute bottom-3 left-14 space-y-1">
                <div className="h-1.5 w-12 bg-slate-200 rounded" />
                <div className="h-1 w-8 bg-slate-100 rounded" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              Tap + to add your first meal of the day
            </p>
          </div>
        ) : (
          /* Populated logged meals list */
          <div className="space-y-2.5">
            {dayMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3.5 border border-slate-100 bg-white rounded-2xl shadow-xs hover:border-slate-200 transition-all text-xs animate-in fade-in"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-sm">
                    🥗
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{meal.name}</h4>
                    <span className="text-[9px] text-slate-400 block font-semibold">{meal.mealType} • {meal.servings} serving</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3.5">
                  <span className="font-extrabold text-emerald-600">+{Math.round(meal.calories * meal.servings)} kcal</span>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-1 rounded bg-rose-50 text-rose-500 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                <span className="text-sm font-extrabold text-slate-900">Search Food Database</span>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100"
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
                    className={`py-1.5 rounded-lg border text-[10px] font-bold ${
                      selectedMealType === t 
                        ? "bg-[#111827] border-[#111827] text-white" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search input field */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query Indian foods (Roti, Paneer)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-slate-400 font-semibold"
                />
              </div>

              {/* Results list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none pt-1">
                {searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOpenPortion(food)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-left"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{food.name}</p>
                      <span className="text-[9px] text-slate-400 font-semibold">{food.servingSize} • P: {food.protein}g C: {food.carbs}g F: {food.fat}g</span>
                    </div>
                    <span className="text-emerald-600 font-extrabold text-xs">+{food.calories} kcal</span>
                  </button>
                ))}
                {searchLoading && <p className="text-center text-slate-400 py-3">Searching catalog...</p>}
                {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-center text-slate-400 py-3">No matching preset foods found.</p>
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
                <h4 className="text-sm font-extrabold text-slate-900">{selectedFoodForLog.name}</h4>
                <p className="text-[10px] text-slate-400">{selectedFoodForLog.servingSize} base split</p>
              </div>

              <div className="space-y-1">
                <label>Number of Servings</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={loggedServings}
                  onChange={(e) => setLoggedServings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-center"
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
