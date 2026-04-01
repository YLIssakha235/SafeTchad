import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheckQuery = useQuery(orpc.healthCheck.queryOptions());

  const isConnected = !!healthCheckQuery.data;
  const isLoading = healthCheckQuery.isLoading;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-8 sm:space-y-10">
        <section className="text-center space-y-5 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            SafeTchad
          </p>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
            Signaler.
            <br />
            Protéger.
            <br />
            Agir.
          </h1>

          <p className="mx-auto max-w-md sm:max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Une plateforme simple pour signaler les incidents, consulter les alertes
            et suivre l’activité de votre communauté.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <Link
              to="/incidents/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Signaler un incident
            </Link>

            <Link
              to="/incidents"
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Voir les incidents
            </Link>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 sm:p-6 animate-fade-up delay-1">
          <h2 className="mb-3 font-medium">API Status</h2>

          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Checking..." : isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}