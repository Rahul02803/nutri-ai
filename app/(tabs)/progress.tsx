import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from "react-native";
import { useStore } from "../../store/useStore";
import { 
  TrendingDown as LucideTrendingDown,
  Scale as LucideScale,
  Calendar as LucideCalendar
} from "lucide-react-native";

const TrendingDown = LucideTrendingDown as any;
const Scale = LucideScale as any;
const Calendar = LucideCalendar as any;

export default function ProgressScreen() {
  const { user, weightLogs, meals, logWeight } = useStore();
  const [weightInput, setWeightInput] = useState("");

  if (!user) return null;

  // Weight statistics
  const currentWeight = user.current_weight || 75;
  const initialWeight = weightLogs[0]?.weight || 75;
  const targetWeight = user.target_weight || 70;

  const totalToLose = Math.abs(initialWeight - targetWeight);
  const lostSoFar = Math.abs(initialWeight - currentWeight);
  const progressPercent = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 0;
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // Compile meal adherence records for the last 5 days
  const getAdherenceData = () => {
    const data = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    const targetCal = user.target_calories || 2000;
    const targetPro = user.target_protein || 140;

    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Filter meals on this day
      const dayMeals = meals.filter((m) => m.created_at.startsWith(dateStr));
      const dayCal = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      const dayPro = dayMeals.reduce((sum, m) => sum + m.protein, 0);

      data.push({
        label: i === 0 ? "Today" : dayNames[d.getDay()],
        calories: dayCal,
        protein: dayPro,
        calRatio: Math.min(1.0, dayCal / targetCal),
        proRatio: Math.min(1.0, dayPro / targetPro),
      });
    }
    return data;
  };

  const adherenceList = getAdherenceData();

  const handleWeightCheckin = () => {
    const wt = parseFloat(weightInput);
    if (isNaN(wt) || wt <= 0 || wt > 300) {
      Alert.alert("Input Error", "Please enter a valid weight in kg.");
      return;
    }

    logWeight(wt);
    setWeightInput("");
    Alert.alert("Weight Logged", `Logged weight: ${wt} kg!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Progress Trends</Text>
          <Text style={styles.headerSub}>ANALYTICS & WEIGHT CALIBRATIONS</Text>
        </View>

        {/* Weight Logging Check-In Card */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>WEIGHT CHECK-IN</Text>
          <Text style={styles.cardDesc}>Update your current weight to recalculate macros.</Text>
          
          <View style={styles.logRow}>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder={`Current: ${currentWeight} kg`}
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.logBtn} 
              onPress={handleWeightCheckin}
              activeOpacity={0.8}
            >
              <Text style={styles.logBtnText}>Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transformation Weight Specs Card */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>WEIGHT CALIBRATION</Text>
          
          <View style={styles.specsGrid}>
            <View style={styles.specCol}>
              <Text style={styles.specVal}>{initialWeight} kg</Text>
              <Text style={styles.specLabel}>Start</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specVal}>{currentWeight} kg</Text>
              <Text style={styles.specLabel}>Current</Text>
            </View>
            <View style={styles.specCol}>
              <Text style={styles.specVal}>{targetWeight} kg</Text>
              <Text style={styles.specLabel}>Goal</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: "#7C3AED" }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{progressPercent}% of target achieved</Text>
          </View>

          <View style={styles.deltaRow}>
            <TrendingDown size={14} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={styles.deltaText}>
              Overall weight shift: <Text style={{ fontWeight: "900", color: "#F9FAFB" }}>{weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg</Text>
            </Text>
          </View>
        </View>

        {/* Weight Trends visual timeline */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>WEIGHT GRAPH HISTORY</Text>
          
          {weightLogs.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No weight logs found.</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              {weightLogs.slice(-5).map((log) => {
                const baseWt = Math.max(10, targetWeight - 5);
                const maxWt = initialWeight + 5;
                const htPercent = Math.max(20, Math.round(((log.weight - baseWt) / (maxWt - baseWt)) * 100));
                
                return (
                  <View key={log.id} style={styles.chartCol}>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartBar, { height: `${htPercent}%` }]} />
                    </View>
                    <Text style={styles.chartLabel}>{log.weight}kg</Text>
                    <Text style={styles.chartDate}>
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Calorie Adherence Progress tracker */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>CALORIE ADHERENCE (TARGET: {user.target_calories} KCAL)</Text>
          <View style={styles.adherenceList}>
            {adherenceList.map((day, idx) => (
              <View key={idx} style={styles.adherenceRow}>
                <Text style={styles.adherenceLabel}>{day.label}</Text>
                <View style={styles.adherenceTrackWrapper}>
                  <View style={styles.adherenceTrack}>
                    <View style={[styles.adherenceBar, { width: `${day.calRatio * 100}%`, backgroundColor: "#7C3AED" }]} />
                  </View>
                  <Text style={styles.adherenceValue}>{day.calories} kcal</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Protein Adherence tracker */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>PROTEIN ADHERENCE (TARGET: {user.target_protein}G)</Text>
          <View style={styles.adherenceList}>
            {adherenceList.map((day, idx) => (
              <View key={idx} style={styles.adherenceRow}>
                <Text style={styles.adherenceLabel}>{day.label}</Text>
                <View style={styles.adherenceTrackWrapper}>
                  <View style={styles.adherenceTrack}>
                    <View style={[styles.adherenceBar, { width: `${day.proRatio * 100}%`, backgroundColor: "#22C55E" }]} />
                  </View>
                  <Text style={styles.adherenceValue}>{day.protein}g</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F9FAFB",
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 9,
    color: "#7C3AED",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1.2,
  },
  darkCard: {
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 14,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14,
    fontWeight: "800",
    color: "#F9FAFB",
    marginRight: 10,
  },
  logBtn: {
    width: 68,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  logBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  specsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  specCol: {
    alignItems: "flex-start",
  },
  specVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  specLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#0B0F14",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 6,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 12,
    marginTop: 4,
  },
  deltaText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    paddingTop: 12,
  },
  chartCol: {
    alignItems: "center",
    width: "18%",
  },
  chartTrack: {
    height: 90,
    width: 8,
    backgroundColor: "#0B0F14",
    borderRadius: 4,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  chartBar: {
    width: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  chartDate: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "800",
    marginTop: 4,
  },
  emptyChart: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
  },
  adherenceList: {
    marginTop: 8,
  },
  adherenceRow: {
    marginBottom: 12,
  },
  adherenceLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F9FAFB",
    marginBottom: 6,
  },
  adherenceTrackWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adherenceTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#0B0F14",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 12,
  },
  adherenceBar: {
    height: "100%",
    borderRadius: 3,
  },
  adherenceValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
  },
});
