import { Link, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />

      <Container>
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-sm items-center rounded-3xl border border-border bg-card p-8">
            <Text className="mb-3 text-5xl">🤔</Text>

            <Text className="mb-2 text-xl font-bold text-card-foreground">
              Page Not Found
            </Text>

            <Text className="mb-6 text-center text-muted-foreground">
              The page you're looking for doesn't exist.
            </Text>

            <Link href="/" asChild>
              <Pressable className="rounded-2xl bg-brand px-5 py-3 active:opacity-80">
                <Text className="font-semibold text-white">
                  Go Home
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </Container>
    </>
  );
}