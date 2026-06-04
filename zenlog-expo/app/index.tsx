import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../store/useStore";
import { SafeAreaView } from "react-native-safe-area-context";

type GoalType = "cut" | "maintain" | "bulk";

export default function WelcomePage() {
  const router = useRouter();
  const { user, login } = useStore();
  const [name, setName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("maintain");
  const [isNavigating, setIsNavigating] = useState(false);

  // Automatic redirect if user already has completed onboarding
  useEffect(() => {
    if (user && user.goal) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user]);

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please tell us your name to personalize your experience.");
      return;
    }
    setIsNavigating(true);

    try {
      const guestProfile = {
        id: "usr_guest",
        email: "guest@zenlog.ai",
        name: name.trim(),
        goal: selectedGoal,
      };

      // Set guest profile in Zustand store
      login(guestProfile);

      // Route to detailed calibration onboarding
      router.push("/onboarding");
    } catch (error) {
      console.error("Failed to setup local guest profile:", error);
      Alert.alert("Error", "Could not create user profile. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header branding */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>Zenlog AI</Text>
            <Text style={styles.brandTagline}>YOUR NATIVE INDIAN HEALTH COMPANION</Text>
          </View>

          {/* Setup Card Form */}
          <View style={styles.card}>
            <Text style={styles.label}>WHAT IS YOUR NAME?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Aarav Sharma"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
              maxLength={30}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text style={[styles.label, { marginTop: 24 }]}>CHOOSE YOUR FITNESS GOAL</Text>
            
            {/* Goal selection cards */}
            <TouchableOpacity
              style={[styles.goalOption, selectedGoal === "cut" && styles.goalOptionSelected]}
              onPress={() => setSelectedGoal("cut")}
              activeOpacity={0.8}
            >
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>🔥 Lose Weight</Text>
                <Text style={styles.goalDesc}>Burn fat, increase cardiovascular fitness, & get lean.</Text>
              </View>
              <View style={[styles.radio, selectedGoal === "cut" && styles.radioChecked]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.goalOption, selectedGoal === "maintain" && styles.goalOptionSelected]}
              onPress={() => setSelectedGoal("maintain")}
              activeOpacity={0.8}
            >
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>⚖️ Maintain Weight</Text>
                <Text style={styles.goalDesc}>Balance energy, improve strength, & establish healthy habits.</Text>
              </View>
              <View style={[styles.radio, selectedGoal === "maintain" && styles.radioChecked]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.goalOption, selectedGoal === "bulk" && styles.goalOptionSelected]}
              onPress={() => setSelectedGoal("bulk")}
              activeOpacity={0.8}
            >
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>💪 Gain Muscle</Text>
                <Text style={styles.goalDesc}>Increase strength, scale protein intake, & gain size.</Text>
              </View>
              <View style={[styles.radio, selectedGoal === "bulk" && styles.radioChecked]} />
            </TouchableOpacity>
          </View>

          {/* Action button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryButton, isNavigating && styles.buttonDisabled]}
              onPress={handleContinue}
              activeOpacity={0.9}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <ActivityIndicator size="small" color="#F9FAFB" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#F9FAFB",
    letterSpacing: -1.5,
  },
  brandTagline: {
    fontSize: 10,
    color: "#7C3AED", // Purple accent
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: "#111827", // Card background
    borderRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    color: "#F9FAFB",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "700",
  },
  goalOption: {
    backgroundColor: "#0B0F14",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  goalOptionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  goalInfo: {
    flex: 1,
    paddingRight: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
    lineHeight: 14,
  },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
  },
  radioChecked: {
    borderColor: "#7C3AED",
    backgroundColor: "#7C3AED",
  },
  footer: {
    width: "100%",
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: "#7C3AED", // Purple accent
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
