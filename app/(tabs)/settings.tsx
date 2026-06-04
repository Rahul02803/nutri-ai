import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput, SafeAreaView } from "react-native";
import { useStore } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  LogOut as LucideLogOut,
  Sliders as LucideSliders,
  Info as LucideInfo
} from "lucide-react-native";

const LogOut = LucideLogOut as any;
const Sliders = LucideSliders as any;
const Info = LucideInfo as any;

export default function SettingsScreen() {
  const router = useRouter();
  const {
    user,
    saveOnboarding,
    logout,
    weightUnit,
    toggleWeightUnit
  } = useStore();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [calorieInput, setCalorieInput] = useState(user?.target_calories?.toString() || "2000");
  const [proteinInput, setProteinInput] = useState(user?.target_protein?.toString() || "140");
  const [carbsInput, setCarbsInput] = useState(user?.target_carbs?.toString() || "210");
  const [fatInput, setFatInput] = useState(user?.target_fat?.toString() || "65");

  if (!user) return null;

  const handleSaveGoals = () => {
    const cal = parseInt(calorieInput);
    const pro = parseInt(proteinInput);
    const carb = parseInt(carbsInput);
    const fat = parseInt(fatInput);

    if (isNaN(cal) || cal < 800 || cal > 10000) {
      Alert.alert("Invalid Input", "Please enter a valid calorie target.");
      return;
    }
    if (isNaN(pro) || pro < 20 || pro > 500) {
      Alert.alert("Invalid Input", "Please enter a valid protein target.");
      return;
    }
    if (isNaN(carb) || carb < 20 || carb > 1000) {
      Alert.alert("Invalid Input", "Please enter a valid carbohydrate target.");
      return;
    }
    if (isNaN(fat) || fat < 10 || fat > 300) {
      Alert.alert("Invalid Input", "Please enter a valid fat target.");
      return;
    }

    saveOnboarding({
      ...user,
      target_calories: cal,
      target_protein: pro,
      target_carbs: carb,
      target_fat: fat
    });
    setIsEditingGoals(false);
    Alert.alert("Targets Updated", "Your daily calorie and macronutrient budgets have been adjusted.");
  };

  const handleLogout = () => {
    Alert.alert("Reset Profile", "Are you sure you want to delete your local profile and log out? All data will be reset.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset All",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Settings</Text>
          <Text style={styles.headerSub}>PREFERENCES & ADJUSTMENTS</Text>
        </View>

        {/* Goals & Targets Section */}
        <View style={styles.darkCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Sliders size={16} color="#7C3AED" />
              <Text style={styles.fieldLabel}>CALORIE TARGETS</Text>
            </View>
            <TouchableOpacity onPress={() => isEditingGoals ? handleSaveGoals() : setIsEditingGoals(true)}>
              <Text style={styles.actionText}>{isEditingGoals ? "Save" : "Adjust"}</Text>
            </TouchableOpacity>
          </View>

          {isEditingGoals ? (
            <View style={styles.goalsForm}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Calories (kcal/day)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={calorieInput} 
                  onChangeText={setCalorieInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Protein (g/day)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={proteinInput} 
                  onChangeText={setProteinInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Carbohydrates (g/day)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={carbsInput} 
                  onChangeText={setCarbsInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Fat (g/day)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={fatInput} 
                  onChangeText={setFatInput} 
                  keyboardType="numeric" 
                />
              </View>
            </View>
          ) : (
            <View style={styles.goalsOverview}>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Calorie Budget</Text>
                <Text style={styles.targetVal}>{user.target_calories} kcal</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Protein target</Text>
                <Text style={styles.targetVal}>{user.target_protein} g</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Carbohydrate budget</Text>
                <Text style={styles.targetVal}>{user.target_carbs} g</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Fat budget</Text>
                <Text style={styles.targetVal}>{user.target_fat} g</Text>
              </View>
            </View>
          )}
        </View>

        {/* Preferences Toggle */}
        <View style={styles.darkCard}>
          <Text style={styles.fieldLabel}>PREFERENCES</Text>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Display weight in LBs</Text>
            <Switch 
              value={weightUnit === "lb"} 
              onValueChange={toggleWeightUnit}
              trackColor={{ false: "#1F2937", true: "#7C3AED" }}
              thumbColor="#F9FAFB"
            />
          </View>
        </View>

        {/* Profile Meta Account Info */}
        <View style={styles.darkCard}>
          <View style={styles.titleRow}>
            <Info size={16} color="#7C3AED" />
            <Text style={[styles.fieldLabel, { marginLeft: 6 }]}>ACCOUNT METRICS</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Name</Text>
            <Text style={styles.accountVal}>{user.name || "Zenlog Guest"}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Client ID</Text>
            <Text style={styles.accountVal}>{user.id}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Email Reference</Text>
            <Text style={styles.accountVal}>{user.email}</Text>
          </View>
        </View>

        {/* Reset Session Trigger */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Reset My Profile & Data</Text>
        </TouchableOpacity>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#7C3AED",
  },
  goalsForm: {
    width: "100%",
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    color: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    fontWeight: "800",
  },
  goalsOverview: {
    width: "100%",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  targetVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  accountVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#EF4444",
  },
});
