import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from "react-native";
import { useStore } from "../../store/useStore";
import { 
  TrendingDown as LucideTrendingDown,
  Scale as LucideScale
} from "lucide-react-native";

const TrendingDown = LucideTrendingDown as any;
const Scale = LucideScale as any;

export default function ProgressScreen() {
  const { user, weightLogs, meals, logWeight } = useStore();
  const [weightInput, setWeightInput] = useState("");

  if (!user) return null;

  // Transformations weight calibrations
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
    if (isNaN(wt) || wt <= 0) {
      Alert.alert("Input Error", "Please enter a valid weight check-in value.");
      return;
    }

    logWeight(wt);
    setWeightInput("");
    Alert.alert("Weight Logged", `Logged weight check-in: ${wt} kg! Goal target budgets adjusted.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Progress</Text>
          <Text style={styles.headerSub}>TARGETS & LOGS</Text>
        </View>

        {/* 1. Weight Logging Check-In Card (Action 1: Log Weight - Max 3 Actions per screen) */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Weight Check-In</Text>
          <Text style={styles.cardDesc}>Log current weight to calibrate calorie budgets.</Text>
          
          <View style={styles.logRow}>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder={`Current: ${currentWeight} kg`}
              placeholderTextColor="#9CA3AF"
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

        {/* 2. Transformation Weight Specs Card */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Weight Transformation</Text>
          
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
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.deltaRow}>
            <TrendingDown size={14} color="#3B82F6" style={{ marginRight: 6 }} />
            <Text style={styles.deltaText}>
              Overall weight shift: <Text style={{ fontWeight: "900", color: "#111827" }}>{weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg</Text>
            </Text>
          </View>
        </View>

        {/* 3. Weight Trends visual timeline */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Weight Chart</Text>
          
          <View style={styles.chartContainer}>
            {weightLogs.slice(-5).map((log, idx) => {
              const baseWt = targetWeight - 2;
              const maxWt = initialWeight + 2;
              const htPercent = Math.max(15, Math.round(((log.weight - baseWt) / (maxWt - baseWt)) * 100));
              
              return (
                <View key={log.id} style={styles.chartCol}>
                  <View style={styles.chartTrack}>
                    <View style={[styles.chartBar, { height: `${htPercent}%` }]} />
                  </View>
                  <Text style={styles.chartLabel}>{log.weight}kg</Text>
                  <Text style={styles.chartDate}>{new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 4. Calorie Adherence Progress tracker */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Calorie Adherence (Target: {user.target_calories} kcal)</Text>
          <View style={styles.adherenceList}>
            {adherenceList.map((day, idx) => (
              <View key={idx} style={styles.adherenceRow}>
                <Text style={styles.adherenceLabel}>{day.label}</Text>
                <View style={styles.adherenceTrackWrapper}>
                  <View style={styles.adherenceTrack}>
                    <View style={[styles.adherenceBar, { width: `${day.calRatio * 100}%` }]} />
                  </View>
                  <Text style={styles.adherenceValue}>{day.calories} kcal</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 5. Protein Adherence tracker */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Protein Adherence (Target: {user.target_protein}g)</Text>
          <View style={styles.adherenceList}>
            {adherenceList.map((day, idx) => (
              <View key={idx} style={styles.adherenceRow}>
                <Text style={styles.adherenceLabel}>{day.label}</Text>
                <View style={styles.adherenceTrackWrapper}>
                  <View style={styles.adherenceTrack}>
                    <View style={[styles.adherenceBar, { width: `${day.proRatio * 100}%` }]} />
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: 1.5,
  },
  grayCard: {
    backgroundColor: "#F4F4F5",
    borderRadius: 20, // Strict 20px rounded corners
    padding: 20,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "left",
  },
  cardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 14,
    textAlign: "left",
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginRight: 10,
  },
  logBtn: {
    width: 72,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#3B82F6", // Unified Accent Color
    alignItems: "center",
    justifyContent: "center",
  },
  logBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
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
    color: "#111827",
  },
  specLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deltaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "800",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingTop: 12,
  },
  chartCol: {
    alignItems: "center",
    width: "18%",
  },
  chartTrack: {
    height: 80,
    width: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  chartBar: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#111827",
  },
  chartDate: {
    fontSize: 7,
    color: "#9CA3AF",
    fontWeight: "900",
    marginTop: 4,
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
    color: "#111827",
    marginBottom: 6,
    textAlign: "left",
  },
  adherenceTrackWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adherenceTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 12,
  },
  adherenceBar: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  adherenceValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
  },
});
