/**
 * ZenLog Core Mathematics & Calculation Engine
 * Inspired by clinical dietetics (Mifflin-St Jeor Equation)
 */

export interface OnboardingData {
  goal: "lose_fat" | "gain_muscle" | "maintain" | "body_recomp";
  gender: "male" | "female" | "other";
  age: number;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "extreme";
  workoutFrequency: string;
  fitnessExperience: string;
  dietPreference: "vegetarian" | "eggetarian" | "non_vegetarian" | "vegan";
  allergies: string[];
  mealsPerDay: number;
  timeline: string;
  challenge: string;
  dreamPhysique: string;
  
  // Custom new features
  goalSpeed?: "slow" | "moderate" | "aggressive";
  motivation?: string;
  weightUnit?: "metric" | "imperial";
}

export interface CalculatedTargets {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFat: number;     // in grams
  waterTargetMl: number;
}

/**
 * Calculates BMI and returns Category
 */
export function calculateBMI(weight: number, heightCm: number): { bmi: number; category: string } {
  const heightMeters = heightCm / 100;
  const bmi = weight / (heightMeters * heightMeters);
  let category = "Normal";

  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 18.5 && bmi < 24.9) category = "Normal";
  else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
  else category = "Obese";

  return { bmi: Math.round(bmi * 10) / 10, category };
}

/**
 * Calculates BMR using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, heightCm: number, age: number, gender: string): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * heightCm - 5 * age + 5;
  } else {
    // female and others default to female equation for safety
    return 10 * weight + 6.25 * heightCm - 5 * age - 161;
  }
}

/**
 * Calculates TDEE based on BMR and Activity Level multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: OnboardingData["activityLevel"]): number {
  const multipliers = {
    sedentary: 1.2,    // Little to no exercise
    light: 1.375,      // Light exercise 1-3 days/week
    moderate: 1.55,    // Moderate exercise 3-5 days/week
    active: 1.725,     // Hard exercise 6-7 days/week
    extreme: 1.9,      // Heavy daily physical work
  };
  return Math.round(bmr * multipliers[activityLevel || "sedentary"]);
}

/**
 * Main calculation engine mapping onboarding inputs into daily macro goals
 */
export function calculateNutritionTargets(data: OnboardingData): CalculatedTargets {
  const { bmi, category: bmiCategory } = calculateBMI(data.currentWeight, data.height);
  const bmr = calculateBMR(data.currentWeight, data.height, data.age, data.gender);
  const tdee = calculateTDEE(bmr, data.activityLevel);

  let targetCalories = tdee;
  let proteinRatioGramsPerKg = 1.8;

  // Calorie adjustments based on goal speed (slow, moderate, aggressive)
  const speed = data.goalSpeed || "moderate";
  let speedDeficit = 500;
  let speedSurplus = 300;

  if (speed === "slow") {
    speedDeficit = 250;
    speedSurplus = 150;
  } else if (speed === "aggressive") {
    speedDeficit = 750;
    speedSurplus = 500;
  }

  // Calorie adjustments based on primary transformation goals
  switch (data.goal) {
    case "lose_fat":
      targetCalories = tdee - speedDeficit;
      proteinRatioGramsPerKg = 2.0; // preserve muscle in deficit
      break;
    case "gain_muscle":
      targetCalories = tdee + speedSurplus;
      proteinRatioGramsPerKg = 2.2; // maximize muscle protein synthesis
      break;
    case "body_recomp":
      targetCalories = tdee - 200; // minor recomp deficit
      proteinRatioGramsPerKg = 2.1;
      break;
    case "maintain":
    default:
      targetCalories = tdee;
      proteinRatioGramsPerKg = 1.6;
      break;
  }

  // Enforce safety limits
  const minSafeCalories = data.gender === "male" ? 1500 : 1200;
  if (targetCalories < minSafeCalories) {
    targetCalories = minSafeCalories;
  }

  targetCalories = Math.round(targetCalories);

  // Macro Calculation:
  // 1. Calculate Protein: based on body weight
  let targetProtein = Math.round(data.currentWeight * proteinRatioGramsPerKg);
  
  // Safety checks on protein
  if (targetProtein < 50) targetProtein = 50;
  if (targetProtein > 250) targetProtein = 250;

  // 2. Calculate Fat: 25% of target calories. Fat contains 9 kcal per gram.
  let targetFat = Math.round((targetCalories * 0.25) / 9);

  // 3. Calculate Carbs: remaining calories. Carbs contain 4 kcal per gram.
  const proteinCalories = targetProtein * 4;
  const fatCalories = targetFat * 9;
  let targetCarbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4);

  if (targetCarbs < 50) {
    targetCarbs = 50;
    targetFat = Math.round((targetCalories - proteinCalories - (50 * 4)) / 9);
  }

  // Water Hydration target (Base: 35ml per kg of bodyweight, adjusted for workout status)
  let waterTargetMl = Math.round(data.currentWeight * 35);
  if (data.activityLevel !== "sedentary") {
    waterTargetMl += 500;
  }
  waterTargetMl = Math.max(2000, Math.min(5000, waterTargetMl));

  return {
    bmi,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    waterTargetMl,
  };
}
