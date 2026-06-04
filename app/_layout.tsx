import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useStore } from "../store/useStore";

// Error Boundary implementation to capture and prevent rendering crashes from showing white screens
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={boundaryStyles.errorContainer}>
          <Text style={boundaryStyles.errorEmoji}>⚠️</Text>
          <Text style={boundaryStyles.errorTitle}>Something went wrong</Text>
          <Text style={boundaryStyles.errorSub}>Please restart the app.</Text>
          {this.state.error?.message && (
            <Text style={boundaryStyles.errorDetails}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={boundaryStyles.resetButton} onPress={this.handleReset}>
            <Text style={boundaryStyles.resetButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Standard handler for Zustand persist hydration checking
    const checkHydration = () => {
      const hydrated = useStore.persist.hasHydrated();
      if (hydrated) {
        setIsHydrated(true);
      } else {
        const unsub = useStore.persist.onHydrate(() => {
          setIsHydrated(true);
          unsub();
        });
      }
    };
    checkHydration();
  }, []);

  if (!isHydrated) {
    return (
      <View style={loadingStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={loadingStyles.loadingText}>Zenlog AI</Text>
        <Text style={loadingStyles.loadingSub}>AI INDIAN NUTRITION</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0B0F14" }
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const boundaryStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 11,
    color: "#EF4444",
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    textAlign: "center",
    width: "100%",
  },
  resetButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "900",
  },
});

const loadingStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F9FAFB",
    marginTop: 16,
    letterSpacing: -1,
  },
  loadingSub: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1.5,
  },
});
