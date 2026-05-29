"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OnboardingData, CalculatedTargets, calculateNutritionTargets } from "@/lib/calculations";
import { FoodItem, INITIAL_FOODS } from "@/lib/foods";
import { useAuth } from "./AuthContext";

export interface LoggedMeal {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  loggedDate: string; // YYYY-MM-DD
  // Micro nutrients & Additional macro tags
  fiber?: number;
  sugar?: number;
  sodium?: number;
  potassium?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
  barcode?: string;
  brand?: string;
}

export interface WeightLog {
  weight: number;
  date: string; // YYYY-MM-DD
}

export interface WorkoutLog {
  id: string;
  name: string;
  type: "Strength" | "Cardio";
  duration: number; // in minutes
  caloriesBurned: number;
  loggedDate: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  unlockedDate: string; // YYYY-MM-DD
}

interface AppContextType {
  onboardingData: OnboardingData | null;
  targets: CalculatedTargets | null;
  meals: LoggedMeal[];
  waterLogged: number; // In ml
  weightLogs: WeightLog[];
  foodCatalog: FoodItem[];
  favorites: FoodItem[];
  recentSearches: string[];
  customFoods: FoodItem[];
  
  // Fasting clock states
  isFasting: boolean;
  fastingDuration: number;
  fastingStartTime: string | null;
  fastingElapsedTime: number; // in seconds
  startFasting: (durationHours: number) => void;
  stopFasting: () => void;
  cancelFasting: () => void;
  
  // Step syncing state
  steps: number;
  syncSteps: (newSteps: number) => void;
  
  // Workout logger state
  workouts: WorkoutLog[];
  logWorkout: (name: string, type: "Strength" | "Cardio", duration: number, caloriesBurned: number) => void;
  deleteWorkout: (id: string) => void;
  
  // Streaks & achievements
  streakCount: number;
  unlockedBadges: Badge[];
  checkAndUnlockBadges: () => void;

  saveOnboarding: (data: OnboardingData) => void;
  logMeal: (
    name: string,
    type: LoggedMeal["mealType"],
    cal: number,
    pro: number,
    carb: number,
    fat: number,
    servings: number,
    extraMetrics?: {
      fiber?: number;
      sugar?: number;
      sodium?: number;
      potassium?: number;
      vitaminA?: number;
      vitaminC?: number;
      calcium?: number;
      iron?: number;
      barcode?: string;
      brand?: string;
    }
  ) => void;
  deleteMeal: (id: string) => void;
  logWater: (amountMl: number) => void;
  logWeight: (weight: number) => void;
  addNewFoodToCatalog: (food: Omit<FoodItem, "id">) => void;
  deleteFoodFromCatalog: (id: string) => void;
  manuallySetTargets: (cal: number, pro: number, carb: number, fat: number) => void;
  toggleFavorite: (food: FoodItem) => void;
  addRecentSearch: (query: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUserOnboardStatus } = useAuth();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [targets, setTargets] = useState<CalculatedTargets | null>(null);
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [waterLogged, setWaterLogged] = useState<number>(0);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [foodCatalog, setFoodCatalog] = useState<FoodItem[]>(INITIAL_FOODS);
  
  // Advanced feature state variables
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // Fasting clock states
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [fastingDuration, setFastingDuration] = useState<number>(16);
  const [fastingStartTime, setFastingStartTime] = useState<string | null>(null);
  const [fastingElapsedTime, setFastingElapsedTime] = useState<number>(0);

  // Health sync states
  const [steps, setSteps] = useState<number>(4200);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [streakCount, setStreakCount] = useState<number>(3);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);

  // Initialize and load persistent data
  useEffect(() => {
    if (!user) return;

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Load Onboarding Data & Calculate Targets
    try {
      const storedOnboarding = localStorage.getItem(`nutriai_onboarding_${user.id}`);
      let computedTargets: CalculatedTargets | null = null;
      if (storedOnboarding) {
        const parsed = JSON.parse(storedOnboarding);
        if (parsed) {
          setOnboardingData(parsed);
          computedTargets = calculateNutritionTargets(parsed);
          if (user && !user.isOnboarded) {
            updateUserOnboardStatus(true);
          }
        }
      }
      
      const storedManual = localStorage.getItem(`nutriai_manual_targets_${user.id}`);
      if (storedManual) {
        const parsedManual = JSON.parse(storedManual);
        if (parsedManual) {
          const baseTargets = computedTargets || {
            bmi: 23.5,
            bmiCategory: "Normal",
            bmr: 1650,
            tdee: 2200,
            targetCalories: 2000,
            targetProtein: 140,
            targetCarbs: 210,
            targetFat: 65,
            waterTargetMl: 3000,
          };
          computedTargets = {
            ...baseTargets,
            targetCalories: parsedManual.targetCalories ?? baseTargets.targetCalories,
            targetProtein: parsedManual.targetProtein ?? baseTargets.targetProtein,
            targetCarbs: parsedManual.targetCarbs ?? baseTargets.targetCarbs,
            targetFat: parsedManual.targetFat ?? baseTargets.targetFat,
          };
        }
      }

      if (computedTargets) {
        setTargets(computedTargets);
      } else {
        setTargets({
          bmi: 23.5,
          bmiCategory: "Normal",
          bmr: 1650,
          tdee: 2200,
          targetCalories: 2000,
          targetProtein: 140,
          targetCarbs: 210,
          targetFat: 65,
          waterTargetMl: 3000,
        });
      }
    } catch (e) {
      console.error("Onboarding load failure", e);
    }

    // 2. Load Logged Meals
    try {
      const storedMeals = localStorage.getItem(`nutriai_meals_${user.id}`);
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals) || []);
      } else {
        // Seed preloaded meals for a gorgeous startup view
        const seededMeals: LoggedMeal[] = [
          {
            id: "m1",
            name: "Idli with Sambar",
            mealType: "Breakfast",
            calories: 185,
            protein: 6.5,
            carbs: 36,
            fat: 2,
            servings: 1,
            loggedDate: todayStr,
            fiber: 4,
            sugar: 3.5,
            sodium: 410,
            potassium: 160,
            vitaminA: 35,
            vitaminC: 3,
            calcium: 55,
            iron: 1.1
          },
          {
            id: "m2",
            name: "Basmati Rice with Paneer Tikka Masala",
            mealType: "Lunch",
            calories: 475,
            protein: 18.3,
            carbs: 56,
            fat: 20.4,
            servings: 1,
            loggedDate: todayStr,
            fiber: 3.6,
            sugar: 4.1,
            sodium: 485,
            potassium: 225,
            vitaminA: 120,
            vitaminC: 6.8,
            calcium: 360,
            iron: 2.0
          },
          {
            id: "m3",
            name: "Whey Protein Shake & Apple",
            mealType: "Snack",
            calories: 200,
            protein: 25.4,
            carbs: 21.5,
            fat: 1.2,
            servings: 1,
            loggedDate: todayStr,
            fiber: 4.9,
            sugar: 15.5,
            sodium: 56,
            potassium: 320,
            vitaminA: 8,
            vitaminC: 7,
            calcium: 149,
            iron: 0.3
          }
        ];
        setMeals(seededMeals);
        localStorage.setItem(`nutriai_meals_${user.id}`, JSON.stringify(seededMeals));
      }
    } catch (e) {
      setMeals([]);
    }

    // 3. Load Water Logs
    try {
      const storedWater = localStorage.getItem(`nutriai_water_${user.id}`);
      if (storedWater) {
        setWaterLogged(parseInt(storedWater) || 0);
      } else {
        setWaterLogged(1250);
        localStorage.setItem(`nutriai_water_${user.id}`, "1250");
      }
    } catch (e) {
      setWaterLogged(0);
    }

    // 4. Load Weight Logs
    try {
      const storedWeights = localStorage.getItem(`nutriai_weights_${user.id}`);
      if (storedWeights) {
        setWeightLogs(JSON.parse(storedWeights) || []);
      } else {
        const seededWeights: WeightLog[] = [];
        const now = new Date();
        const initialWeight = 78.5;
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const weight = initialWeight - (6 - i) * 0.2 + (Math.random() * 0.15 - 0.07);
          seededWeights.push({
            weight: Math.round(weight * 10) / 10,
            date: dateStr,
          });
        }
        setWeightLogs(seededWeights);
        localStorage.setItem(`nutriai_weights_${user.id}`, JSON.stringify(seededWeights));
      }
    } catch (e) {
      setWeightLogs([]);
    }

    // 5. Load Custom Food Catalog
    try {
      const storedCatalog = localStorage.getItem(`nutriai_catalog_${user.id}`);
      if (storedCatalog) {
        setFoodCatalog(JSON.parse(storedCatalog) || INITIAL_FOODS);
      }
    } catch (e) {
      setFoodCatalog(INITIAL_FOODS);
    }

    // 6. Load Favorites
    try {
      const storedFavorites = localStorage.getItem(`nutriai_favorites_${user.id}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites) || []);
      }
    } catch (e) {
      console.error(e);
    }

    // 7. Load Recent Searches
    try {
      const storedRecents = localStorage.getItem(`nutriai_recents_${user.id}`);
      if (storedRecents) {
        setRecentSearches(JSON.parse(storedRecents) || []);
      }
    } catch (e) {
      console.error(e);
    }

    // 8. Load Custom Foods (for the dedicated My Foods tab)
    try {
      const storedCustomFoods = localStorage.getItem(`nutriai_custom_foods_${user.id}`);
      if (storedCustomFoods) {
        setCustomFoods(JSON.parse(storedCustomFoods) || []);
      }
    } catch (e) {
      console.error(e);
    }

    // 9. Fasting Clock Loading
    try {
      const storedIsFasting = localStorage.getItem(`nutriai_fasting_isFasting_${user.id}`);
      setIsFasting(storedIsFasting === "true");
      
      const storedDuration = localStorage.getItem(`nutriai_fasting_duration_${user.id}`);
      setFastingDuration(parseInt(storedDuration || "16"));
      
      const storedStartTime = localStorage.getItem(`nutriai_fasting_startTime_${user.id}`);
      setFastingStartTime(storedStartTime);
    } catch (e) {
      console.error(e);
    }
    
    // 10. Steps Loading
    try {
      const storedSteps = localStorage.getItem(`nutriai_steps_${user.id}`);
      setSteps(parseInt(storedSteps || "4200"));
    } catch (e) {
      console.error(e);
    }
    
    // 11. Workouts Loading
    try {
      const storedWorkouts = localStorage.getItem(`nutriai_workouts_${user.id}`);
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      } else {
        const seededWorkouts: WorkoutLog[] = [
          {
            id: "w1",
            name: "Morning Yoga Flow",
            type: "Cardio",
            duration: 30,
            caloriesBurned: 150,
            loggedDate: todayStr,
          },
          {
            id: "w2",
            name: "Upper Body Strength Push",
            type: "Strength",
            duration: 45,
            caloriesBurned: 320,
            loggedDate: todayStr,
          }
        ];
        setWorkouts(seededWorkouts);
        localStorage.setItem(`nutriai_workouts_${user.id}`, JSON.stringify(seededWorkouts));
      }
    } catch (e) {
      console.error(e);
    }
    
    // 12. Streaks and Badges Loading
    try {
      const storedStreak = localStorage.getItem(`nutriai_streak_${user.id}`);
      setStreakCount(parseInt(storedStreak || "3"));
      
      const storedBadges = localStorage.getItem(`nutriai_badges_${user.id}`);
      if (storedBadges) {
        setUnlockedBadges(JSON.parse(storedBadges));
      } else {
        const seededBadges: Badge[] = [
          {
            id: "first_meal",
            name: "First Step",
            description: "Logged your first meal on NutriTrack AI",
            icon: "🥗",
            unlockedDate: todayStr,
          },
          {
            id: "water_champ",
            name: "Hydration Master",
            description: "Drank over 3,000ml of water in a day",
            icon: "💧",
            unlockedDate: todayStr,
          }
        ];
        setUnlockedBadges(seededBadges);
        localStorage.setItem(`nutriai_badges_${user.id}`, JSON.stringify(seededBadges));
      }
    } catch (e) {
      console.error(e);
    }

  }, [user]);

  // Fasting timer ticking logic
  useEffect(() => {
    if (!isFasting || !fastingStartTime) {
      setFastingElapsedTime(0);
      return;
    }
    
    const syncTime = () => {
      const start = new Date(fastingStartTime).getTime();
      const now = new Date().getTime();
      setFastingElapsedTime(Math.max(0, Math.floor((now - start) / 1000)));
    };

    syncTime();
    const interval = setInterval(syncTime, 1000);

    return () => clearInterval(interval);
  }, [isFasting, fastingStartTime]);

  // Automatic badge checker
  useEffect(() => {
    if (user) {
      checkAndUnlockBadges();
    }
  }, [meals, waterLogged, streakCount, workouts]);

  // Badge unlocking helper
  const unlockBadge = (id: string, name: string, description: string, icon: string) => {
    if (!user) return;
    const todayStr = new Date().toISOString().split("T")[0];
    setUnlockedBadges((prev) => {
      if (prev.some((b) => b.id === id)) return prev;
      const newBadge: Badge = { id, name, description, icon, unlockedDate: todayStr };
      const updated = [...prev, newBadge];
      localStorage.setItem(`nutriai_badges_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const checkAndUnlockBadges = () => {
    if (!user) return;
    if (waterLogged >= 3000) {
      unlockBadge("water_champ", "Hydration Master", "Drank over 3,000ml of water in a day", "💧");
    }
    if (meals.length > 0) {
      unlockBadge("first_meal", "First Step", "Logged your first meal on NutriTrack AI", "🥗");
    }
    if (streakCount >= 3) {
      unlockBadge("streak_3", "Consistent Builder", "Maintained a solid 3-day health logging streak", "🔥");
    }
    if (streakCount >= 7) {
      unlockBadge("streak_7", "NutriTrack Devotee", "Achieved an amazing 7-day health logging streak", "👑");
    }
    if (workouts.length > 0) {
      unlockBadge("workout_warrior", "Iron Will", "Logged your first workout session", "💪");
    }
  };

  // Fasting controllers
  const startFasting = (durationHours: number) => {
    if (!user) return;
    const nowStr = new Date().toISOString();
    setIsFasting(true);
    setFastingDuration(durationHours);
    setFastingStartTime(nowStr);
    setFastingElapsedTime(0);
    
    localStorage.setItem(`nutriai_fasting_isFasting_${user.id}`, "true");
    localStorage.setItem(`nutriai_fasting_duration_${user.id}`, durationHours.toString());
    localStorage.setItem(`nutriai_fasting_startTime_${user.id}`, nowStr);
  };

  const stopFasting = () => {
    if (!user) return;
    setIsFasting(false);
    setFastingStartTime(null);
    setFastingElapsedTime(0);
    
    localStorage.setItem(`nutriai_fasting_isFasting_${user.id}`, "false");
    localStorage.removeItem(`nutriai_fasting_startTime_${user.id}`);
    
    unlockBadge("fasting_champion", "Autophagy Hero", "Completed a scheduled fasting cycle", "⏳");
  };

  const cancelFasting = () => {
    if (!user) return;
    setIsFasting(false);
    setFastingStartTime(null);
    setFastingElapsedTime(0);
    
    localStorage.setItem(`nutriai_fasting_isFasting_${user.id}`, "false");
    localStorage.removeItem(`nutriai_fasting_startTime_${user.id}`);
  };

  // Steps controller
  const syncSteps = (newSteps: number) => {
    if (!user) return;
    setSteps(newSteps);
    localStorage.setItem(`nutriai_steps_${user.id}`, newSteps.toString());
    
    if (newSteps >= 10000) {
      unlockBadge("step_master", "10K Club", "Walked over 10,000 steps in a single day", "👟");
    }
  };

  // Workout controllers
  const logWorkout = (name: string, type: "Strength" | "Cardio", duration: number, caloriesBurned: number) => {
    if (!user) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const newWorkout: WorkoutLog = {
      id: "workout-log-" + Math.floor(Math.random() * 100000),
      name,
      type,
      duration,
      caloriesBurned,
      loggedDate: todayStr,
    };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    localStorage.setItem(`nutriai_workouts_${user.id}`, JSON.stringify(updated));
  };

  const deleteWorkout = (id: string) => {
    if (!user) return;
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    localStorage.setItem(`nutriai_workouts_${user.id}`, JSON.stringify(updated));
  };

  // Saves Onboarding Inputs
  const saveOnboarding = (data: OnboardingData) => {
    if (!user) return;
    setOnboardingData(data);
    const computedTargets = calculateNutritionTargets(data);
    setTargets(computedTargets);

    localStorage.setItem(`nutriai_onboarding_${user.id}`, JSON.stringify(data));
    localStorage.removeItem(`nutriai_manual_targets_${user.id}`);
    updateUserOnboardStatus(true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const currentLogs = weightLogs || [];
      const newLogs = [...currentLogs.filter((w) => w && w.date !== todayStr), { weight: data.currentWeight, date: todayStr }];
      setWeightLogs(newLogs);
      localStorage.setItem(`nutriai_weights_${user.id}`, JSON.stringify(newLogs));
    } catch (e) {
      console.error("Weight log sync failure", e);
    }
  };

  // Logs a Meal with micro and macro metrics
  const logMeal = (
    name: string,
    type: LoggedMeal["mealType"],
    cal: number,
    pro: number,
    carb: number,
    fat: number,
    servings: number,
    extraMetrics?: {
      fiber?: number;
      sugar?: number;
      sodium?: number;
      potassium?: number;
      vitaminA?: number;
      vitaminC?: number;
      calcium?: number;
      iron?: number;
      barcode?: string;
      brand?: string;
    }
  ) => {
    if (!user) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const newMeal: LoggedMeal = {
      id: "meal-log-" + Math.floor(Math.random() * 100000),
      name,
      mealType: type,
      calories: Math.round(cal * servings),
      protein: Math.round(pro * servings * 10) / 10,
      carbs: Math.round(carb * servings * 10) / 10,
      fat: Math.round(fat * servings * 10) / 10,
      servings,
      loggedDate: todayStr,
      // Scaled Micro nutrients
      fiber: extraMetrics?.fiber !== undefined ? Math.round(extraMetrics.fiber * servings * 10) / 10 : undefined,
      sugar: extraMetrics?.sugar !== undefined ? Math.round(extraMetrics.sugar * servings * 10) / 10 : undefined,
      sodium: extraMetrics?.sodium !== undefined ? Math.round(extraMetrics.sodium * servings) : undefined,
      potassium: extraMetrics?.potassium !== undefined ? Math.round(extraMetrics.potassium * servings) : undefined,
      vitaminA: extraMetrics?.vitaminA !== undefined ? Math.round(extraMetrics.vitaminA * servings) : undefined,
      vitaminC: extraMetrics?.vitaminC !== undefined ? Math.round(extraMetrics.vitaminC * servings * 10) / 10 : undefined,
      calcium: extraMetrics?.calcium !== undefined ? Math.round(extraMetrics.calcium * servings) : undefined,
      iron: extraMetrics?.iron !== undefined ? Math.round(extraMetrics.iron * servings * 10) / 10 : undefined,
      barcode: extraMetrics?.barcode,
      brand: extraMetrics?.brand,
    };

    const updated = [newMeal, ...meals];
    setMeals(updated);
    localStorage.setItem(`nutriai_meals_${user.id}`, JSON.stringify(updated));
  };

  // Deletes a Logged Meal
  const deleteMeal = (id: string) => {
    if (!user) return;
    const updated = meals.filter((meal) => meal.id !== id);
    setMeals(updated);
    localStorage.setItem(`nutriai_meals_${user.id}`, JSON.stringify(updated));
  };

  // Hydration tracking
  const logWater = (amountMl: number) => {
    if (!user) return;
    const updated = Math.max(0, waterLogged + amountMl);
    setWaterLogged(updated);
    localStorage.setItem(`nutriai_water_${user.id}`, updated.toString());
  };

  // Logs Daily Weight
  const logWeight = (weight: number) => {
    if (!user) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const updatedLogs = [...weightLogs.filter((w) => w.date !== todayStr), { weight, date: todayStr }].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setWeightLogs(updatedLogs);
    localStorage.setItem(`nutriai_weights_${user.id}`, JSON.stringify(updatedLogs));

    if (onboardingData) {
      const updatedOnboarding = { ...onboardingData, currentWeight: weight };
      setOnboardingData(updatedOnboarding);
      localStorage.setItem(`nutriai_onboarding_${user.id}`, JSON.stringify(updatedOnboarding));
      const computedTargets = calculateNutritionTargets(updatedOnboarding);
      
      const storedManual = localStorage.getItem(`nutriai_manual_targets_${user.id}`);
      if (storedManual) {
        const parsedManual = JSON.parse(storedManual);
        if (parsedManual) {
          setTargets({
            ...computedTargets,
            targetCalories: parsedManual.targetCalories ?? computedTargets.targetCalories,
            targetProtein: parsedManual.targetProtein ?? computedTargets.targetProtein,
            targetCarbs: parsedManual.targetCarbs ?? computedTargets.targetCarbs,
            targetFat: parsedManual.targetFat ?? computedTargets.targetFat,
          });
        } else {
          setTargets(computedTargets);
        }
      } else {
        setTargets(computedTargets);
      }
    }
  };

  // Adds a food to the catalog AND customFoods list
  const addNewFoodToCatalog = (food: Omit<FoodItem, "id">) => {
    if (!user) return;
    const newFood: FoodItem = {
      ...food,
      id: "custom-food-" + Math.floor(Math.random() * 10000),
    };
    
    const updatedCatalog = [newFood, ...foodCatalog];
    setFoodCatalog(updatedCatalog);
    localStorage.setItem(`nutriai_catalog_${user.id}`, JSON.stringify(updatedCatalog));

    const updatedCustom = [newFood, ...customFoods];
    setCustomFoods(updatedCustom);
    localStorage.setItem(`nutriai_custom_foods_${user.id}`, JSON.stringify(updatedCustom));
  };

  const deleteFoodFromCatalog = (id: string) => {
    if (!user) return;
    const updatedCatalog = foodCatalog.filter((f) => f.id !== id);
    setFoodCatalog(updatedCatalog);
    localStorage.setItem(`nutriai_catalog_${user.id}`, JSON.stringify(updatedCatalog));

    const updatedCustom = customFoods.filter((f) => f.id !== id);
    setCustomFoods(updatedCustom);
    localStorage.setItem(`nutriai_custom_foods_${user.id}`, JSON.stringify(updatedCustom));
  };

  // Toggle favorites mapping
  const toggleFavorite = (food: FoodItem) => {
    if (!user) return;
    const isFav = favorites.some((f) => f.id === food.id);
    let updated;
    if (isFav) {
      updated = favorites.filter((f) => f.id !== food.id);
    } else {
      updated = [food, ...favorites];
    }
    setFavorites(updated);
    localStorage.setItem(`nutriai_favorites_${user.id}`, JSON.stringify(updated));
  };

  // Add recent search cache
  const addRecentSearch = (query: string) => {
    if (!user || !query.trim()) return;
    const cleanQuery = query.trim();
    const updated = [cleanQuery, ...recentSearches.filter((q) => q.toLowerCase() !== cleanQuery.toLowerCase())].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem(`nutriai_recents_${user.id}`, JSON.stringify(updated));
  };

  // Manual override custom target values
  const manuallySetTargets = (cal: number, pro: number, carb: number, fat: number) => {
    if (!user) return;
    const manual = {
      targetCalories: cal,
      targetProtein: pro,
      targetCarbs: carb,
      targetFat: fat
    };
    localStorage.setItem(`nutriai_manual_targets_${user.id}`, JSON.stringify(manual));
    
    setTargets(prev => {
      const base = prev || {
        bmi: 23.5,
        bmiCategory: "Normal",
        bmr: 1650,
        tdee: 2200,
        targetCalories: 2000,
        targetProtein: 140,
        targetCarbs: 210,
        targetFat: 65,
        waterTargetMl: 3000,
      };
      return {
        ...base,
        targetCalories: cal,
        targetProtein: pro,
        targetCarbs: carb,
        targetFat: fat
      };
    });
  };

  // Resets profile data
  const resetAllData = () => {
    if (!user) return;
    setOnboardingData(null);
    setMeals([]);
    setWaterLogged(0);
    setWeightLogs([]);
    setFoodCatalog(INITIAL_FOODS);
    setFavorites([]);
    setRecentSearches([]);
    setCustomFoods([]);
    setIsFasting(false);
    setFastingStartTime(null);
    setFastingElapsedTime(0);
    setSteps(4200);
    setWorkouts([]);
    setStreakCount(3);
    setUnlockedBadges([]);
    updateUserOnboardStatus(false);

    localStorage.removeItem(`nutriai_onboarding_${user.id}`);
    localStorage.removeItem(`nutriai_meals_${user.id}`);
    localStorage.removeItem(`nutriai_water_${user.id}`);
    localStorage.removeItem(`nutriai_weights_${user.id}`);
    localStorage.removeItem(`nutriai_catalog_${user.id}`);
    localStorage.removeItem(`nutriai_manual_targets_${user.id}`);
    localStorage.removeItem(`nutriai_favorites_${user.id}`);
    localStorage.removeItem(`nutriai_recents_${user.id}`);
    localStorage.removeItem(`nutriai_custom_foods_${user.id}`);
    localStorage.removeItem(`nutriai_fasting_isFasting_${user.id}`);
    localStorage.removeItem(`nutriai_fasting_duration_${user.id}`);
    localStorage.removeItem(`nutriai_fasting_startTime_${user.id}`);
    localStorage.removeItem(`nutriai_steps_${user.id}`);
    localStorage.removeItem(`nutriai_workouts_${user.id}`);
    localStorage.removeItem(`nutriai_streak_${user.id}`);
    localStorage.removeItem(`nutriai_badges_${user.id}`);
  };

  return (
    <AppContext.Provider
      value={{
        onboardingData,
        targets,
        meals,
        waterLogged,
        weightLogs,
        foodCatalog,
        favorites,
        recentSearches,
        customFoods,
        
        // Fasting
        isFasting,
        fastingDuration,
        fastingStartTime,
        fastingElapsedTime,
        startFasting,
        stopFasting,
        cancelFasting,
        
        // Steps
        steps,
        syncSteps,
        
        // Workouts
        workouts,
        logWorkout,
        deleteWorkout,
        
        // Streaks
        streakCount,
        unlockedBadges,
        checkAndUnlockBadges,

        saveOnboarding,
        logMeal,
        deleteMeal,
        logWater,
        logWeight,
        addNewFoodToCatalog,
        deleteFoodFromCatalog,
        manuallySetTargets,
        toggleFavorite,
        addRecentSearch,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
