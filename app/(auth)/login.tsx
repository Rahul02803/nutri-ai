import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "../../store/useStore";
import { Mail, ShieldCheck } from "lucide-react-native";

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
    <View style={styles.container}>
      
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>ZenLog</Text>
        <Text style={styles.subTitle}>Premium AI Nutrition Coach</Text>
      </View>

      {/* Form Input Container */}
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
          <Text style={styles.primaryButtonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>

      {/* Alternative Social Oauth Triggers */}
      <View style={styles.socialContainer}>
        <View style={styles.separatorWrapper}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>or continue with</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.socialButton} onPress={handleMockGoogleLogin}>
          <Text style={styles.socialButtonText}>🌐 Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleMockAppleLogin}>
          <Text style={styles.socialButtonText}> Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.policyText}>
        By signing in you agree to our Terms of Service & Privacy Policy.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "bold",
    marginTop: 2,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  inputField: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  socialContainer: {
    width: "100%",
    marginBottom: 40,
  },
  separatorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  separatorText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  socialButtonText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
  },
  policyText: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 14,
  },
});
