import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  formatLabel,
  INCIDENT_TYPES,
  VILLES,
  QUARTIERS,
  AXES_ROUTIERS,
} from "@my-better-t-app/hooks";
import type {
  IncidentType,
  Ville,
  Quartier,
  AxeRoutier,
} from "@my-better-t-app/api/contracts/incident";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/create")({
  component: RouteComponent,
});

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {children}
    </label>
  );
}

function inputClass(hasError = false) {
  return [
    "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground",
    "placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
    "transition-all duration-150",
    hasError ? "border-destructive" : "border-input",
  ].join(" ");
}

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>(INCIDENT_TYPES[0]);
  const [ville, setVille] = useState<Ville>(VILLES[0]);
  const [quartier, setQuartier] = useState<Quartier>(QUARTIERS[0]);
  const [axeRoutier, setAxeRoutier] = useState<AxeRoutier>(AXES_ROUTIERS[0]);
  const [errorMessage, setErrorMessage] = useState("");

  const incidentsQueryOptions = orpc.incident.list.queryOptions();
  const authQuery = useQuery({
    ...orpc.privateData.queryOptions(),
    retry: false,
  });

  const createIncident = useMutation(
    orpc.incident.create.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: incidentsQueryOptions.queryKey,
        });
      },
    })
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    try {
      await createIncident.mutateAsync({
        title,
        description,
        type,
        ville,
        quartier,
        axeRoutier,
      });

      await navigate({ to: "/incidents" });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link
        to="/incidents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour aux incidents
      </Link>

      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Nouveau
        </p>
        <h1 className="font-display text-4xl leading-tight">
          Signaler un incident
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Remplissez le formulaire pour alerter la communauté.
        </p>
      </div>

      {authQuery.isLoading && (
        <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground animate-pulse animate-fade-up">
          Vérification de votre session…
        </div>
      )}

      {!authQuery.isLoading && !authQuery.isSuccess && (
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-fade-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🔒</span>
            <div>
              <h2 className="font-semibold text-base">Connexion requise</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vous devez être connecté pour signaler un incident.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Link
              to="/login"
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Se connecter
            </Link>
            <Link
              to="/incidents"
              className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              Voir les incidents
            </Link>
          </div>
        </div>
      )}

      {authQuery.isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up delay-1">
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Informations générales
            </p>

            <div>
              <FieldLabel>
                Titre <span className="text-brand">*</span>
              </FieldLabel>
              <input
                className={inputClass()}
                placeholder="Ex : Accident sur l'avenue Mobutu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={`${inputClass()} resize-none min-h-100px`} // possible de mettre entre []
                placeholder="Décrivez ce qui se passe avec le plus de détails possible…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <FieldLabel>
                Type d'incident <span className="text-brand">*</span>
              </FieldLabel>
              <select
                className={inputClass()}
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatLabel(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Localisation
            </p>

            <div>
              <FieldLabel>
                Ville <span className="text-brand">*</span>
              </FieldLabel>
              <select
                className={inputClass()}
                value={ville}
                onChange={(e) => setVille(e.target.value as Ville)}
              >
                {VILLES.map((v) => (
                  <option key={v} value={v}>
                    {formatLabel(v)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Quartier</FieldLabel>
                <select
                  className={inputClass()}
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value as Quartier)}
                >
                  {QUARTIERS.map((q) => (
                    <option key={q} value={q}>
                      {formatLabel(q)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Axe routier</FieldLabel>
                <select
                  className={inputClass()}
                  value={axeRoutier}
                  onChange={(e) => setAxeRoutier(e.target.value as AxeRoutier)}
                >
                  {AXES_ROUTIERS.map((a) => (
                    <option key={a} value={a}>
                      {formatLabel(a)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={createIncident.isPending || !title.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            {createIncident.isPending ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Envoi en cours…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Signaler l'incident
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
