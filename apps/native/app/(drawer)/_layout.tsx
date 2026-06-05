import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React, { useCallback } from "react";
import { Text, View } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAppTheme } from "@/contexts/app-theme-context";

function SafeTchadTitle() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: "#E5341A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 14,
          }}
        >
          🛡️
        </Text>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: "white",
        }}
      >
        Safe<Text style={{ color: "#E5341A" }}>Tchad</Text>
      </Text>
    </View>
  );
}

export default function DrawerLayout() {
  const { isDark } = useAppTheme();

  const foreground = isDark ? "#f3f0e8" : "#1b1b22";
  const background = isDark ? "#0d0d11" : "#fbfaf6";
  const border = isDark ? "#2d2d36" : "#e5e2da";

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: foreground,
        headerStyle: {
          backgroundColor: background,
          borderBottomColor: border,
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: foreground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: {
          backgroundColor: background,
        },
        drawerActiveTintColor: "#E5341A",
        drawerInactiveTintColor: foreground,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Accueil",
          drawerLabel: ({ color }) => <Text style={{ color }}>Accueil</Text>,
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: () => <SafeTchadTitle />,
          drawerLabel: ({ color }) => <Text style={{ color }}>Incidents</Text>,
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}