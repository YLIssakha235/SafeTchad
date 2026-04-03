import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { orpc } from "@/utils/orpc";
import { formatLabel, useIncidentById } from "@my-better-t-app/hooks";

export const Route = createFileRoute("/incidents/$incidentId")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      context.orpc.incident.getById.queryOptions({
        input: { id: params.incidentId },
      })
    );
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

  const { incident, isLoading, error, isFetching } = useIncidentById(orpc, incidentId);

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
          <p className="text-2xl mb-2">📡</p>
          <p className="font-medium text-foreground">Impossible de charger cet incident</p>
          <p className="text-sm text-muted-foreground mt-1">
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
          <p className="text-2xl mb-2">🔍</p>
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
        <div className="text-xs text-muted-foreground">
          Actualisation…
        </div>
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
            <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
              {incident.description}
            </p>
          )}
        </div>

        <div className="bg-muted/50 border-t border-border px-5 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
              Ville
            </p>
            <p className="font-medium text-foreground">{formatLabel(incident.ville)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
              Quartier
            </p>
            <p className="font-medium text-foreground">
              {formatLabel(incident.quartier)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
              Axe routier
            </p>
            <p className="font-medium text-foreground">
              {formatLabel(incident.axeRoutier)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4 animate-fade-up delay-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-base">Médias</h2>
          {incident.medias && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {incident.medias.length} fichier{incident.medias.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {incident.medias && incident.medias.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incident.medias.map((media) => (
              <a
                key={media.id}
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="group aspect-video rounded-lg border bg-muted overflow-hidden hover:ring-2 hover:ring-brand transition-all"
              >
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border py-8 text-center text-muted-foreground">
            <p className="text-2xl mb-1">🖼️</p>
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
          <label className="flex items-start sm:items-center gap-3 rounded-lg border-2 border-dashed border-border hover:border-brand/50 transition-colors cursor-pointer p-4 group">
            <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-muted group-hover:bg-brand/10 transition-colors text-muted-foreground group-hover:text-brand">
              <UploadIcon />
            </span>
            <div className="text-sm">
              {selectedFile ? (
                <p className="font-medium text-foreground break-all">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="font-medium text-foreground">Choisir une image</p>
                  <p className="text-muted-foreground text-xs">PNG, JPG jusqu'à 10 MB</p>
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Upload en cours…
              </>
            ) : (
              <>
                <UploadIcon /> Uploader l'image
              </>
            )}
          </button>

          {uploadMessage && (
            <p
              className={`text-sm px-3 py-2 rounded-lg ${
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