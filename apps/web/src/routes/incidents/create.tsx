import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AXES_ROUTIERS, INCIDENT_TYPES, QUARTIERS, VILLES, formatLabel, useIncidents } from "@my-better-t-app/hooks";
import type { AxeRoutier, IncidentType, Quartier, Ville } from "@my-better-t-app/api/contracts/incident";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/incidents/create")({
  component: RouteComponent,
});

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium text-foreground">{children}</label>;
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IncidentType>(INCIDENT_TYPES[0]);
  const [ville, setVille] = useState<Ville>(VILLES[0]);
  const [quartier, setQuartier] = useState<Quartier>(QUARTIERS[0]);
  const [axeRoutier, setAxeRoutier] = useState<AxeRoutier>(AXES_ROUTIERS[0]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const authQuery = useQuery({
    ...orpc.privateData.queryOptions(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { create } = useIncidents(orpc);
  const { mutateAsync: createAsync, isLoading: isCreating, error: createError } = create;
 

  useEffect(() => {
    setIsOnline(window.navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (createError) {
      setErrorMessage(
        createError instanceof Error ? createError.message : "Une erreur est survenue.",
      );
    }
  }, [createError]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!isOnline) {
      setErrorMessage("Création indisponible hors ligne.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("La description est obligatoire.");
      return;
    }

    try {
      await createAsync({
        title,
        description,
        type,
        ville,
        quartier,
        axeRoutier,
      });
      await navigate({ to: "/incidents" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link
        to="/incidents"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour aux incidents
      </Link>

      <div className="mb-8 animate-fade-up">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Nouveau
        </p>
        <h1 className="font-display text-4xl leading-tight">Signaler un incident</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Remplissez le formulaire pour alerter la communauté.
        </p>
      </div>

      {authQuery.isLoading && (
        <div className="animate-pulse animate-fade-up rounded-xl border bg-card p-5 text-sm text-muted-foreground">
          Vérification de votre session…
        </div>
      )}

      {!authQuery.isLoading && !authQuery.isSuccess && (
        <div className="animate-fade-up space-y-4 rounded-xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <div>
              <h2 className="text-base font-semibold">Connexion requise</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vous devez être connecté pour signaler un incident.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Link
              to="/login"
              className="flex flex-1 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Se connecter
            </Link>
            <Link
              to="/incidents"
              className="flex flex-1 items-center justify-center rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Voir les incidents
            </Link>
          </div>
        </div>
      )}

      {authQuery.isSuccess && (
        <form onSubmit={handleSubmit} className="animate-fade-up delay-1 space-y-5">
          {!isOnline && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              Mode hors ligne : la création d’incident est temporairement indisponible.
            </div>
          )}

          <div className="space-y-5 rounded-xl border bg-card p-6">
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
                className={`${inputClass()} min-h-24 resize-none`}
                placeholder="Décrivez ce qui se passe avec le plus de détails possible…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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

          <div className="space-y-5 rounded-xl border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Localisation</p>
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

            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !title.trim() || !description.trim() || !isOnline}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCreating ? (
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
                {isOnline ? "Signaler l'incident" : "Indisponible hors ligne"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
 