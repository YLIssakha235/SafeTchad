import { expoClient } from "@better-auth/expo/client";
import { env } from "@my-better-t-app/env/native";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function getServerUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return env.EXPO_PUBLIC_SERVER_URL;
}

const SERVER_URL = getServerUrl();

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  fetchOptions: Platform.OS === "web" ? { credentials: "include" } : undefined,
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
  ],
});