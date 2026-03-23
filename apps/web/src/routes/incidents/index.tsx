import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useIncidents,
  formatLabel,
  type IncidentType,
  type IncidentStatus,
} from "@my-better-t-app/hooks";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  component: RouteComponent,
});

const typeLabels: Record<IncidentType, string> = {
  ACCIDENT: "Accident",
  VOL: "Vol",
  INCENDIE: "Incendie",
  INONDATION: "Inondation",
  ROUTE_DANGEREUSE: "Route dangereuse",
  URGENCE_MEDICALE: "Urgence médicale",
};

const statusLabels: Record<IncidentStatus, string> = {
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  ANNULE: "Annulé",
};

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function RouteComponent() {
  const { data: incidents = [], isLoading, error } = useIncidents(orpc);

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Chargement des incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p>Erreur lors du chargement des incidents.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez les signalements récents faits par les utilisateurs.
          </p>
        </div>

        <Link
          to="/incidents/create"
          className="rounded-md border px-4 py-2 font-medium"
        >
          Signaler un incident
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Aucun incident pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold">{incident.title}</h2>

                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {typeLabels[incident.type] ?? incident.type}
                    </span>

                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {statusLabels[incident.status] ?? incident.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {incident.description}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground md:text-right">
                  <p>Signalé le {formatDate(incident.createdAt)}</p>
                  {"reporter" in incident && incident.reporter ? (
                    <p>
                      Par {incident.reporter.name || incident.reporter.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <span className="font-medium">Ville :</span>{" "}
                  {formatLabel(incident.ville)}
                </div>
                <div>
                  <span className="font-medium">Quartier :</span>{" "}
                  {incident.quartier
                    ? formatLabel(incident.quartier)
                    : "Non précisé"}
                </div>
                <div>
                  <span className="font-medium">Axe routier :</span>{" "}
                  {incident.axeRoutier
                    ? formatLabel(incident.axeRoutier)
                    : "Non précisé"}
                </div>
              </div>

              {"medias" in incident && Array.isArray(incident.medias) && (
                <div className="text-sm text-muted-foreground">
                  Médias associés : {incident.medias.length}
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  to="/incidents/$incidentId"
                  params={{ incidentId: incident.id }}
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                  Voir le détail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}