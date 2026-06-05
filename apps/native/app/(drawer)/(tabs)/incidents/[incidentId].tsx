import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, Platform, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { formatLabel, useIncidents } from "@my-better-t-app/hooks";
import { env } from "@my-better-t-app/env/native";

const API_URL = env.EXPO_PUBLIC_SERVER_URL;

const STATUS_LABELS = {
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  ANNULE: "Annulé",
} as const;

const TYPE_LABELS = {
  ACCIDENT: "Accident",
  VOL: "Vol",
  INCENDIE: "Incendie",
  INONDATION: "Inondation",
  ROUTE_DANGEREUSE: "Route dangereuse",
  URGENCE_MEDICALE: "Urgence médicale",
} as const;

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function getStatusBadgeClass(status: keyof typeof STATUS_LABELS) {
  if (status === "EN_COURS") return "bg-yellow-500/15 text-yellow-400";
  if (status === "RESOLU") return "bg-green-500/15 text-green-400";
  return "bg-red-500/15 text-red-400";
}

export default function IncidentDetailScreen() {
  const params = useLocalSearchParams<{ incidentId?: string | string[] }>();
  const incidentId = Array.isArray(params.incidentId)
    ? params.incidentId[0]
    : params.incidentId;

  const { data: session } = authClient.useSession();
  const { detail, updateStatus } = useIncidents(orpc, incidentId);
  const { incident, isLoading, error, isFetching, refetch } = detail;

  const [cancelError, setCancelError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refetch?.();
    setIsRefreshing(false);
  }

  async function handleCancelIncident() {
    if (!incident) return;
    setCancelError("");
    try {
      await updateStatus.mutateAsync({
        id: incident.id,
        status: "ANNULE",
      });
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : "Impossible d'annuler cet incident."
      );
    }
  }

  async function uploadImage(uri: string) {
    if (!incident) return;
    try {
      setIsUploading(true);
      setUploadMessage("");
      const fileName = uri.split("/").pop() || "image.jpg";
      const formData = new FormData();
      formData.append("incidentId", incident.id);
      if (Platform.OS === "web") {
        const blob = await fetch(uri).then((res) => res.blob());
        const file = new File([blob], fileName, {
          type: blob.type || "image/jpeg",
        });
        formData.append("file", file);
      } else {
        formData.append("file", {
          uri,
          name: fileName,
          type: "image/jpeg",
        } as any);
      }
      const cookies = await authClient.getCookie();
      const response = await fetch(`${API_URL}/api/incidents/upload`, {
        method: "POST",
        body: formData,
        headers: cookies ? { Cookie: cookies } : {},
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      setUploadMessage("Image ajoutée avec succès.");
      await refetch?.();
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Erreur lors de l'upload."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setUploadMessage("Permission galerie refusée.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setUploadMessage("Permission caméra refusée.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  }

  if (!incidentId) {
    return (
      <Container className="bg-background p-6">
        <Text className="font-bold text-red-500">ID incident manquant.</Text>
        <Link href="/(drawer)/(tabs)/incidents" className="mt-4 text-brand">
          Retour aux incidents
        </Link>
      </Container>
    );
  }

  if (isLoading && !incident) {
    return (
      <Container className="bg-background p-6">
        <Text className="text-muted-foreground">Chargement de l'incident...</Text>
      </Container>
    );
  }

  if (error && !incident) {
    return (
      <Container className="bg-background p-6">
        <Text className="font-bold text-red-500">Impossible de charger cet incident.</Text>
        <Link href="/(drawer)/(tabs)/incidents" className="mt-4 text-brand">
          Retour aux incidents
        </Link>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container className="bg-background p-6">
        <Text className="text-muted-foreground">Incident introuvable.</Text>
        <Link href="/(drawer)/(tabs)/incidents" className="mt-4 text-brand">
          Retour aux incidents
        </Link>
      </Container>
    );
  }

  const canCancel =
    session?.user?.id === incident.reporterId && incident.status === "EN_COURS";
  const canUpload =
    session?.user?.id === incident.reporterId && incident.status === "EN_COURS";

  return (
    <Container className="bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Link href="/(drawer)/(tabs)/incidents" className="mb-6 text-muted-foreground">
          ← Tous les incidents
        </Link>

        {error && (
          <View className="mb-5 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Text className="text-amber-500">
              Mode hors ligne : affichage des dernières données disponibles.
            </Text>
          </View>
        )}

        {isFetching && !error && (
          <Text className="mb-3 text-muted-foreground">Actualisation...</Text>
        )}

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-2 text-3xl font-bold text-card-foreground">
            {incident.title}
          </Text>
          <Text className="mb-4 text-sm text-muted-foreground">
            Signalé le {formatDate(incident.createdAt)}
            {incident.reporter ? (
              <>
                {" · par "}
                <Text className="font-semibold text-foreground">
                  {incident.reporter.name || incident.reporter.email}
                </Text>
              </>
            ) : null}
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            <Text className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
              {TYPE_LABELS[incident.type] ?? formatLabel(incident.type)}
            </Text>
            <Text
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(incident.status)}`}
            >
              {STATUS_LABELS[incident.status] ?? formatLabel(incident.status)}
            </Text>
          </View>
          <Text className="leading-6 text-muted-foreground">
            {incident.description || "Aucune description."}
          </Text>
        </View>

        {canCancel && (
          <View className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-5">
            <Text className="mb-3 font-bold text-red-500">Gestion de mon signalement</Text>
            <Text className="mb-4 text-sm text-muted-foreground">
              Vous pouvez annuler ce signalement tant qu'il est encore en cours.
            </Text>
            {cancelError ? (
              <Text className="mb-3 text-sm text-red-500">{cancelError}</Text>
            ) : null}
            <Pressable
              onPress={handleCancelIncident}
              disabled={updateStatus.isPending}
              className="items-center rounded-2xl bg-red-500 p-4 active:opacity-80 disabled:opacity-50"
            >
              <Text className="font-bold text-white">
                {updateStatus.isPending ? "Annulation..." : "Annuler mon signalement"}
              </Text>
            </Pressable>
          </View>
        )}

        <View className="mb-5 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 font-bold text-card-foreground">Localisation</Text>
          <Text className="mb-2 text-muted-foreground">Ville : {formatLabel(incident.ville)}</Text>
          <Text className="mb-2 text-muted-foreground">Quartier : {formatLabel(incident.quartier ?? "Non précisé")}</Text>
          <Text className="text-muted-foreground">Axe routier : {formatLabel(incident.axeRoutier ?? "Non précisé")}</Text>
        </View>

        {incident.latitude != null && incident.longitude != null ? (
          <View className="mt-4 border-t border-border pt-4">
            <Text className="mb-2 font-bold text-card-foreground">Position GPS</Text>
            <Text className="mb-2 text-muted-foreground">Latitude : {incident.latitude.toFixed(6)}</Text>
            <Text className="text-muted-foreground">Longitude : {incident.longitude.toFixed(6)}</Text>
            {incident.locationAccuracy != null ? (
              <Text className="text-muted-foreground">
                Précision GPS : ±{incident.locationAccuracy.toFixed(0)} m
              </Text>
            ) : null}
          </View>
        ) : (
          <View className="mt-4 border-t border-border pt-4">
            <Text className="text-muted-foreground">Aucune position GPS enregistrée.</Text>
          </View>
        )}

        <View className="rounded-3xl border border-border bg-card p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-bold text-card-foreground">Médias</Text>
            <Text className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {incident.medias?.length ?? 0} fichier{(incident.medias?.length ?? 0) > 1 ? "s" : ""}
            </Text>
          </View>

          {canUpload ? (
            <View className="mb-4 gap-3">
              <Pressable
                onPress={pickFromGallery}
                disabled={isUploading}
                className="items-center rounded-2xl bg-brand p-4 active:opacity-80 disabled:opacity-50"
              >
                <Text className="font-bold text-white">
                  {isUploading ? "Upload en cours..." : "Choisir depuis la galerie"}
                </Text>
              </Pressable>
              <Pressable
                onPress={takePhoto}
                disabled={isUploading}
                className="items-center rounded-2xl border border-border bg-card p-4 active:opacity-80 disabled:opacity-50"
              >
                <Text className="font-bold text-card-foreground">Prendre une photo</Text>
              </Pressable>
              {uploadMessage ? (
                <Text className="text-sm text-muted-foreground">{uploadMessage}</Text>
              ) : null}
            </View>
          ) : null}

          {incident.medias?.length ? (
            <View className="gap-3">
              {incident.medias.map((media) => (
                <View key={media.id} className="overflow-hidden rounded-2xl border border-border">
                  <Image
                    source={{ uri: `${API_URL}${media.url}` }}
                    className="h-56 w-full bg-muted"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-muted-foreground">Aucun média pour cet incident.</Text>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}