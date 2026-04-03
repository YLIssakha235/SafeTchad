import { createFileRoute, Link } from "@tanstack/react-router";
import { useIncidents, formatLabel } from "@my-better-t-app/hooks";
import type { IncidentType, IncidentStatus } from "@my-better-t-app/api/contracts/incident";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.orpc.incident.list.queryOptions()
    );
  },
  component: RouteComponent,
});

const TYPE_CONFIG: Record<
  IncidentType,
  { label: string; color: string; bg: string; icon: string }
> = {
  ACCIDENT: { label: "Accident", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", icon: "" },
  VOL: { label: "Vol", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", icon: "" },
  INCENDIE: { label: "Incendie", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", icon: "" },
  INONDATION: { label: "Inondation", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", icon: "" },
  ROUTE_DANGEREUSE: { label: "Route dang.", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40", icon: "" },
  URGENCE_MEDICALE: { label: "Urgence méd.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", icon: "" },
};

const TYPE_BORDER: Record<IncidentType, string> = {
  ACCIDENT: "border-l-amber-500",
  VOL: "border-l-red-500",
  INCENDIE: "border-l-orange-500",
  INONDATION: "border-l-blue-500",
  ROUTE_DANGEREUSE: "border-l-violet-500",
  URGENCE_MEDICALE: "border-l-emerald-500",
};

const STATUS_CONFIG: Record<IncidentStatus, { label: string; dot: string }> = {
  EN_COURS: { label: "En cours", dot: "bg-amber-400" },
  RESOLU: { label: "Résolu", dot: "bg-emerald-500" },
  ANNULE: { label: "Annulé", dot: "bg-zinc-400" },
};

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-l-4 border-l-border bg-card p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-32 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="h-3 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}

function RouteComponent() {
  const { list: incidents, isLoading, error, isFetching } = useIncidents(orpc);
  const hasIncidents = incidents.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            SafeTchad
          </p>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight">
            Incidents
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Signalements récents de la communauté
          </p>
        </div>

        <Link
          to="/incidents/create"
          className="w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Signaler
        </Link>
      </div>

      {!isLoading && hasIncidents && (
        <div className="animate-fade-up delay-1 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
          </span>

          {isFetching && !error && (
            <span className="text-xs text-muted-foreground">Actualisation…</span>
          )}
        </div>
      )}

      {error && hasIncidents && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300 animate-fade-up">
          Mode hors ligne : affichage des dernières données disponibles.
        </div>
      )}

      {isLoading && !hasIncidents && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !hasIncidents && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive animate-fade-up">
          Erreur lors du chargement des incidents.
        </div>
      )}

      {!isLoading && !error && !hasIncidents && (
        <div className="rounded-xl border bg-card p-12 text-center animate-fade-up">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-medium text-foreground">Aucun incident signalé</p>
          <p className="text-sm text-muted-foreground mt-1">
            Soyez le premier à signaler un incident dans votre zone.
          </p>
        </div>
      )}

      {hasIncidents && (
        <div className="space-y-3">
          {incidents.map((incident, i) => {
            const type = TYPE_CONFIG[incident.type] ?? {
              label: incident.type,
              color: "text-muted-foreground",
              bg: "bg-muted",
              icon: "",
            };

            const borderColor = TYPE_BORDER[incident.type] ?? "border-l-border";
            const status = STATUS_CONFIG[incident.status];

            return (
              <div
                key={incident.id}
                className={`animate-fade-up delay-${Math.min(i + 1, 7)}`}
              >
                <Link
                  to="/incidents/$incidentId"
                  params={{ incidentId: incident.id }}
                  className={[
                    "group block rounded-xl border border-l-4 bg-card",
                    borderColor,
                    "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
                  ].join(" ")}
                >
                  <div className="p-5 space-y-3.5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="shrink-0 space-y-0.5 text-left sm:text-right">
                            {incident.title}
                          </div>

                          <span
                            className={[
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0",
                              type.color,
                              type.bg,
                            ].join(" ")}
                          >
                            {type.icon} {type.label}
                          </span>

                          {status && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground shrink-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          )}
                        </div>

                        {incident.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {incident.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-xs font-medium text-foreground">
                          {formatDate(incident.createdAt)}
                        </p>
                        {"reporter" in incident && incident.reporter && (
                          <p className="text-xs text-muted-foreground">
                            {incident.reporter.name || incident.reporter.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-0.5 border-t border-border flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        <span className="font-medium text-foreground">
                          {formatLabel(incident.ville)}
                        </span>
                      </span>

                      {incident.quartier && <span>· {formatLabel(incident.quartier)}</span>}
                      {incident.axeRoutier && <span>· {formatLabel(incident.axeRoutier)}</span>}

                      {"medias" in incident &&
                        Array.isArray(incident.medias) &&
                        incident.medias.length > 0 && (
                          <span className="ml-auto flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="M21 15l-5-5L5 21" />
                            </svg>
                            {incident.medias.length}
                          </span>
                        )}

                      <span className="text-brand opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs font-medium flex items-center gap-0.5 sm:ml-auto">
                        Voir →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
