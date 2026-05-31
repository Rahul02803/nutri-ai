import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../store/useStore";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useStore();

  // If user is already logged in, redirect automatically
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
    <View style={styles.container}>
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandEmoji}>🍎</Text>
        <Text style={styles.brandTitle}>ZenLog</Text>
        <Text style={styles.brandTagline}>AI Powered Nutrition Tracking</Text>
      </View>

      {/* Full-Screen Looping Video / Mockup Viewport */}
      <View style={styles.previewContainer}>
        <View style={styles.auroraLayer} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mockupSlide}>
            <Text style={styles.slideHeader}>📷 AI Meal Scanning</Text>
            <Text style={styles.slideText}>Snap photo to estimate calories & macro splits instantly via Gemini 2.5 Flash Vision.</Text>
          </View>

          <View style={styles.mockupSlide}>
            <Text style={styles.slideHeader}>🥗 Indian Foods Catalog</Text>
            <Text style={styles.slideText}>Search and log typical favorites like Roti, Paneer, Dosa, and leading regional brands.</Text>
          </View>

          <View style={styles.mockupSlide}>
            <Text style={styles.slideHeader}>📉 Weight Progress Trends</Text>
            <Text style={styles.slideText}>Track daily check-ins, delta shifts, and BMI scales in a beautifully clean timeline.</Text>
          </View>

          <View style={styles.mockupSlide}>
            <Text style={styles.slideHeader}>🌱 Gemini AI Coach</Text>
            <Text style={styles.slideText}>Get real-time dynamic motivation and proportional macro advice customized for your goal.</Text>
          </View>
        </ScrollView>
      </View>

      {/* Action Buttons */}
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
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "bold",
    marginTop: 2,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#111115",
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    padding: 20,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  auroraLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(20, 184, 166, 0.04)",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 10,
  },
  mockupSlide: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    borderRadius: 24,
    width: "100%",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  slideHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#14B8A6",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  slideText: {
    fontSize: 10,
    color: "#D1D5DB",
    lineHeight: 14,
    fontWeight: "bold",
    textAlign: "left",
  },
  footer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "bold",
  },
});
