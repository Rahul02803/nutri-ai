import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../store/useStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleEmailLogin = () => {
    if (!email.includes("@")) {
      setErrorText("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorText("Password must be at least 6 characters.");
      return;
    }

    login(email);
    router.replace("/(onboarding)");
  };

  const handleMockGoogleLogin = () => {
    login("rahul.sharma@gmail.com", "Rahul Sharma");
    router.replace("/(onboarding)");
  };

  const handleMockAppleLogin = () => {
    login("apple.user@icloud.com", "Apple User");
    router.replace("/(onboarding)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>ZenLog</Text>
          <Text style={styles.subTitle}>LOG IN OR SIGN UP</Text>
        </View>

        {/* Form Input Container (Action 1: Email continue - Primary Action) */}
        <View style={styles.formContainer}>
          {errorText && (
            <Text style={styles.errorText}>{errorText}</Text>
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputField}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrorText(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputField}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrorText(null); }}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleEmailLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Social Oauth Buttons (Actions 2 & 3: Social logins) */}
        <View style={styles.socialContainer}>
          <View style={styles.separatorRow}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleMockGoogleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}>🌐 Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleMockAppleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.socialButtonText}> Continue with Apple</Text>
          </TouchableOpacity>
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
    marginBottom: 44,
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
  },
  formContainer: {
    width: "100%",
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: "#F4F4F5", // Soft gray input box
    borderRadius: 20, // Strict 20px rounded corners
    paddingHorizontal: 18,
    height: 52,
    justifyContent: "center",
    marginBottom: 12,
  },
  inputField: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#3B82F6", // Brand electric blue
    height: 52,
    borderRadius: 20, // Strict 20px rounded corners
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  socialContainer: {
    width: "100%",
    marginBottom: 36,
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  separatorText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "900",
    marginHorizontal: 12,
  },
  socialButton: {
    backgroundColor: "#F4F4F5",
    height: 48,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  socialButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  policyText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 14,
  },
});
