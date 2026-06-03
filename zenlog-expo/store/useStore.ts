import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number;
  current_weight?: number;
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "extreme";
  goal?: "cut" | "maintain" | "bulk";
  target_weight?: number;
  diet_preference?: "vegetarian" | "non-vegetarian" | "vegan";
  steps_goal?: number;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
}

export interface Meal {
  id: string;
  user_id: string;
  image_url?: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  foods?: FoodItem[];
}

export interface FoodItem {
  id: string;
  meal_id: string;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  body_fat?: number;
  created_at: string;
}

export interface FoodPrediction {
  id: string;
  user_id: string;
  meal_id?: string;
  predicted_food: string;
  predicted_weight: number;
  predicted_calories: number;
  confidence: number;
  created_at: string;
}

export interface FoodCorrection {
  id: string;
  prediction_id: string;
  corrected_food: string;
  corrected_weight: number;
  corrected_calories: number;
  corrected_protein: number;
  corrected_carbs: number;
  corrected_fat: number;
  created_at: string;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  template_name: string;
  created_at: string;
  foods: Omit<FoodItem, "id" | "meal_id">[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface IndianFoodItem {
  id: string;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitamin_d: number;
  vitamin_b12: number;
  category: "North Indian" | "South Indian" | "Street Food" | "Fast Food" | "Restaurant Meals" | "Vegetarian" | "Non Vegetarian";
  is_verified: boolean;
  popularity_score: number;
}

export interface HydrationLog {
  id: string;
  amountMl: number;
  created_at: string;
}

export interface SleepLog {
  id: string;
  hours: number;
  created_at: string;
}

interface ZenlogState {
  user: UserProfile | null;
  meals: Meal[];
  weightLogs: WeightLog[];
  predictions: FoodPrediction[];
  corrections: FoodCorrection[];
  templates: MealTemplate[];
  chatHistory: ChatMessage[];
  subscriptionPlan: "free" | "premium";
  scanCountToday: number;
  isDarkMode: boolean;
  weightUnit: "kg" | "lb";
  
  // Indian Food Database State
  indianFoods: IndianFoodItem[];
  recentFoods: IndianFoodItem[];

  // Hydration & Sleep
  hydrationLogs: HydrationLog[];
  sleepLogs: SleepLog[];

  // UI States
  isTabBarHidden: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, name?: string) => void;
  setTabBarHidden: (hidden: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
  saveOnboarding: (profile: Partial<UserProfile>) => void;
  logMeal: (meal: Omit<Meal, "id" | "user_id" | "created_at">, foods?: Omit<FoodItem, "id" | "meal_id">[]) => void;
  deleteMeal: (id: string) => void;
  logWeight: (weight: number, bodyFat?: number) => void;
  savePredictionAndCorrection: (pred: Omit<FoodPrediction, "id" | "user_id" | "created_at">, corr: Omit<FoodCorrection, "id" | "created_at">) => void;
  createTemplate: (name: string, foods: Omit<FoodItem, "id" | "meal_id">[]) => void;
  deleteTemplate: (id: string) => void;
  toggleDarkMode: () => void;
  toggleWeightUnit: () => void;
  sendChatMessage: (text: string) => void;
  receiveChatCoachMessage: (text: string) => void;
  incrementScans: () => void;
  upgradeSubscription: (plan: "free" | "premium") => void;

  // Indian Foods DB Actions
  addIndianFood: (food: Omit<IndianFoodItem, "id" | "popularity_score">) => void;
  editIndianFood: (id: string, updated: Partial<IndianFoodItem>) => void;
  deleteIndianFood: (id: string) => void;
  verifyIndianFood: (id: string) => void;
  logRecentFood: (food: IndianFoodItem) => void;
  searchIndianFoods: (query: string) => IndianFoodItem[];

  // Automatic Goal Adjustment Engine Action
  evaluateWeeklyGoalAdjustment: () => { adjusted: boolean; oldCalories: number; newCalories: number; reason: string } | null;

  // Hydration & Sleep Actions
  logWater: (amountMl: number) => void;
  logSleep: (hours: number) => void;
  calculateDailyHealthScore: (dateStr: string) => {
    total: number;
    nutrition: number;
    protein: number;
    hydration: number;
    sleep: number;
    consistency: number;
  };
}

// Preset Indian Food Database entries
const INITIAL_INDIAN_FOODS: IndianFoodItem[] = [
  {
    id: "inf_1",
    name: "Paneer Butter Masala",
    serving_size: "1 bowl (200g)",
    calories: 380,
    protein: 14,
    carbs: 12,
    fat: 30,
    fiber: 3,
    iron: 2.1,
    calcium: 320,
    vitamin_d: 0.8,
    vitamin_b12: 0.4,
    category: "North Indian",
    is_verified: true,
    popularity_score: 95
  },
  {
    id: "inf_2",
    name: "Masala Dosa",
    serving_size: "1 dosa (150g)",
    calories: 287,
    protein: 6,
    carbs: 45,
    fat: 9,
    fiber: 4,
    iron: 1.8,
    calcium: 80,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "South Indian",
    is_verified: true,
    popularity_score: 92
  },
  {
    id: "inf_3",
    name: "Butter Chicken",
    serving_size: "1 bowl (200g)",
    calories: 420,
    protein: 28,
    carbs: 10,
    fat: 29,
    fiber: 1.5,
    iron: 2.4,
    calcium: 120,
    vitamin_d: 1.2,
    vitamin_b12: 1.6,
    category: "Non Vegetarian",
    is_verified: true,
    popularity_score: 88
  },
  {
    id: "inf_4",
    name: "Chole Bhature",
    serving_size: "1 plate (2 bhature)",
    calories: 620,
    protein: 15,
    carbs: 78,
    fat: 28,
    fiber: 12,
    iron: 4.8,
    calcium: 150,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "Street Food",
    is_verified: true,
    popularity_score: 85
  },
  {
    id: "inf_5",
    name: "Idli Sambar",
    serving_size: "1 plate (2 idlis)",
    calories: 198,
    protein: 6,
    carbs: 38,
    fat: 2,
    fiber: 5,
    iron: 1.6,
    calcium: 60,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "South Indian",
    is_verified: true,
    popularity_score: 90
  },
  {
    id: "inf_6",
    name: "Samosa",
    serving_size: "1 piece (75g)",
    calories: 252,
    protein: 4,
    carbs: 32,
    fat: 12,
    fiber: 2,
    iron: 1.2,
    calcium: 20,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "Fast Food",
    is_verified: false,
    popularity_score: 82
  },
  {
    id: "inf_7",
    name: "Tandoori Chicken",
    serving_size: "2 pieces (180g)",
    calories: 270,
    protein: 32,
    carbs: 4,
    fat: 14,
    fiber: 0.5,
    iron: 2.8,
    calcium: 90,
    vitamin_d: 1.5,
    vitamin_b12: 1.9,
    category: "Non Vegetarian",
    is_verified: true,
    popularity_score: 80
  },
  {
    id: "inf_8",
    name: "Dal Makhani",
    serving_size: "1 bowl (200g)",
    calories: 310,
    protein: 11,
    carbs: 34,
    fat: 15,
    fiber: 9.5,
    iron: 3.5,
    calcium: 180,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "North Indian",
    is_verified: true,
    popularity_score: 75
  },
  {
    id: "inf_9",
    name: "Aloo Tikki Chaat",
    serving_size: "1 plate (150g)",
    calories: 275,
    protein: 5,
    carbs: 42,
    fat: 10,
    fiber: 4.5,
    iron: 1.9,
    calcium: 50,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "Street Food",
    is_verified: false,
    popularity_score: 78
  },
  {
    id: "inf_10",
    name: "Chicken Biryani",
    serving_size: "1 plate (300g)",
    calories: 540,
    protein: 24,
    carbs: 65,
    fat: 19,
    fiber: 3.5,
    iron: 3.2,
    calcium: 110,
    vitamin_d: 0.8,
    vitamin_b12: 1.1,
    category: "Restaurant Meals",
    is_verified: true,
    popularity_score: 97
  },
  {
    id: "inf_11",
    name: "Palak Paneer",
    serving_size: "1 bowl (200g)",
    calories: 290,
    protein: 13,
    carbs: 10,
    fat: 22,
    fiber: 6.2,
    iron: 4.1,
    calcium: 380,
    vitamin_d: 0.5,
    vitamin_b12: 0.3,
    category: "Vegetarian",
    is_verified: true,
    popularity_score: 84
  },
  {
    id: "inf_12",
    name: "Medul Vada",
    serving_size: "2 pieces (100g)",
    calories: 220,
    protein: 7,
    carbs: 29,
    fat: 8,
    fiber: 3.2,
    iron: 1.5,
    calcium: 40,
    vitamin_d: 0,
    vitamin_b12: 0,
    category: "South Indian",
    is_verified: true,
    popularity_score: 70
  }
];

const generatePreloadedLogs = () => {
  const meals: Meal[] = [];
  const hydrationLogs: HydrationLog[] = [];
  const sleepLogs: SleepLog[] = [];
  const weightLogs: WeightLog[] = [];

  const today = new Date();

  // Seed weight logs for the last 3 check-ins to demonstrate Automatic Goal adjustment
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i * 7);
    weightLogs.push({
      id: `weight_seed_${i}`,
      user_id: "usr_guest",
      weight: 80.5 - (3 - i) * 0.7, // 80.5 -> 79.8 -> 79.1 -> 78.4 kg
      body_fat: 18.5 - (3 - i) * 0.3,
      created_at: d.toISOString()
    });
  }

  // Seed breakfast/lunch, water logs, and sleep logs for the last 10 days
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed Breakfast
    meals.push({
      id: `meal_seed_b_${i}`,
      user_id: "usr_guest",
      meal_type: "Breakfast",
      calories: 450,
      protein: 28,
      carbs: 45,
      fat: 12,
      created_at: `${dateStr}T08:30:00.000Z`,
      foods: [
        {
          id: `food_seed_b1_${i}`,
          meal_id: `meal_seed_b_${i}`,
          food_name: "Oatmeal with Almonds",
          quantity_grams: 150,
          calories: 300,
          protein: 10,
          carbs: 45,
          fat: 8
        },
        {
          id: `food_seed_b2_${i}`,
          meal_id: `meal_seed_b_${i}`,
          food_name: "Whey Protein Shake",
          quantity_grams: 30,
          calories: 150,
          protein: 18,
          carbs: 0,
          fat: 4
        }
      ]
    });

    // Seed Lunch
    meals.push({
      id: `meal_seed_l_${i}`,
      user_id: "usr_guest",
      meal_type: "Lunch",
      calories: 620,
      protein: 38,
      carbs: 65,
      fat: 18,
      created_at: `${dateStr}T13:15:00.000Z`,
      foods: [
        {
          id: `food_seed_l1_${i}`,
          meal_id: `meal_seed_l_${i}`,
          food_name: "Paneer Bhurji",
          quantity_grams: 180,
          calories: 380,
          protein: 22,
          carbs: 10,
          fat: 14
        },
        {
          id: `food_seed_l2_${i}`,
          meal_id: `meal_seed_l_${i}`,
          food_name: "Roti",
          quantity_grams: 80,
          calories: 240,
          protein: 16,
          carbs: 55,
          fat: 4
        }
      ]
    });

    // Only log Dinner for historical days (i > 0) so today's dinner is open for user log!
    if (i > 0) {
      meals.push({
        id: `meal_seed_d_${i}`,
        user_id: "usr_guest",
        meal_type: "Dinner",
        calories: 550,
        protein: 32,
        carbs: 50,
        fat: 16,
        created_at: `${dateStr}T20:30:00.000Z`,
        foods: [
          {
            id: `food_seed_d1_${i}`,
            meal_id: `meal_seed_d_${i}`,
            food_name: "Tandoori Paneer Tikka",
            quantity_grams: 200,
            calories: 350,
            protein: 24,
            carbs: 15,
            fat: 10
          },
          {
            id: `food_seed_d2_${i}`,
            meal_id: `meal_seed_d_${i}`,
            food_name: "Dal Tadka & Rice",
            quantity_grams: 150,
            calories: 200,
            protein: 8,
            carbs: 35,
            fat: 6
          }
        ]
      });
    }

    // Seed water logs (e.g. 2000ml to 3500ml)
    const waterAmt = 2000 + (i % 4) * 500; // 2000, 2500, 3000, 3500ml
    hydrationLogs.push({
      id: `hydro_seed_${i}`,
      amountMl: waterAmt,
      created_at: `${dateStr}T15:00:00.000Z`
    });

    // Seed sleep logs (e.g. 6 to 8 hours)
    const sleepHrs = 6 + (i % 3); // 6, 7, 8 hours
    sleepLogs.push({
      id: `sleep_seed_${i}`,
      hours: sleepHrs,
      created_at: `${dateStr}T07:00:00.000Z`
    });
  }

  return { meals, hydrationLogs, sleepLogs, weightLogs };
};

const preloaded = generatePreloadedLogs();

export const useStore = create<ZenlogState>()(
  persist(
    (set, get) => ({
      user: null,
  meals: preloaded.meals,
  weightLogs: preloaded.weightLogs,
  predictions: [],
  corrections: [],
  templates: [
    {
      id: "temp_seed_1",
      user_id: "usr_guest",
      template_name: "High Protein Breakfast",
      created_at: new Date().toISOString(),
      foods: [
        {
          food_name: "Oats",
          quantity_grams: 80,
          calories: 300,
          protein: 12,
          carbs: 52,
          fat: 6
        },
        {
          food_name: "Eggs",
          quantity_grams: 100,
          calories: 150,
          protein: 13,
          carbs: 1,
          fat: 10
        },
        {
          food_name: "Whey Protein",
          quantity_grams: 30,
          calories: 120,
          protein: 24,
          carbs: 2,
          fat: 1.5
        }
      ]
    }
  ],
  chatHistory: [
    { role: "model", text: "Welcome Aarav! I am your ZenLog AI Coach. I've analyzed your daily health trends. Your protein split is perfect, but let's aim for an extra 500ml of water today! 🥑", timestamp: new Date().toISOString() }
  ],
  subscriptionPlan: "premium",
  scanCountToday: 2,
  isDarkMode: false,
  weightUnit: "kg",
  
  // Indian Food Lists
  indianFoods: INITIAL_INDIAN_FOODS,
  recentFoods: [],

  // Hydration & Sleep
  hydrationLogs: preloaded.hydrationLogs,
  sleepLogs: preloaded.sleepLogs,

  // UI States
  isTabBarHidden: false,
  _hasHydrated: false,

  login: (email, name) => set((state) => {
    // If user already exists with matching email, preserve all onboarding profile variables to avoid resets
    if (state.user && state.user.email === email) {
      return {};
    }
    return {
      user: {
        id: state.user?.id || "usr_" + Math.random().toString(36).substr(2, 9),
        email,
        name: name || state.user?.name || email.split("@")[0],
        age: state.user?.age,
        gender: state.user?.gender,
        height: state.user?.height,
        current_weight: state.user?.current_weight,
        activity_level: state.user?.activity_level,
        goal: state.user?.goal,
        target_weight: state.user?.target_weight,
        diet_preference: state.user?.diet_preference,
        steps_goal: state.user?.steps_goal,
        target_calories: state.user?.target_calories,
        target_protein: state.user?.target_protein,
        target_carbs: state.user?.target_carbs,
        target_fat: state.user?.target_fat
      }
    };
  }),

  setTabBarHidden: (hidden) => set({ isTabBarHidden: hidden }),
  setHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

  logout: () => set({
    user: null,
    meals: [],
    weightLogs: [],
    predictions: [],
    corrections: [],
    chatHistory: [
      { role: "model", text: "Hey! I am your ZenLog AI Coach. What should we tackle today? Post-workout splits or protein guidelines? 🥑", timestamp: new Date().toISOString() }
    ],
    subscriptionPlan: "free",
    scanCountToday: 0,
    recentFoods: [],
    hydrationLogs: [],
    sleepLogs: []
  }),

  saveOnboarding: (profile) => set((state) => {
    if (!state.user) return {};
    
    const weight = profile.current_weight || 70;
    const height = profile.height || 175;
    const age = profile.age || 24;
    const gender = profile.gender || "male";
    const activity = profile.activity_level || "moderate";
    const goal = profile.goal || "maintain";

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === "male") bmr += 5;
    else bmr -= 161;

    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9 };
    const tdee = Math.round(bmr * multipliers[activity]);

    let targetCal = tdee;
    let proteinRatio = 1.8;

    if (goal === "cut") {
      targetCal = tdee - 500;
      proteinRatio = 2.0;
    } else if (goal === "bulk") {
      targetCal = tdee + 300;
      proteinRatio = 2.2;
    }

    const targetPro = Math.round(weight * proteinRatio);
    const targetFat = Math.round((targetCal * 0.25) / 9);
    const targetCarbs = Math.round((targetCal - (targetPro * 4) - (targetFat * 9)) / 4);

    const updatedUser = {
      ...state.user,
      ...profile,
      target_calories: Math.max(1200, targetCal),
      target_protein: Math.max(50, targetPro),
      target_carbs: Math.max(50, targetCarbs),
      target_fat: Math.max(10, targetFat)
    };

    return { user: updatedUser };
  }),

  logMeal: (meal, foodList) => set((state) => {
    if (!state.user) return {};
    const mealId = "meal_" + Math.random().toString(36).substr(2, 9);
    
    const formattedFoods: FoodItem[] = (foodList || []).map((f) => ({
      ...f,
      id: "food_" + Math.random().toString(36).substr(2, 9),
      meal_id: mealId
    }));

    const newMeal: Meal = {
      ...meal,
      id: mealId,
      user_id: state.user.id,
      created_at: new Date().toISOString(),
      foods: formattedFoods
    };

    return { meals: [newMeal, ...state.meals] };
  }),

  deleteMeal: (id) => set((state) => ({
    meals: state.meals.filter((m) => m.id !== id)
  })),

  logWeight: (weight, bodyFat) => set((state) => {
    if (!state.user) return {};
    const newLog: WeightLog = {
      id: "weight_" + Math.random().toString(36).substr(2, 9),
      user_id: state.user.id,
      weight,
      body_fat: bodyFat,
      created_at: new Date().toISOString()
    };

    const updatedUser = {
      ...state.user,
      current_weight: weight
    };

    return {
      weightLogs: [...state.weightLogs, newLog],
      user: updatedUser
    };
  }),

  savePredictionAndCorrection: (pred, corr) => set((state) => {
    const predId = "pred_" + Math.random().toString(36).substr(2, 9);
    const newPrediction: FoodPrediction = {
      ...pred,
      id: predId,
      user_id: state.user?.id || "usr_guest",
      created_at: new Date().toISOString()
    };

    const newCorrection: FoodCorrection = {
      ...corr,
      id: "corr_" + Math.random().toString(36).substr(2, 9),
      prediction_id: predId,
      created_at: new Date().toISOString()
    };

    return {
      predictions: [newPrediction, ...state.predictions],
      corrections: [newCorrection, ...state.corrections]
    };
  }),

  createTemplate: (name, foods) => set((state) => {
    const newTemplate: MealTemplate = {
      id: "temp_" + Math.random().toString(36).substr(2, 9),
      user_id: state.user?.id || "usr_guest",
      template_name: name,
      created_at: new Date().toISOString(),
      foods
    };
    return { templates: [newTemplate, ...state.templates] };
  }),

  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id)
  })),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  toggleWeightUnit: () => set((state) => ({ weightUnit: state.weightUnit === "kg" ? "lb" : "kg" })),

  sendChatMessage: (text) => set((state) => ({
    chatHistory: [...state.chatHistory, { role: "user", text, timestamp: new Date().toISOString() }]
  })),

  receiveChatCoachMessage: (text) => set((state) => ({
    chatHistory: [...state.chatHistory, { role: "model", text, timestamp: new Date().toISOString() }]
  })),

  incrementScans: () => set((state) => ({ scanCountToday: state.scanCountToday + 1 })),

  upgradeSubscription: (plan) => set({ subscriptionPlan: plan }),

  // Indian Foods CRUD & Logic Actions
  addIndianFood: (food) => set((state) => {
    const newFood: IndianFoodItem = {
      ...food,
      id: "inf_" + Math.random().toString(36).substr(2, 9),
      popularity_score: 0
    };
    return { indianFoods: [newFood, ...state.indianFoods] };
  }),

  editIndianFood: (id, updated) => set((state) => ({
    indianFoods: state.indianFoods.map((f) => f.id === id ? { ...f, ...updated } : f)
  })),

  deleteIndianFood: (id) => set((state) => ({
    indianFoods: state.indianFoods.filter((f) => f.id !== id)
  })),

  verifyIndianFood: (id) => set((state) => ({
    indianFoods: state.indianFoods.map((f) => f.id === id ? { ...f, is_verified: true } : f)
  })),

  logRecentFood: (food) => set((state) => {
    const filtered = state.recentFoods.filter((f) => f.id !== food.id);
    const updatedRecents = [food, ...filtered].slice(0, 10);
    
    const updatedFoods = state.indianFoods.map((f) => 
      f.id === food.id ? { ...f, popularity_score: f.popularity_score + 1 } : f
    );

    return { 
      recentFoods: updatedRecents,
      indianFoods: updatedFoods
    };
  }),

  searchIndianFoods: (query) => {
    const foods = get().indianFoods;
    if (!query.trim()) return [];

    const normQuery = query.toLowerCase().trim();
    return foods.filter((f) => 
      f.name.toLowerCase().includes(normQuery) || 
      f.category.toLowerCase().includes(normQuery)
    ).sort((a, b) => b.popularity_score - a.popularity_score);
  },

  evaluateWeeklyGoalAdjustment: () => {
    const { user, weightLogs } = get();
    if (!user || weightLogs.length < 2) return null;

    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const currentLog = sortedLogs[sortedLogs.length - 1];
    const previousLog = sortedLogs[sortedLogs.length - 2];

    const weightDelta = currentLog.weight - previousLog.weight;
    const goal = user.goal || "maintain";
    const oldCalories = user.target_calories || 2000;
    let newCalories = oldCalories;
    let reason = "";
    let adjusted = false;

    if (goal === "cut") {
      if (weightDelta < -1.0) {
        newCalories = oldCalories + 100;
        reason = `Weight loss is too rapid (${Math.abs(weightDelta).toFixed(2)} kg this week, expected 0.5-1.0 kg). Daily budget increased by 100 kcal to protect lean body mass.`;
        adjusted = true;
      } else if (weightDelta > -0.25) {
        newCalories = oldCalories - 100;
        reason = `Weight loss has stalled (${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(2)} kg this week, expected 0.5-1.0 kg loss). Daily budget decreased by 100 kcal to break the plateau.`;
        adjusted = true;
      }
    } else if (goal === "bulk") {
      if (weightDelta > 0.5) {
        newCalories = oldCalories - 100;
        reason = `Weight gain is too rapid (+${weightDelta.toFixed(2)} kg this week, expected 0.25-0.5 kg). Daily budget decreased by 100 kcal to minimize unnecessary fat accumulation.`;
        adjusted = true;
      } else if (weightDelta < 0.25) {
        newCalories = oldCalories + 100;
        reason = `Weight gain is slower than expected (${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(2)} kg this week, expected 0.25-0.5 kg). Daily budget increased by 100 kcal to sustain anabolic muscle growth.`;
        adjusted = true;
      }
    }

    if (adjusted) {
      newCalories = Math.max(1200, newCalories);
      
      const targetPro = user.target_protein || 140;
      const targetFat = Math.round((newCalories * 0.25) / 9);
      const targetCarbs = Math.round((newCalories - (targetPro * 4) - (targetFat * 9)) / 4);

      set((state) => {
        if (!state.user) return {};
        
        const updatedUser = {
          ...state.user,
          target_calories: newCalories,
          target_fat: Math.max(10, targetFat),
          target_carbs: Math.max(50, targetCarbs)
        };

        const notificationMessage: ChatMessage = {
          role: "model",
          text: `🚨 ZenLog Goal Adjustment Engine: ${reason} Daily Budget recalculated: ${newCalories} kcal (P: ${targetPro}g • C: ${targetCarbs}g • F: ${targetFat}g).`,
          timestamp: new Date().toISOString()
        };

        return {
          user: updatedUser,
          chatHistory: [...state.chatHistory, notificationMessage]
        };
      });

      return { adjusted: true, oldCalories, newCalories, reason };
    }

    return { adjusted: false, oldCalories, newCalories: oldCalories, reason: "Consistency is perfect! Your weekly weight shift is fully on track with your goals." };
  },

  // Hydration & Sleep logs
  logWater: (amountMl) => set((state) => {
    const newLog: HydrationLog = {
      id: "hydro_" + Math.random().toString(36).substr(2, 9),
      amountMl,
      created_at: new Date().toISOString()
    };
    return { hydrationLogs: [newLog, ...state.hydrationLogs] };
  }),

  logSleep: (hours) => set((state) => {
    const newLog: SleepLog = {
      id: "sleep_" + Math.random().toString(36).substr(2, 9),
      hours,
      created_at: new Date().toISOString()
    };
    return { sleepLogs: [newLog, ...state.sleepLogs] };
  }),

  calculateDailyHealthScore: (dateStr) => {
    const { meals, user, hydrationLogs, sleepLogs } = get();
    if (!user) return { total: 0, nutrition: 0, protein: 0, hydration: 0, sleep: 0, consistency: 0 };

    const formattedDate = dateStr.split("T")[0];

    // 1. Nutrition Score (30%)
    const todayMeals = meals.filter((m) => m.created_at.startsWith(formattedDate));
    const loggedCal = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const targetCal = user.target_calories || 2000;
    
    let nutritionScore = 0;
    if (loggedCal > 0) {
      const calDiff = Math.abs(loggedCal - targetCal);
      nutritionScore = Math.max(0, 100 - (calDiff / 5)); // drops off linearly, within +-500 calories
    }

    // 2. Protein Score (25%)
    const loggedPro = todayMeals.reduce((sum, m) => sum + m.protein, 0);
    const targetPro = user.target_protein || 140;
    const proteinScore = targetPro > 0 ? Math.min(100, Math.round((loggedPro / targetPro) * 100)) : 0;

    // 3. Hydration Score (15%) - Target 3000ml (3.0 Liters)
    const todayWater = hydrationLogs
      .filter((h) => h.created_at.startsWith(formattedDate))
      .reduce((sum, h) => sum + h.amountMl, 0);
    const hydrationScore = Math.min(100, Math.round((todayWater / 3000) * 100));

    // 4. Sleep Score (15%) - Target 8 hours
    const todaySleep = sleepLogs
      .filter((s) => s.created_at.startsWith(formattedDate))
      .reduce((sum, s) => sum + s.hours, 0);
    const sleepScore = Math.min(100, Math.round((todaySleep / 8) * 100));

    // 5. Consistency Score (15%) - streaking days logging meals
    // Quick look back over previous days:
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const loggedToday = todayMeals.length > 0;
    const loggedYesterday = meals.filter((m) => m.created_at.startsWith(yesterdayStr)).length > 0;

    let consistencyScore = 0;
    if (loggedToday && loggedYesterday) consistencyScore = 100;
    else if (loggedToday) consistencyScore = 60;
    else if (loggedYesterday) consistencyScore = 40;

    // Aggregate formula
    const totalScore = Math.round(
      nutritionScore * 0.30 +
      proteinScore * 0.25 +
      hydrationScore * 0.15 +
      sleepScore * 0.15 +
      consistencyScore * 0.15
    );

    return {
      total: Math.max(0, Math.min(100, totalScore)),
      nutrition: Math.round(nutritionScore),
      protein: Math.round(proteinScore),
      hydration: Math.round(hydrationScore),
      sleep: Math.round(sleepScore),
      consistency: Math.round(consistencyScore)
    };
  }
}), {
  name: "zenlog-storage-v3",
  storage: createJSONStorage(() => AsyncStorage),
  onRehydrateStorage: () => (state) => {
    state?.setHydrated(true);
  }
}));
