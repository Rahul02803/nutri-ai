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
import { useStore, IndianFoodItem } from "../store/useStore";
import { useRouter } from "expo-router";
import { 
  ArrowLeft as LucideArrowLeft, 
  Search as LucideSearch,
  Star as LucideStar,
  X as LucideX,
  Plus as LucidePlus,
  Minus as LucideMinus
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";

const ArrowLeft = LucideArrowLeft as any;
const Search = LucideSearch as any;
const Star = LucideStar as any;
const X = LucideX as any;
const Plus = LucidePlus as any;
const Minus = LucideMinus as any;

// Helper to parse base grams from serving_size string (e.g., "100g" -> 100, "1 plate (200g)" -> 200)
const parseBaseGrams = (servingSize: string): number => {
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? parseFloat(match[1]) : 100;
};

// Helper to determine the gram weight of 1 unit of a selected option for a given food
const getUnitWeight = (foodName: string, servingSize: string, unit: string): number => {
  const normName = foodName.toLowerCase();
  const baseGrams = parseBaseGrams(servingSize);

  switch (unit) {
    case "g":
      return 1;
    case "kg":
      return 1000;
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
      if (servingSize.toLowerCase().includes("bowl")) {
        return baseGrams;
      }
      return 300;
    case "serving":
      return baseGrams;
    case "piece":
      if (normName.includes("roti") || normName.includes("chapati")) return 40;
      if (normName.includes("samosa")) return 75;
      if (normName.includes("idli")) return 50;
      if (normName.includes("dosa")) return 120;
      if (normName.includes("banana")) return 100;
      if (normName.includes("apple")) return 120;
      if (normName.includes("egg")) return 50;
      if (normName.includes("chicken")) return 80;
      if (normName.includes("jalebi")) return 25;
      if (normName.includes("paneer")) return 20;
      if (normName.includes("tofu")) return 25;
      if (normName.includes("vada")) return 60;
      if (normName.includes("bhature") || normName.includes("bhatura")) return 60;
      if (normName.includes("puri") || normName.includes("poori")) return 25;
      if (normName.includes("gulab jamun")) return 40;
      if (normName.includes("rasgulla")) return 45;
      if (normName.includes("laddu") || normName.includes("ladoo")) return 40;
      if (normName.includes("slice")) return 30;

      if (servingSize.toLowerCase().includes("piece") || servingSize.toLowerCase().includes("pc")) {
        return baseGrams;
      }
      return 100;
    default:
      return baseGrams;
  }
};

interface FoodRowProps {
  food: IndianFoodItem;
  onPress: (food: IndianFoodItem) => void;
}

// Memoized food row component for high performance virtualized list
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

export default function SearchScreen() {
  const router = useRouter();
  const {
    indianFoods,
    recentFoods,
    logRecentFood,
    logMeal
  } = useStore();

  const [inputText, setInputText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<IndianFoodItem | null>(null);

  // Unit and quantity states
  const [selectedUnit, setSelectedUnit] = useState<string>("serving");
  const [quantityText, setQuantityText] = useState<string>("1");

  // Debouncing input text
  useEffect(() => {
    if (inputText === "") {
      setDebouncedQuery("");
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedQuery(inputText);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputText]);

  const searchCache = useRef<{ [query: string]: IndianFoodItem[] }>({});

  // Memoized search querying
  const filteredFoods = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      return indianFoods.sort((a, b) => b.popularity_score - a.popularity_score);
    }
    if (searchCache.current[q]) {
      return searchCache.current[q];
    }
    // Perform search using the store's fuzzy matching engine
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

  const UNITS = ["serving", "piece", "g", "bowl", "cup", "tbsp", "tsp", "kg", "ml", "liter"];

  const getStepSize = (unit: string): number => {
    if (unit === "g" || unit === "ml") return 50;
    if (unit === "kg" || unit === "liter") return 0.1;
    return 1;
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    if (unit === "g" || unit === "ml") {
      setQuantityText("100");
    } else if (unit === "kg" || unit === "liter") {
      setQuantityText("0.1");
    } else {
      setQuantityText("1");
    }
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

  // Live macronutrient calculations
  const liveMacros = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0, totalGrams: 0 };
    
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
      fiber: Math.round((selectedFood.fiber || 0) * factor * 10) / 10,
      calcium: Math.round((selectedFood.calcium || 0) * factor * 10) / 10,
      iron: Math.round((selectedFood.iron || 0) * factor * 10) / 10,
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

    Alert.alert(
      "Meal Logged",
      `Successfully logged ${selectedFood.name} (${liveMacros.totalGrams}g) to ${mealType}!`,
      [{ text: "Done", onPress: () => { setSelectedFood(null); router.replace("/(tabs)"); } }]
    );
  };

  const isSearching = inputText !== debouncedQuery;

  // Render header view for virtualized FlashList
  const renderListHeader = () => {
    if (debouncedQuery) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Results ({filteredFoods.length})
          </Text>
        </View>
      );
    }

    const favoriteFoods = indianFoods.slice(0, 3);

    return (
      <View>
        {/* FAVORITE FOODS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          <View style={styles.favoritesGrid}>
            {favoriteFoods.map((food) => (
              <TouchableOpacity
                key={`fav-${food.id}`}
                style={styles.favCard}
                onPress={() => handleSelectFood(food)}
                activeOpacity={0.8}
              >
                <View style={styles.favHeader}>
                  <Star size={12} color="#3B82F6" style={{ marginRight: 4 }} />
                  <Text style={styles.favName} numberOfLines={1}>{food.name}</Text>
                </View>
                <Text style={styles.favCal}>{food.calories} kcal</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECENT SEARCHES */}
        {recentFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Foods</Text>
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

        {/* DEFAULT VERIFIED DISHES TITLE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verified Dishes</Text>
        </View>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: IndianFoodItem }) => {
    return <FoodRow food={item} onPress={handleSelectFood} />;
  }, [handleSelectFood]);

  const keyExtractor = useCallback((item: IndianFoodItem) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Minimal Search Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Database</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Minimalist Search Box (Soft gray background, 20px rounded) */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search: 'Dosa', 'Paneer', 'Eggs'..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText("")}>
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* High Performance Virtualized List */}
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
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListHeaderComponent={renderListHeader}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* LOGGING DETAILS SLIDE SHEET MODAL */}
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
                      activeOpacity={0.8}
                    >
                      <X size={18} color="#111827" />
                    </TouchableOpacity>
                  </View>

                  {/* Quantity Stepper & Stepper Buttons */}
                  <Text style={styles.logLabel}>Adjust Quantity & Unit:</Text>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.unitScroll}
                    contentContainerStyle={styles.unitScrollContent}
                  >
                    {UNITS.map((unit) => {
                      const isActive = selectedUnit === unit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          style={[styles.unitCapsule, isActive && styles.unitCapsuleActive]}
                          onPress={() => handleUnitChange(unit)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.unitText, isActive && styles.unitTextActive]}>
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.stepperButton} 
                      onPress={decrementQuantity}
                      activeOpacity={0.8}
                    >
                      <Minus size={18} color="#111827" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={quantityText}
                      onChangeText={setQuantityText}
                      selectTextOnFocus={true}
                    />
                    
                    <TouchableOpacity 
                      style={styles.stepperButton} 
                      onPress={incrementQuantity}
                      activeOpacity={0.8}
                    >
                      <Plus size={18} color="#111827" />
                    </TouchableOpacity>
                  </View>

                  {/* Macro summary card (Soft gray card, rounded 20px) */}
                  <View style={styles.modalMacroCard}>
                    <View style={styles.modalCalWrapper}>
                      <Text style={styles.modalCalVal}>{liveMacros.calories}</Text>
                      <Text style={styles.modalCalLabel}>Calories</Text>
                      <Text style={styles.modalWeightLabel}>{liveMacros.totalGrams}g total</Text>
                    </View>

                    <View style={styles.modalMacrosSplit}>
                      <View style={styles.splitRow}>
                        <Text style={styles.splitLabel}>Protein</Text>
                        <Text style={styles.splitVal}>{liveMacros.protein}g</Text>
                      </View>
                      <View style={styles.splitRow}>
                        <Text style={styles.splitLabel}>Carbs</Text>
                        <Text style={styles.splitVal}>{liveMacros.carbs}g</Text>
                      </View>
                      <View style={styles.splitRow}>
                        <Text style={styles.splitLabel}>Fats</Text>
                        <Text style={styles.splitVal}>{liveMacros.fat}g</Text>
                      </View>
                    </View>
                  </View>

                  {/* Micro Nutrients Summary inside clean minimal drawer */}
                  <View style={styles.microsDrawer}>
                    <Text style={styles.fieldLabel}>Estimated Micros</Text>
                    <View style={styles.microsGrid}>
                      <View style={styles.microCol}>
                        <Text style={styles.microVal}>{liveMacros.fiber}g</Text>
                        <Text style={styles.microLabel}>Fiber</Text>
                      </View>
                      <View style={styles.microCol}>
                        <Text style={styles.microVal}>{liveMacros.calcium}mg</Text>
                        <Text style={styles.microLabel}>Calcium</Text>
                      </View>
                      <View style={styles.microCol}>
                        <Text style={styles.microVal}>{liveMacros.iron}mg</Text>
                        <Text style={styles.microLabel}>Iron</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action 1: Instant logging to specific meals */}
                  <Text style={styles.logLabel}>Select Meal Log Target:</Text>
                  <View style={styles.logGrid}>
                    <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Breakfast")} activeOpacity={0.8}>
                      <Text style={styles.logBtnText}>Breakfast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Lunch")} activeOpacity={0.8}>
                      <Text style={styles.logBtnText}>Lunch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Dinner")} activeOpacity={0.8}>
                      <Text style={styles.logBtnText}>Dinner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Snack")} activeOpacity={0.8}>
                      <Text style={styles.logBtnText}>Snack</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginTop: 16,
    width: "100%",
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    textAlign: "left",
  },
  favoritesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 8,
    marginTop: 8,
  },
  favCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 14,
    width: "31%",
    alignItems: "flex-start",
  },
  favHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  favName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  favCal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#3B82F6",
    marginTop: 6,
  },
  recentList: {
    marginBottom: 8,
    marginTop: 8,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  recentText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  recentCal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
  },
  foodLeft: {
    flex: 1,
    alignItems: "flex-start",
    marginRight: 8,
  },
  foodName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  foodMeta: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },
  foodRight: {
    alignItems: "flex-end",
  },
  foodCal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  foodMacros: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: "center",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 48 : 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 2,
  },
  modalCloseBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  unitScroll: {
    marginVertical: 4,
  },
  unitScrollContent: {
    paddingVertical: 4,
  },
  unitCapsule: {
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  unitCapsuleActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  unitText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  unitTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    backgroundColor: "#F4F4F5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "center",
    width: "60%",
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    paddingVertical: 6,
  },
  modalMacroCard: {
    flexDirection: "row",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  modalCalWrapper: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    alignItems: "center",
    paddingRight: 10,
  },
  modalCalVal: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  modalCalLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    marginTop: 1,
  },
  modalWeightLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  modalMacrosSplit: {
    flex: 1,
    paddingLeft: 16,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 1.5,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  splitVal: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  microsDrawer: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  microsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  microCol: {
    width: "30%",
    alignItems: "center",
  },
  microVal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  microLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 1,
  },
  logLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "left",
  },
  logGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logBtn: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 3,
  },
  logBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});
