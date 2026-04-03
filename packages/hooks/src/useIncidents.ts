import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AppOrpcUtils } from "@my-better-t-app/api";
import {
  incidentTypeValues,
  incidentStatusValues,
  villeValues,
  quartierValues,
  axeRoutierValues,
  type IncidentType,
  type IncidentStatus,
  type Ville,
  type Quartier,
  type AxeRoutier,
  type CreateIncidentInput,
} from "@my-better-t-app/api/contracts/incident";

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

export function useIncidents(orpc: AppOrpcUtils) {
  const incidentsQuery = useQuery(orpc.incident.list.queryOptions());

  return {
    list: incidentsQuery.data ?? [],
    isLoading: incidentsQuery.isLoading,
    error: incidentsQuery.error,
    refetch: incidentsQuery.refetch,
    isFetching: incidentsQuery.isFetching,
  };
}

export function useCreateIncident(orpc: AppOrpcUtils) {
  const [newIncident, setNewIncident] = useState<CreateIncidentInput>({
    title: "",
    description: "",
    type: "ACCIDENT",
    ville: "NDJAMENA",
    quartier: "FARCHA",
    axeRoutier: "Avenue_MOBUTU",
  });

  const queryClient = useQueryClient();

  const createIncidentMutation = useMutation({
    ...orpc.incident.create.mutationOptions(),
    onMutate: async () => {
      const queryKey = orpc.incident.list.queryOptions().queryKey;

      queryClient.setQueryData<Incident[]>(queryKey, (old = []) => [
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
          reporterId: "temp",
          medias: [],
        },
      ]);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: orpc.incident.list.queryOptions().queryKey,
      });
    },
  });

  function create() {
    createIncidentMutation.mutate(newIncident);
  }

  return {
    newIncident,
    setNewIncident,
    create,
    isCreating: createIncidentMutation.isPending,
    createError: createIncidentMutation.error,
  };
}

export function useIncidentById(orpc: AppOrpcUtils, id: string) {
  const incidentQuery = useQuery(
    orpc.incident.getById.queryOptions({
      input: { id },
    })
  );

  return {
    incident: incidentQuery.data ?? null,
    isLoading: incidentQuery.isLoading,
    error: incidentQuery.error,
    refetch: incidentQuery.refetch,
    isFetching: incidentQuery.isFetching,
  };
}

