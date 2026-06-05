import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";

function Modal() {
  function handleClose() {
    router.back();
  }

  return (
    <Container className="bg-background">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-sm rounded-3xl border border-border bg-card p-6">
          <View className="items-center">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
              <Ionicons name="checkmark" size={28} color="#E5341A" />
            </View>

            <Text className="mb-2 text-xl font-bold text-card-foreground">
              Modal Screen
            </Text>

            <Text className="mb-6 text-center text-muted-foreground">
              This is an example modal screen for dialogs and confirmations.
            </Text>
          </View>

          <Pressable
            onPress={handleClose}
            className="items-center rounded-2xl bg-brand p-4 active:opacity-80"
          >
            <Text className="font-semibold text-white">Close</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

export default Modal;