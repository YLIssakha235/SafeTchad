import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useState } from "react";

export const INCIDENT_TYPES = [
  "ACCIDENT",
  "VOL",
  "INCENDIE",
  "INONDATION",
  "ROUTE_DANGEREUSE",
  "URGENCE_MEDICALE",
] as const;

export const INCIDENT_STATUSES = ["EN_COURS", "RESOLU", "ANNULE"] as const;
export const VILLES = ["NDJAMENA"] as const;
export const QUARTIERS = ["FARCHA", "DIGUEL"] as const;
export const AXES_ROUTIERS = [
  "Avenue_MOBUTU",
  "Route_NDjamena_Moundou",
  "Route_Charles_de_Gaulle",
  "Route_Globe_Terrestre",
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type Ville = (typeof VILLES)[number];
export type Quartier = (typeof QUARTIERS)[number];
export type AxeRoutier = (typeof AXES_ROUTIERS)[number];

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

export type CreateIncidentInput = Omit<
  Incident,
  "id" | "status" | "createdAt" | "updatedAt" | "reporterId" | "reporter" | "medias"
>;

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
        onSettled?: () => Promise<void> | void;
      }) => MutationOptionsLike;
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

  const query = useQuery({
    ...orpc.incident.list.queryOptions(),
  }) as UseQueryResult<Incident[], Error>;

  const queryClient = useQueryClient();
  const incidentsQueryOptions = orpc.incident.list.queryOptions();

  const createMutation = useMutation(
    orpc.incident.create.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: incidentsQueryOptions.queryKey,
        });
      },
    }) as never
  ) as UseMutationResult<Incident, Error, CreateIncidentInput, unknown>;

  return {
    ...query,
    data: query.data ?? [],
    newIncident,
    setNewIncident,
    create() {
      createMutation.mutate(newIncident);
    },
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}