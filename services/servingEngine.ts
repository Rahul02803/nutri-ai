export type SupportedUnit =
  | "g"
  | "kg"
  | "oz"
  | "lb"
  | "ml"
  | "liter"
  | "tbsp"
  | "tsp"
  | "cup"
  | "bowl"
  | "piece"
  | "slice"
  | "cube"
  | "egg"
  | "roti";

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitamin_d: number;
  vitamin_b12: number;
}

/**
 * Returns the weight/volume multiplier in base units (grams or ml) for a single unit of a given food.
 * Implementing standard conversions:
 * - grams ↔ ounces (1 oz = 28.3495g)
 * - grams ↔ kilograms (1 kg = 1000g)
 * - ml ↔ liters (1 liter = 1000ml)
 * Supported custom food units:
 * - Paneer: 1 cube = 25g
 * - Egg: 1 egg = 50g
 * - Roti: 1 roti = 40g
 * - Rice: 1 bowl = 180g
 */
export function getUnitWeightInGrams(unit: SupportedUnit, foodName: string): number {
  const normName = foodName.toLowerCase();

  switch (unit) {
    case "g":
      return 1;
    case "kg":
      return 1000;
    case "oz":
      return 28.3495;
    case "lb":
      return 453.592;
    case "ml":
      return 1;
    case "liter":
      return 1000;
    case "tbsp":
      return 15;
    case "tsp":
      return 5;
    case "cup":
      return 240;
    case "bowl":
      if (normName.includes("rice")) return 180;
      if (normName.includes("dal") || normName.includes("sambar") || normName.includes("curry")) return 200;
      return 180;
    case "piece":
      if (normName.includes("samosa")) return 75;
      if (normName.includes("paneer")) return 30;
      if (normName.includes("chicken")) return 90;
      if (normName.includes("idli")) return 50;
      if (normName.includes("vada")) return 50;
      return 50;
    case "slice":
      if (normName.includes("roti") || normName.includes("chapati")) return 40;
      if (normName.includes("bread")) return 30;
      return 30;
    case "cube":
      // Paneer custom food unit: 1 cube = 25g
      return 25;
    case "egg":
      // Egg custom food unit: 1 egg = 50g
      return 50;
    case "roti":
      // Roti custom food unit: 1 roti = 40g
      return 40;
    default:
      return 1;
  }
}

/**
 * Converts a quantity from one unit to another for a specific food item.
 */
export function convertQuantity(
  value: number,
  fromUnit: SupportedUnit,
  toUnit: SupportedUnit,
  foodName: string
): number {
  if (fromUnit === toUnit) return value;
  const grams = value * getUnitWeightInGrams(fromUnit, foodName);
  return grams / getUnitWeightInGrams(toUnit, foodName);
}

/**
 * Stores and recalculates all nutrition values dynamically based on base values (per 1 gram or 1 ml).
 */
export function calculateNutrition(
  baseNutritionPerGram: NutritionValues,
  quantity: number,
  unit: SupportedUnit,
  foodName: string
): NutritionValues {
  const multiplier = getUnitWeightInGrams(unit, foodName);
  const totalGrams = quantity * multiplier;

  return {
    calories: Math.round(baseNutritionPerGram.calories * totalGrams),
    protein: Math.round(baseNutritionPerGram.protein * totalGrams * 10) / 10,
    carbs: Math.round(baseNutritionPerGram.carbs * totalGrams * 10) / 10,
    fat: Math.round(baseNutritionPerGram.fat * totalGrams * 10) / 10,
    fiber: Math.round(baseNutritionPerGram.fiber * totalGrams * 10) / 10,
    iron: Math.round(baseNutritionPerGram.iron * totalGrams * 100) / 100,
    calcium: Math.round(baseNutritionPerGram.calcium * totalGrams * 10) / 10,
    vitamin_d: Math.round(baseNutritionPerGram.vitamin_d * totalGrams * 100) / 100,
    vitamin_b12: Math.round(baseNutritionPerGram.vitamin_b12 * totalGrams * 100) / 100,
  };
}
