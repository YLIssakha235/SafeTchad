import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function ProfileScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [showSignIn, setShowSignIn] = useState(true);

  async function handleLogout() {
    await authClient.signOut();
  }

  if (isPending) {
    return (
      <Container className="bg-background p-6">
        <Text className="text-muted-foreground">Chargement...</Text>
      </Container>
    );
  }

  if (!session?.user) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="px-5 py-10">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            SafeTchad
          </Text>

          <Text className="mt-3 text-4xl font-bold text-foreground">
            {showSignIn ? "Welcome Back" : "Create Account"}
          </Text>

          <Text className="mb-6 mt-2 text-sm text-muted-foreground">
            {showSignIn
              ? "Connectez-vous pour accéder à votre compte."
              : "Créez un compte pour signaler des incidents."}
          </Text>

          <View className="rounded-3xl border border-border bg-card p-5">
            {showSignIn ? <SignIn /> : <SignUp />}
          </View>

          <Pressable
            onPress={() => setShowSignIn(!showSignIn)}
            className="mt-5 items-center rounded-3xl border border-border bg-card p-4 active:opacity-80"
          >
            <Text className="text-sm font-bold text-card-foreground">
              {showSignIn
                ? "Créer un compte"
                : "Déjà un compte ? Se connecter"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-10">
        <Text className="mb-2 text-4xl font-bold text-foreground">Profil</Text>

        <Text className="mb-6 text-muted-foreground">
          Gérez votre session SafeTchad.
        </Text>

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-2 text-lg font-bold text-card-foreground">
            Connecté
          </Text>

          <Text className="mb-1 text-muted-foreground">
            Nom : {session.user.name ?? "Utilisateur"}
          </Text>

          <Text className="text-muted-foreground">
            Email : {session.user.email}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          className="items-center rounded-3xl bg-red-500 p-4 active:opacity-80"
        >
          <Text className="font-bold text-white">Se déconnecter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}