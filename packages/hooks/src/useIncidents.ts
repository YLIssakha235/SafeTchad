import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppOrpcUtils } from "@my-better-t-app/api";
import {
 incidentTypeValues,
 incidentStatusValues,
 villeValues,
 quartierValues,
 axeRoutierValues,
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
export function useIncidents(orpc: AppOrpcUtils) {
 const incidentsQuery = useQuery({
  ...orpc.incident.list.queryOptions(),
  networkMode: "offlineFirst",
  retry: false,
  refetchOnWindowFocus: false,
 });

 return {
   list: incidentsQuery.data ?? [],
   isLoading: incidentsQuery.isLoading,
   error: incidentsQuery.error,
   refetch: incidentsQuery.refetch,
   isFetching: incidentsQuery.isFetching,
 };
}

export function useCreateIncident(orpc: AppOrpcUtils) {
 const queryClient = useQueryClient();
 const listQueryOptions = orpc.incident.list.queryOptions();
 const createIncidentMutation = useMutation({
   ...orpc.incident.create.mutationOptions(),
   onMutate: async (input: CreateIncidentInput) => {
     await queryClient.cancelQueries({
       queryKey: listQueryOptions.queryKey,
     });
     const previousIncidents =
       queryClient.getQueryData<Incident[]>(listQueryOptions.queryKey) ?? [];
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

  //  onError: (_error, _input, context) => {
  //    if (context?.previousIncidents) {
  //      queryClient.setQueryData(listQueryOptions.queryKey, context.previousIncidents);
  //    }
  //  },
  
   onSettled: async () => {
     await queryClient.invalidateQueries({
       queryKey: listQueryOptions.queryKey,
     });
   },
 });
 function create(input: CreateIncidentInput) {
   createIncidentMutation.mutate(input);
 }
 async function createAsync(input: CreateIncidentInput) {
   return createIncidentMutation.mutateAsync(input);
 }
 return {
   create,
   createAsync,
   isCreating: createIncidentMutation.isPending,
   createError: createIncidentMutation.error,
 };
}
export function useIncidentById(orpc: AppOrpcUtils, id: string) {
 const incidentQuery = useQuery({
   ...orpc.incident.getById.queryOptions({
     input: { id },
   }),
    networkMode: "offlineFirst",
    retry: false,
    refetchOnWindowFocus: false,
 });
 return {
   incident: incidentQuery.data ?? null,
   isLoading: incidentQuery.isLoading,
   error: incidentQuery.error,
   refetch: incidentQuery.refetch,
   isFetching: incidentQuery.isFetching,
 };
}