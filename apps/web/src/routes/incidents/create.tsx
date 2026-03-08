import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("ACCIDENT");
  const [ville, setVille] = useState("NDJAMENA");
  const [quartier, setQuartier] = useState("");
  const [axeRoutier, setAxeRoutier] = useState("");

  const createIncident = useMutation(orpc.incident.create.mutationOptions());

  async function handleSubmit() {
    await createIncident.mutateAsync({
      title,
      description,
      type: type as any,
      ville: ville as any,
      quartier: quartier ? (quartier as any) : undefined,
      axeRoutier: axeRoutier || undefined,
    });
    navigate({ to: "/incidents" });
  }

  return (
    <div>
      <h1>Signaler un incident</h1>

      <input
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="ACCIDENT">Accident</option>
        <option value="VOL">Vol</option>
        <option value="INCENDIE">Incendie</option>
        <option value="INONDATION">Inondation</option>
        <option value="ROUTE_DANGEREUSE">Route dangereuse</option>
        <option value="URGENCE_MEDICALE">Urgence médicale</option>
      </select>

      <select value={ville} onChange={(e) => setVille(e.target.value)}>
        <option value="NDJAMENA">N'Djamena</option>
      </select>

      <select value={quartier} onChange={(e) => setQuartier(e.target.value)}>
        <option value="">-- Quartier (optionnel) --</option>
        <option value="FARCHA">Farcha</option>
        <option value="DIGUEL">Diguel</option>
      </select>

      <input
        placeholder="Axe routier (optionnel)"
        value={axeRoutier}
        onChange={(e) => setAxeRoutier(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={createIncident.isPending}>
        {createIncident.isPending ? "Envoi..." : "Signaler"}
      </button>
    </div>
  );
}