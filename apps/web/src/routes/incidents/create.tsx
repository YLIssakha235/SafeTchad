import { useState } from "react";
import { useCreateIncident, formatLabel,IncidentType, Ville, Quartier, AxeRoutier } from "@my-better-t-app/hooks";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>(IncidentType.ACCIDENT);
  const [ville, setVille] = useState<Ville>(Ville.NDJAMENA);
  const [quartier, setQuartier] = useState<Quartier>(Quartier.FARCHA);
  const [axeRoutier, setAxeRoutier] = useState<AxeRoutier>(AxeRoutier.Avenue_MOBUTU);
  const [errorMessage, setErrorMessage] = useState("");

  const createIncident = useCreateIncident(orpc);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    try {
      await createIncident.mutateAsync({ title, description, type, ville, quartier, axeRoutier });
      await navigate({ to: "/incidents" });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue lors du signalement."
      );
    }
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
            {Object.values(IncidentType).map((t) => (
              <option key={t} value={t}>{formatLabel(t)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ville</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={ville}
            onChange={(e) => setVille(e.target.value as Ville)}
          >
            {Object.values(Ville).map((v) => (
              <option key={v} value={v}>{formatLabel(v)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quartier</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={quartier}
            onChange={(e) => setQuartier(e.target.value as Quartier)}
          >
            {Object.values(Quartier).map((q) => (
              <option key={q} value={q}>{formatLabel(q)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Axe routier</label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={axeRoutier}
            onChange={(e) => setAxeRoutier(e.target.value as AxeRoutier)}
          >
            {Object.values(AxeRoutier).map((a) => (
              <option key={a} value={a}>{formatLabel(a)}</option>
            ))}
          </select>
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