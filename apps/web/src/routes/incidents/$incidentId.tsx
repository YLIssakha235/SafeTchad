import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { formatLabel } from "@my-better-t-app/hooks";

export const Route = createFileRoute("/incidents/$incidentId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { incidentId } = Route.useParams();

  const { data: incident, isLoading, error } = useQuery(
    orpc.incident.getById.queryOptions({
      input: { id: incidentId },
    })
  );

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (error || !incident) {
    return <div className="p-6">Incident introuvable.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{incident.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signalé le {new Date(incident.createdAt).toLocaleString()}
          </p>
        </div>

        <Link
          to="/incidents"
          className="rounded-md border px-4 py-2 font-medium"
        >
          Retour
        </Link>
      </div>

      <div className="rounded-xl border p-5 space-y-4">
        <p>{incident.description}</p>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div>
            <span className="font-medium">Ville :</span>{" "}
            {formatLabel(incident.ville)}
          </div>
          <div>
            <span className="font-medium">Quartier :</span>{" "}
            {formatLabel(incident.quartier)}
          </div>
          <div>
            <span className="font-medium">Axe routier :</span>{" "}
            {formatLabel(incident.axeRoutier)}
          </div>
        </div>

        {incident.reporter && (
          <div className="text-sm text-muted-foreground">
            Signalé par : {incident.reporter.name || incident.reporter.email}
          </div>
        )}

        {incident.medias && incident.medias.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-medium">Médias</h2>
            <div className="grid grid-cols-2 gap-2">
              {incident.medias.map((media) => (
                <img
                  key={media.id}
                  src={media.url}
                  className="rounded-md"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}