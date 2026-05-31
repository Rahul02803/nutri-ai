import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import { useStore, IndianFoodItem } from "../store/useStore";
import { useRouter } from "expo-router";
import { 
  ArrowLeft as LucideArrowLeft, 
  Search as LucideSearch, 
  CheckCircle as LucideCheckCircle, 
  Clock as LucideClock, 
  Star as LucideStar, 
  Plus as LucidePlus, 
  Shield as LucideShield, 
  Settings as LucideSettings, 
  Info as LucideInfo 
} from "lucide-react-native";

const ArrowLeft = LucideArrowLeft as any;
const Search = LucideSearch as any;
const CheckCircle = LucideCheckCircle as any;
const Clock = LucideClock as any;
const Star = LucideStar as any;
const Plus = LucidePlus as any;
const Shield = LucideShield as any;
const Settings = LucideSettings as any;
const Info = LucideInfo as any;

export default function SearchScreen() {
  const router = useRouter();
  const {
    indianFoods,
    recentFoods,
    logRecentFood,
    searchIndianFoods,
    logMeal
  } = useStore();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<IndianFoodItem | null>(null);

  const categories = ["All", "North Indian", "South Indian", "Street Food", "Fast Food", "Restaurant Meals", "Vegetarian", "Non Vegetarian"];

  // Filter foods by category and search query
  const getFilteredFoods = () => {
    let list = indianFoods;

    if (activeCategory !== "All") {
      list = list.filter((f) => {
        if (activeCategory === "Vegetarian") {
          return f.category === "Vegetarian" || f.category === "North Indian" || f.category === "South Indian" || f.name.toLowerCase().includes("paneer") || f.name.toLowerCase().includes("idli") || f.name.toLowerCase().includes("dosa");
        }
        if (activeCategory === "Non Vegetarian") {
          return f.category === "Non Vegetarian" || f.name.toLowerCase().includes("chicken") || f.name.toLowerCase().includes("mutton") || f.name.toLowerCase().includes("fish");
        }
        return f.category === activeCategory;
      });
    }

    if (query.trim()) {
      const norm = query.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(norm) || f.category.toLowerCase().includes(norm));
    }

    // Sort by popularity score
    return list.sort((a, b) => b.popularity_score - a.popularity_score);
  };

  const filteredFoods = getFilteredFoods();

  // Popular foods list
  const popularFoods = [...indianFoods]
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, 4);

  const handleSelectFood = (food: IndianFoodItem) => {
    logRecentFood(food);
    setSelectedFood(food);
  };

  const handleLogFood = (mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack") => {
    if (!selectedFood) return;

    logMeal(
      {
        meal_type: mealType,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat
      },
      [
        {
          food_name: selectedFood.name,
          quantity_grams: 100, // baseline
          calories: selectedFood.calories,
          protein: selectedFood.protein,
          carbs: selectedFood.carbs,
          fat: selectedFood.fat
        }
      ]
    );

    Alert.alert(
      "Logged Successfully",
      `1 Serving of "${selectedFood.name}" has been logged to ${mealType}!`,
      [{ text: "Close", onPress: () => setSelectedFood(null) }]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Search Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Indian Foods DB</Text>
        
        <TouchableOpacity style={styles.adminButton} onPress={() => router.push("/admin")}>
          <Settings size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Modern Search Engine Bar */}
      <View style={styles.searchBarWrapper}>
        <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods: 'Dosa', 'Paneer', 'Chicken'..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Horizontal categories list */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* RECENT SEARCHES LIST */}
        {!query && recentFoods.length > 0 && (
          <View style={styles.dbSection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentGrid}>
              {recentFoods.map((food) => (
                <TouchableOpacity
                  key={`rec-${food.id}`}
                  style={styles.recentItem}
                  onPress={() => setSelectedFood(food)}
                >
                  <Clock size={12} color="#9CA3AF" />
                  <Text style={styles.recentText} numberOfLines={1}>{food.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* POPULAR FOODS CARDS */}
        {!query && activeCategory === "All" && (
          <View style={styles.dbSection}>
            <Text style={styles.sectionTitle}>Popular Today</Text>
            <View style={styles.popularRow}>
              {popularFoods.map((food) => (
                <TouchableOpacity
                  key={`pop-${food.id}`}
                  style={styles.popularCard}
                  onPress={() => handleSelectFood(food)}
                >
                  <View style={styles.popularHeader}>
                    <Text style={styles.popularName} numberOfLines={1}>{food.name}</Text>
                    {food.is_verified && <CheckCircle size={10} color="#14B8A6" />}
                  </View>
                  <Text style={styles.popularCal}>{food.calories} kcal</Text>
                  <Text style={styles.popularMacros}>P: {food.protein}g • C: {food.carbs}g</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* DATABASE RESULTS */}
        <View style={styles.dbSection}>
          <Text style={styles.sectionTitle}>
            {query || activeCategory !== "All" ? `Results (${filteredFoods.length})` : "Indian Specialties database"}
          </Text>

          {filteredFoods.length === 0 ? (
            <View style={styles.emptyCard}>
              <Info size={20} color="#9CA3AF" />
              <Text style={styles.emptyText}>No matching Indian dishes found.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => router.push("/admin")}>
                <Text style={styles.emptyAddText}>ADD CUSTOM DISH</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodRow}
                onPress={() => handleSelectFood(food)}
              >
                <View style={styles.foodInfo}>
                  <View style={styles.foodNameWrapper}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    {food.is_verified ? (
                      <View style={styles.badgeVerified}>
                        <Shield size={8} color="#14B8A6" />
                        <Text style={styles.badgeText}>VERIFIED</Text>
                      </View>
                    ) : (
                      <View style={styles.badgePending}>
                        <Text style={styles.badgeTextPending}>USER</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.foodCat}>{food.category} • {food.serving_size}</Text>
                </View>

                <View style={styles.foodRight}>
                  <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                  <Text style={styles.foodMacrosRecap}>P: {food.protein}g • F: {food.fat}g</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      {/* DETAILED MODAL SHEET */}
      {selectedFood && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectedFood !== null}
          onRequestClose={() => setSelectedFood(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedFood.name}</Text>
                  <Text style={styles.modalSub}>{selectedFood.category} database preset • {selectedFood.serving_size}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Nutrition Ring widget */}
              <View style={styles.macroBox}>
                <View style={styles.calWrapper}>
                  <Text style={styles.calVal}>{selectedFood.calories}</Text>
                  <Text style={styles.calLabel}>CALORIES</Text>
                </View>

                <View style={styles.macrosSplit}>
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Protein</Text>
                    <Text style={styles.splitVal}>{selectedFood.protein}g</Text>
                  </View>
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Carbohydrates</Text>
                    <Text style={styles.splitVal}>{selectedFood.carbs}g</Text>
                  </View>
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Fat</Text>
                    <Text style={styles.splitVal}>{selectedFood.fat}g</Text>
                  </View>
                </View>
              </View>

              {/* Micros Grid list */}
              <View style={styles.microsSection}>
                <Text style={styles.microsTitle}>Essential Micro-nutrients</Text>
                <View style={styles.microsGrid}>
                  <View style={styles.microCol}>
                    <Text style={styles.microVal}>{selectedFood.fiber}g</Text>
                    <Text style={styles.microLabel}>Fiber</Text>
                  </View>
                  <View style={styles.microCol}>
                    <Text style={styles.microVal}>{selectedFood.iron}mg</Text>
                    <Text style={styles.microLabel}>Iron</Text>
                  </View>
                  <View style={styles.microCol}>
                    <Text style={styles.microVal}>{selectedFood.calcium}mg</Text>
                    <Text style={styles.microLabel}>Calcium</Text>
                  </View>
                  <View style={styles.microCol}>
                    <Text style={styles.microVal}>{selectedFood.vitamin_d}mcg</Text>
                    <Text style={styles.microLabel}>Vit D</Text>
                  </View>
                  <View style={styles.microCol}>
                    <Text style={styles.microVal}>{selectedFood.vitamin_b12}mcg</Text>
                    <Text style={styles.microLabel}>Vit B12</Text>
                  </View>
                </View>
              </View>

              {/* Tap to log actions */}
              <Text style={styles.logPrompt}>Tap to log this dish to daily budget:</Text>
              <View style={styles.logButtonsRow}>
                <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Breakfast")}>
                  <Text style={styles.logBtnText}>Breakfast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Lunch")}>
                  <Text style={styles.logBtnText}>Lunch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Dinner")}>
                  <Text style={styles.logBtnText}>Dinner</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logBtn} onPress={() => handleLogFood("Snack")}>
                  <Text style={styles.logBtnText}>Snack</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
      )}

    </View>
  );
}

// Bypassing Lucide strict typechecks in the stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.2,
  },
  adminButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#111827",
    fontWeight: "bold",
  },
  categoriesSection: {
    marginBottom: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  dbSection: {
    marginTop: 14,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "left",
  },
  recentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    maxWidth: 120,
  },
  recentText: {
    fontSize: 10,
    color: "#4B5563",
    fontWeight: "bold",
    marginLeft: 4,
  },
  popularRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  popularCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 12,
    width: "48%",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  popularHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  popularName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
    flex: 1,
    textAlign: "left",
  },
  popularCal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#10B981",
    marginTop: 6,
  },
  popularMacros: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  foodNameWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodName: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgePending: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 6,
    fontWeight: "900",
    color: "#14B8A6",
    marginLeft: 2,
  },
  badgeTextPending: {
    fontSize: 6,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  foodCat: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 4,
  },
  foodRight: {
    alignItems: "flex-end",
  },
  foodCalories: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  foodMacrosRecap: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 8,
  },
  emptyAddBtn: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyAddText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    textAlign: "left",
  },
  modalSub: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "left",
  },
  closeButton: {
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
  },
  closeButtonText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "bold",
  },
  macroBox: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  calWrapper: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    alignItems: "center",
  },
  calVal: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  calLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  macrosSplit: {
    flex: 1,
    paddingLeft: 20,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
  },
  splitVal: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  microsSection: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  microsTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  microsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  microCol: {
    width: "18%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  microVal: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  microLabel: {
    fontSize: 7,
    fontWeight: "900",
    color: "#9CA3AF",
    marginTop: 2,
  },
  logPrompt: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "left",
  },
  logButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 3,
  },
  logBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
});
