import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  SafeAreaView, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from "react-native";
import { useStore, IndianFoodItem } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  Search as LucideSearch,
  Star as LucideStar,
  X as LucideX,
  Plus as LucidePlus,
  Minus as LucideMinus,
  Camera as LucideCamera,
  Sparkles as LucideSparkles,
  Check as LucideCheck
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { scanMealImageWithGemini, ScannedFoodResult } from "../../services/gemini";

const Search = LucideSearch as any;
const Star = LucideStar as any;
const X = LucideX as any;
const Plus = LucidePlus as any;
const Minus = LucideMinus as any;
const Camera = LucideCamera as any;
const Sparkles = LucideSparkles as any;
const Check = LucideCheck as any;

// Helper to parse base grams from serving_size string (e.g. "150g" -> 150)
const parseBaseGrams = (servingSize: string): number => {
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? parseFloat(match[1]) : 100;
};

// Helper to estimate weight of 1 unit
const getUnitWeight = (foodName: string, servingSize: string, unit: string): number => {
  const normName = foodName.toLowerCase();
  const baseGrams = parseBaseGrams(servingSize);

  switch (unit) {
    case "g": return 1;
    case "ml": return 1;
    case "kg": return 1000;
    case "liter": return 1000;
    case "tbsp": return 15;
    case "tsp": return 5;
    case "cup": return 240;
    case "bowl": return servingSize.toLowerCase().includes("bowl") ? baseGrams : 300;
    case "serving": return baseGrams;
    case "piece":
      if (normName.includes("roti") || normName.includes("chapati")) return 40;
      if (normName.includes("samosa")) return 75;
      if (normName.includes("idli")) return 50;
      if (normName.includes("dosa")) return 120;
      if (normName.includes("banana")) return 100;
      if (normName.includes("apple")) return 120;
      if (normName.includes("egg")) return 50;
      if (servingSize.toLowerCase().includes("piece") || servingSize.toLowerCase().includes("pc")) return baseGrams;
      return 100;
    default: return baseGrams;
  }
};

interface FoodRowProps {
  food: IndianFoodItem;
  onPress: (food: IndianFoodItem) => void;
}

const FoodRow = React.memo(({ food, onPress }: FoodRowProps) => {
  return (
    <TouchableOpacity
      style={styles.foodRow}
      onPress={() => onPress(food)}
      activeOpacity={0.8}
    >
      <View style={styles.foodLeft}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodMeta}>{food.category} • {food.serving_size}</Text>
      </View>
      <View style={styles.foodRight}>
        <Text style={styles.foodCal}>{food.calories} kcal</Text>
        <Text style={styles.foodMacros}>P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function MealsScreen() {
  const router = useRouter();
  const {
    indianFoods,
    recentFoods,
    logRecentFood,
    logMeal
  } = useStore();

  const [activeTab, setActiveTab] = useState<"search" | "scan">("search");
  
  // Search parameters
  const [inputText, setInputText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<IndianFoodItem | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("serving");
  const [quantityText, setQuantityText] = useState<string>("1");

  // Scan parameters
  const [scanState, setScanState] = useState<"ready" | "analyzing" | "confirm">("ready");
  const [scanResult, setScanResult] = useState<ScannedFoodResult | null>(null);

  // Debouncing search
  useEffect(() => {
    if (inputText === "") {
      setDebouncedQuery("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedQuery(inputText);
    }, 250);
    return () => clearTimeout(handler);
  }, [inputText]);

  const searchCache = useRef<{ [query: string]: IndianFoodItem[] }>({});

  const filteredFoods = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      return indianFoods.sort((a, b) => b.popularity_score - a.popularity_score);
    }
    if (searchCache.current[q]) {
      return searchCache.current[q];
    }
    const results = useStore.getState().searchIndianFoods(q);
    searchCache.current[q] = results;
    return results;
  }, [debouncedQuery, indianFoods]);

  const handleSelectFood = useCallback((food: IndianFoodItem) => {
    logRecentFood(food);
    setSelectedFood(food);
    setSelectedUnit("serving");
    setQuantityText("1");
  }, [logRecentFood]);

  const UNITS = ["serving", "piece", "g", "bowl", "cup", "tbsp", "tsp"];

  const getStepSize = (unit: string): number => {
    if (unit === "g") return 50;
    return 1;
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setQuantityText(unit === "g" ? "100" : "1");
  };

  const incrementQuantity = () => {
    const step = getStepSize(selectedUnit);
    const currentVal = parseFloat(quantityText) || 0;
    const newVal = currentVal + step;
    setQuantityText(parseFloat(newVal.toFixed(2)).toString());
  };

  const decrementQuantity = () => {
    const step = getStepSize(selectedUnit);
    const currentVal = parseFloat(quantityText) || 0;
    const newVal = Math.max(0, currentVal - step);
    setQuantityText(parseFloat(newVal.toFixed(2)).toString());
  };

  const liveMacros = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0, totalGrams: 0 };
    
    const parsedQty = parseFloat(quantityText) || 0;
    const baseGrams = parseBaseGrams(selectedFood.serving_size);
    const unitGrams = getUnitWeight(selectedFood.name, selectedFood.serving_size, selectedUnit);
    const totalGrams = Math.round(parsedQty * unitGrams * 10) / 10;
    const factor = totalGrams / baseGrams;

    return {
      calories: Math.round(selectedFood.calories * factor),
      protein: Math.round(selectedFood.protein * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      fat: Math.round(selectedFood.fat * factor * 10) / 10,
      totalGrams
    };
  }, [selectedFood, quantityText, selectedUnit]);

  const handleLogFood = (mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => {
    if (!selectedFood) return;
    logMeal(
      {
        meal_type: mealType,
        calories: liveMacros.calories,
        protein: liveMacros.protein,
        carbs: liveMacros.carbs,
        fat: liveMacros.fat
      },
      [
        {
          food_name: selectedFood.name,
          quantity_grams: liveMacros.totalGrams,
          calories: liveMacros.calories,
          protein: liveMacros.protein,
          carbs: liveMacros.carbs,
          fat: liveMacros.fat
        }
      ]
    );

    Alert.alert("Meal Logged", `${selectedFood.name} logged to ${mealType}!`, [
      { text: "Done", onPress: () => { setSelectedFood(null); router.replace("/(tabs)/dashboard"); } }
    ]);
  };

  // AI Scanner Actions
  const handleSimulateScan = () => {
    setScanState("analyzing");
    
    // Simulate Gemini Visual Scanning API execution
    setTimeout(async () => {
      // Stub base64 for camera frame representation
      const sampleBase64 = "data:image/jpeg;base64,...";
      try {
        const results = await scanMealImageWithGemini(sampleBase64);
        if (results.length > 0) {
          setScanResult(results[0]);
          setScanState("confirm");
        } else {
          throw new Error("No foods detected.");
        }
      } catch (e) {
        Alert.alert("Scan Failed", "We could not classify the foods. Please enter details manually.");
        setScanState("ready");
      }
    }, 2000);
  };

  const handleConfirmScanLog = (mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => {
    if (!scanResult) return;
    logMeal(
      {
        meal_type: mealType,
        calories: scanResult.calories,
        protein: scanResult.protein,
        carbs: scanResult.carbs,
        fat: scanResult.fat
      },
      [
        {
          food_name: scanResult.name,
          quantity_grams: scanResult.weight,
          calories: scanResult.calories,
          protein: scanResult.protein,
          carbs: scanResult.carbs,
          fat: scanResult.fat
        }
      ]
    );

    Alert.alert("Meal Logged", `${scanResult.name} logged to ${mealType}!`, [
      { text: "Done", onPress: () => { setScanResult(null); setScanState("ready"); router.replace("/(tabs)/dashboard"); } }
    ]);
  };

  const renderListHeader = () => {
    if (debouncedQuery) return null;
    const favoriteFoods = indianFoods.slice(0, 3);
    return (
      <View>
        {favoriteFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Dishes</Text>
            <View style={styles.favoritesGrid}>
              {favoriteFoods.map((food) => (
                <TouchableOpacity
                  key={`fav-${food.id}`}
                  style={styles.favCard}
                  onPress={() => handleSelectFood(food)}
                  activeOpacity={0.8}
                >
                  <View style={styles.favHeader}>
                    <LucideStar size={11} color="#7C3AED" style={{ marginRight: 4 }} />
                    <Text style={styles.favName} numberOfLines={1}>{food.name}</Text>
                  </View>
                  <Text style={styles.favCal}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {recentFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentList}>
              {recentFoods.slice(0, 4).map((food) => (
                <TouchableOpacity
                  key={`rec-${food.id}`}
                  style={styles.recentRow}
                  onPress={() => handleSelectFood(food)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.recentText}>{food.name}</Text>
                  <Text style={styles.recentCal}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Verified Indian Foods</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Sub tabs Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "search" && styles.tabButtonActive]}
          onPress={() => setActiveTab("search")}
        >
          <Text style={[styles.tabText, activeTab === "search" && styles.tabTextActive]}>Database Search</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "scan" && styles.tabButtonActive]}
          onPress={() => setActiveTab("scan")}
        >
          <Text style={[styles.tabText, activeTab === "scan" && styles.tabTextActive]}>AI Plate Scan</Text>
        </TouchableOpacity>
      </View>

      {/* DATABASE SEARCH TAB */}
      {activeTab === "search" && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <Search size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search e.g. Roti, Dosa, Paneer Bhurji..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
            />
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText("")}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }}>
            {filteredFoods.length === 0 ? (
              <ScrollView contentContainerStyle={styles.listContent}>
                {renderListHeader()}
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No matching foods found</Text>
                </View>
              </ScrollView>
            ) : (
              <FlashList
                data={filteredFoods}
                renderItem={({ item }) => <FoodRow food={item} onPress={handleSelectFood} />}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      )}

      {/* AI SCANNER TAB */}
      {activeTab === "scan" && (
        <View style={styles.scanContainer}>
          {scanState === "ready" && (
            <View style={styles.scanReadyView}>
              <View style={styles.scanCircleOuter}>
                <View style={styles.scanCircleInner}>
                  <LucideCamera size={44} color="#7C3AED" />
                </View>
              </View>
              <Text style={styles.scanTitle}>Zenlog Visual AI</Text>
              <Text style={styles.scanDesc}>
                Take a photo of your plate to estimate calories, macronutrient splits, and portions instantly.
              </Text>
              
              <TouchableOpacity 
                style={styles.scanBtn}
                onPress={handleSimulateScan}
                activeOpacity={0.9}
              >
                <Sparkles size={16} color="#F9FAFB" />
                <Text style={styles.scanBtnText}>Scan My Plate</Text>
              </TouchableOpacity>
            </View>
          )}

          {scanState === "analyzing" && (
            <View style={styles.analyzingView}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.analyzingTitle}>AI Visual Matcher running...</Text>
              <Text style={styles.analyzingDesc}>Detecting ingredients & checking verified food databases</Text>
            </View>
          )}

          {scanState === "confirm" && scanResult && (
            <ScrollView contentContainerStyle={styles.confirmScroll}>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmHeader}>AI MEAL DETECTION MATCH</Text>
                
                <Text style={styles.confirmFoodName}>🍽️ {scanResult.name}</Text>
                <Text style={styles.confirmFoodWeight}>Estimated weight: {scanResult.weight}g</Text>

                {/* Scanned Macros */}
                <View style={styles.confirmMacrosRow}>
                  <View style={styles.confirmMacroItem}>
                    <Text style={styles.confirmMacroVal}>{scanResult.calories}</Text>
                    <Text style={styles.confirmMacroLbl}>Calories</Text>
                  </View>
                  <View style={styles.confirmMacroItem}>
                    <Text style={styles.confirmMacroVal}>{scanResult.protein}g</Text>
                    <Text style={styles.confirmMacroLbl}>Protein</Text>
                  </View>
                  <View style={styles.confirmMacroItem}>
                    <Text style={styles.confirmMacroVal}>{scanResult.carbs}g</Text>
                    <Text style={styles.confirmMacroLbl}>Carbs</Text>
                  </View>
                  <View style={styles.confirmMacroItem}>
                    <Text style={styles.confirmMacroVal}>{scanResult.fat}g</Text>
                    <Text style={styles.confirmMacroLbl}>Fat</Text>
                  </View>
                </View>

                {/* Target logging controls */}
                <Text style={styles.confirmTargetTitle}>Select Meal Destination:</Text>
                <View style={styles.confirmButtonsGrid}>
                  <TouchableOpacity style={styles.confirmTargetBtn} onPress={() => handleConfirmScanLog("Breakfast")}>
                    <Text style={styles.confirmTargetText}>Breakfast</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmTargetBtn} onPress={() => handleConfirmScanLog("Lunch")}>
                    <Text style={styles.confirmTargetText}>Lunch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmTargetBtn} onPress={() => handleConfirmScanLog("Dinner")}>
                    <Text style={styles.confirmTargetText}>Dinner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmTargetBtn} onPress={() => handleConfirmScanLog("Snack")}>
                    <Text style={styles.confirmTargetText}>Snack</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.cancelScanBtn}
                  onPress={() => setScanState("ready")}
                >
                  <Text style={styles.cancelScanText}>Cancel & Scan Again</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* MANUAL SEARCH PORTION LOGGING DIALOG */}
      {selectedFood && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectedFood !== null}
          onRequestClose={() => setSelectedFood(null)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedFood.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedFood.category} • {selectedFood.serving_size}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setSelectedFood(null)} 
                    style={styles.modalCloseBtn}
                  >
                    <X size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Unit selectors */}
                <Text style={styles.modalLabel}>PORTION UNIT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                  {UNITS.map((unit) => {
                    const active = selectedUnit === unit;
                    return (
                      <TouchableOpacity
                        key={unit}
                        style={[styles.unitCap, active && styles.unitCapActive]}
                        onPress={() => handleUnitChange(unit)}
                      >
                        <Text style={[styles.unitCapText, active && styles.unitCapTextActive]}>{unit}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Steppers */}
                <Text style={[styles.modalLabel, { marginTop: 16 }]}>ADJUST QUANTITY</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity style={styles.stepperBtn} onPress={decrementQuantity}>
                    <Minus size={16} color="#F9FAFB" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.stepperInput}
                    keyboardType="numeric"
                    value={quantityText}
                    onChangeText={setQuantityText}
                    selectTextOnFocus={true}
                  />

                  <TouchableOpacity style={styles.stepperBtn} onPress={incrementQuantity}>
                    <Plus size={16} color="#F9FAFB" />
                  </TouchableOpacity>
                </View>

                {/* Nutrition Summary Card */}
                <View style={styles.nutritionCard}>
                  <View style={styles.nutritionCol}>
                    <Text style={styles.nutritionValue}>{liveMacros.calories}</Text>
                    <Text style={styles.nutritionLbl}>Calories</Text>
                  </View>
                  <View style={styles.nutritionCol}>
                    <Text style={styles.nutritionValue}>{liveMacros.protein}g</Text>
                    <Text style={styles.nutritionLbl}>Protein</Text>
                  </View>
                  <View style={styles.nutritionCol}>
                    <Text style={styles.nutritionValue}>{liveMacros.carbs}g</Text>
                    <Text style={styles.nutritionLbl}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionCol}>
                    <Text style={styles.nutritionValue}>{liveMacros.fat}g</Text>
                    <Text style={styles.nutritionLbl}>Fat</Text>
                  </View>
                </View>
                <Text style={styles.totalGramsMeta}>Total weight: {liveMacros.totalGrams}g</Text>

                {/* Log target actions */}
                <Text style={styles.modalLabel}>SAVE TO DIARY</Text>
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity style={styles.logTargetBtn} onPress={() => handleLogFood("Breakfast")}>
                    <Text style={styles.logTargetText}>Breakfast</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logTargetBtn} onPress={() => handleLogFood("Lunch")}>
                    <Text style={styles.logTargetText}>Lunch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logTargetBtn} onPress={() => handleLogFood("Dinner")}>
                    <Text style={styles.logTargetText}>Dinner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logTargetBtn} onPress={() => handleLogFood("Snack")}>
                    <Text style={styles.logTargetText}>Snack</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#111827",
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#7C3AED", // Purple accent active
    fontWeight: "900",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#F9FAFB",
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 16,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.1,
  },
  favoritesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 8,
  },
  favCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 14,
    padding: 12,
    width: "31%",
  },
  favHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  favName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F9FAFB",
    flex: 1,
  },
  favCal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#7C3AED",
    marginTop: 6,
  },
  recentList: {
    marginTop: 8,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  recentText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  recentCal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  foodLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  foodName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  foodMeta: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 4,
  },
  foodRight: {
    alignItems: "flex-end",
  },
  foodCal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  foodMacros: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: "center",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  scanContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  scanReadyView: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanCircleOuter: {
    height: 140,
    width: 140,
    borderRadius: 70,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1F2937",
    marginBottom: 24,
  },
  scanCircleInner: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#7C3AED",
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  scanDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  scanBtn: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  scanBtnText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
  analyzingView: {
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F9FAFB",
    marginTop: 18,
  },
  analyzingDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 6,
  },
  confirmScroll: {
    paddingVertical: 24,
  },
  confirmCard: {
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 20,
    padding: 20,
  },
  confirmHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: "#7C3AED",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  confirmFoodName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  confirmFoodWeight: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 20,
  },
  confirmMacrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0B0F14",
    borderRadius: 14,
    padding: 12,
    marginBottom: 24,
  },
  confirmMacroItem: {
    alignItems: "center",
    flex: 1,
  },
  confirmMacroVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  confirmMacroLbl: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  confirmTargetTitle: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  confirmButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  confirmTargetBtn: {
    backgroundColor: "#0B0F14",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 10,
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmTargetText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "800",
  },
  cancelScanBtn: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  cancelScanText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  modalCloseBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
  },
  modalLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  unitScroll: {
    marginBottom: 8,
  },
  unitCap: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  unitCapActive: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  unitCapText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  unitCapTextActive: {
    color: "#7C3AED",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0B0F14",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: "60%",
    alignSelf: "center",
    marginBottom: 20,
  },
  stepperBtn: {
    height: 36,
    width: 36,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperInput: {
    fontSize: 16,
    color: "#F9FAFB",
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },
  nutritionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0B0F14",
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  nutritionCol: {
    alignItems: "center",
    flex: 1,
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  nutritionLbl: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  totalGramsMeta: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logTargetBtn: {
    flex: 1,
    height: 42,
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
  },
  logTargetText: {
    color: "#F9FAFB",
    fontSize: 11,
    fontWeight: "900",
  },
});
