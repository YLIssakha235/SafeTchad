import { useMutation } from "@tanstack/react-query";

type ORPC = any;

export type CreateIncidentInput = {
  title: string;
  description: string;
  type:
    | "ACCIDENT"
    | "VOL"
    | "INCENDIE"
    | "INONDATION"
    | "ROUTE_DANGEREUSE"
    | "URGENCE_MEDICALE";
  ville: "NDJAMENA";
  quartier: "FARCHA" | "DIGUEL";
  axeRoutier: string;
};

export function useCreateIncident(orpc: ORPC) {
  return useMutation<any, Error, CreateIncidentInput>(
    orpc.incident.create.mutationOptions());
}