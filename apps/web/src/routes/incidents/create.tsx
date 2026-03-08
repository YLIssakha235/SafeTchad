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
type Quartier = "FARCHA" | "DIGUEL";

function RouteComponent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>("ACCIDENT");
  const [ville, setVille] = useState<Ville>("NDJAMENA");
  const [quartier, setQuartier] = useState<Quartier>("FARCHA");
  const [axeRoutier, setAxeRoutier] = useState("Rond point cheval");
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
      quartier,
      axeRoutier,
    });
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Signaler un incident</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remplissez le formulaire pour signaler un incident dans votre zone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Titre</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Ex: Accident sur l'avenue Mobutu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            placeholder="Décrivez ce qui se passe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Type d'incident</label>
          <select
            className="w-full rounded-md border px-3 py-2"
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Ville</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={ville}
            onChange={(e) => setVille(e.target.value as Ville)}
          >
            <option value="NDJAMENA">N'Djamena</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quartier</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value as Quartier)}
          >
            <option value="FARCHA">Farcha</option>
            <option value="DIGUEL">Diguel</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Axe routier</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Ex: Rond point cheval"
            value={axeRoutier}
            onChange={(e) => setAxeRoutier(e.target.value)}
          />
        </div>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          className="w-full rounded-md border px-4 py-2 font-medium"
          disabled={createIncident.isPending}
        >
          {createIncident.isPending ? "Envoi..." : "Signaler l'incident"}
        </button>
      </form>
    </div>
  );
}