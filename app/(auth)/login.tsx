import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../../services/supabase";

// Complete the authentication session if redirecting back to web environment
WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Robust parsing helper for access_token and refresh_token in OAuth redirects
  const getParamsFromUrl = (url: string) => {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) return {};
    const hash = url.substring(hashIndex + 1);
    const params: Record<string, string> = {};
    hash.split("&").forEach((part) => {
      const [key, val] = part.split("=");
      if (key && val) {
        params[key] = decodeURIComponent(val);
      }
    });
    return params;
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      // Resolve correct redirect URI scheme ('zenlog://' for standalone builds, custom linking for Expo Go)
      const redirectTo = makeRedirectUri({ scheme: "zenlog" });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Could not retrieve authentication URL from server.");

      // Open OAuth authentication flow in a secure browser window
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === "success" && result.url) {
        const parsedParams = getParamsFromUrl(result.url);
        const access_token = parsedParams.access_token;
        const refresh_token = parsedParams.refresh_token;

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (sessionError) throw sessionError;
          
          // Successful session will trigger useEffect in _layout.tsx and redirect automatically
        } else {
          throw new Error("Failed to receive authentication tokens from Google.");
        }
      } else if (result.type === "cancel") {
        // User exited authentication, silent handle
      } else {
        throw new Error("Google authentication was cancelled.");
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      setErrorText(err.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>ZenLog</Text>
          <Text style={styles.subTitle}>LOG IN OR SIGN UP</Text>
        </View>

        {/* Display Errors if any */}
        {errorText && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {/* Auth Action Area */}
        <View style={styles.actionContainer}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Connecting to Google...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.googleButtonText}>🌐 Continue with Google</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.policyText}>
          By signing in you agree to our Terms of Service & Privacy Policy.
        </Text>

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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -1,
  },
  subTitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  actionContainer: {
    width: "100%",
    marginBottom: 48,
    minHeight: 60,
    justifyContent: "center",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "800",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: "#F4F4F5",
    height: 56,
    borderRadius: 20, // Strict 20px rounded corners
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  policyText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 20,
  },
});
