import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, SafeAreaView } from "react-native";
import { useStore, IndianFoodItem } from "../store/useStore";
import { useRouter } from "expo-router";
import { 
  ArrowLeft as LucideArrowLeft, 
  Search as LucideSearch,
  Star as LucideStar,
  X as LucideX
} from "lucide-react-native";

const ArrowLeft = LucideArrowLeft as any;
const Search = LucideSearch as any;
const Star = LucideStar as any;
const X = LucideX as any;

export default function SearchScreen() {
  const router = useRouter();
  const {
    indianFoods,
    recentFoods,
    logRecentFood,
    logMeal
  } = useStore();

  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<IndianFoodItem | null>(null);

  // Filter foods by search query
  const getFilteredFoods = () => {
    let list = indianFoods;
    if (query.trim()) {
      const norm = query.toLowerCase().trim();
      list = list.filter((f) => f.name.toLowerCase().includes(norm) || f.category.toLowerCase().includes(norm));
    }
    return list.sort((a, b) => b.popularity_score - a.popularity_score);
  };

  const filteredFoods = getFilteredFoods();

  // Favorite foods (Mock favorite dishes based on popular scores)
  const favoriteFoods = indianFoods.slice(0, 3);

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
          quantity_grams: 100, // baseline serving size
          calories: selectedFood.calories,
          protein: selectedFood.protein,
          carbs: selectedFood.carbs,
          fat: selectedFood.fat
        }
      ]
    );

    Alert.alert(
      "Meal Logged",
      `Successfully logged ${selectedFood.name} to ${mealType}!`,
      [{ text: "Done", onPress: () => { setSelectedFood(null); router.replace("/(tabs)"); } }]
    );
  };

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
          <View style={{ width: 40 }} /> {/* Spacer to align title */}
        </View>

        {/* Minimalist Search Box (Soft gray background, 20px rounded) */}
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search: 'Dosa', 'Paneer', 'Eggs'..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* FAVORITE FOODS SECTION */}
          {!query && (
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
          )}

          {/* RECENT SEARCHES */}
          {!query && recentFoods.length > 0 && (
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

          {/* DATABASE DISHES LIST */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {query ? `Results (${filteredFoods.length})` : "Verified Dishes"}
            </Text>

            {filteredFoods.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No matching foods found</Text>
              </View>
            ) : (
              filteredFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.foodRow}
                  onPress={() => handleSelectFood(food)}
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
              ))
            )}
          </View>

        </ScrollView>

        {/* LOGGING DETAILS SLIDE SHEET MODAL */}
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

                {/* Macro summary card (Soft gray card, rounded 20px) */}
                <View style={styles.modalMacroCard}>
                  <View style={styles.modalCalWrapper}>
                    <Text style={styles.modalCalVal}>{selectedFood.calories}</Text>
                    <Text style={styles.modalCalLabel}>Calories</Text>
                  </View>

                  <View style={styles.modalMacrosSplit}>
                    <View style={styles.splitRow}>
                      <Text style={styles.splitLabel}>Protein</Text>
                      <Text style={styles.splitVal}>{selectedFood.protein}g</Text>
                    </View>
                    <View style={styles.splitRow}>
                      <Text style={styles.splitLabel}>Carbs</Text>
                      <Text style={styles.splitVal}>{selectedFood.carbs}g</Text>
                    </View>
                    <View style={styles.splitRow}>
                      <Text style={styles.splitLabel}>Fats</Text>
                      <Text style={styles.splitVal}>{selectedFood.fat}g</Text>
                    </View>
                  </View>
                </View>

                {/* Micro Nutrients Summary inside clean minimal drawer */}
                <View style={styles.microsDrawer}>
                  <Text style={styles.fieldLabel}>Estimated Micros</Text>
                  <View style={styles.microsGrid}>
                    <View style={styles.microCol}>
                      <Text style={styles.microVal}>{selectedFood.fiber}g</Text>
                      <Text style={styles.microLabel}>Fiber</Text>
                    </View>
                    <View style={styles.microCol}>
                      <Text style={styles.microVal}>{selectedFood.calcium}mg</Text>
                      <Text style={styles.microLabel}>Calcium</Text>
                    </View>
                    <View style={styles.microCol}>
                      <Text style={styles.microVal}>{selectedFood.iron}mg</Text>
                      <Text style={styles.microLabel}>Iron</Text>
                    </View>
                  </View>
                </View>

                {/* Action 1: Instant logging to specific meals (Max 3 logs grouped as one action matrix) */}
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
    borderRadius: 20, // Strict 20px rounded corners
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
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginTop: 16,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
    textAlign: "left",
  },
  favoritesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 8,
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
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
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
  modalMacroCard: {
    flexDirection: "row",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  modalCalWrapper: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCalVal: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },
  modalCalLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    marginTop: 2,
  },
  modalMacrosSplit: {
    flex: 1,
    paddingLeft: 20,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  splitVal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  microsDrawer: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
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
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  microLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 2,
  },
  logLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "left",
  },
  logGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logBtn: {
    flex: 1,
    backgroundColor: "#3B82F6", // Unified Brand Accent
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  logBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});
