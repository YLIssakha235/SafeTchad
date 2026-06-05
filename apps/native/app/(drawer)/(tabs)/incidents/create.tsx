import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import { orpc } from "@/utils/orpc";
import {
  AXES_ROUTIERS,
  INCIDENT_TYPES,
  QUARTIERS,
  VILLES,
  formatLabel,
  useIncidents,
} from "@my-better-t-app/hooks";
import type {
  AxeRoutier,
  IncidentType,
  Quartier,
  Ville,
} from "@my-better-t-app/api/contracts/incident";

export default function CreateIncidentScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>(INCIDENT_TYPES[0]);
  const [ville, setVille] = useState<Ville>(VILLES[0]);
  const [quartier, setQuartier] = useState<Quartier>(QUARTIERS[0]);
  const [axeRoutier, setAxeRoutier] = useState<AxeRoutier>(AXES_ROUTIERS[0]);
  const [errorMessage, setErrorMessage] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const { create } = useIncidents(orpc);
  const isSubmitting = create.isPending || create.isLoading;

  useEffect(() => {
    async function loadLocation() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          setErrorMessage("Permission GPS refusée.");
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationAccuracy(position.coords.accuracy);
      } catch {
        setErrorMessage("Impossible de récupérer la position.");
      } finally {
        setLocationLoading(false);
      }
    }

    loadLocation();
  }, []);

  async function handleSubmit() {
    setErrorMessage("");

    try {
      await create.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        type,
        ville,
        quartier,
        axeRoutier,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        locationAccuracy: locationAccuracy ?? undefined,
      });

      router.push("/(drawer)/(tabs)/incidents");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de la création."
      );
    }
  }

  function OptionButton<T extends string>({
    value,
    selected,
    onPress,
  }: {
    value: T;
    selected: boolean;
    onPress: () => void;
  }) {
    return (
      <Pressable
        onPress={onPress}
        className={`rounded-full border px-4 py-2 ${
          selected ? "border-brand bg-brand" : "border-border bg-background"
        }`}
      >
        <Text className={selected ? "font-medium text-white" : "text-foreground"}>
          {formatLabel(value)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Container className="bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-10">
        <View className="mb-6">
          <Text className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            Nouveau
          </Text>

          <Text className="text-4xl font-bold text-foreground">
            Signaler un incident
          </Text>

          <Text className="mt-2 text-sm text-muted-foreground">
            Remplissez le formulaire pour alerter la communauté.
          </Text>
        </View>

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 font-semibold text-card-foreground">
            Informations générales
          </Text>

          <View className="gap-4">
            <View>
              <Text className="mb-2 font-medium text-card-foreground">
                Titre
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex : Accident avenue Mobutu"
                placeholderTextColor="#777780"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
              />
            </View>

            <View>
              <Text className="mb-2 font-medium text-card-foreground">
                Description
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez l’incident…"
                placeholderTextColor="#777780"
                multiline
                textAlignVertical="top"
                className="min-h-[120px] rounded-2xl border border-border bg-background px-4 py-4 text-foreground"
              />
            </View>
          </View>
        </View>

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 font-semibold text-card-foreground">
            Type d’incident
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {INCIDENT_TYPES.map((incidentType) => (
              <OptionButton
                key={incidentType}
                value={incidentType}
                selected={type === incidentType}
                onPress={() => setType(incidentType)}
              />
            ))}
          </View>
        </View>

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 font-semibold text-card-foreground">
            Localisation
          </Text>

          <View className="gap-4">
            <View>
              <Text className="mb-2 font-medium text-card-foreground">
                Ville
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {VILLES.map((v) => (
                  <OptionButton
                    key={v}
                    value={v}
                    selected={ville === v}
                    onPress={() => setVille(v)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 font-medium text-card-foreground">
                Quartier
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {QUARTIERS.map((q) => (
                  <OptionButton
                    key={q}
                    value={q}
                    selected={quartier === q}
                    onPress={() => setQuartier(q)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 font-medium text-card-foreground">
                Axe routier
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {AXES_ROUTIERS.map((a) => (
                  <OptionButton
                    key={a}
                    value={a}
                    selected={axeRoutier === a}
                    onPress={() => setAxeRoutier(a)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-2 font-semibold text-card-foreground">
            Position GPS
          </Text>

          {locationLoading ? (
            <Text className="text-muted-foreground">
              Récupération de la position...
            </Text>
          ) : latitude !== null && longitude !== null ? (
            <>
              <Text className="text-muted-foreground">
                Latitude : {latitude.toFixed(6)}
              </Text>

              <Text className="text-muted-foreground">
                Longitude : {longitude.toFixed(6)}
              </Text>

              <Text className="text-muted-foreground">
                Précision GPS :  ±{locationAccuracy?.toFixed(0)} m
              </Text>

              
            </>
          ) : (
            <Text className="text-muted-foreground">
              Position indisponible.
            </Text>
          )}
        </View>

        {errorMessage ? (
          <View className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-4">
            <Text className="font-medium text-red-500">{errorMessage}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className={`items-center rounded-3xl p-4 ${
            isSubmitting || !title.trim() || !description.trim()
              ? "bg-muted"
              : "bg-brand active:opacity-80"
          }`}
        >
          <Text className="text-base font-bold text-white">
            {isSubmitting ? "Envoi..." : "Signaler l’incident"}
          </Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}