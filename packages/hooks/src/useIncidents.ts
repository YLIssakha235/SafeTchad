import { useMutation,useQuery,useQueryClient,type UseMutationResult,type UseQueryResult,
} from "@tanstack/react-query";
import { useState } from "react"; // c'est quoi son problème ? 
import {incidentTypeValues,incidentStatusValues,villeValues,quartierValues,axeRoutierValues,type IncidentType,
  type IncidentStatus,type Ville,type Quartier,type AxeRoutier,type CreateIncidentInput,} from "@my-better-t-app/api/contracts/incident";

export const INCIDENT_TYPES = incidentTypeValues;
export const INCIDENT_STATUSES = incidentStatusValues;
export const VILLES = villeValues;
export const QUARTIERS = quartierValues;
export const AXES_ROUTIERS = axeRoutierValues;

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export type IncidentReporter = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type IncidentMedia = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  mediaType: "IMAGE" | "VIDEO";
  createdAt: string | Date;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  ville: Ville;
  quartier: Quartier;
  axeRoutier: AxeRoutier;
  createdAt: string | Date;
  updatedAt: string | Date;
  reporterId: string;
  reporter?: IncidentReporter;
  medias?: IncidentMedia[];
};

type QueryOptionsLike = {
  queryKey: readonly unknown[];
};

type MutationOptionsLike = object;

type IncidentsOrpc = {
  incident: {
    list: {
      queryOptions: () => QueryOptionsLike;
    };
    create: {
      mutationOptions: (options?: {
        onMutate?: () => void | Promise<void>;
        onSettled?: () => Promise<void> | void;
      }) => MutationOptionsLike;
    };
    getById: {
      queryOptions: (options: { input: { id: string } }) => QueryOptionsLike;
    };
  };
};

export function useIncidents(orpc: IncidentsOrpc) {
  const [newIncident, setNewIncident] = useState<CreateIncidentInput>({
    title: "",
    description: "",
    type: "ACCIDENT",
    ville: "NDJAMENA",
    quartier: "FARCHA",
    axeRoutier: "Avenue_MOBUTU",
  });

  const queryClient = useQueryClient();
  const incidentsQueryOptions = orpc.incident.list.queryOptions();

  const incidentsQuery = useQuery({
    ...orpc.incident.list.queryOptions(),
  }) as UseQueryResult<Incident[], Error>;

  const createIncidentMutation = useMutation(
    orpc.incident.create.mutationOptions({
      onMutate: async () => {
        queryClient.setQueryData<Incident[]>(
          incidentsQueryOptions.queryKey,
          (old = []) => [
            ...old,
            {
              id: `temp-${Date.now()}`,
              title: newIncident.title,
              description: newIncident.description,
              type: newIncident.type,
              status: "EN_COURS",
              ville: newIncident.ville,
              quartier: newIncident.quartier,
              axeRoutier: newIncident.axeRoutier,
              createdAt: new Date(),
              updatedAt: new Date(),
              reporterId: "temp-reporter",
              reporter: undefined,
              medias: [],
            },
          ]
        );
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: incidentsQueryOptions.queryKey,
        });
      },
    }) as never
  ) as UseMutationResult<Incident, Error, CreateIncidentInput, unknown>;

  const list = incidentsQuery.data ?? [];
  const isLoading = incidentsQuery.isLoading;
  const error = incidentsQuery.error;
  const refetch = incidentsQuery.refetch;

  const isCreating = createIncidentMutation.isPending;
  const createError = createIncidentMutation.error;

  function create() {
    createIncidentMutation.mutate(newIncident);
  }

  return {
    newIncident,
    setNewIncident,

    list,
    isLoading,
    error,
    refetch,

    create,
    isCreating,
    createError,
  };
}

export function useIncidentById(orpc: IncidentsOrpc, id: string) {
  const incidentQuery = useQuery({
    ...orpc.incident.getById.queryOptions({
      input: { id },
    }),
    enabled: !!id,
  }) as UseQueryResult<Incident, Error>;

  const incident = incidentQuery.data ?? null;
  const isLoading = incidentQuery.isLoading;
  const error = incidentQuery.error;
  const refetch = incidentQuery.refetch;

  return {
    incident,
    isLoading,
    error,
    refetch,
  };
}