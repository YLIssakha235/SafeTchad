import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppOrpcUtils  as ORPC} from "@my-better-t-app/api";

import {
 incidentTypeValues,
 incidentStatusValues,
 villeValues,
 quartierValues,
 axeRoutierValues,
 type CreateIncidentInput,
 type Incident,
} from "@my-better-t-app/api/contracts/incident";


// constantes que je partage entre le client et le serveur
export const INCIDENT_TYPES = incidentTypeValues;
export const INCIDENT_STATUSES = incidentStatusValues;
export const VILLES = villeValues;
export const QUARTIERS = quartierValues;
export const AXES_ROUTIERS = axeRoutierValues;

// fonction utilitaire pour formater les labels des enums
export function formatLabel(value: string): string {
 return value.replace(/_/g, " ");
}

export function useIncidents(orpc: ORPC, id?: string) {
  const queryClient = useQueryClient();

  // liste des incidents
  const incidentsQuery = useQuery({
    ...orpc.incident.list.queryOptions(),
    networkMode: "offlineFirst",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const list = {
    data: incidentsQuery.data ?? [],
    isLoading: incidentsQuery.isLoading,
    error: incidentsQuery.error,
    refetch: incidentsQuery.refetch,
    isFetching: incidentsQuery.isFetching,
  };

  // incident par id
  const incidentByIdQuery = useQuery({
    ...orpc.incident.getById.queryOptions({
      input: { id: id ?? "" },
    }),
    enabled: !!id,
    networkMode: "offlineFirst",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const detail ={
    incident: incidentByIdQuery.data ?? null,
    isLoading: incidentByIdQuery.isLoading,
    error: incidentByIdQuery.error,
    refetch: incidentByIdQuery.refetch,
    isFetching: incidentByIdQuery.isFetching,
  };

  // creation incident
  const listQueryOptions = orpc.incident.list.queryOptions();
  const createIncidentMutation = useMutation({
    ...orpc.incident.create.mutationOptions(),

    // optimistic update : on ajoute l'incident à la liste avant même d'avoir la réponse du serveur pour une meilleure UX
    onMutate: async (input: CreateIncidentInput) => {
      await queryClient.cancelQueries({
        queryKey: listQueryOptions.queryKey,
      });
    // on ajoute un incident temporaire à la liste pour une meilleure UX pendant la création
    const previousIncidents =
      queryClient.getQueryData<Incident[]>(listQueryOptions.queryKey) ?? [];

    // on ajoute un incident temporaire à la liste pour une meilleure UX pendant la création
    queryClient.setQueryData<Incident[]>(listQueryOptions.queryKey, (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          title: input.title,
          description: input.description,
          type: input.type,
          status: "EN_COURS",
          ville: input.ville, 
          quartier: input.quartier,
          axeRoutier: input.axeRoutier,
          createdAt: new Date(),
          updatedAt: new Date(),
          reporterId: "temp",
          medias: [],
        },
      ]);
      return { previousIncidents };
    },

    // si la création échoue, on remet l'ancienne liste d'incidents pour éviter d'avoir un incident "fantôme" dans la liste
    onError: (_error, _input, context: { previousIncidents: Incident[] } | undefined) => {
      if (context?.previousIncidents) {
        queryClient.setQueryData<Incident[]>(
          listQueryOptions.queryKey,
          context.previousIncidents
        );
      }
    },
  
    // une fois la création réussie ou échouée, on invalide la liste des incidents pour refetch et avoir les données à jour
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: listQueryOptions.queryKey,
      });
    },
  });

  // on expose une fonction create qui utilise la mutation de création d'incident
  const create = {
    mutate: createIncidentMutation.mutate,
    mutateAsync: createIncidentMutation.mutateAsync,
    isLoading: createIncidentMutation.isPending,
    error: createIncidentMutation.error,
  };

  return {
    list,
    detail,
    create,
  };
}

    


// export function useIncidents(orpc: ORPC) {
//  const incidentsQuery = useQuery({
//   ...orpc.incident.list.queryOptions(),
//   networkMode: "offlineFirst",
//   retry: false,
//   refetchOnWindowFocus: false,
//  });

//  return {
//    list: incidentsQuery.data ?? [],
//    isLoading: incidentsQuery.isLoading,
//    error: incidentsQuery.error,
//    refetch: incidentsQuery.refetch,
//    isFetching: incidentsQuery.isFetching,
//  };
// }

// export function useCreateIncident(orpc: ORPC) {
//  const queryClient = useQueryClient();
//  const listQueryOptions = orpc.incident.list.queryOptions();
//  const createIncidentMutation = useMutation({
//    ...orpc.incident.create.mutationOptions(),
//    onMutate: async (input: CreateIncidentInput) => {
//      await queryClient.cancelQueries({
//        queryKey: listQueryOptions.queryKey,
//      });
//      const previousIncidents =
//        queryClient.getQueryData<Incident[]>(listQueryOptions.queryKey) ?? [];
//      queryClient.setQueryData<Incident[]>(listQueryOptions.queryKey, (old = []) => [
//        ...old,
//        {
//          id: `temp-${Date.now()}`,
//          title: input.title,
//          description: input.description,
//          type: input.type,
//          status: "EN_COURS",
//          ville: input.ville,
//          quartier: input.quartier,
//          axeRoutier: input.axeRoutier,
//          createdAt: new Date(),
//          updatedAt: new Date(),
//          reporterId: "temp",
//          medias: [],
//        },
//      ]);
//      return { previousIncidents };
//    },

//   // incident oublié dans la liste après échec de la création, on remet l'ancienne liste
//    onError: (_error, _input, context) => {
//      if (context?.previousIncidents) {
//        queryClient.setQueryData<Incident[]>(listQueryOptions.queryKey, context.previousIncidents);
//      }
//    },
  
//    onSettled: async () => {
//      await queryClient.invalidateQueries({
//        queryKey: listQueryOptions.queryKey,
//      });
//    },
//  });
//  function create(input: CreateIncidentInput) {
//    createIncidentMutation.mutate(input);
//  }
//  async function createAsync(input: CreateIncidentInput) {
//    return createIncidentMutation.mutateAsync(input);
//  }
//  return {
//    create,
//    createAsync,
//    isCreating: createIncidentMutation.isPending,
//    createError: createIncidentMutation.error,
//  };
// }
// export function useIncidentById(orpc: ORPC, id: string) {
//  const incidentQuery = useQuery({
//    ...orpc.incident.getById.queryOptions({
//      input: { id },
//    }),
//     networkMode: "offlineFirst",
//     retry: false,
//     refetchOnWindowFocus: false,
//  });
//  return {
//    incident: incidentQuery.data ?? null,
//    isLoading: incidentQuery.isLoading,
//    error: incidentQuery.error,
//    refetch: incidentQuery.refetch,
//    isFetching: incidentQuery.isFetching,
//  };
// }