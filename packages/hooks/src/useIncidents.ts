import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ORPC = any;

export type Incident = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  ville: string;
  quartier?: string | null;
  axeRoutier?: string | null;
};

export type CreateIncidentInput = Omit<Incident, "id" | "status">;

export function useIncidents(orpc: ORPC) {
  const query = useQuery({
    ...orpc.incident.list.queryOptions({}),
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