import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import "./index.css";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient, queryPersister } from "./utils/orpc";

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,

    defaultPreload: "render", // précharge au moment du rendu (par défaut, c'est "intent" qui précharge au moment de l'intention de navigation)

    // Garde la position de scroll lors des navigations quand c'est possible
    scrollRestoration: true,

    // Préchargement considéré immédiatement périmé
    defaultPreloadStaleTime: 0,

    // Très important :
    // attend 800 ms avant d'afficher le pending global
    // donc évite le spinner flash pour les chargements rapides
    defaultPendingMs: 800,

    // Si le pending apparaît, on le garde au moins un peu
    // pour éviter un clignotement trop brutal
    defaultPendingMinMs: 250,

    context: { orpc, queryClient },

    // Loader global du router quand une route est vraiment en attente
    defaultPendingComponent: () => <Loader />,

    defaultNotFoundComponent: () => <div>Not Found</div>,

    Wrap: ({ children }) => {
      // Côté navigateur : React Query persisté dans localStorage
      if (queryPersister) {
        return (
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: queryPersister,
              maxAge: 1000 * 60 * 60 * 24,
            }}
            onSuccess={() => {
              queryClient.resumePausedMutations().catch(() => {});
            }}
          >
            {children}
          </PersistQueryClientProvider>
        );
      }

      // Côté serveur : provider React Query classique
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    },
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
