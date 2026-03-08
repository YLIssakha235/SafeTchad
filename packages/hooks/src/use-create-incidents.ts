import { useMutation } from "@tanstack/react-query";

type ORPC = any;

export function useCreateIncident(orpc: ORPC) {
  return useMutation(orpc.incident.create.mutationOptions());
}