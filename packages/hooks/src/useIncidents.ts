import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IncidentType, IncidentStatus, Ville, Quartier, AxeRoutier } from "@my-better-t-app/db";

type ORPC = any;

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export { IncidentType, IncidentStatus, Ville, Quartier, AxeRoutier };

export type Incident = {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  ville: Ville;
  quartier?: Quartier | null;
  axeRoutier?: AxeRoutier | null;
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
  const incidentsQueryOptions = orpc.incident.list.queryOptions({});
  return useMutation({
    mutationFn: async (input: CreateIncidentInput) => {
      return await orpc.incident.create.mutation(input);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentsQueryOptions.queryKey,
      });
    },
  });
}

