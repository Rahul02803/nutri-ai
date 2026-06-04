import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, useRouter, Stack } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    console.log("[+not-found] Go Home button pressed. Redirecting to '/' route.");
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🗺️</Text>
        <Text style={styles.title}>Oops! Route Not Found</Text>
        <Text style={styles.message}>
          The screen you are trying to reach doesn't exist, or the route failed to resolve.
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go to Welcome Screen</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
