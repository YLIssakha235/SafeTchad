import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 text-left space-y-2 animate-fade-up">
      <div className="text-2xl">{icon}</div>
      <h2 className="font-medium text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TypeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function HomeComponent() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-10 sm:space-y-14">
        <section className="text-center space-y-5 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            SafeTchad
          </p>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
            Signaler.
            <br />
            Informer.
            <br />
            Protéger.
          </h1>

          <p className="mx-auto max-w-md sm:max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            SafeTchad est une plateforme communautaire de signalement permettant
            de remonter rapidement des incidents, de consulter les alertes locales
            et de suivre l’évolution de la situation sur le terrain.
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon=""
            title="Signalement localisé"
            description="Renseignez la ville, le quartier et l’axe routier pour situer précisément un incident."
          />
          <FeatureCard
            icon=""
            title="Information communautaire"
            description="Consultez rapidement les derniers signalements partagés par les utilisateurs de la plateforme."
          />
          <FeatureCard
            icon=""
            title="Suivi de situation"
            description="Visualisez les incidents en cours, les cas résolus et les zones qui nécessitent plus d’attention."
          />
        </section>

        <section className="rounded-2xl border bg-card p-6 sm:p-8 space-y-5 animate-fade-up delay-1">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Types d’incidents suivis
            </p>
            <h2 className="font-display text-2xl sm:text-3xl leading-tight">
              Une plateforme pensée pour les alertes du quotidien
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              SafeTchad permet de centraliser différents types de signalements utiles
              à la population et aux acteurs de terrain.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TypeBadge>Accident</TypeBadge>
            <TypeBadge>Vol</TypeBadge>
            <TypeBadge>Incendie</TypeBadge>
            <TypeBadge>Inondation</TypeBadge>
            <TypeBadge>Route dangereuse</TypeBadge>
            <TypeBadge>Urgence médicale</TypeBadge>
          </div>
        </section>
      </div>
    </div>
  );
}