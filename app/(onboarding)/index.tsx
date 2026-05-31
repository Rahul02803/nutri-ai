import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useStore, UserProfile } from "../../store/useStore";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveOnboarding } = useStore();

  const [step, setStep] = useState(1);

  // States for Onboarding Questionnaire
  const [name, setName] = useState("");
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState<UserProfile["gender"]>("male");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("75");
  const [activity, setActivity] = useState<UserProfile["activity_level"]>("moderate");
  const [goal, setGoal] = useState<UserProfile["goal"]>("maintain");
  const [targetWeight, setTargetWeight] = useState("70");
  const [diet, setDiet] = useState<UserProfile["diet_preference"]>("vegetarian");
  const [steps, setSteps] = useState("8000");

  const handleNext = () => {
    if (step < 10) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const payload: Partial<UserProfile> = {
      name: name || "ZenLog Member",
      age: parseInt(age) || 24,
      gender,
      height: parseFloat(height) || 175,
      current_weight: parseFloat(weight) || 75,
      activity_level: activity,
      goal,
      target_weight: parseFloat(targetWeight) || 70,
      diet_preference: diet,
      steps_goal: parseInt(steps) || 8000
    };

    saveOnboarding(payload);
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      
      {/* Progress indicators bar */}
      <View style={styles.header}>
        <Text style={styles.progressText}>Step {step} of 10</Text>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBar, { width: `${(step / 10) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Q1: Name */}
        {step === 1 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>What should we call you?</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name..."
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        )}

        {/* Q2: Age */}
        {step === 2 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>What is your age?</Text>
            <Text style={styles.questionSub}>Used for clinical metabolic calibration.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Age in years..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>
        )}

        {/* Q3: Gender */}
        {step === 3 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Select Biological Gender</Text>
            <View style={styles.buttonOptions}>
              {([
                { id: "male" as const, label: "Male" },
                { id: "female" as const, label: "Female" },
                { id: "other" as const, label: "Prefer not to say" }
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, gender === opt.id && styles.optionCardSelected]}
                  onPress={() => setGender(opt.id)}
                >
                  <Text style={[styles.optionLabel, gender === opt.id && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Q4: Height */}
        {step === 4 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>What is your height?</Text>
            <Text style={styles.questionSub}>Measured in centimeters.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Height in cm..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
          </View>
        )}

        {/* Q5: Current Weight */}
        {step === 5 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>What is your current weight?</Text>
            <Text style={styles.questionSub}>Measured in kilograms.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Weight in kg..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
        )}

        {/* Q6: Activity Level */}
        {step === 6 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Select Daily Activity level</Text>
            <View style={styles.buttonOptions}>
              {([
                { id: "sedentary" as const, label: "🛋️ Sedentary (No formal workout)" },
                { id: "light" as const, label: "🚶 Lightly Active (1-2 days/week)" },
                { id: "moderate" as const, label: "🏃 Moderately Active (3-5 days/week)" },
                { id: "active" as const, label: "🏋️ Very Active (6-7 days intense work)" },
                { id: "extreme" as const, label: "🐆 Athlete (Intense daily training)" }
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, activity === opt.id && styles.optionCardSelected]}
                  onPress={() => setActivity(opt.id)}
                >
                  <Text style={[styles.optionLabel, activity === opt.id && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Q7: Goal */}
        {step === 7 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Select Daily Transformation Goal</Text>
            <View style={styles.buttonOptions}>
              {([
                { id: "cut" as const, label: "📉 Lose Weight (Cut)" },
                { id: "maintain" as const, label: "⚖️ Maintain Weight" },
                { id: "bulk" as const, label: "💪 Gain Muscle (Bulk)" }
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, goal === opt.id && styles.optionCardSelected]}
                  onPress={() => setGoal(opt.id)}
                >
                  <Text style={[styles.optionLabel, goal === opt.id && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Q8: Target Weight */}
        {step === 8 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>What is your target weight?</Text>
            <Text style={styles.questionSub}>Used for timeline calibration metrics.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Target weight in kg..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={targetWeight}
                onChangeText={setTargetWeight}
              />
            </View>
          </View>
        )}

        {/* Q9: Diet Preference */}
        {step === 9 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Select Food Preference</Text>
            <View style={styles.buttonOptions}>
              {([
                { id: "vegetarian" as const, label: "🥦 Vegetarian" },
                { id: "non-vegetarian" as const, label: "🍗 Non-Vegetarian" },
                { id: "vegan" as const, label: "🌱 Vegan" }
              ]).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionCard, diet === opt.id && styles.optionCardSelected]}
                  onPress={() => setDiet(opt.id)}
                >
                  <Text style={[styles.optionLabel, diet === opt.id && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Q10: Daily Steps Goal */}
        {step === 10 && (
          <View style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Set Daily Steps Goal</Text>
            <Text style={styles.questionSub}>Baseline target is 8,000 steps.</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Steps (e.g. 8000)..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={steps}
                onChangeText={setSteps}
              />
            </View>
          </View>
        )}

      </ScrollView>

      {/* Wizard actions buttons */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 10 ? "Finish Calibration" : "Next Option"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    width: "100%",
    marginBottom: 40,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  progressBarWrapper: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#111827",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  questionWrapper: {
    width: "100%",
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  questionSub: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 10,
  },
  textInput: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "bold",
  },
  buttonOptions: {
    width: "100%",
    marginTop: 10,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  optionCardSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  optionLabel: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "bold",
  },
  optionLabelSelected: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButtonText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});
