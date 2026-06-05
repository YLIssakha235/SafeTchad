import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { orpc } from "@/utils/orpc";
import { formatLabel, useIncidents } from "@my-better-t-app/hooks";
import type { IncidentType } from "@my-better-t-app/api/contracts/incident";

const TYPE_LABEL: Record<IncidentType, string> = {
  ACCIDENT: "Accident",
  VOL: "Vol",
  INCENDIE: "Incendie",
  INONDATION: "Inondation",
  ROUTE_DANGEREUSE: "Route dangereuse",
  URGENCE_MEDICALE: "Urgence médicale",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <View className="w-[48%] rounded-3xl border border-border bg-card p-4">
      <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-3 text-3xl font-bold text-card-foreground">
        {value}
      </Text>
      <Text className="mt-1 text-xs text-muted-foreground">{sub}</Text>
    </View>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardScreen() {
  const { list } = useIncidents(orpc);
  const incidents = list.data ?? [];

  const total = incidents.length;
  const enCours = incidents.filter((i) => i.status === "EN_COURS").length;
  const resolus = incidents.filter((i) => i.status === "RESOLU").length;
  const annules = incidents.filter((i) => i.status === "ANNULE").length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = incidents.filter(
    (i) => new Date(i.createdAt) >= oneWeekAgo
  ).length;

  const byType = incidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const byZone = incidents.reduce<Record<string, number>>((acc, i) => {
    const key = `${formatLabel(i.quartier ?? "NDJAMENA")} · ${formatLabel(
      i.axeRoutier ?? "Non précisé"
    )}`;

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topZones = Object.entries(byZone)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const fmt = (n: number) => (list.isLoading ? "…" : String(n));

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 py-8">
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tableau de bord
        </Text>

        <Text className="mt-2 text-4xl font-bold text-foreground">
          Dashboard SafeTchad
        </Text>

        <Text className="mt-2 text-sm text-muted-foreground">
          Aperçu de l’activité et du suivi des incidents.
        </Text>

        {list.error && incidents.length > 0 && (
          <View className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Text className="text-sm text-amber-500">
              Mode hors ligne : affichage des dernières données disponibles.
            </Text>
          </View>
        )}

        {list.error && incidents.length === 0 && (
          <View className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <Text className="text-sm text-red-500">
              Impossible de charger les statistiques.
            </Text>
          </View>
        )}

        <View className="mt-6 flex-row flex-wrap justify-between gap-y-4">
          <StatCard label="Total" value={fmt(total)} sub="incidents signalés" />
          <StatCard label="En cours" value={fmt(enCours)} sub="à suivre" />
          <StatCard label="Résolus" value={fmt(resolus)} sub="clôturés" />
          <StatCard label="Cette semaine" value={fmt(thisWeek)} sub="nouveaux" />
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Répartition par type
          </Text>

          {topTypes.length === 0 ? (
            <Text className="mt-4 text-sm text-muted-foreground">
              Aucune donnée.
            </Text>
          ) : (
            <View className="mt-4 gap-3">
              {topTypes.map(([type, count]) => {
                const percent =
                  total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <View key={type}>
                    <View className="mb-1 flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-card-foreground">
                        {TYPE_LABEL[type as IncidentType] ?? type}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {count}
                      </Text>
                    </View>

                    <View className="h-2 overflow-hidden rounded-full bg-muted">
                      <View
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${percent}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Zones les plus touchées
          </Text>

          {topZones.length === 0 ? (
            <Text className="mt-4 text-sm text-muted-foreground">
              Aucune zone.
            </Text>
          ) : (
            <View className="mt-4 gap-3">
              {topZones.map(([zone, count]) => (
                <View
                  key={zone}
                  className="flex-row items-center justify-between rounded-2xl bg-muted px-4 py-3"
                >
                  <Text className="flex-1 text-sm text-card-foreground">
                    {zone}
                  </Text>
                  <Text className="ml-3 text-xs text-muted-foreground">
                    {count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Incidents récents
            </Text>

            <Text className="text-xs text-muted-foreground">
              {annules} annulé{annules !== 1 ? "s" : ""}
            </Text>
          </View>

          {recentIncidents.length === 0 ? (
            <Text className="mt-4 text-sm text-muted-foreground">
              Aucun incident récent.
            </Text>
          ) : (
            <View className="mt-4 gap-3">
              {recentIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={{
                    pathname: "/(drawer)/(tabs)/incidents/[incidentId]",
                    params: { incidentId: incident.id },
                  }}
                  asChild
                >
                  <Pressable className="rounded-2xl border border-border bg-background px-4 py-3 active:opacity-80">
                    <View className="flex-row justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {incident.title}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                          {formatLabel(incident.quartier ?? "NDJAMENA")} ·{" "}
                          {formatDate(incident.createdAt)}
                        </Text>
                      </View>

                      <Text className="text-xs text-muted-foreground">
                        {incident.status === "EN_COURS"
                          ? "En cours"
                          : incident.status === "RESOLU"
                            ? "Résolu"
                            : "Annulé"}
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 flex-row gap-3">
          <Link href="/(drawer)/(tabs)/incidents/create" asChild>
            <Pressable className="flex-1 rounded-3xl bg-brand p-4 active:opacity-80">
              <Text className="text-center text-sm font-semibold text-white">
                + Signaler
              </Text>
            </Pressable>
          </Link>

          <Link href="/(drawer)/(tabs)/incidents" asChild>
            <Pressable className="flex-1 rounded-3xl border border-border bg-card p-4 active:opacity-80">
              <Text className="text-center text-sm font-semibold text-card-foreground">
                Voir incidents
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}