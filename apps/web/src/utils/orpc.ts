import type { RouterClient } from "@orpc/server";

import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { toast } from "sonner";

// Ici on crée le vrai client React Query de l'app
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Si une query échoue, on affiche un toast d'erreur
    onError: (error, query) => {
      const message = 
        error instanceof Error ? error.message : String(error);
      
      const isOfflineError =
        typeof navigator !== "undefined" && !navigator.onLine &&
        (
          message.includes("NetworkError") ||
          message.includes("Failed to fetch") ||
          message.includes("Network request failed")  
        );

      if (isOfflineError){
        return;
      }

      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => query.invalidate(),
        },
      });
    },
  }),
  defaultOptions: {
    queries: {
      // Pendant 5 min, les données sont considérées encore "fraîches"
      staleTime: 1000 * 60 * 2,

      // On garde le cache 24h avant nettoyage
      gcTime: 1000 * 60 * 60 * 24,

      // En cas d'échec réseau, on retente 1 fois
      retry: 0,

      // Évite des refetch agressifs quand on revient sur l'onglet
      refetchOnWindowFocus: false,

      // Si le réseau revient, React Query peut relancer la query
      refetchOnReconnect: false,

      // Quand on remonte une page, on ne veut pas forcément refetch les données
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Ici on crée le persister pour sauvegarder le cache dans localStorage
export const queryPersister =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "safe-tchad-react-query",
      })
    : undefined;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: async () => {
        return createContext({ req: getRequest() });
      },
    }),
  )
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

export const client: RouterClient<typeof appRouter> = getORPCClient();

// Ici on fabrique l'utilitaire ORPC branché sur TanStack Query
export const orpc = createTanstackQueryUtils(client);
