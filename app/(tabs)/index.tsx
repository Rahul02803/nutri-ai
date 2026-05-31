import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useStore, Meal } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  Flame as LucideFlame, 
  Brain as LucideBrain, 
  Trash2 as LucideTrash2, 
  ArrowRight as LucideArrowRight,
  Search as LucideSearch
} from "lucide-react-native";

const Flame = LucideFlame as any;
const Brain = LucideBrain as any;
const Trash2 = LucideTrash2 as any;
const ArrowRight = LucideArrowRight as any;
const Search = LucideSearch as any;


export default function DashboardScreen() {
  const router = useRouter();
  const {
    user,
    meals,
    weightLogs,
    templates,
    logMeal,
    deleteMeal,
    isDarkMode
  } = useStore();

  const [activeTemplateIndex, setActiveTemplateIndex] = useState<number | null>(null);

  if (!user) return null;

  // Aggregate today's food inputs
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.created_at.startsWith(todayStr));

  const loggedCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const loggedProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const loggedCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const loggedFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);

  const targetCal = user.target_calories || 2000;
  const targetPro = user.target_protein || 140;
  const targetCarbs = user.target_carbs || 210;
  const targetFat = user.target_fat || 65;

  const remainingCal = Math.max(0, targetCal - loggedCalories);
  const remainingPro = Math.max(0, targetPro - loggedProtein);
  const remainingCarbs = Math.max(0, targetCarbs - loggedCarbs);
  const remainingFat = Math.max(0, targetFat - loggedFat);

  // Gemini dynamic coaching alerts based on split ratios
  const getCoachAdviceText = () => {
    if (remainingPro > 30) {
      return `Eat ${remainingPro}g more protein today to preserve lean muscle synthesis.`;
    }
    if (loggedCalories > targetCal) {
      return `You have exceeded your target calorie budget. Focus on steps to burn excess energy!`;
    }
    return `Amazing consistency! Today's calories and macro allocations are perfectly on track.`;
  };

  // Reusable meal template one-tap logger
  const handleLogTemplate = (templateIndex: number) => {
    const temp = templates[templateIndex];
    if (!temp) return;

    const totalCal = temp.foods.reduce((sum, f) => sum + f.calories, 0);
    const totalPro = temp.foods.reduce((sum, f) => sum + f.protein, 0);
    const totalCarb = temp.foods.reduce((sum, f) => sum + f.carbs, 0);
    const totalFat = temp.foods.reduce((sum, f) => sum + f.fat, 0);

    logMeal(
      {
        meal_type: "Breakfast",
        calories: totalCal,
        protein: totalPro,
        carbs: totalCarb,
        fat: totalFat
      },
      temp.foods
    );

    Alert.alert("Meal Logged", `Successfully logged reusable template "${temp.template_name}"!`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Brand header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ZenLog</Text>
          <Text style={styles.headerSub}>AI Powered Nutrition Coach</Text>
        </View>
        
        {/* Streak counts */}
        <TouchableOpacity style={styles.streakWrapper} onPress={() => router.push("/chat")}>
          <Flame size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{meals.length > 0 ? "1" : "0"}</Text>
        </TouchableOpacity>
      </View>

      {/* Calories Circular Balance Card */}
      <View style={styles.caloriesCard}>
        <View style={styles.caloriesLeftWrapper}>
          <Text style={styles.caloriesValue}>{remainingCal}</Text>
          <Text style={styles.caloriesLabel}>Calories left</Text>
          <Text style={styles.caloriesLogged}>Logged: {loggedCalories} / {targetCal} kcal</Text>
        </View>
      </View>

      {/* Macronutrient column cards */}
      <View style={styles.macrosContainer}>
        
        {/* Protein */}
        <View style={styles.macroCol}>
          <Text style={styles.macroValue}>{remainingPro}g</Text>
          <Text style={styles.macroLabel}>Protein left</Text>
          <View style={styles.macroBarWrapper}>
            <View style={[styles.macroBar, { backgroundColor: "#FF6B81", width: `${Math.min(100, (loggedProtein / targetPro) * 100)}%` }]} />
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroCol}>
          <Text style={styles.macroValue}>{remainingCarbs}g</Text>
          <Text style={styles.macroLabel}>Carbs left</Text>
          <View style={styles.macroBarWrapper}>
            <View style={[styles.macroBar, { backgroundColor: "#F4A261", width: `${Math.min(100, (loggedCarbs / targetCarbs) * 100)}%` }]} />
          </View>
        </View>

        {/* Fat */}
        <View style={styles.macroCol}>
          <Text style={styles.macroValue}>{remainingFat}g</Text>
          <Text style={styles.macroLabel}>Fat left</Text>
          <View style={styles.macroBarWrapper}>
            <View style={[styles.macroBar, { backgroundColor: "#4A90E2", width: `${Math.min(100, (loggedFat / targetFat) * 100)}%` }]} />
          </View>
        </View>

      </View>

      {/* AI Recommendation notification banner */}
      <View style={styles.coachBanner}>
        <Brain size={18} color="#14B8A6" />
        <View style={styles.coachContent}>
          <Text style={styles.coachHeader}>Gemini AI Recommendation</Text>
          <Text style={styles.coachText}>"{getCoachAdviceText()}"</Text>
        </View>
      </View>

      {/* Reusable Meal Templates Panel */}
      {templates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={styles.sectionTitle}>Tap to Log Template</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
            {templates.map((temp, idx) => (
              <TouchableOpacity
                key={temp.id}
                style={styles.templateChip}
                onPress={() => handleLogTemplate(idx)}
              >
                <Text style={styles.templateChipText}>🍱 {temp.template_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Today's logged meals list */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        
        {todayMeals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Tap Scan or Plus to log your first meal of the day!</Text>
          </View>
        ) : (
          todayMeals.map((meal) => (
            <View key={meal.id} style={styles.mealRow}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealIcon}>🥗</Text>
                <View>
                  <Text style={styles.mealName}>{meal.meal_type}</Text>
                  <Text style={styles.mealMacros}>P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g</Text>
                </View>
              </View>
              
              <View style={styles.mealActions}>
                <Text style={styles.mealCalories}>+{meal.calories} kcal</Text>
                <TouchableOpacity onPress={() => deleteMeal(meal.id)} style={styles.deleteButton}>
                  <Trash2 size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Live AI Coach Chat Shortcut Banner */}
      <TouchableOpacity style={styles.coachWidget} onPress={() => router.push("/chat")}>
        <View style={styles.coachWidgetInfo}>
          <Text style={styles.coachWidgetEmoji}>💬</Text>
          <View>
            <Text style={styles.coachWidgetTitle}>Chat with AI Coach</Text>
            <Text style={styles.coachWidgetSub}>Ask: "What should I eat tonight?"</Text>
          </View>
        </View>
        <ArrowRight size={16} color="#6B7280" />
      </TouchableOpacity>

      {/* Indian Food Database Search Shortcut */}
      <TouchableOpacity style={[styles.coachWidget, { marginTop: 12 }]} onPress={() => router.push("/search")}>
        <View style={styles.coachWidgetInfo}>
          <Text style={styles.coachWidgetEmoji}>🍛</Text>
          <View>
            <Text style={styles.coachWidgetTitle}>Indian Foods Database</Text>
            <Text style={styles.coachWidgetSub}>Search macros, micros, & verified favorites</Text>
          </View>
        </View>
        <ArrowRight size={16} color="#6B7280" />
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  streakWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#D97706",
    marginLeft: 4,
  },
  caloriesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 10,
    elevation: 1,
  },
  caloriesLeftWrapper: {
    alignItems: "center",
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  caloriesLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  caloriesLogged: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "bold",
    marginTop: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  macroCol: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    width: "31%",
    alignItems: "center",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
    marginBottom: 8,
  },
  macroBarWrapper: {
    height: 3,
    backgroundColor: "#E5E7EB",
    width: "100%",
    borderRadius: 9,
    overflow: "hidden",
  },
  macroBar: {
    height: "100%",
    borderRadius: 9,
  },
  coachBanner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  coachContent: {
    marginLeft: 12,
    flex: 1,
  },
  coachHeader: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  coachText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    lineHeight: 15,
    marginTop: 2,
  },
  templatesSection: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  templatesScroll: {
    paddingVertical: 4,
  },
  templateChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 0.5,
  },
  templateChipText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.2,
    marginBottom: 12,
    textAlign: "left",
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
  emptyCardText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 16,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 14,
    marginBottom: 8,
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mealName: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  mealMacros: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  mealActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: "900",
    color: "#10B981",
    marginRight: 12,
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    padding: 6,
    borderRadius: 10,
  },
  coachWidget: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
  },
  coachWidgetInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  coachWidgetEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  coachWidgetTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  coachWidgetSub: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
});
