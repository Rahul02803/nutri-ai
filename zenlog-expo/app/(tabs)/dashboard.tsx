import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { useStore } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  Plus as LucidePlus,
  Trash2 as LucideTrash2,
  Brain as LucideBrain,
  Droplet as LucideDroplet,
  Scale as LucideScale,
  Sparkles as LucideSparkles
} from "lucide-react-native";
import { generateDailyInsightPrompt } from "../../services/gemini";

const Plus = LucidePlus as any;
const Trash2 = LucideTrash2 as any;
const Brain = LucideBrain as any;
const Droplet = LucideDroplet as any;
const Scale = LucideScale as any;
const Sparkles = LucideSparkles as any;

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    user, 
    meals, 
    deleteMeal, 
    dailyInsights, 
    generateDailyInsight, 
    hydrationLogs, 
    logWater,
    weightLogs,
    logWeight
  } = useStore();

  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  if (!user) return null;

  // Compile today's data
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

  // Hydration Compile
  const todayWater = hydrationLogs
    .filter((h) => h.created_at.startsWith(todayStr))
    .reduce((sum, h) => sum + h.amountMl, 0);
  
  const waterGoal = 3000; // 3 Liters
  const waterProgress = Math.min(100, (todayWater / waterGoal) * 100);

  // Weight Compile
  const currentWeight = user.current_weight || (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null);

  const todayInsight = dailyInsights.find((i) => i.logged_date === todayStr);

  useEffect(() => {
    // Generate AI nutrition tip if meals are logged but no insight is present
    if (todayMeals.length > 0 && !todayInsight && !isInsightLoading) {
      const fetchInsight = async () => {
        setIsInsightLoading(true);
        try {
          const { insight, isPositive } = await generateDailyInsightPrompt(user, meals);
          generateDailyInsight(insight, isPositive);
        } catch (e) {
          console.warn("Could not generate daily insight:", e);
        } finally {
          setIsInsightLoading(false);
        }
      };
      fetchInsight();
    }
  }, [todayMeals.length, todayInsight, user, meals]);

  const handleLogWeightSubmit = () => {
    const wt = parseFloat(newWeight);
    if (isNaN(wt) || wt <= 0 || wt > 300) {
      Alert.alert("Invalid Input", "Please enter a valid weight in kg.");
      return;
    }
    const bf = parseFloat(bodyFat);
    logWeight(wt, isNaN(bf) ? undefined : bf);
    setNewWeight("");
    setBodyFat("");
    setWeightModalVisible(false);
    Alert.alert("Weight Logged", `Your current weight has been updated to ${wt} kg.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Zenlog AI</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {user.name || "User"}</Text>
          </View>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => router.push("/meals")}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#F9FAFB" />
            <Text style={styles.quickAddText}>Add Meal</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <LucideBrain size={18} color="#7C3AED" />
            <Text style={styles.aiTitle}>AI DAILY COACH</Text>
          </View>
          {isInsightLoading ? (
            <View style={styles.aiLoader}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={styles.aiInsightLoadingText}>Analyzing intake patterns...</Text>
            </View>
          ) : (
            <Text style={styles.aiInsightText}>
              {todayInsight 
                ? todayInsight.insight_text 
                : "Record your breakfasts, lunches, and snacks. Zenlog AI reviews your splits and shares health optimization ideas here! 🥑"}
            </Text>
          )}
        </View>

        {/* Calorie Progress Ring / Widget */}
        <View style={styles.mainCalorieCard}>
          <View style={styles.calorieRow}>
            <View style={styles.calorieStatsColumn}>
              <Text style={styles.largeCalorieNum}>{remainingCal}</Text>
              <Text style={styles.calorieCardLabel}>CALORIES REMAINING</Text>
            </View>
            <View style={styles.calorieMetaColumn}>
              <View style={styles.calorieMetaRow}>
                <Text style={styles.metaLabel}>Goal</Text>
                <Text style={styles.metaValue}>{targetCal} kcal</Text>
              </View>
              <View style={styles.calorieMetaRow}>
                <Text style={styles.metaLabel}>Logged</Text>
                <Text style={styles.metaValue}>{loggedCalories} kcal</Text>
              </View>
            </View>
          </View>
          <View style={styles.calorieProgressTrack}>
            <View style={[styles.calorieProgressBar, { width: `${Math.min(100, (loggedCalories / targetCal) * 100)}%` }]} />
          </View>
        </View>

        {/* Macros Breakdown */}
        <View style={styles.macrosSection}>
          <Text style={styles.sectionLabel}>DAILY MACRONUTRIENT LOGS</Text>
          
          <View style={styles.macroRow}>
            {/* Protein */}
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroRatio}>{Math.round(loggedProtein)} / {targetPro}g</Text>
              <View style={styles.macroProgressTrack}>
                <View style={[styles.macroProgressBar, { width: `${Math.min(100, (loggedProtein / targetPro) * 100)}%`, backgroundColor: "#7C3AED" }]} />
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroRatio}>{Math.round(loggedCarbs)} / {targetCarbs}g</Text>
              <View style={styles.macroProgressTrack}>
                <View style={[styles.macroProgressBar, { width: `${Math.min(100, (loggedCarbs / targetCarbs) * 100)}%`, backgroundColor: "#F59E0B" }]} />
              </View>
            </View>

            {/* Fats */}
            <View style={styles.macroCard}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroRatio}>{Math.round(loggedFat)} / {targetFat}g</Text>
              <View style={styles.macroProgressTrack}>
                <View style={[styles.macroProgressBar, { width: `${Math.min(100, (loggedFat / targetFat) * 100)}%`, backgroundColor: "#EF4444" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Dual Actions: Hydration + Weight */}
        <View style={styles.dualGrid}>
          
          {/* Water Tracker */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <View style={styles.widgetTitleRow}>
                <LucideDroplet size={16} color="#3B82F6" />
                <Text style={styles.widgetTitle}>Water Log</Text>
              </View>
              <Text style={styles.widgetValue}>{todayWater} ml</Text>
            </View>
            <View style={styles.widgetProgressTrack}>
              <View style={[styles.widgetProgressBar, { width: `${waterProgress}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            <View style={styles.waterActions}>
              <TouchableOpacity onPress={() => logWater(250)} style={styles.waterAddBtn}>
                <Text style={styles.waterBtnText}>+250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => logWater(500)} style={styles.waterAddBtn}>
                <Text style={styles.waterBtnText}>+500ml</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight Card */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <View style={styles.widgetTitleRow}>
                <LucideScale size={16} color="#22C55E" />
                <Text style={styles.widgetTitle}>Weight</Text>
              </View>
              <Text style={styles.widgetValue}>{currentWeight ? `${currentWeight} kg` : "Not logged"}</Text>
            </View>
            <Text style={styles.targetWeightSubtitle}>Target: {user.target_weight || "--"} kg</Text>
            
            <TouchableOpacity 
              style={styles.weightLogBtn}
              onPress={() => setWeightModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.weightLogBtnText}>Log Check-in</Text>
            </TouchableOpacity>
          </View>
          
        </View>

        {/* Today's Food Diary */}
        <View style={styles.foodDiarySection}>
          <Text style={styles.sectionLabel}>TODAY'S FOOD DIARY</Text>

          {todayMeals.length === 0 ? (
            <View style={styles.emptyDiaryCard}>
              <Text style={styles.emptyDiaryText}>No calories logged today.</Text>
            </View>
          ) : (
            todayMeals.map((meal) => (
              <View key={meal.id} style={styles.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodRowName}>{meal.meal_type}</Text>
                  <Text style={styles.foodRowMacros}>
                    P: {Math.round(meal.protein)}g  C: {Math.round(meal.carbs)}g  F: {Math.round(meal.fat)}g
                  </Text>
                </View>
                <View style={styles.foodRowRight}>
                  <Text style={styles.foodRowCalories}>+{meal.calories} kcal</Text>
                  <TouchableOpacity
                    onPress={() => deleteMeal(meal.id)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <LucideTrash2 size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Weight Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={weightModalVisible}
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Weight Check-in</Text>
            
            <Text style={styles.modalLabel}>CURRENT WEIGHT (KG)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 74.5"
              placeholderTextColor="#6B7280"
              value={newWeight}
              onChangeText={setNewWeight}
            />

            <Text style={[styles.modalLabel, { marginTop: 16 }]}>BODY FAT % (OPTIONAL)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 18.5"
              placeholderTextColor="#6B7280"
              value={bodyFat}
              onChangeText={setBodyFat}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleLogWeightSubmit}
              >
                <Text style={styles.modalBtnTextSubmit}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F9FAFB",
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  quickAddButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  quickAddText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  aiCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#1F2937",
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#7C3AED",
    marginLeft: 6,
    letterSpacing: 1.2,
  },
  aiLoader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  aiInsightLoadingText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 8,
  },
  aiInsightText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  mainCalorieCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calorieStatsColumn: {
    flex: 1,
  },
  largeCalorieNum: {
    fontSize: 44,
    fontWeight: "900",
    color: "#F9FAFB",
    letterSpacing: -1,
  },
  calorieCardLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  calorieMetaColumn: {
    alignItems: "flex-end",
  },
  calorieMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
    marginRight: 6,
  },
  metaValue: {
    fontSize: 13,
    color: "#F9FAFB",
    fontWeight: "900",
  },
  calorieProgressTrack: {
    height: 8,
    backgroundColor: "#0B0F14",
    borderRadius: 4,
    overflow: "hidden",
  },
  calorieProgressBar: {
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 4,
  },
  macrosSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  macroLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  macroRatio: {
    fontSize: 13,
    color: "#F9FAFB",
    fontWeight: "900",
    marginVertical: 4,
  },
  macroProgressTrack: {
    height: 4,
    backgroundColor: "#0B0F14",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  macroProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  dualGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  widgetCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "space-between",
  },
  widgetHeader: {
    marginBottom: 10,
  },
  widgetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#F9FAFB",
    marginLeft: 6,
  },
  widgetValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F9FAFB",
    marginTop: 6,
  },
  targetWeightSubtitle: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: -4,
    marginBottom: 12,
  },
  widgetProgressTrack: {
    height: 4,
    backgroundColor: "#0B0F14",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  widgetProgressBar: {
    height: "100%",
    borderRadius: 2,
  },
  waterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  waterAddBtn: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: "center",
  },
  waterBtnText: {
    color: "#3B82F6",
    fontSize: 10,
    fontWeight: "900",
  },
  weightLogBtn: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  weightLogBtnText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "900",
  },
  foodDiarySection: {
    marginBottom: 20,
  },
  emptyDiaryCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyDiaryText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
  },
  foodRow: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  foodRowName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  foodRowMacros: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  foodRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodRowCalories: {
    fontSize: 13,
    fontWeight: "900",
    color: "#7C3AED",
    marginRight: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F9FAFB",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    color: "#F9FAFB",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  modalBtnCancel: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  modalBtnSubmit: {
    backgroundColor: "#7C3AED",
  },
  modalBtnTextCancel: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "900",
  },
  modalBtnTextSubmit: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "900",
  },
});
