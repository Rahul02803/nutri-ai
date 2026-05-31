import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../store/useStore";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useStore();

  // Automatic redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.goal) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)");
      }
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>ZenLog</Text>
          <Text style={styles.brandTagline}>AI MEAL TRACKING</Text>
        </View>

        {/* Calm Features Showcase (Soft gray card, 20px rounded) */}
        <View style={styles.previewContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.mockupSlide}>
              <Text style={styles.slideHeader}>📸 Camera Meal Scan</Text>
              <Text style={styles.slideText}>
                Snap food photos to estimate calories, macros, and micro-nutrient profiles instantly.
              </Text>
            </View>

            <View style={styles.mockupSlide}>
              <Text style={styles.slideHeader}>📊 Portion Recalculation</Text>
              <Text style={styles.slideText}>
                Slide weights dynamically to scale macros instantly with zero server lag.
              </Text>
            </View>

            <View style={styles.mockupSlide}>
              <Text style={styles.slideHeader}>📈 Goal Auto-Calibration</Text>
              <Text style={styles.slideText}>
                ZenLog tracks weight shifts on weekly check-ins and trims or adds calories automatically.
              </Text>
            </View>

          </ScrollView>
        </View>

        {/* Footer Actions (Action 1: Get Started primary electric blue, Action 2: Sign In text link) */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 12,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1.5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#F4F4F5",
    borderRadius: 20, // Strict 20px rounded corners
    overflow: "hidden",
    padding: 16,
    marginVertical: 32,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  mockupSlide: {
    padding: 18,
    borderRadius: 16,
    width: "100%",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  slideHeader: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  slideText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "left",
  },
  footer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#3B82F6", // Brand electric blue
    paddingVertical: 16,
    borderRadius: 20, // Strict 20px rounded corners
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
});
