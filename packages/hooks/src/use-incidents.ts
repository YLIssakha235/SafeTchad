// import { orpc } from "@my-better-t-app/api";
import { useQuery } from "@tanstack/react-query";

type ORPC = any;

export function useIncidents(orpc: ORPC) {
  return useQuery(orpc.incident.list.queryOptions({}));
}