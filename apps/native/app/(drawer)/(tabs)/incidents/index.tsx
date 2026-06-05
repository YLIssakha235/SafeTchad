import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import { orpc } from "@/utils/orpc";
import {
  formatLabel,
  INCIDENT_TYPES,
  useIncidents,
} from "@my-better-t-app/hooks";
import type {
  IncidentStatus,
  IncidentType,
} from "@my-better-t-app/api/contracts/incident";

const STATUS_LABELS: Record<IncidentStatus, string> = {
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  ANNULE: "Annulé",
};

const TYPE_LABELS: Record<IncidentType, string> = {
  ACCIDENT: "Accident",
  VOL: "Vol",
  INCENDIE: "Incendie",
  INONDATION: "Inondation",
  ROUTE_DANGEREUSE: "Route dangereuse",
  URGENCE_MEDICALE: "Urgence médicale",
};

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeClass(status: IncidentStatus) {
  if (status === "EN_COURS") return "bg-yellow-500/15 text-yellow-400";
  if (status === "RESOLU") return "bg-green-500/15 text-green-400";
  return "bg-red-500/15 text-red-400";
}

export default function IncidentsScreen() {
  const { list } = useIncidents(orpc);
  const incidents = list.data ?? [];
  const { isLoading, error, isFetching, refetch } = list;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TOUS" | IncidentStatus>("TOUS");
  const [typeFilter, setTypeFilter] = useState<"TOUS" | IncidentType>("TOUS");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    if (statusFilter !== "TOUS") {
      result = result.filter((incident) => incident.status === statusFilter);
    }
    if (typeFilter !== "TOUS") {
      result = result.filter((incident) => incident.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((incident) => {
        return (
          incident.title.toLowerCase().includes(q) ||
          incident.description.toLowerCase().includes(q) ||
          (incident.quartier ?? "").toLowerCase().includes(q) ||
          (incident.axeRoutier ?? "").toLowerCase().includes(q)
        );
      });
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [incidents, search, statusFilter, typeFilter]);

  const enCoursCount = incidents.filter((i) => i.status === "EN_COURS").length;
  const resoluCount = incidents.filter((i) => i.status === "RESOLU").length;
  const annuleCount = incidents.filter((i) => i.status === "ANNULE").length;

  return (
    <Container className="bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="mb-6">
          <Text className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            SafeTchad
          </Text>
          <Text className="text-4xl font-bold text-foreground">Incidents</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Suivi des signalements récents de la communauté
          </Text>
        </View>

        <Link href="/(drawer)/(tabs)/incidents/create" asChild>
          <Pressable className="mb-5 rounded-3xl bg-brand p-4 active:opacity-80">
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="add" size={20} color="white" />
              <Text className="font-bold text-white">Signaler un incident</Text>
            </View>
          </Pressable>
        </Link>

        {!isLoading && incidents.length > 0 && (
          <View className="mb-5 flex-row gap-3">
            <View className="flex-1 rounded-3xl border border-border bg-card p-4">
              <Text className="text-xs uppercase text-muted-foreground">En cours</Text>
              <Text className="text-2xl font-bold text-card-foreground">{enCoursCount}</Text>
            </View>
            <View className="flex-1 rounded-3xl border border-border bg-card p-4">
              <Text className="text-xs uppercase text-muted-foreground">Résolus</Text>
              <Text className="text-2xl font-bold text-card-foreground">{resoluCount}</Text>
            </View>
            <View className="flex-1 rounded-3xl border border-border bg-card p-4">
              <Text className="text-xs uppercase text-muted-foreground">Annulés</Text>
              <Text className="text-2xl font-bold text-card-foreground">{annuleCount}</Text>
            </View>
          </View>
        )}

        <View className="mb-5 rounded-3xl border border-border bg-card p-4">
          <Text className="mb-3 font-semibold text-card-foreground">Recherche et filtres</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un incident…"
            placeholderTextColor="#777780"
            className="mb-3 rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {(["TOUS", "EN_COURS", "RESOLU", "ANNULE"] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  className={`rounded-full border px-4 py-2 ${
                    statusFilter === status ? "border-brand bg-brand" : "border-border bg-background"
                  }`}
                >
                  <Text className={statusFilter === status ? "font-medium text-white" : "text-foreground"}>
                    {status === "TOUS" ? "Tous" : STATUS_LABELS[status]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {(["TOUS", ...INCIDENT_TYPES] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setTypeFilter(type)}
                  className={`rounded-full border px-4 py-2 ${
                    typeFilter === type ? "border-brand bg-brand" : "border-border bg-background"
                  }`}
                >
                  <Text className={typeFilter === type ? "font-medium text-white" : "text-foreground"}>
                    {type === "TOUS" ? "Tous types" : TYPE_LABELS[type]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {isFetching && !error && (
            <Text className="mt-3 text-xs text-muted-foreground">Actualisation…</Text>
          )}
        </View>

        {isLoading && incidents.length === 0 && (
          <Text className="text-muted-foreground">Chargement des incidents…</Text>
        )}

        {error && incidents.length === 0 && (
          <View className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5">
            <Text className="font-semibold text-red-500">Erreur lors du chargement des incidents.</Text>
          </View>
        )}

        {!isLoading && !error && incidents.length === 0 && (
          <View className="items-center rounded-3xl border border-border bg-card p-8">
            <Text className="mb-3 text-4xl">📭</Text>
            <Text className="font-bold text-card-foreground">Aucun incident signalé</Text>
            <Text className="mt-2 text-center text-muted-foreground">
              Soyez le premier à signaler un incident.
            </Text>
          </View>
        )}

        {filteredIncidents.length === 0 && incidents.length > 0 && (
          <View className="items-center rounded-3xl border border-border bg-card p-8">
            <Text className="mb-3 text-4xl">🔎</Text>
            <Text className="font-bold text-card-foreground">Aucun résultat</Text>
            <Text className="mt-2 text-center text-muted-foreground">
              Essayez un autre filtre ou mot-clé.
            </Text>
          </View>
        )}

        <View className="gap-3">
          {filteredIncidents.map((incident) => (
            <Link
              key={incident.id}
              href={{
                pathname: "/(drawer)/(tabs)/incidents/[incidentId]",
                params: { incidentId: incident.id },
              }}
              asChild
            >
              <Pressable className="rounded-3xl border border-border bg-card p-5 active:opacity-80">
                <View className="mb-3 flex-row justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-card-foreground">{incident.title}</Text>
                    <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
                      {incident.description}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">{formatDate(incident.createdAt)}</Text>
                </View>
                <View className="mb-3 flex-row flex-wrap gap-2">
                  <Text className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                    {TYPE_LABELS[incident.type]}
                  </Text>
                  <Text className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(incident.status)}`}>
                    {STATUS_LABELS[incident.status]}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2 border-t border-border pt-3">
                  <Text className="text-xs text-muted-foreground">{formatLabel(incident.ville)}</Text>
                  <Text className="text-xs text-muted-foreground">· {formatLabel(incident.quartier ?? "Non précisé")}</Text>
                  <Text className="text-xs text-muted-foreground">· {formatLabel(incident.axeRoutier ?? "Non précisé")}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}
