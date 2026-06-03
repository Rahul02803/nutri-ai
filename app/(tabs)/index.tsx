import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useStore } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  Camera as LucideCamera, 
  Plus as LucidePlus,
  Trash2 as LucideTrash2,
  Brain as LucideBrain,
  RefreshCcw as LucideRefreshCcw
} from "lucide-react-native";
import { generateDailyInsightPrompt } from "../../services/gemini";

const Camera = LucideCamera as any;
const Plus = LucidePlus as any;
const Trash2 = LucideTrash2 as any;
const Brain = LucideBrain as any;
const RefreshCcw = LucideRefreshCcw as any;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, meals, deleteMeal, dailyInsights, generateDailyInsight, evaluateWeeklyGoalAdjustment, isSynced } = useStore();
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  if (!user) return null;

  // Compile today's logs
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

  // Single Accent Color Config: #3B82F6
  const ACCENT_COLOR = "#3B82F6";

  const todayInsight = dailyInsights.find((i) => i.logged_date === todayStr);

  useEffect(() => {
    // Generate insight if we have some meals logged today and no insight exists yet
    if (todayMeals.length > 0 && !todayInsight && !isInsightLoading) {
      const fetchInsight = async () => {
        setIsInsightLoading(true);
        const { insight, isPositive } = await generateDailyInsightPrompt(user, meals);
        generateDailyInsight(insight, isPositive);
        setIsInsightLoading(false);
      };
      fetchInsight();
    }
  }, [todayMeals.length, todayInsight, isInsightLoading, user, meals, generateDailyInsight]);

  const handleWeeklyCheckin = () => {
    const result = evaluateWeeklyGoalAdjustment();
    if (result && result.adjusted) {
      Alert.alert("AI Coach Update", `Macro targets updated: ${result.newCalories} kcal.\nReason: ${result.reason}`);
    } else {
      Alert.alert("AI Coach Update", "You are perfectly on track! No target adjustments needed this week.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Scrollable Layout (Maximum 3 Actions total: Floating Scan, Header Plus, Row Delete) */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Minimal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>ZenLog</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.headerSub}>TODAY</Text>
                <View style={[styles.syncDot, { backgroundColor: isSynced ? "#10B981" : "#F59E0B" }]} />
                <Text style={styles.syncText}>{isSynced ? "Synced" : "Syncing..."}</Text>
              </View>
            </View>
            
            {/* Header Action 2: Manual Search / Plus (Secondary Action) */}
            <TouchableOpacity 
              style={styles.plusButton} 
              onPress={() => router.push("/search")}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* AI Coach Widget */}
          <View style={styles.aiCoachWidget}>
            <View style={styles.aiHeader}>
              <View style={styles.aiTitleRow}>
                <Brain size={18} color="#A855F7" />
                <Text style={styles.aiTitle}>AI Nutrition Coach</Text>
              </View>
              <TouchableOpacity onPress={handleWeeklyCheckin} style={styles.checkinButton}>
                <RefreshCcw size={14} color="#A855F7" />
                <Text style={styles.checkinText}>Check-in</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.aiContent}>
              {isInsightLoading ? (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="small" color="#A855F7" />
                  <Text style={styles.aiLoadingText}>Analyzing your nutrition...</Text>
                </View>
              ) : (
                <Text style={styles.aiInsightText}>
                  {todayInsight ? todayInsight.insight_text : "Log your first meal today to receive personalized AI coaching insights!"}
                </Text>
              )}
            </View>
          </View>

          {/* Large Calories Remaining Widget (Soft gray card, large typography, 20px rounded) */}
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesValue}>{remainingCal}</Text>
            <Text style={styles.caloriesLabel}>Calories Left</Text>
            <Text style={styles.caloriesMeta}>
              Logged: {loggedCalories} / {targetCal} kcal
            </Text>
          </View>

          {/* Clean Linear Macros Grid (Unified electric blue accent bar indicator) */}
          <View style={styles.macrosContainer}>
            {/* Protein */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{loggedProtein}/{targetPro}g</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${Math.min(100, (loggedProtein / targetPro) * 100)}%` }]} />
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{loggedCarbs}/{targetCarbs}g</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${Math.min(100, (loggedCarbs / targetCarbs) * 100)}%` }]} />
              </View>
            </View>

            {/* Fat */}
            <View style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroValue}>{loggedFat}/{targetFat}g</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${Math.min(100, (loggedFat / targetFat) * 100)}%` }]} />
              </View>
            </View>
          </View>

          {/* Today's Meals Section */}
          <View style={styles.mealsSection}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            
            {todayMeals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No meals logged today</Text>
              </View>
            ) : (
              todayMeals.map((meal) => (
                <View key={meal.id} style={styles.mealRow}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.meal_type}</Text>
                    <Text style={styles.mealMacros}>
                      P: {Math.round(meal.protein)}g • C: {Math.round(meal.carbs)}g • F: {Math.round(meal.fat)}g
                    </Text>
                  </View>
                  
                  {/* Row Action: Delete log (Tertiary Action) */}
                  <View style={styles.mealRight}>
                    <Text style={styles.mealCalories}>+{meal.calories} kcal</Text>
                    <TouchableOpacity 
                      onPress={() => deleteMeal(meal.id)} 
                      style={styles.deleteButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

        </ScrollView>

        {/* Action 1: Full-Screen Floating Shutter Scan Button (Primary Action) */}
        <TouchableOpacity 
          style={styles.floatingScanButton}
          onPress={() => router.push("/scan")}
          activeOpacity={0.9}
        >
          <Camera size={26} color="#FFFFFF" />
        </TouchableOpacity>

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 130, // Extra space to prevent floating button overlaps
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: "System",
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  headerSub: {
    fontFamily: "System",
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: 1.5,
  },
  plusButton: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20, // Strict 20px rounded corners
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  caloriesValue: {
    fontSize: 64,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -2,
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  caloriesMeta: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 12,
  },
  macrosContainer: {
    marginBottom: 32,
  },
  macroCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  macroValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6", // Single Brand Accent
    borderRadius: 2,
  },
  mealsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: "left",
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
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  mealMacros: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    marginTop: 4,
  },
  mealRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginRight: 14,
  },
  deleteButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingScanButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6", // Electric Accent Blue
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  aiCoachWidget: {
    backgroundColor: "#F3E8FF", // Soft purple background for AI
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#7E22CE",
    letterSpacing: -0.2,
  },
  checkinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  checkinText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7E22CE",
  },
  aiContent: {
    minHeight: 40,
    justifyContent: "center",
  },
  aiInsightText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B21A8",
    lineHeight: 18,
  },
  aiLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiLoadingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9333EA",
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
    marginRight: 4,
  },
  syncText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
});
