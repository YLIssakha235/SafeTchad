import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useAppTheme } from "@/contexts/app-theme-context";

export default function TabLayout() {
  const { isDark } = useAppTheme();

  const foreground = isDark ? "#f3f0e8" : "#1b1b22";
  const background = isDark ? "#0d0d11" : "#fbfaf6";
  const border = isDark ? "#2d2d36" : "#e5e2da";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        headerStyle: {
          backgroundColor: background,
        },

        headerTintColor: foreground,

        headerTitleStyle: {
          color: foreground,
          fontWeight: "600",
        },

        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
        },

        tabBarActiveTintColor: "#E5341A",
        tabBarInactiveTintColor: foreground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="incidents/index"
        options={{
          title: "Incidents",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="incidents/create"
        options={{
          title: "Signaler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="incidents/[incidentId]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}