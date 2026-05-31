import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput, SafeAreaView } from "react-native";
import { useStore, UserProfile } from "../../store/useStore";
import { useRouter } from "expo-router";
import { 
  LogOut as LucideLogOut,
  ChevronRight as LucideChevronRight
} from "lucide-react-native";

const LogOut = LucideLogOut as any;
const ChevronRight = LucideChevronRight as any;

export default function ProfileScreen() {
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
    saveOnboarding({
      ...user,
      target_calories: parseInt(calorieInput) || user.target_calories,
      target_protein: parseInt(proteinInput) || user.target_protein,
      target_carbs: parseInt(carbsInput) || user.target_carbs,
      target_fat: parseInt(fatInput) || user.target_fat
    });
    setIsEditingGoals(false);
    Alert.alert("Success", "Nutrition targets updated successfully!");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of ZenLog?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
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
          <Text style={styles.brandTitle}>Profile</Text>
          <Text style={styles.headerSub}>SETTINGS & GOALS</Text>
        </View>

        {/* 1. GOALS SECTION (Action 1: Edit/Save Goals) */}
        <View style={styles.grayCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.fieldLabel}>Goals & Targets</Text>
            <TouchableOpacity onPress={() => isEditingGoals ? handleSaveGoals() : setIsEditingGoals(true)}>
              <Text style={styles.actionText}>{isEditingGoals ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {isEditingGoals ? (
            <View style={styles.goalsForm}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Calories (kcal)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={calorieInput} 
                  onChangeText={setCalorieInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={proteinInput} 
                  onChangeText={setProteinInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Carbohydrates (g)</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={carbsInput} 
                  onChangeText={setCarbsInput} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
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
                <Text style={styles.targetVal}>{user.target_calories} kcal/day</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Protein Target</Text>
                <Text style={styles.targetVal}>{user.target_protein}g/day</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Carbohydrates</Text>
                <Text style={styles.targetVal}>{user.target_carbs}g/day</Text>
              </View>
              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Fat Target</Text>
                <Text style={styles.targetVal}>{user.target_fat}g/day</Text>
              </View>
            </View>
          )}
        </View>

        {/* 2. APPLICATION SETTINGS (Action 2: Weight unit toggle) */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Settings</Text>
          
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Display weight in LBs</Text>
            <Switch 
              value={weightUnit === "lb"} 
              onValueChange={toggleWeightUnit}
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 3. ACCOUNT PROFILE DETAILED INFO */}
        <View style={styles.grayCard}>
          <Text style={styles.fieldLabel}>Account Info</Text>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Name</Text>
            <Text style={styles.accountVal}>{user.name || "ZenLog Member"}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountVal}>{user.email}</Text>
          </View>
        </View>

        {/* Action 3: Secure Logout Button (Tertiary Action - Max 3 total) */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Log Out Session</Text>
        </TouchableOpacity>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "left",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#3B82F6", // Brand primary accent
  },
  goalsForm: {
    width: "100%",
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
    textAlign: "left",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
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
    borderBottomColor: "#E5E7EB",
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  targetVal: {
    fontSize: 13,
    fontWeight: "900",
    color: "#6B7280",
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  accountLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  accountVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#EF4444",
  },
});
