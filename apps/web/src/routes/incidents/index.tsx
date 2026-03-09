import { createFileRoute, Link } from "@tanstack/react-router";
import { useIncidents } from "@my-better-t-app/hooks";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  component: RouteComponent,
});

function getTypeLabel(type: string) {
  switch (type) {
    case "ACCIDENT":
      return "Accident";
    case "VOL":
      return "Vol";
    case "INCENDIE":
      return "Incendie";
    case "INONDATION":
      return "Inondation";
    case "ROUTE_DANGEREUSE":
      return "Route dangereuse";
    case "URGENCE_MEDICALE":
      return "Urgence médicale";
    default:
      return type;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "EN_COURS":
      return "En cours";
    case "RESOLU":
      return "Résolu";
    case "ANNULE":
      return "Annulé";
    default:
      return status;
  }
}

function RouteComponent() {
  const { data: incidents, isLoading, error } = useIncidents(orpc);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les signalements récents faits par les utilisateurs.
          </p>
        </div>

        <Link
          to="/incidents/create"
          className="rounded-md px-4 py-2 font-medium border"
        >
          Signaler un incident
        </Link>
      </div>

      {incidents?.length === 0 && (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Aucun incident pour le moment.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {incidents?.map((incident) => (
          <div
            key={incident.id}
            className="rounded-xl border p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{incident.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {incident.description}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {getTypeLabel(incident.type)}
                </span>
                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {getStatusLabel(incident.status)}
                </span>
              </div>
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-3">
              <div>
                <span className="font-medium">Ville :</span> {incident.ville}
              </div>

              <div>
                <span className="font-medium">Quartier :</span>{" "}
                {incident.quartier ?? "Non précisé"}
              </div>

              <div>
                <span className="font-medium">Axe routier :</span>{" "}
                {incident.axeRoutier ?? "Non précisé"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// la diffrecene qu'on foit avoir avec web et mobile 
// ici on fait beforloading et on affiche un message de chargement
// et on affiche les incidents dans une liste