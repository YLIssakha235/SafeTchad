import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ORPC = any;

export const INCIDENT_TYPES = [
  "ACCIDENT",
  "VOL",
  "INCENDIE",
  "INONDATION",
  "ROUTE_DANGEREUSE",
  "URGENCE_MEDICALE",
] as const;

export const INCIDENT_STATUSES = [
  "EN_COURS",
  "RESOLU",
  "ANNULE",
] as const;

export const VILLES = ["NDJAMENA"] as const;

export const QUARTIERS = ["FARCHA", "DIGUEL"] as const;

export const AXES_ROUTIERS = [
  "Avenue_MOBUTU",
  "Avenue_CHARLES_DE_GAULLE",
  "Boulevard_MARA",
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type Ville = (typeof VILLES)[number];
export type Quartier = (typeof QUARTIERS)[number];
export type AxeRoutier = (typeof AXES_ROUTIERS)[number];

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export type Incident = {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  ville: Ville;
  quartier?: Quartier;
  axeRoutier?: AxeRoutier;
};

export type CreateIncidentInput = Omit<Incident, "id" | "status">;

export function useIncidents(orpc: ORPC) {
  const query = useQuery({
    ...orpc.incident.list.queryOptions(),
  });

  return {
    ...query,
    data: (query.data ?? []) as Incident[],
  };
}

export function useCreateIncident(orpc: ORPC) {
  const queryClient = useQueryClient();
  const incidentsQueryOptions = orpc.incident.list.queryOptions();
  
  return useMutation({
    ...orpc.incident.create.mutationOptions(),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentsQueryOptions.queryKey,
      });
    },
  });
}