import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: incidents, isLoading } = useQuery(
    orpc.incident.list.queryOptions({})
  );

  if (isLoading) {
    return <p className="p-6">Chargement des incidents...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Incidents</h1>

        <Link
          to="/incidents/create"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Signaler un incident
        </Link>
      </div>

      {incidents?.length === 0 && (
        <p className="text-gray-500">Aucun incident pour le moment.</p>
      )}

      <div className="space-y-4">
        {incidents?.map((incident) => (
          <div key={incident.id} className="border p-4 rounded">
            <h2 className="font-semibold">{incident.title}</h2>

            <p>{incident.description}</p>

            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <p>Type : {incident.type}</p>
              <p>Statut : {incident.status}</p>
              <p>Ville : {incident.ville}</p>

              {incident.quartier && (
                <p>Quartier : {incident.quartier}</p>
              )}

              {incident.axeRoutier && (
                <p>Axe routier : {incident.axeRoutier}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}