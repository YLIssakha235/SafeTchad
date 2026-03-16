import { createFileRoute, Link } from "@tanstack/react-router";
import { useIncidents, IncidentType, IncidentStatus, formatLabel } from "@my-better-t-app/hooks";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  component: RouteComponent,
});

const typeLabels: Record<IncidentType, string> = {
  [IncidentType.ACCIDENT]: "Accident",
  [IncidentType.VOL]: "Vol",
  [IncidentType.INCENDIE]: "Incendie",
  [IncidentType.INONDATION]: "Inondation",
  [IncidentType.ROUTE_DANGEREUSE]: "Route dangereuse",
  [IncidentType.URGENCE_MEDICALE]: "Urgence médicale",
};

const statusLabels: Record<IncidentStatus, string> = {
  [IncidentStatus.EN_COURS]: "En cours",
  [IncidentStatus.RESOLU]: "Résolu",
  [IncidentStatus.ANNULE]: "Annulé",
};

function RouteComponent() {
  const { data: incidents, isLoading, error } = useIncidents(orpc);

  if (isLoading) return <div className="p-6"><p>Chargement des incidents...</p></div>;
  if (error) return <div className="p-6"><p>Erreur lors du chargement des incidents.</p></div>;

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les signalements récents faits par les utilisateurs.
          </p>
        </div>
        <Link to="/incidents/create" className="rounded-md px-4 py-2 font-medium border">
          Signaler un incident
        </Link>
      </div>

      {incidents?.length === 0 && (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">Aucun incident pour le moment.</p>
        </div>
      )}

      <div className="grid gap-4">
        {incidents?.map((incident) => (
          <div key={incident.id} className="rounded-xl border p-5 shadow-sm space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{incident.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{incident.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {typeLabels[incident.type as IncidentType] ?? incident.type}
                </span>
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {statusLabels[incident.status as IncidentStatus] ?? incident.status}
                </span>
              </div>
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-3">
              <div><span className="font-medium">Ville :</span> {formatLabel(incident.ville)}</div>
              <div><span className="font-medium">Quartier :</span> {incident.quartier ? formatLabel(incident.quartier) : "Non précisé"}</div>
              <div><span className="font-medium">Axe routier :</span> {incident.axeRoutier ? formatLabel(incident.axeRoutier) : "Non précisé"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}