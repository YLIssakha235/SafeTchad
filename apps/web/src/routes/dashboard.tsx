import { createFileRoute, redirect, Link } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

import { useIncidents } from "@my-better-t-app/hooks";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },

  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }

    await context.queryClient.ensureQueryData(
      context.orpc.incident.list.queryOptions()
    );
  },

  component: RouteComponent,
});

function StatCard({
  label,
  value,
  sub,
  icon,
  delay = "",
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  delay?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 space-y-2 animate-fade-up ${delay}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <span className="text-lg">{icon}</span>
      </div>

      <p
        className={`font-display text-3xl sm:text-4xl leading-none tabular-nums ${
          accent ? "text-brand" : ""
        }`}
      >
        {value}
      </p>

      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const { list: incidents, isLoading, error, isFetching } = useIncidents(orpc);

  const firstName = session?.user.name?.split(" ")[0] ?? "vous";

  const total = incidents.length;
  const enCours = incidents.filter((i) => i.status === "EN_COURS").length;
  const resolus = incidents.filter((i) => i.status === "RESOLU").length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = incidents.filter((i) => new Date(i.createdAt) >= oneWeekAgo).length;

  const fmt = (n: number) => (isLoading ? "…" : String(n));

  const byType = incidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const TYPE_LABEL: Record<string, string> = {
    ACCIDENT: "Accident",
    VOL: "Vol",
    INCENDIE: "Incendie",
    INONDATION: "Inondation",
    ROUTE_DANGEREUSE: "Route dang.",
    URGENCE_MEDICALE: "Urgence méd.",
  };

  const TYPE_ICON: Record<string, string> = {
    ACCIDENT: "",
    VOL: "",
    INCENDIE: "",
    INONDATION: "",
    ROUTE_DANGEREUSE: "",
    URGENCE_MEDICALE: "",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Tableau de bord
        </p>

        <h1 className="font-display text-3xl sm:text-4xl leading-tight">
          Bonjour, {firstName}
        </h1>

        <p className="mt-1.5 text-sm text-muted-foreground">
          Voici un aperçu de l'activité sur SafeTchad.
        </p>

        {error && incidents.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Mode hors ligne : affichage des dernières données disponibles.
          </div>
        )}

        {isFetching && !error && (
          <p className="mt-3 text-xs text-muted-foreground">Actualisation…</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={fmt(total)}
          icon=""
          sub="incidents signalés"
          delay="delay-1"
        />
        <StatCard
          label="En cours"
          value={fmt(enCours)}
          icon=""
          sub="non résolus"
          delay="delay-2"
          accent={enCours > 0}
        />
        <StatCard
          label="Résolus"
          value={fmt(resolus)}
          icon=""
          sub="statut résolu"
          delay="delay-3"
        />
        <StatCard
          label="Cette semaine"
          value={fmt(thisWeek)}
          icon=""
          sub="nouveaux signalements"
          delay="delay-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-2">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Répartition par type
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : error && incidents.length === 0 ? (
            <p className="text-sm text-destructive">
              Impossible de charger les statistiques.
            </p>
          ) : topTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée</p>
          ) : (
            <div className="space-y-2">
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{TYPE_ICON[type] ?? ""}</span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {TYPE_LABEL[type] ?? type}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {count}
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{
                          width: total > 0 ? `${Math.round((count / total) * 100)}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Actions rapides
          </h2>

          <Link
            to="/incidents/create"
            className="group flex items-start sm:items-center gap-4 rounded-xl border bg-card p-4 hover:border-brand/40 hover:shadow-md transition-all duration-200"
          >
            <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-all">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>

            <div>
              <p className="font-medium text-sm text-foreground">Signaler un incident</p>
              <p className="text-xs text-muted-foreground">
                Ajouter un nouveau signalement
              </p>
            </div>

            <svg
              className="ml-auto text-muted-foreground group-hover:text-brand transition-colors shrink-0"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/incidents"
            className="group flex items-start sm:items-center gap-4 rounded-xl border bg-card p-4 hover:border-brand/40 hover:shadow-md transition-all duration-200"
          >
            <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-muted group-hover:bg-brand group-hover:text-white transition-all">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </span>

            <div>
              <p className="font-medium text-sm text-foreground">Voir les incidents</p>
              <p className="text-xs text-muted-foreground">
                Parcourir tous les signalements
              </p>
            </div>

            <svg
              className="ml-auto text-muted-foreground group-hover:text-brand transition-colors shrink-0"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}