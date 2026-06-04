import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useStore } from "../store/useStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform, View, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Safe check loop for Zustand hydration state
        let hydrated = useStore.persist.hasHydrated();
        let retries = 0;
        while (!hydrated && retries < 20) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          hydrated = useStore.persist.hasHydrated();
          retries++;
        }
      } catch (e) {
        console.warn("Hydration prepare warning:", e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!ready) {
    return null;
  }

  const stackNavigator = (
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
  );

  if (Platform.OS === "web") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={webStyles.webContainer}>
          <View style={webStyles.phoneFrame}>
            <View style={webStyles.notch} />
            <View style={webStyles.screenContent}>
              {stackNavigator}
            </View>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stackNavigator}
    </SafeAreaProvider>
  );
}

const webStyles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: "#07090C", // Slightly darker than #0B0F14 for nice contrast
    alignItems: "center",
    justifyContent: "center",
    width: "100%" as any,
    height: "100vh" as any,
  },
  phoneFrame: {
    width: 390, // modern smartphone width (iPhone 13/14 size)
    height: 820,
    backgroundColor: "#0B0F14",
    borderRadius: 44,
    borderWidth: 10,
    borderColor: "#1E293B", // dark elegant border color
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
  },
  notch: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: [{ translateX: -60 }],
    width: 120,
    height: 24,
    backgroundColor: "#1E293B",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 9999,
  },
  screenContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
