import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../services/supabase";
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
  const { setUser } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Fallback timeout to guarantee loading screen clears even if network/auth state request hangs
    const timeoutId = setTimeout(() => {
      console.warn("Auth check timed out. Dismissing loading screen.");
      setIsInitializing(false);
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log(`[Auth Event] ${event} detected.`);
        if (session) {
          const authUser = session.user;
          const email = authUser.email || "";
          const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0];
          const profilePicture = authUser.user_metadata?.avatar_url || "";

          // Check if public profile exists
          const { data: profile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

          if (error) throw error;

          let activeProfile = profile;

          if (!profile) {
            const newProfile = {
              id: authUser.id,
              email,
              name,
              profile_picture: profilePicture,
              last_login: new Date().toISOString(),
            };

            const { data: insertedProfile, error: insertError } = await supabase
              .from("users")
              .insert(newProfile)
              .select()
              .maybeSingle();

            if (insertError) throw insertError;
            activeProfile = insertedProfile || newProfile;
          } else {
            // Update last login
            await supabase
              .from("users")
              .update({ last_login: new Date().toISOString() })
              .eq("id", authUser.id);

            activeProfile = {
              ...profile,
              last_login: new Date().toISOString(),
            };
          }

          // Update local Zustand store
          setUser(activeProfile);

          // Invoke email sending logic
          if (event === "SIGNED_IN") {
            supabase.functions
              .invoke("send-login-email", {
                body: { name: activeProfile.name },
              })
              .catch((err) => console.error("Error triggering login email:", err));
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state observer error, failing gracefully:", err);
        setUser(null);
      } finally {
        setIsInitializing(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  if (isInitializing) {
    return (
      <View style={loadingStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={loadingStyles.loadingText}>ZenLog</Text>
        <Text style={loadingStyles.loadingSub}>AI MEAL TRACKING</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8F8FA" }
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" options={{ presentation: "card" }} />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const boundaryStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: "#111827",
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 11,
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    textAlign: "center",
    width: "100%",
  },
  resetButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});

const loadingStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
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

