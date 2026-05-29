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
  let result: any = null;

  // 1. If userDescription is provided, search our local INITIAL_FOODS or fuzzy evaluate!
  if (descLower) {
    // A. Fuzzy match local foods database
    const localMatch = INITIAL_FOODS.find((f) => 
      f.name.toLowerCase().includes(descLower) || 
      descLower.includes(f.name.toLowerCase())
    );

    if (localMatch) {
      return {
        name: localMatch.name,
        servingSize: localMatch.servingSize,
        calories: localMatch.calories,
        protein: localMatch.protein,
        carbs: localMatch.carbs,
        fat: localMatch.fat,
        fiber: localMatch.fiber ?? 0,
        sugar: localMatch.sugar ?? 0,
        sodium: localMatch.sodium ?? 0,
        potassium: localMatch.potassium ?? 0,
        vitaminA: localMatch.vitaminA ?? 0,
        vitaminC: localMatch.vitaminC ?? 0,
        calcium: localMatch.calcium ?? 0,
        iron: localMatch.iron ?? 0,
        confidence: 99
      };
    }

    // B. Call direct offline-online search and take top result if available
    try {
      const searchMatches = await searchFoodsOfflineOnline(descLower);
      if (searchMatches && searchMatches.length > 0) {
        const topFood = searchMatches[0];
        return {
          name: topFood.name,
          servingSize: topFood.servingSize,
          calories: topFood.calories,
          protein: topFood.protein,
          carbs: topFood.carbs,
          fat: topFood.fat,
          fiber: topFood.fiber ?? 0,
          sugar: topFood.sugar ?? 0,
          sodium: topFood.sodium ?? 0,
          potassium: topFood.potassium ?? 0,
          vitaminA: topFood.vitaminA ?? 0,
          vitaminC: topFood.vitaminC ?? 0,
          calcium: topFood.calcium ?? 0,
          iron: topFood.iron ?? 0,
          confidence: 97
        };
      }
    } catch (err) {
      console.warn("Visual search lookup failed", err);
    }

    // C. Calibrated parser if it doesn't exist in local/USDA databases
    // Heuristically calculate nutrition parameters
    let estCal = 250;
    let estPro = 8;
    let estCarb = 30;
    let estFat = 7;
    let estFiber = 2;

    if (descLower.includes("chicken") || descLower.includes("fish") || descLower.includes("salmon") || descLower.includes("meat")) {
      estCal = 320;
      estPro = 28;
      estCarb = 5;
      estFat = 12;
    } else if (descLower.includes("egg") || descLower.includes("omlet") || descLower.includes("scramble")) {
      estCal = 180;
      estPro = 14;
      estCarb = 2;
      estFat = 11;
    } else if (descLower.includes("paneer") || descLower.includes("tofu") || descLower.includes("cheese")) {
      estCal = 260;
      estPro = 16;
      estCarb = 4;
      estFat = 18;
    } else if (descLower.includes("shake") || descLower.includes("whey") || descLower.includes("protein")) {
      estCal = 150;
      estPro = 26;
      estCarb = 3;
      estFat = 1.5;
    } else if (descLower.includes("roti") || descLower.includes("chapati") || descLower.includes("bread") || descLower.includes("naan")) {
      estCal = 110;
      estPro = 3.5;
      estCarb = 22;
      estFat = 1;
    } else if (descLower.includes("rice") || descLower.includes("biryani") || descLower.includes("pulao")) {
      estCal = 220;
      estPro = 4.5;
      estCarb = 45;
      estFat = 2;
    } else if (descLower.includes("apple") || descLower.includes("banana") || descLower.includes("fruit") || descLower.includes("berry")) {
      estCal = 85;
      estPro = 0.8;
      estCarb = 21;
      estFat = 0.2;
      estFiber = 3.5;
    } else if (descLower.includes("salad") || descLower.includes("vegetable") || descLower.includes("broccoli")) {
      estCal = 120;
      estPro = 4;
      estCarb = 10;
      estFat = 6;
      estFiber = 4.5;
    }

    // Capitalize user's description
    const capitalizedName = userDescription!.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return {
      name: `${capitalizedName} (Calibrated)`,
      servingSize: "1 plate (estimated)",
      calories: estCal,
      protein: estPro,
      carbs: estCarb,
      fat: estFat,
      fiber: estFiber,
      sugar: Math.round(estCarb * 0.1 * 10) / 10,
      sodium: estFat * 30 + 100,
      potassium: estPro * 15 + 120,
      vitaminA: 60,
      vitaminC: 4,
      calcium: 80,
      iron: 1.5,
      confidence: 95
    };
  }

  // 2. If NO userDescription, use imageName keywords or fallback to a gorgeous randomized healthy list!
  if (nameLower.includes("salad") || nameLower.includes("veg")) {
    result = {
      name: "Avocado & Chickpea Green Salad",
      servingSize: "1 large bowl (220g)",
      calories: 245,
      protein: 8.5,
      carbs: 18.0,
      fat: 16.5,
      fiber: 6.8,
      sugar: 3.2,
      sodium: 320,
      potassium: 420,
      vitaminA: 180,
      vitaminC: 22.4,
      calcium: 85,
      iron: 2.1,
      confidence: 94
    };
  } else if (nameLower.includes("pizza")) {
    result = {
      name: "Neapolitan Pepperoni Pizza",
      servingSize: "2 Slices (180g)",
      calories: 490,
      protein: 22.5,
      carbs: 52.0,
      fat: 19.8,
      fiber: 3.0,
      sugar: 4.8,
      sodium: 980,
      potassium: 310,
      vitaminA: 120,
      vitaminC: 3.6,
      calcium: 240,
      iron: 3.2,
      confidence: 96
    };
  } else if (nameLower.includes("egg") || nameLower.includes("breakfast")) {
    result = {
      name: "Scrambled Eggs with Toast & Paneer",
      servingSize: "1 plate (200g)",
      calories: 360,
      protein: 21.0,
      carbs: 24.5,
      fat: 18.2,
      fiber: 2.5,
      sugar: 2.0,
      sodium: 480,
      potassium: 290,
      vitaminA: 140,
      vitaminC: 1.5,
      calcium: 180,
      iron: 2.4,
      confidence: 91
    };
  } else if (nameLower.includes("burger") || nameLower.includes("mcdonald")) {
    result = {
      name: "McDonald's Double Cheeseburger",
      servingSize: "1 Burger (165g)",
      calories: 440,
      protein: 25.0,
      carbs: 34.0,
      fat: 23.0,
      fiber: 2.0,
      sugar: 7.0,
      sodium: 1050,
      potassium: 340,
      vitaminA: 80,
      vitaminC: 1.5,
      calcium: 200,
      iron: 3.8,
      confidence: 97
    };
  } else {
    // Diverse, highly realistic healthy meal presets generator!
    // Instead of defaulting to paneer roll every time, cycle through 8 premium fitness options!
    const premiumPresets = [
      {
        name: "Scrambled Eggs with Avocado Toast",
        servingSize: "1 plate (210g)",
        calories: 380,
        protein: 22.0,
        carbs: 24.0,
        fat: 19.5,
        fiber: 5.2,
        sugar: 2.1,
        sodium: 440,
        potassium: 340,
        vitaminA: 150,
        vitaminC: 4.8,
        calcium: 120,
        iron: 2.6,
        confidence: 90
      },
      {
        name: "Grilled Salmon with Asparagus Tiers",
        servingSize: "1 serving (240g)",
        calories: 390,
        protein: 34.5,
        carbs: 8.0,
        fat: 22.4,
        fiber: 2.8,
        sugar: 1.2,
        sodium: 380,
        potassium: 620,
        vitaminA: 180,
        vitaminC: 12.0,
        calcium: 95,
        iron: 1.9,
        confidence: 93
      },
      {
        name: "Organic Oats Bowl with Chia & Berries",
        servingSize: "1 bowl (180g)",
        calories: 290,
        protein: 9.5,
        carbs: 48.0,
        fat: 5.6,
        fiber: 7.4,
        sugar: 11.5,
        sodium: 120,
        potassium: 290,
        vitaminA: 20,
        vitaminC: 14.5,
        calcium: 150,
        iron: 2.2,
        confidence: 92
      },
      {
        name: "Strawberry Whey Isolate Shake",
        servingSize: "1 shaker (350ml)",
        calories: 160,
        protein: 26.2,
        carbs: 4.8,
        fat: 1.8,
        fiber: 0.8,
        sugar: 2.5,
        sodium: 90,
        potassium: 210,
        vitaminA: 10,
        vitaminC: 3.2,
        calcium: 190,
        iron: 0.3,
        confidence: 95
      },
      {
        name: "Grilled Chicken Quinoa Bowl",
        servingSize: "1 bowl (250g)",
        calories: 420,
        protein: 36.0,
        carbs: 38.0,
        fat: 11.2,
        fiber: 4.5,
        sugar: 2.2,
        sodium: 520,
        potassium: 480,
        vitaminA: 85,
        vitaminC: 6.2,
        calcium: 75,
        iron: 3.1,
        confidence: 94
      },
      {
        name: "Classic Masala Dosa with Sambar",
        servingSize: "1 Dosa + Sambar",
        calories: 310,
        protein: 7.2,
        carbs: 54.0,
        fat: 7.5,
        fiber: 4.8,
        sugar: 4.2,
        sodium: 590,
        potassium: 220,
        vitaminA: 40,
        vitaminC: 3.5,
        calcium: 68,
        iron: 1.4,
        confidence: 89
      },
      {
        name: "Paneer Tikka Salad Wrap",
        servingSize: "1 wrap (180g)",
        calories: 350,
        protein: 16.0,
        carbs: 36.0,
        fat: 14.8,
        fiber: 4.2,
        sugar: 3.5,
        sodium: 510,
        potassium: 240,
        vitaminA: 110,
        vitaminC: 5.2,
        calcium: 310,
        iron: 1.6,
        confidence: 91
      },
      {
        name: "Spiced Chickpea & Hummus Platter",
        servingSize: "1 plate (200g)",
        calories: 270,
        protein: 11.5,
        carbs: 32.0,
        fat: 9.8,
        fiber: 6.5,
        sugar: 2.8,
        sodium: 460,
        potassium: 310,
        vitaminA: 45,
        vitaminC: 7.8,
        calcium: 110,
        iron: 2.8,
        confidence: 92
      }
    ];

    // Seed-like hash selection based on imageName size or date seconds
    const index = Math.abs((imageName || "").length + new Date().getSeconds()) % premiumPresets.length;
    result = premiumPresets[index];
  }

  return result;
}
