import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useStore } from "../../store/useStore";
import { 
  Scale as LucideScale, 
  BarChart2 as LucideBarChart2, 
  CheckCircle2 as LucideCheckCircle2, 
  TrendingDown as LucideTrendingDown, 
  RefreshCw as LucideRefreshCw,
  Heart as LucideHeart,
  Droplet as LucideDroplet,
  Moon as LucideMoon,
  Flame as LucideFlame,
  Award as LucideAward
} from "lucide-react-native";

const Scale = LucideScale as any;
const BarChart2 = LucideBarChart2 as any;
const CheckCircle2 = LucideCheckCircle2 as any;
const TrendingDown = LucideTrendingDown as any;
const RefreshCw = LucideRefreshCw as any;
const Heart = LucideHeart as any;
const Droplet = LucideDroplet as any;
const Moon = LucideMoon as any;
const Flame = LucideFlame as any;
const Award = LucideAward as any;

type AnalyticsTab = "weight" | "health" | "calories" | "macros" | "accuracy";
type RangeFilter = "7d" | "30d" | "90d" | "1y";

export default function ProgressScreen() {
  const {
    user,
    weightLogs,
    meals,
    predictions,
    corrections,
    hydrationLogs,
    sleepLogs,
    logWeight,
    logWater,
    logSleep,
    calculateDailyHealthScore,
    evaluateWeeklyGoalAdjustment
  } = useStore();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("weight");
  const [range, setRange] = useState<RangeFilter>("7d");
  const [newWeightInput, setNewWeightInput] = useState("");
  const [healthTrendType, setHealthTrendType] = useState<"daily" | "weekly" | "monthly">("daily");

  const getHealthTrendsData = () => {
    const today = new Date();
    
    if (healthTrendType === "daily") {
      // Last 7 days
      const days = [];
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const scoreBreakdown = calculateDailyHealthScore(dateStr);
        days.push({
          label: dayNames[d.getDay()],
          score: scoreBreakdown.total,
          isToday: i === 0
        });
      }
      return days;
    } else if (healthTrendType === "weekly") {
      // Last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < 7; j++) {
          const d = new Date();
          d.setDate(today.getDate() - (i * 7 + j));
          const dateStr = d.toISOString().split("T")[0];
          sum += calculateDailyHealthScore(dateStr).total;
          count++;
        }
        const avg = Math.round(sum / count);
        weeks.push({
          label: `W-${4 - i}`,
          score: avg,
          isToday: i === 0
        });
      }
      return weeks;
    } else {
      // Last 6 months
      const months = [];
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        
        let sum = 0;
        let count = 0;
        for (let j = 0; j < 4; j++) {
          const testDay = new Date(d.getFullYear(), d.getMonth(), 1 + j * 7);
          const dateStr = testDay.toISOString().split("T")[0];
          sum += calculateDailyHealthScore(dateStr).total;
          count++;
        }
        const avg = Math.round(sum / count);
        
        months.push({
          label: monthNames[d.getMonth()],
          score: avg,
          isToday: i === 0
        });
      }
      return months;
    }
  };

  if (!user) return null;

  // Onboarding parameters
  const currentWeight = user.current_weight || 75;
  const initialWeight = weightLogs[0]?.weight || 75;
  const targetWeight = user.target_weight || 70;

  const totalToLose = Math.abs(initialWeight - targetWeight);
  const lostSoFar = Math.abs(initialWeight - currentWeight);
  const progressPercent = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 0;
  
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // Health Score Calculation
  const todayStr = new Date().toISOString();
  const healthBreakdown = calculateDailyHealthScore(todayStr);

  // Hydration & Sleep aggregations for today
  const todayDateStr = todayStr.split("T")[0];
  const loggedWaterMl = hydrationLogs
    .filter((h) => h.created_at.startsWith(todayDateStr))
    .reduce((sum, h) => sum + h.amountMl, 0);
  const loggedSleepHours = sleepLogs
    .filter((s) => s.created_at.startsWith(todayDateStr))
    .reduce((sum, s) => sum + s.hours, 0);

  const handleLogWeightCheckin = () => {
    const wt = parseFloat(newWeightInput);
    if (isNaN(wt) || wt <= 0) {
      Alert.alert("Input Error", "Please enter a valid weight check-in value.");
      return;
    }

    logWeight(wt);
    setNewWeightInput("");

    // Trigger the Automatic Goal Adjustment check!
    setTimeout(() => {
      const adjustment = evaluateWeeklyGoalAdjustment();
      if (adjustment && adjustment.adjusted) {
        Alert.alert(
          "AI Target Calorie Adjusted! 🚨",
          `${adjustment.reason}\n\nDaily calorie budget has been updated to ${adjustment.newCalories} kcal. Check your AI Coach Chat for updated macro splits!`,
          [{ text: "Great" }]
        );
      } else if (adjustment) {
        Alert.alert(
          "Check-in Complete",
          adjustment.reason || "Consistency is perfect! Your weekly weight shift is fully on track with your goals."
        );
      }
    }, 500);
  };

  const handleAddWater = (ml: number) => {
    logWater(ml);
    Alert.alert("Hydration Saved", `Successfully logged +${ml}ml of water check-in! 💧`);
  };

  const handleAddSleep = (hours: number) => {
    logSleep(hours);
    Alert.alert("Sleep Logged", `Successfully registered +${hours} hours of sleep! 🛌`);
  };

  // Accuracy diagnostics aggregator
  const totalPredictions = predictions.length;
  const totalCorrections = corrections.length;

  const calculateAverageAccuracy = () => {
    if (totalPredictions === 0) return 100;
    
    let totalDifference = 0;
    corrections.forEach((corr) => {
      const pred = predictions.find((p) => p.id === corr.prediction_id);
      if (pred) {
        const calDiff = Math.abs(pred.predicted_calories - corr.corrected_calories);
        const percentDiff = (calDiff / pred.predicted_calories) * 100;
        totalDifference += percentDiff;
      }
    });

    const averageError = totalCorrections > 0 ? totalDifference / totalCorrections : 0;
    return Math.round(100 - averageError);
  };

  const engineAccuracy = calculateAverageAccuracy();

  // Find most corrected foods
  const getMostCorrectedFoods = () => {
    const counts: Record<string, number> = {};
    corrections.forEach((c) => {
      counts[c.corrected_food] = (counts[c.corrected_food] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  };

  const topCorrected = getMostCorrectedFoods();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>ZenLog Reports</Text>
        <Text style={styles.headerSub}>Progress & Analytics</Text>
      </View>

      {/* 1. ANALYTICS TABS SELECTOR */}
      <View style={styles.tabContainer}>
        {[
          { id: "weight" as const, label: "Weight" },
          { id: "health" as const, label: "Health Score" },
          { id: "calories" as const, label: "Calories" },
          { id: "macros" as const, label: "Macros" },
          { id: "accuracy" as const, label: "AI Accuracy" }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2. TIMELINE RANGE SELECTORS */}
      <View style={styles.rangeContainer}>
        {[
          { id: "7d" as const, label: "7 DAYS" },
          { id: "30d" as const, label: "30 DAYS" },
          { id: "90d" as const, label: "90 DAYS" },
          { id: "1y" as const, label: "1 YEAR" }
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.rangeButton, range === item.id && styles.rangeButtonActive]}
            onPress={() => setRange(item.id)}
          >
            <Text style={[styles.rangeLabel, range === item.id && styles.rangeLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. CORE ANALYTICS VIEWS */}

      {activeTab === "health" && (
        /* DAILY HEALTH SCORE PANEL */
        <View style={styles.healthDashboard}>
          
          {/* Main 0-100 Health Score circle card */}
          <View style={styles.healthHeaderCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{healthBreakdown.total}</Text>
              <Text style={styles.scoreLabel}>Health score</Text>
            </View>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreTitle}>
                {healthBreakdown.total >= 85 ? "Excellent Day! 🌟" : healthBreakdown.total >= 60 ? "Good Pace! 👍" : "Keep Tracking! 🌱"}
              </Text>
              <Text style={styles.scoreText}>
                Your Health Score tracks Calories, Protein requirements, Hydration consistency, Sleep quality, and Log streaks.
              </Text>
            </View>
          </View>

          {/* Breakdown bars */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Score Breakdown</Text>
            
            {/* Nutrition (30%) */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>🥗 Calorie Target (30%)</Text>
                <Text style={styles.breakdownValue}>{healthBreakdown.nutrition}%</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={[styles.barInner, { backgroundColor: "#FFB03B", width: `${healthBreakdown.nutrition}%` }]} />
              </View>
            </View>

            {/* Protein (25%) */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>🥩 Protein Target (25%)</Text>
                <Text style={styles.breakdownValue}>{healthBreakdown.protein}%</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={[styles.barInner, { backgroundColor: "#FF6B81", width: `${healthBreakdown.protein}%` }]} />
              </View>
            </View>

            {/* Hydration (15%) */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>💧 Water Target (15%)</Text>
                <Text style={styles.breakdownValue}>{healthBreakdown.hydration}%</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={[styles.barInner, { backgroundColor: "#14B8A6", width: `${healthBreakdown.hydration}%` }]} />
              </View>
            </View>

            {/* Sleep (15%) */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>🛌 Sleep Target (15%)</Text>
                <Text style={styles.breakdownValue}>{healthBreakdown.sleep}%</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={[styles.barInner, { backgroundColor: "#4A90E2", width: `${healthBreakdown.sleep}%` }]} />
              </View>
            </View>

            {/* Consistency (15%) */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownLabel}>🔥 Logging Streak (15%)</Text>
                <Text style={styles.breakdownValue}>{healthBreakdown.consistency}%</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={[styles.barInner, { backgroundColor: "#8B5CF6", width: `${healthBreakdown.consistency}%` }]} />
              </View>
            </View>
          </View>

          {/* Quick hydration & sleep log inputs */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Hydration & Sleep Logger</Text>
            
            {/* Water ml */}
            <View style={styles.quickLogBlock}>
              <View style={styles.quickLogHeader}>
                <Droplet size={14} color="#14B8A6" />
                <Text style={styles.quickLogLabel}>Logged Today: {loggedWaterMl} / 3000 ml</Text>
              </View>
              <View style={styles.quickLogButtons}>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddWater(250)}>
                  <Text style={styles.quickLogBtnText}>+250ml Glass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddWater(500)}>
                  <Text style={styles.quickLogBtnText}>+500ml Bottle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddWater(1000)}>
                  <Text style={styles.quickLogBtnText}>+1.0L Shaker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sleep hours */}
            <View style={styles.quickLogBlock}>
              <View style={styles.quickLogHeader}>
                <Moon size={14} color="#4A90E2" />
                <Text style={styles.quickLogLabel}>Logged Today: {loggedSleepHours} / 8 hours</Text>
              </View>
              <View style={styles.quickLogButtons}>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddSleep(1)}>
                  <Text style={styles.quickLogBtnText}>+1 Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddSleep(2)}>
                  <Text style={styles.quickLogBtnText}>+2 Hours</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickLogBtn} onPress={() => handleAddSleep(8)}>
                  <Text style={styles.quickLogBtnText}>+8 Hrs (Full)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Daily / Weekly / Monthly Trends Card */}
          <View style={styles.cardSection}>
            <View style={styles.trendsHeaderRow}>
              <Text style={styles.cardSectionTitle}>Health Score Trends</Text>
              <View style={styles.trendToggleContainer}>
                {(["daily", "weekly", "monthly"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.trendToggleBtn, healthTrendType === type && styles.trendToggleBtnActive]}
                    onPress={() => setHealthTrendType(type)}
                  >
                    <Text style={[styles.trendToggleText, healthTrendType === type && styles.trendToggleTextActive]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.trendsRowContainer}>
              {getHealthTrendsData().map((item, idx) => (
                <View key={idx} style={[styles.trendsCol, { width: healthTrendType === "daily" ? "12%" : healthTrendType === "weekly" ? "20%" : "14%" }]}>
                  <Text style={[styles.trendsDate, item.isToday && { color: "#111827", fontWeight: "900" }]}>{item.label}</Text>
                  <View style={[styles.trendsPillBar, { height: Math.max(10, Math.round(item.score * 0.9)) }, item.isToday && { backgroundColor: "#14B8A6" }]} />
                  <Text style={[styles.trendsVal, item.isToday && { fontWeight: "bold", color: "#14B8A6" }]}>{item.score}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      )}

      {activeTab === "weight" && (
        /* WEIGHT CHECK-IN VIEW */
        <View style={styles.weightSection}>
          {/* Main Specs Transformation Card */}
          <View style={styles.metricsCard}>
            <Text style={styles.cardSectionTitle}>Transformation Specs</Text>
            
            <View style={styles.gridThree}>
              <View style={styles.gridThreeCol}>
                <Text style={styles.metricCardLabel}>Current Weight</Text>
                <Text style={styles.metricCardValue}>{currentWeight} kg</Text>
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.metricCardLabel}>Goal Weight</Text>
                <Text style={styles.metricCardValue}>{targetWeight} kg</Text>
              </View>
              <View style={styles.gridThreeCol}>
                <Text style={styles.metricCardLabel}>Completion</Text>
                <Text style={[styles.metricCardValue, { color: "#14B8A6" }]}>{progressPercent}%</Text>
              </View>
            </View>

            <View style={styles.weightChangeRow}>
              <View style={styles.flexRow}>
                <TrendingDown size={16} color="#10B981" />
                <Text style={styles.weightChangeText}>Net Weight shift overall:</Text>
              </View>
              <Text style={styles.weightChangeValue}>{weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg</Text>
            </View>
          </View>

          {/* Floating Weight Log Check-in widget */}
          <View style={[styles.metricsCard, { marginTop: 16 }]}>
            <Text style={styles.cardSectionTitle}>Goal Adjustment Engine Check-In</Text>
            <Text style={styles.checkinDescription}>
              Log your current weight below to trigger the weekly AI Coach Goal Adjustment check. The engine will evaluate your pace and adjust your daily calorie budget automatically.
            </Text>

            <View style={styles.checkinInputRow}>
              <TextInput
                style={styles.checkinInput}
                value={newWeightInput}
                onChangeText={setNewWeightInput}
                placeholder={`Enter weight in kg (e.g., ${(currentWeight - 0.6).toFixed(1)})...`}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.checkinButton} onPress={handleLogWeightCheckin}>
                <Text style={styles.checkinButtonText}>Log & Adjust</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mock charts */}
          <View style={[styles.chartFallback, { marginTop: 16 }]}>
            <Text style={styles.chartTitle}>WEIGHT TIMELINE TRENDS</Text>
            <View style={styles.fallbackVisual}>
              <BarChart2 size={36} color="#111827" />
              <Text style={styles.fallbackText}>Minimal Timeline Dashboard</Text>
              <Text style={styles.fallbackSub}>Progress graphs auto-generate on weekly check-ins.</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === "accuracy" && (
        /* ACCURACY LEARNING DASHBOARD */
        <View style={styles.accuracyDashboard}>
          
          {/* Main Accuracy score cards */}
          <View style={styles.accuracyRow}>
            <View style={styles.accuracyCard}>
              <Text style={styles.accuracyValue}>{engineAccuracy}%</Text>
              <Text style={styles.accuracyLabel}>AI Recognition Accuracy</Text>
            </View>

            <View style={styles.accuracyCard}>
              <Text style={styles.accuracyValue}>{totalCorrections}</Text>
              <Text style={styles.accuracyLabel}>Total Corrections Logged</Text>
            </View>
          </View>

          {/* Most corrected food items list */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Most Corrected Foods</Text>
            {topCorrected.length === 0 ? (
              <Text style={styles.emptyText}>No corrected food records logged yet.</Text>
            ) : (
              topCorrected.map((item, idx) => (
                <View key={idx} style={styles.correctedRow}>
                  <Text style={styles.correctedFoodName}>🍱 {item.name}</Text>
                  <Text style={styles.correctedCount}>{item.count} corrections</Text>
                </View>
              ))
            )}
          </View>

          {/* User correction history details */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Learning History</Text>
            {corrections.length === 0 ? (
              <Text style={styles.emptyText}>ZenLog AI is training. Perform corrections after scanning!</Text>
            ) : (
              corrections.map((corr) => {
                const pred = predictions.find((p) => p.id === corr.prediction_id);
                return (
                  <View key={corr.id} style={styles.historyRow}>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyName}>{corr.corrected_food}</Text>
                      <Text style={styles.historyDate}>Saved: {corr.corrected_calories} kcal • P: {corr.corrected_protein}g</Text>
                    </View>
                    
                    <View style={styles.historyDiff}>
                      <Text style={styles.historyAiLabel}>AI predicted</Text>
                      <Text style={styles.historyAiValue}>{pred?.predicted_calories || corr.corrected_calories} kcal</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      )}

      {(activeTab === "calories" || activeTab === "macros") && (
        /* CALORIES & MACROS TIME METRICS */
        <View style={styles.chartFallback}>
          <Text style={styles.chartTitle}>{activeTab.toUpperCase()} PROGRESS TRENDS</Text>
          
          <View style={styles.fallbackVisual}>
            <BarChart2 size={36} color="#111827" />
            <Text style={styles.fallbackText}>Minimal Timeline Dashboard</Text>
            <Text style={styles.fallbackSub}>Progress graphs auto-generate on weekly check-ins.</Text>
          </View>
        </View>
      )}

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
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  headerSub: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
    textTransform: "uppercase",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 6,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#111827",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6B7280",
  },
  tabLabelActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  rangeButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  rangeLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6B7280",
  },
  rangeLabelActive: {
    color: "#FFFFFF",
  },
  healthDashboard: {
    width: "100%",
  },
  healthHeaderCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },
  scoreLabel: {
    fontSize: 6,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  scoreContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  scoreText: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "bold",
    lineHeight: 13,
    marginTop: 4,
    textAlign: "left",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "left",
  },
  breakdownRow: {
    marginBottom: 12,
  },
  breakdownInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
  },
  breakdownValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  barWrapper: {
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    width: "100%",
    overflow: "hidden",
  },
  barInner: {
    height: "100%",
    borderRadius: 99,
  },
  quickLogBlock: {
    marginBottom: 14,
    alignItems: "flex-start",
  },
  quickLogHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quickLogLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 6,
  },
  quickLogButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  quickLogBtn: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 3,
  },
  quickLogBtnText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#111827",
  },
  trendsRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 10,
  },
  trendsCol: {
    width: "12%",
    alignItems: "center",
  },
  trendsDate: {
    fontSize: 7,
    fontWeight: "900",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  trendsPillBar: {
    width: 6,
    backgroundColor: "#111827",
    borderRadius: 99,
    minHeight: 10,
  },
  trendsVal: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6B7280",
    marginTop: 8,
  },
  weightSection: {
    width: "100%",
  },
  metricsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    padding: 20,
  },
  gridThree: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridThreeCol: {
    width: "31%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  metricCardLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metricCardValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  weightChangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 16,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightChangeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    marginLeft: 6,
  },
  weightChangeValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
  },
  checkinDescription: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "bold",
    lineHeight: 13,
    marginBottom: 14,
    textAlign: "left",
  },
  checkinInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkinInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 11,
    color: "#111827",
    fontWeight: "bold",
    marginRight: 8,
  },
  checkinButton: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkinButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  accuracyDashboard: {
    width: "100%",
  },
  accuracyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  accuracyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    padding: 16,
    width: "48%",
    alignItems: "flex-start",
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },
  accuracyLabel: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
    lineHeight: 11,
  },
  emptyText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 14,
  },
  correctedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 10,
  },
  correctedFoodName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  correctedCount: {
    fontSize: 9,
    color: "#14B8A6",
    fontWeight: "bold",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 10,
  },
  historyCol: {
    alignItems: "flex-start",
  },
  historyName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  historyDate: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginTop: 2,
  },
  historyDiff: {
    alignItems: "flex-end",
  },
  historyAiLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  historyAiValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  chartFallback: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 32,
    padding: 24,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  fallbackVisual: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 20,
  },
  fallbackText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    marginTop: 12,
  },
  fallbackSub: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  trendsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  trendToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 2,
  },
  trendToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  trendToggleBtnActive: {
    backgroundColor: "#111827",
  },
  trendToggleText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#6B7280",
  },
  trendToggleTextActive: {
    color: "#FFFFFF",
  },
});
