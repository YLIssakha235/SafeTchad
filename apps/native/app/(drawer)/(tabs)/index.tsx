import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft">
        <Ionicons name={icon} size={22} color="#E5341A" />
      </View>

      <Text className="mb-2 text-base font-bold text-card-foreground">
        {title}
      </Text>

      <Text className="leading-6 text-muted-foreground">{description}</Text>
    </View>
  );
}

function TypeBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-border bg-background px-3 py-1.5">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <Container className="bg-background">
      <View className="px-6 py-8">
        <View className="items-center">
          <Text className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            SafeTchad
          </Text>

          <Text className="text-center text-5xl font-bold leading-[52px] text-foreground">
            Signaler.{"\n"}Informer.{"\n"}Protéger.
          </Text>

          <Text className="mt-5 text-center text-base leading-7 text-muted-foreground">
            SafeTchad est une plateforme communautaire de signalement permettant
            de remonter rapidement des incidents, de consulter les alertes
            locales et de suivre l’évolution de la situation sur le terrain.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <Link href="/(drawer)/(tabs)/incidents/create" asChild>
            <Pressable className="items-center rounded-full bg-brand px-5 py-4 active:opacity-80">
              <View className="flex-row items-center gap-2">
                <Ionicons name="add" size={18} color="white" />
                <Text className="font-bold text-white">
                  Signaler un incident
                </Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/(drawer)/(tabs)/incidents" asChild>
            <Pressable className="items-center rounded-full border border-border bg-card px-5 py-4 active:opacity-80">
              <Text className="font-bold text-card-foreground">
                Voir les incidents
              </Text>
            </Pressable>
          </Link>
        </View>

        <View className="mt-8 gap-4">
          <FeatureCard
            icon="location-outline"
            title="Signalement localisé"
            description="Renseignez la ville, le quartier et l’axe routier pour situer précisément un incident."
          />

          <FeatureCard
            icon="people-outline"
            title="Information communautaire"
            description="Consultez rapidement les derniers signalements partagés par les utilisateurs de la plateforme."
          />

          <FeatureCard
            icon="analytics-outline"
            title="Suivi de situation"
            description="Visualisez les incidents en cours, les cas résolus et les zones qui nécessitent plus d’attention."
          />
        </View>

        <View className="mt-8 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Types d’incidents suivis
          </Text>

          <Text className="mb-3 text-2xl font-bold text-card-foreground">
            Une plateforme pensée pour les alertes du quotidien
          </Text>

          <Text className="mb-5 leading-6 text-muted-foreground">
            SafeTchad permet de centraliser différents types de signalements
            utiles à la population et aux acteurs de terrain.
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <TypeBadge label="Accident" />
            <TypeBadge label="Vol" />
            <TypeBadge label="Incendie" />
            <TypeBadge label="Inondation" />
            <TypeBadge label="Route dangereuse" />
            <TypeBadge label="Urgence médicale" />
          </View>
        </View>
      </View>
    </Container>
  );
}