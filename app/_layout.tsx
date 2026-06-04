import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useStore } from "../store/useStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

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

  return (
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
  );
}
