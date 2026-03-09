// import { useQuery } from "@tanstack/react-query";

// type ORPC = any;


// export type Incident = {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   status: string;
//   ville: string;
//   quartier?: string | null;
//   axeRoutier?: string | null;
// };

// export function useIncidents(orpc: ORPC) {
//   const query = useQuery(orpc.incident.list.queryOptions({}));

//   return {
//     ...query,
//     data: (query.data ?? []) as Incident[],
//   }

// };