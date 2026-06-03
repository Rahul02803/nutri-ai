import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../services/supabase";
import { useStore } from "../store/useStore";

export default function RootLayout() {
  const { setUser } = useStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const authUser = session.user;
        const email = authUser.email || "";
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0];
        const profilePicture = authUser.user_metadata?.avatar_url || "";

        // Check if public profile exists
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        let activeProfile = profile;

        if (!profile) {
          const newProfile = {
            id: authUser.id,
            email,
            name,
            profile_picture: profilePicture,
            last_login: new Date().toISOString(),
          };

          const { data: insertedProfile } = await supabase
            .from("users")
            .insert(newProfile)
            .select()
            .maybeSingle();

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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
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
        <Stack.Screen name="(onboarding)/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat" options={{ presentation: "card" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
