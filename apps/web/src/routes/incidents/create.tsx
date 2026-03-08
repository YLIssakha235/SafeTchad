import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/create")({
  component: RouteComponent,
});

type IncidentType =
  | "ACCIDENT"
  | "VOL"
  | "INCENDIE"
  | "INONDATION"
  | "ROUTE_DANGEREUSE"
  | "URGENCE_MEDICALE";

type Ville = "NDJAMENA";
type Quartier = "FARCHA" | "DIGUEL" | "";

function RouteComponent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>("ACCIDENT");
  const [ville, setVille] = useState<Ville>("NDJAMENA");
  const [quartier, setQuartier] = useState<Quartier>("");
  const [axeRoutier, setAxeRoutier] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const createIncident = useMutation(
    orpc.incident.create.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/incidents" });
      },
      onError: (error) => {
        setErrorMessage(
          error.message || "Une erreur est survenue lors du signalement."
        );
      },
    })
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    await createIncident.mutateAsync({
      title,
      description,
      type,
      ville,
      quartier: quartier || undefined,
      axeRoutier: axeRoutier || undefined,
    });
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Signaler un incident</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Titre</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Type d'incident</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
          >
            <option value="ACCIDENT">Accident</option>
            <option value="VOL">Vol</option>
            <option value="INCENDIE">Incendie</option>
            <option value="INONDATION">Inondation</option>
            <option value="ROUTE_DANGEREUSE">Route dangereuse</option>
            <option value="URGENCE_MEDICALE">Urgence médicale</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Ville</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={ville}
            onChange={(e) => setVille(e.target.value as Ville)}
          >
            <option value="NDJAMENA">N'Djamena</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Quartier</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value as Quartier)}
          >
            <option value="">-- Quartier (optionnel) --</option>
            <option value="FARCHA">Farcha</option>
            <option value="DIGUEL">Diguel</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Axe routier</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Axe routier (optionnel)"
            value={axeRoutier}
            onChange={(e) => setAxeRoutier(e.target.value)}
          />
        </div>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          className="border rounded px-4 py-2"
          disabled={createIncident.isPending}
        >
          {createIncident.isPending ? "Envoi..." : "Signaler"}
        </button>
      </form>
    </div>
  );
}