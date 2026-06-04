import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useStore, UserProfile } from "../store/useStore";
import { SafeAreaView } from "react-native-safe-area-context";

type ActivityType = "sedentary" | "light" | "moderate" | "active" | "extreme";
type GenderType = "male" | "female" | "other";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, saveOnboarding } = useStore();
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState<GenderType>("male");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [targetWeight, setTargetWeight] = useState("65");
  const [activity, setActivity] = useState<ActivityType>("moderate");
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hydrated = useStore.persist.hasHydrated();

  // If no user profile exists in Zustand yet (e.g. bypassed Welcome page), redirect back to index
  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/");
    }
  }, [user, hydrated]);

  if (!hydrated) {
    return null;
  }

  const handleCreatePlan = () => {
    const parsedAge = parseInt(age);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);
    const parsedTarget = parseFloat(targetWeight);

    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      Alert.alert("Invalid Input", "Please enter a valid age.");
      return;
    }
    if (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 250) {
      Alert.alert("Invalid Input", "Please enter a valid height in cm.");
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 300) {
      Alert.alert("Invalid Input", "Please enter a valid weight in kg.");
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget < 20 || parsedTarget > 300) {
      Alert.alert("Invalid Input", "Please enter a valid target weight in kg.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save onboarding parameters - Zustand calculates calorie/macro goals internally
      saveOnboarding({
        age: parsedAge,
        gender: gender,
        height: parsedHeight,
        current_weight: parsedWeight,
        target_weight: parsedTarget,
        activity_level: activity,
      });

      // Navigate to main tabs dashboard
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Onboarding submission failed:", e);
      Alert.alert("Error", "Failed to calibrate plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Calibrate Your Plan</Text>
          <Text style={styles.subtitle}>ZENLOG ESTIMATES TARGET METRICS TAILORED FOR YOU</Text>
        </View>

        {/* Setup Card Form */}
        <View style={styles.card}>
          
          {/* Gender */}
          <Text style={styles.label}>GENDER</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.genderButton, gender === "male" && styles.genderButtonSelected]}
              onPress={() => setGender("male")}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderText, gender === "male" && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderButton, gender === "female" && styles.genderButtonSelected]}
              onPress={() => setGender("female")}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderText, gender === "female" && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Age & Height */}
          <View style={[styles.row, { marginTop: 18 }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.label}>AGE</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>HEIGHT (CM)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                maxLength={3}
              />
            </View>
          </View>

          {/* Current Weight & Target Weight */}
          <View style={[styles.row, { marginTop: 18 }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.label}>CURRENT WEIGHT (KG)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TARGET WEIGHT (KG)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={targetWeight}
                onChangeText={setTargetWeight}
                maxLength={5}
              />
            </View>
          </View>

          {/* Activity Level Selector */}
          <Text style={[styles.label, { marginTop: 18 }]}>ACTIVITY LEVEL</Text>
          {(["sedentary", "light", "moderate", "active", "extreme"] as ActivityType[]).map((level) => {
            const labels = {
              sedentary: "Sedentary (Little to no exercise)",
              light: "Lightly Active (Light exercise 1-3 days/week)",
              moderate: "Moderately Active (Moderate exercise 3-5 days/week)",
              active: "Very Active (Hard exercise 6-7 days/week)",
              extreme: "Extremely Active (Athletic/heavy physical work)",
            };
            return (
              <TouchableOpacity
                key={level}
                style={[styles.activityOption, activity === level && styles.activityOptionSelected]}
                onPress={() => setActivity(level)}
                activeOpacity={0.8}
              >
                <Text style={[styles.activityText, activity === level && styles.activityTextSelected]}>
                  {labels[level]}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Diabetes Warning Options */}
          <View style={styles.diabetesContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.diabetesTitle}>🩺 Diabetes Friendly Mode</Text>
              <Text style={styles.diabetesDesc}>
                Flags high glycemic index foods and reduces standard carb ratios.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkbox, hasDiabetes && styles.checkboxChecked]}
              onPress={() => setHasDiabetes(!hasDiabetes)}
              activeOpacity={0.8}
            >
              {hasDiabetes && <Text style={styles.checkboxTick}>✓</Text>}
            </TouchableOpacity>
          </View>

        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleCreatePlan}
          activeOpacity={0.9}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#F9FAFB" />
          ) : (
            <Text style={styles.primaryButtonText}>Create My Plan</Text>
          )}
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 9,
    color: "#7C3AED",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  genderButton: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#0B0F14",
  },
  genderButtonSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  genderText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "800",
  },
  genderTextActive: {
    color: "#F9FAFB",
  },
  textInput: {
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
  activityOption: {
    backgroundColor: "#0B0F14",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  activityOptionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(124, 58, 237, 0.05)",
  },
  activityText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "700",
  },
  activityTextSelected: {
    color: "#F9FAFB",
    fontWeight: "900",
  },
  diabetesContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 18,
    marginTop: 20,
  },
  diabetesTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F9FAFB",
  },
  diabetesDesc: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: 2,
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    backgroundColor: "#0B0F14",
  },
  checkboxChecked: {
    borderColor: "#7C3AED",
    backgroundColor: "#7C3AED",
  },
  checkboxTick: {
    color: "#F9FAFB",
    fontWeight: "900",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
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
