import React from "react";
import { Tabs } from "expo-router";
import { 
  Home as LucideHome, 
  Camera as LucideCamera, 
  BarChart2 as LucideBarChart2, 
  User as LucideUser 
} from "lucide-react-native";

const Home = LucideHome as any;
const Camera = LucideCamera as any;
const BarChart2 = LucideBarChart2 as any;
const User = LucideUser as any;
import { useStore } from "../../store/useStore";

export default function TabLayout() {
  const { isDarkMode, isTabBarHidden } = useStore();

  const activeColor = "#111827";
  const inactiveColor = "#9CA3AF";
  const backgroundColor = "#FFFFFF";
  const borderColor = "#E5E7EB";

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
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOpacity: 0.02,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          elevation: 2,
          display: isTabBarHidden ? "none" : "flex",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          letterSpacing: -0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "AI Scan",
          tabBarIcon: ({ color, size }) => <Camera size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => <BarChart2 size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
