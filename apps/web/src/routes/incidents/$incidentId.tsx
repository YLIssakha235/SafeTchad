import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { orpc } from "@/utils/orpc";
import { formatLabel, useIncidentById } from "@my-better-t-app/hooks";
import type { IncidentStatus } from "@my-better-t-app/api/contracts/incident";

export const Route = createFileRoute("/incidents/$incidentId")({
  loader: async ({ context, params }) => {
    try {
    await context.queryClient.ensureQueryData(
      context.orpc.incident.getById.queryOptions({
        input: { id: params.incidentId },
      })
    );
  } catch {
      // offline ou erreur réseau :
      // on laisse le composant utiliser le cache éventuel
    }
  },

  component: RouteComponent,

});

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function RouteComponent() {
  const { incidentId } = Route.useParams();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadOk, setUploadOk] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const { incident, isLoading, error, isFetching } = useIncidentById(orpc, incidentId);

  const updateStatusMutation = useMutation(
    orpc.incident.updateStatus.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.incident.getById.queryOptions({
            input: { id: incidentId },
          }).queryKey,
        });

        await queryClient.invalidateQueries({
          queryKey: orpc.incident.list.queryOptions().queryKey,
        });
      },
    })
  );

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

  async function handleUpload() {
    if (!selectedFile) {
      setUploadMessage("Sélectionnez une image.");
      return;
    }

    if (!isOnline) {
      setUploadOk(false);
      setUploadMessage("Upload indisponible hors ligne.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("incidentId", incidentId);

      const response = await fetch("/api/incidents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Échec de l'upload");
      }

      setUploadMessage("Image ajoutée avec succès.");
      setUploadOk(true);
      setSelectedFile(null);

      await queryClient.invalidateQueries({
        queryKey: orpc.incident.getById.queryOptions({
          input: { id: incidentId },
        }).queryKey,
      });

      await queryClient.invalidateQueries({
        queryKey: orpc.incident.list.queryOptions().queryKey,
      });
    } catch (error) {
      setUploadOk(false);
      setUploadMessage(
        error instanceof Error ? error.message : "Erreur lors de l'upload."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleStatusChange(status: IncidentStatus) {
    if (!isOnline) {
      setStatusMessage("Modification du statut indisponible hors ligne.");
      return;
    }

    try {
      setStatusMessage("");

      await updateStatusMutation.mutateAsync({
        id: incidentId,
        status,
      });

      setStatusMessage("Statut mis à jour avec succès.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du statut."
      );
    }
  }

  if (isLoading && !incident) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-4 animate-pulse">
        <div className="h-4 w-24 rounded-full bg-muted" />
        <div className="h-9 w-64 rounded-lg bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Erreur réseau
          </p>
          <p className="font-medium text-foreground">
            Impossible de charger cet incident
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez votre connexion puis réessayez.
          </p>
          <Link
            to="/incidents"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon /> Retour aux incidents
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && !incident) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Introuvable
          </p>
          <p className="font-medium text-foreground">Incident introuvable</p>
          <Link
            to="/incidents"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon /> Retour aux incidents
          </Link>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6 animate-fade-up">
      <Link
        to="/incidents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon />
        Tous les incidents
      </Link>

      {error && incident && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          Mode hors ligne : affichage des dernières données disponibles.
        </div>
      )}

      {isFetching && !error && (
        <div className="text-xs text-muted-foreground">Actualisation…</div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl leading-tight break-word">
              {incident.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Signalé le{" "}
              <span className="font-medium text-foreground">
                {new Date(incident.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </span>
              {incident.reporter && (
                <>
                  {" "}
                  · par{" "}
                  <span className="font-medium text-foreground">
                    {incident.reporter.name || incident.reporter.email}
                  </span>
                </>
              )}
            </p>
          </div>

          {incident.description && (
            <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              {incident.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border bg-muted/50 px-5 py-3 text-sm sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ville
            </p>
            <p className="font-medium text-foreground">{formatLabel(incident.ville)}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quartier
            </p>
            <p className="font-medium text-foreground">
              {formatLabel(incident.quartier)}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Axe routier
            </p>
            <p className="font-medium text-foreground">
              {formatLabel(incident.axeRoutier)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4 animate-fade-up delay-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Suivi
            </p>
            <h2 className="font-semibold text-base">Statut de l’incident</h2>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                incident.status === "EN_COURS"
                  ? "bg-amber-400"
                  : incident.status === "RESOLU"
                  ? "bg-emerald-500"
                  : "bg-zinc-400"
              }`}
            />
            {incident.status === "EN_COURS"
              ? "En cours"
              : incident.status === "RESOLU"
              ? "Résolu"
              : "Annulé"}
          </span>
        </div>

        {!isOnline && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Modification du statut indisponible hors ligne.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleStatusChange("EN_COURS")}
            disabled={
              updateStatusMutation.isPending ||
              !isOnline ||
              incident.status === "EN_COURS"
            }
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remettre en cours
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange("RESOLU")}
            disabled={
              updateStatusMutation.isPending ||
              !isOnline ||
              incident.status === "RESOLU"
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Marquer comme résolu
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange("ANNULE")}
            disabled={
              updateStatusMutation.isPending ||
              !isOnline ||
              incident.status === "ANNULE"
            }
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Annuler l’incident
          </button>
        </div>

        {updateStatusMutation.isPending && (
          <p className="text-xs text-muted-foreground">Mise à jour du statut…</p>
        )}

        {statusMessage && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              statusMessage.toLowerCase().includes("succès")
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4 animate-fade-up delay-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-base">Médias</h2>
          {incident.medias && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {incident.medias.length} fichier{incident.medias.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {incident.medias && incident.medias.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incident.medias.map((media) => (
              <a
                key={media.id}
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="group aspect-video overflow-hidden rounded-lg border bg-muted transition-all hover:ring-2 hover:ring-brand"
              >
                <img
                  src={media.url}
                  alt={media.filename}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border py-8 text-center text-muted-foreground">
            <p className="text-sm">Aucun média pour cet incident</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4 animate-fade-up delay-2">
        <h2 className="font-semibold text-base">Ajouter une image</h2>

        {!isOnline && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Upload indisponible hors ligne.
          </div>
        )}

        <div className="space-y-3">
          <label className="group flex cursor-pointer items-start gap-3 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-brand/50 sm:items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/10 group-hover:text-brand">
              <UploadIcon />
            </span>
            <div className="text-sm">
              {selectedFile ? (
                <p className="break-all font-medium text-foreground">
                  {selectedFile.name}
                </p>
              ) : (
                <>
                  <p className="font-medium text-foreground">Choisir une image</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG jusqu&apos;à 10 MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !isOnline}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Upload en cours…
              </>
            ) : (
              <>
                <UploadIcon /> Uploader l&apos;image
              </>
            )}
          </button>

          {uploadMessage && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                uploadOk
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {uploadMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}