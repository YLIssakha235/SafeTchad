import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: incidents, isLoading } = useQuery(
    orpc.incident.list.queryOptions({})
  );

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Incidents</h1>

      {incidents?.length === 0 && <p>Aucun incident pour le moment.</p>}

      {incidents?.map((incident) => (
        <div key={incident.id}>
          <h2>{incident.title}</h2>
          <p>{incident.description}</p>
          <p>Type : {incident.type}</p>
          <p>Statut : {incident.status}</p>
          <p>Ville : {incident.ville}</p>
          {incident.quartier && <p>Quartier : {incident.quartier}</p>}
          {incident.axeRoutier && <p>Axe routier : {incident.axeRoutier}</p>}
        </div>
      ))}
    </div>
  );
}