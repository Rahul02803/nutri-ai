import React from "react";
import { Tabs } from "expo-router";
import { 
  Home as LucideHome, 
  ChefHat as LucideChefHat, 
  BarChart2 as LucideBarChart2, 
  Settings as LucideSettings 
} from "lucide-react-native";

const Home = LucideHome as any;
const ChefHat = LucideChefHat as any;
const BarChart2 = LucideBarChart2 as any;
const Settings = LucideSettings as any;

export default function TabLayout() {
  const activeColor = "#7C3AED"; // Purple accent
  const inactiveColor = "#9CA3AF";
  const backgroundColor = "#111827"; // Dark mode tab bar
  const borderColor = "#1F2937";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <BarChart2 size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
