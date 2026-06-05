import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppOrpcUtils as ORPC } from "@my-better-t-app/api";

import {
  axeRoutierValues,
  incidentStatusValues,
  incidentTypeValues,
  quartierValues,
  villeValues,
  type CreateIncidentInput,
  type Incident,
} from "@my-better-t-app/api/contracts/incident";

export const INCIDENT_TYPES = incidentTypeValues;
export const INCIDENT_STATUSES = incidentStatusValues;
export const VILLES = villeValues;
export const QUARTIERS = quartierValues;
export const AXES_ROUTIERS = axeRoutierValues;

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function useIncidents(orpc: ORPC, id?: string) {
  const queryClient = useQueryClient();

  const listQueryOptions = orpc.incident.list.queryOptions();

  const incidentsQuery = useQuery({
    ...listQueryOptions,
    networkMode: "offlineFirst",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const detailQueryOptions = orpc.incident.getById.queryOptions({
    input: { id: id ?? "" },
  });

  const incidentByIdQuery = useQuery({
    ...detailQueryOptions,
    enabled: Boolean(id),
    networkMode: "offlineFirst",
    retry: false,
    refetchOnWindowFocus: false,
  });

  const createIncidentMutation = useMutation({
    ...orpc.incident.create.mutationOptions(),

    onMutate: async (input: CreateIncidentInput) => {
      await queryClient.cancelQueries({
        queryKey: listQueryOptions.queryKey,
      });

      const previousIncidents =
        queryClient.getQueryData<Incident[]>(listQueryOptions.queryKey) ?? [];

      const temporaryIncident: Incident = {
        id: `temp-${Date.now()}`,
        title: input.title,
        description: input.description,
        type: input.type,
        status: "EN_COURS",
        ville: input.ville,
        quartier: input.quartier,
        axeRoutier: input.axeRoutier,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        locationAccuracy: input.locationAccuracy ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        reporterId: "temp",
        medias: [],
      };

      queryClient.setQueryData<Incident[]>(
        listQueryOptions.queryKey,
        (old = []) => [temporaryIncident, ...old]
      );

      return { previousIncidents };
    },

    onError: (_error, _input, context) => {
      if (context?.previousIncidents) {
        queryClient.setQueryData<Incident[]>(
          listQueryOptions.queryKey,
          context.previousIncidents
        );
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: listQueryOptions.queryKey,
      });
    },
  });

  const updateStatusMutation = useMutation({
    ...orpc.incident.updateStatus.mutationOptions(),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listQueryOptions.queryKey,
      });

      if (id) {
        await queryClient.invalidateQueries({
          queryKey: detailQueryOptions.queryKey,
        });
      }
    },
  });

  return {
    list: {
      data: incidentsQuery.data ?? [],
      isLoading: incidentsQuery.isLoading,
      error: incidentsQuery.error,
      refetch: incidentsQuery.refetch,
      isFetching: incidentsQuery.isFetching,
    },

    detail: {
      incident: incidentByIdQuery.data ?? null,
      isLoading: incidentByIdQuery.isLoading,
      error: incidentByIdQuery.error,
      refetch: incidentByIdQuery.refetch,
      isFetching: incidentByIdQuery.isFetching,
    },

    create: {
      mutate: createIncidentMutation.mutate,
      mutateAsync: createIncidentMutation.mutateAsync,
      isLoading: createIncidentMutation.isPending,
      isPending: createIncidentMutation.isPending,
      error: createIncidentMutation.error,
    },

    updateStatus: {
      mutate: updateStatusMutation.mutate,
      mutateAsync: updateStatusMutation.mutateAsync,
      isLoading: updateStatusMutation.isPending,
      isPending: updateStatusMutation.isPending,
      error: updateStatusMutation.error,
    },
  };
}
