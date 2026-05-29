/**
 * NutriAI Client-Side Unified Food Search & AI Vision Simulator Service
 * Designed for 100% compatibility with Static exports and Capacitor native APKs.
 * Direct Browser/App CORS-safe public API access with smart sandboxed fallbacks.
 */

import { INITIAL_FOODS, FoodItem } from "./foods";

// Helper to extract nutrients from USDA FDC API response
function extractNutrient(nutrients: any[], nutrientId: number, defaultVal = 0): number {
  const nutrient = nutrients.find((n) => n.nutrientId === nutrientId || n.nutrientNumber === nutrientId.toString());
  return nutrient ? Math.round(nutrient.value * 10) / 10 : defaultVal;
}

/**
 * Direct CORS-safe client search querying USDA FDC & Local Presets
 */
export async function searchFoodsOfflineOnline(query: string): Promise<FoodItem[]> {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  // 1. Search local preseeded/custom database first
  const localMatches = INITIAL_FOODS.filter((food) =>
    food.name.toLowerCase().includes(cleanQuery) || 
    (food.brand && food.brand.toLowerCase().includes(cleanQuery))
  );

  // 2. Try fetching from public USDA FDC API (Browser CORS-safe)
  // Using standard DEMO_KEY, accessible globally
  const usdaApiKey = "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(query)}&pageSize=8`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      const data = await response.json();
      const fdcFoods = data.foods || [];

      const usdaMatches: FoodItem[] = fdcFoods.map((f: any, idx: number) => {
        const nutrients = f.foodNutrients || [];
        
        let servingText = "100g";
        if (f.servingSize && f.servingSizeUnit) {
          servingText = `${f.servingSize} ${f.servingSizeUnit.toLowerCase()}`;
        } else if (f.householdServingFullText) {
          servingText = f.householdServingFullText;
        }

        const calories = Math.round(extractNutrient(nutrients, 1008, extractNutrient(nutrients, 208, 0)));
        const protein = extractNutrient(nutrients, 1003, 0);
        const carbs = extractNutrient(nutrients, 1005, 0);
        const fat = extractNutrient(nutrients, 1004, 0);
        const fiber = extractNutrient(nutrients, 1079, 0);
        const sugar = extractNutrient(nutrients, 269, 0);
        const sodium = Math.round(extractNutrient(nutrients, 1093, 0));
        const potassium = Math.round(extractNutrient(nutrients, 1092, 0));
        const vitaminA = Math.round(extractNutrient(nutrients, 1104, 0));
        const vitaminC = extractNutrient(nutrients, 1162, 0);
        const calcium = Math.round(extractNutrient(nutrients, 1087, 0));
        const iron = extractNutrient(nutrients, 1089, 0);

        return {
          id: `usda-${f.fdcId || idx}-${Math.floor(Math.random() * 1000)}`,
          name: `${f.description}${f.brandOwner ? ` (${f.brandOwner})` : ""}`,
          servingSize: servingText,
          calories,
          protein,
          carbs,
          fat,
          category: "Other" as const,
          fiber,
          sugar,
          sodium,
          potassium,
          vitaminA,
          vitaminC,
          calcium,
          iron,
          brand: f.brandOwner || undefined
        };
      });

      // Merge local matches and USDA matches
      const combined = [...localMatches];
      usdaMatches.forEach((uf) => {
        if (!combined.some((lf) => lf.name.toLowerCase() === uf.name.toLowerCase())) {
          combined.push(uf);
        }
      });

      return combined;
    }
  } catch (e) {
    console.warn("Direct USDA search failed (blocked or offline), fallback active...", e);
  }

  // 3. Fallback simulated results generator if offline
  if (localMatches.length > 0) {
    return localMatches;
  }

  const lowerQuery = cleanQuery;
  let fallback: FoodItem;

  if (lowerQuery.includes("pizza")) {
    fallback = {
      id: "sim-pizza-" + Date.now(),
      name: "Cheese Pizza (Generic Slice)",
      servingSize: "1 Slice (107g)",
      calories: 272,
      protein: 12.2,
      carbs: 32,
      fat: 9.8,
      category: "Lunch/Dinner",
      fiber: 2.3,
      sugar: 3.6,
      sodium: 640,
      potassium: 140,
      vitaminA: 65,
      vitaminC: 1.4,
      calcium: 210,
      iron: 2.1
    };
  } else if (lowerQuery.includes("burger")) {
    fallback = {
      id: "sim-burger-" + Date.now(),
      name: "Hamburger (Generic Patty & Bun)",
      servingSize: "1 Burger (110g)",
      calories: 295,
      protein: 14.5,
      carbs: 30,
      fat: 12.4,
      category: "Lunch/Dinner",
      fiber: 1.8,
      sugar: 4.8,
      sodium: 490,
      potassium: 210,
      vitaminA: 4,
      vitaminC: 0.8,
      calcium: 80,
      iron: 2.8
    };
  } else if (lowerQuery.includes("apple")) {
    fallback = {
      id: "sim-apple-" + Date.now(),
      name: "Fuji Red Apple (Generic)",
      servingSize: "1 Medium (182g)",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      category: "Snacks",
      fiber: 4.4,
      sugar: 19,
      sodium: 2,
      potassium: 195,
      vitaminA: 10,
      vitaminC: 8.4,
      calcium: 11,
      iron: 0.2
    };
  } else {
    fallback = {
      id: "sim-generic-" + Date.now(),
      name: `${query.charAt(0).toUpperCase() + query.slice(1)} (Estimated generic)`,
      servingSize: "100g",
      calories: 120,
      protein: 6.5,
      carbs: 18.2,
      fat: 2.4,
      category: "Other",
      fiber: 1.5,
      sugar: 2.2,
      sodium: 180,
      potassium: 120,
      vitaminA: 10,
      vitaminC: 2.5,
      calcium: 35,
      iron: 0.8
    };
  }

  return [fallback];
}

/**
 * Direct browser CORS query to OpenFoodFacts by barcode
 */
export async function barcodeLookupOfflineOnline(barcode: string): Promise<FoodItem> {
  const cleanBarcode = barcode.trim();
  
  // 1. Search local preseeded catalog first for direct matches
  const localMatch = INITIAL_FOODS.find((food) => food.barcode === cleanBarcode);
  if (localMatch) {
    return localMatch;
  }

  // 2. Fetch from OpenFoodFacts CORS-safe public API
  const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nut = p.nutriments || {};

        const calories = Math.round(nut["energy-kcal_100g"] || nut["energy-kcal"] || 0);
        const protein = Math.round((nut["proteins_100g"] || nut["proteins"] || 0) * 10) / 10;
        const carbs = Math.round((nut["carbohydrates_100g"] || nut["carbohydrates"] || 0) * 10) / 10;
        const fat = Math.round((nut["fat_100g"] || nut["fat"] || 0) * 10) / 10;
        const fiber = Math.round((nut["fiber_100g"] || nut["fiber"] || 0) * 10) / 10;
        const sugar = Math.round((nut["sugars_100g"] || nut["sugars"] || 0) * 10) / 10;
        
        const sodiumGrams = nut["sodium_100g"] || nut["sodium"] || 0;
        const sodium = Math.round(sodiumGrams * 1000);

        const potassium = Math.round((nut["potassium_100g"] || 0) * 1000);
        const vitaminA = Math.round((nut["vitamin-a_100g"] || 0) * 1000000);
        const vitaminC = Math.round((nut["vitamin-c_100g"] || 0) * 1000);
        const calcium = Math.round((nut["calcium_100g"] || 0) * 1000);
        const iron = Math.round((nut["iron_100g"] || 0) * 1000);

        return {
          id: `off-${cleanBarcode}`,
          name: `${p.product_name || "Packaged Product"} (${p.brands || "Generic"})`,
          servingSize: p.serving_size || "100g",
          calories,
          protein,
          carbs,
          fat,
          category: "Other",
          fiber,
          sugar,
          sodium,
          potassium,
          vitaminA,
          vitaminC,
          calcium,
          iron,
          brand: p.brands || undefined,
          barcode: cleanBarcode
        };
      }
    }
  } catch (e) {
    console.warn("Direct OpenFoodFacts CORS fetch failed, falling back to barcode simulator...", e);
  }

  // 3. Fallback simulators matching preseeded barcode numbers
  let fallback: FoodItem;

  if (cleanBarcode === "8801043014847") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f40")!;
  } else if (cleanBarcode === "0021000612239") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f38")!;
  } else if (cleanBarcode === "044000031226") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f39")!;
  } else if (cleanBarcode === "748927020084") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f35")!;
  } else if (cleanBarcode === "5449000000996") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f45")!;
  } else if (cleanBarcode === "5449000133335") {
    fallback = INITIAL_FOODS.find((f) => f.id === "f46")!;
  } else {
    fallback = {
      id: `sim-scanned-${cleanBarcode}`,
      name: `Scanned Packaged Dish #${cleanBarcode.slice(-4)}`,
      servingSize: "1 container (120g)",
      calories: 340,
      protein: 12.0,
      carbs: 45.0,
      fat: 14.5,
      category: "Other",
      fiber: 3.2,
      sugar: 8.5,
      sodium: 520,
      potassium: 180,
      vitaminA: 40,
      vitaminC: 1.2,
      calcium: 95,
      iron: 1.8,
      brand: "SaaS Foods Corp",
      barcode: cleanBarcode
    };
  }

  return fallback;
}

/**
 * Direct browser visual photo portions analyzer simulation
 */
export async function visualMealPhotoScan(image: string, imageName: string, userDescription?: string): Promise<any> {
  // Direct client-side simulated AI delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const nameLower = (imageName || "").toLowerCase();
  const descLower = (userDescription || "").toLowerCase().trim();

  // Helper to extract per-gram nutrients from our food catalog
  const getPerGram = (foodName: string, defaultCal = 1.5, defaultPro = 0.08, defaultCarb = 0.2, defaultFat = 0.04) => {
    const clean = foodName.toLowerCase().trim();
    // Search INITIAL_FOODS first
    const match = INITIAL_FOODS.find((f) => f.name.toLowerCase().includes(clean) || clean.includes(f.name.toLowerCase()));
    
    if (match) {
      const swMatch = match.servingSize.match(/(\d+)\s*(g|ml)/i);
      const sw = swMatch ? parseFloat(swMatch[1]) : 100;
      return {
        calories: match.calories / sw,
        protein: match.protein / sw,
        carbs: match.carbs / sw,
        fat: match.fat / sw,
        fiber: (match.fiber ?? 0) / sw,
        sugar: (match.sugar ?? 0) / sw,
        sodium: (match.sodium ?? 0) / sw,
        potassium: (match.potassium ?? 0) / sw,
      };
    }
    
    // Fallback standard biological presets
    return {
      calories: defaultCal,
      protein: defaultPro,
      carbs: defaultCarb,
      fat: defaultFat,
      fiber: clean.includes("salad") || clean.includes("veg") || clean.includes("broccoli") ? 0.04 : 0.015,
      sugar: clean.includes("fruit") || clean.includes("apple") || clean.includes("banana") || clean.includes("shake") ? 0.08 : 0.01,
      sodium: defaultFat * 25 + 20,
      potassium: defaultPro * 12 + 15,
    };
  };

  // Define structured thali plate templates
  const thaliPresets = [
    {
      // 1. North Indian Paneer Thali
      keywords: ["thali", "paneer", "north indian", "indian"],
      foods: [
        { name: "Cooked Basmati Rice", quantity_grams: 200, ...getPerGram("Basmati Rice (Cooked)", 1.3, 0.03, 0.28, 0.003) },
        { name: "Paneer Butter Masala", quantity_grams: 150, ...getPerGram("Paneer Tikka Masala", 1.87, 0.093, 0.08, 0.133) },
        { name: "Whole Wheat Roti", quantity_grams: 70, ...getPerGram("Whole Wheat Roti (No Butter)", 2.43, 0.086, 0.514, 0.014) },
        { name: "Mixed Green Salad", quantity_grams: 80, ...getPerGram("Apple", 0.4, 0.01, 0.08, 0.01) }
      ],
      confidence: 94
    },
    {
      // 2. South Indian Dosa Breakfast
      keywords: ["dosa", "idli", "south indian", "sambar", "chutney"],
      foods: [
        { name: "Masala Dosa Roll", quantity_grams: 150, ...getPerGram("Masala Dosa with Sambar", 1.55, 0.036, 0.27, 0.038) },
        { name: "Lentil Sambar", quantity_grams: 120, ...getPerGram("Dal Tadka (Arhar/Toor)", 1.0, 0.046, 0.146, 0.026) },
        { name: "Coconut Chutney", quantity_grams: 50, ...getPerGram("Butter Roti", 2.2, 0.05, 0.1, 0.2) }
      ],
      confidence: 92
    },
    {
      // 3. Gym Bodybuilder Plate
      keywords: ["chicken", "brown rice", "gym", "bodybuilder", "high protein"],
      foods: [
        { name: "Grilled Chicken Breast", quantity_grams: 180, ...getPerGram("McDonalds Chicken McNuggets", 1.65, 0.28, 0.0, 0.035) },
        { name: "Steamed Brown Rice", quantity_grams: 150, ...getPerGram("Basmati Rice (Cooked)", 1.15, 0.026, 0.25, 0.01) },
        { name: "Roasted Broccoli", quantity_grams: 80, ...getPerGram("Apple", 0.35, 0.025, 0.07, 0.003) }
      ],
      confidence: 96
    },
    {
      // 4. Avocado Toast & Eggs
      keywords: ["egg", "toast", "avocado", "breakfast", "scramble"],
      foods: [
        { name: "Scrambled Eggs", quantity_grams: 120, ...getPerGram("Scrambled Eggs with Toast & Paneer", 1.4, 0.11, 0.01, 0.09) },
        { name: "Avocado Guacamole", quantity_grams: 80, ...getPerGram("Apple", 1.6, 0.02, 0.08, 0.15) },
        { name: "Whole Wheat Toast", quantity_grams: 60, ...getPerGram("Whole Wheat Roti (No Butter)", 2.43, 0.086, 0.514, 0.014) }
      ],
      confidence: 95
    },
    {
      // 5. Classic Pepperoni Pizza Plate
      keywords: ["pizza", "pepperoni", "italian", "cheese"],
      foods: [
        { name: "Pepperoni Pizza Slices", quantity_grams: 180, ...getPerGram("Pizza Hut Pepperoni Pizza (Personal)", 2.95, 0.13, 0.32, 0.125) },
        { name: "Parmesan Cheese Topping", quantity_grams: 15, ...getPerGram("Paneer (Raw, Low Fat)", 3.8, 0.35, 0.03, 0.28) }
      ],
      confidence: 96
    },
    {
      // 6. Fast Food Double Burger Combo
      keywords: ["burger", "mcdonald", "cheese burger", "fries", "junk"],
      foods: [
        { name: "Double Cheeseburger", quantity_grams: 165, ...getPerGram("McDonalds Cheeseburger", 2.5, 0.133, 0.267, 0.1) },
        { name: "Salted French Fries", quantity_grams: 120, ...getPerGram("McDonalds Chicken McNuggets", 2.7, 0.034, 0.36, 0.13) }
      ],
      confidence: 97
    }
  ];

  // 1. Text-assisted split-scanning parsing logic (Cal AI Perfection)
  if (descLower) {
    // Split user input by separators: comma, "and", "with", "+"
    const separators = /,\s*|\s+and\s+|\s+with\s+|\s*\+\s*/gi;
    const parts = userDescription!.split(separators).map((p) => p.trim()).filter(Boolean);

    if (parts.length > 0) {
      const parsedFoods = parts.map((part) => {
        const cleanPart = part.toLowerCase();
        
        // Match numbers in the text for custom portion calibration (e.g. "200g rice" -> 200, "2 rotis" -> 2)
        const gramMatch = cleanPart.match(/(\d+)\s*(g|grams|ml)/i);
        const countMatch = cleanPart.match(/^(\d+)\s+([a-zA-Z\s]+)/i);

        let weight = 100; // Default estimated weight in grams
        let queryWord = cleanPart;

        if (gramMatch) {
          weight = parseInt(gramMatch[1]);
          queryWord = cleanPart.replace(gramMatch[0], "").trim();
        } else if (countMatch) {
          const count = parseInt(countMatch[1]);
          const item = countMatch[2].trim();
          queryWord = item;
          // Calibrate portion weights by item count
          if (item.includes("roti") || item.includes("chapati") || item.includes("paratha")) {
            weight = count * 35;
          } else if (item.includes("egg") || item.includes("eggs")) {
            weight = count * 50;
          } else if (item.includes("banana") || item.includes("apple") || item.includes("fruit")) {
            weight = count * 120;
          } else {
            weight = count * 80;
          }
        }

        // Calibrate fallback weights by keyword if not explicitly provided
        if (!gramMatch && !countMatch) {
          if (cleanPart.includes("rice")) weight = 200;
          else if (cleanPart.includes("paneer")) weight = 150;
          else if (cleanPart.includes("dal") || cleanPart.includes("sambar") || cleanPart.includes("curry")) weight = 150;
          else if (cleanPart.includes("roti") || cleanPart.includes("chapati") || cleanPart.includes("bread")) weight = 70;
          else if (cleanPart.includes("salad") || cleanPart.includes("veg") || cleanPart.includes("broccoli")) weight = 80;
          else if (cleanPart.includes("dosa")) weight = 150;
          else if (cleanPart.includes("shake") || cleanPart.includes("protein") || cleanPart.includes("whey")) weight = 300;
          else if (cleanPart.includes("burger")) weight = 165;
          else if (cleanPart.includes("pizza")) weight = 180;
        }

        // Capitalize name
        const capitalizedName = queryWord
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
          .trim();

        // Calculate macro structure safely
        const baseMacros = getPerGram(queryWord);

        return {
          name: capitalizedName || "Plate Item",
          quantity_grams: weight,
          ...baseMacros
        };
      });

      return {
        foods: parsedFoods,
        confidence: 95
      };
    }
  }

  // 2. Auto-detect image name keywords thali preset
  const matchedPreset = thaliPresets.find((preset) => {
    return preset.keywords.some((key) => nameLower.includes(key));
  });

  if (matchedPreset) {
    return {
      foods: JSON.parse(JSON.stringify(matchedPreset.foods)), // Deep copy
      confidence: matchedPreset.confidence
    };
  }

  // 3. Fallback: cycle thalis dynamically using seed hashes
  const index = Math.abs((imageName || "").length + new Date().getSeconds()) % thaliPresets.length;
  const selected = thaliPresets[index];

  return {
    foods: JSON.parse(JSON.stringify(selected.foods)),
    confidence: selected.confidence - 2
  };
}
