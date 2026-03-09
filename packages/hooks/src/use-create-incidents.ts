// import { useMutation, useQueryClient } from "@tanstack/react-query";

// type ORPC = any;

// export type CreateIncidentInput = {
//   title: string;
//   description: string;
//   type:
//     | "ACCIDENT"
//     | "VOL"
//     | "INCENDIE"
//     | "INONDATION"
//     | "ROUTE_DANGEREUSE"
//     | "URGENCE_MEDICALE";
//   ville: "NDJAMENA";
//   quartier: "FARCHA" | "DIGUEL";
//   axeRoutier: string;
// };

// export function useCreateIncident(orpc: ORPC) {
//   const queryClient = useQueryClient();
//   // const addedIncident = useMutation<any, Error, CreateIncidentInput>(
//   //   orpc.incident.create.mutationOptions({
//   //     onMutate: async (newIncident) => {

//   return useMutation<any, Error, CreateIncidentInput>(
//     orpc.incident.create.mutationOptions({
//       onSettled: async () => {
//         await queryClient.invalidateQueries();
//     }
//   })
// );
// }


// // donner une on met orcpe par ce que hook commence par use 
// // une methode optimiste 
// // pourquoi il faut invalider les queries ?
// // on utilise onMutate pour faire une mise à jour optimiste de la liste des incidents avant que la mutation ne soit terminée. Cela permet d'améliorer l'expérience utilisateur en affichant immédiatement le nouvel incident dans la liste, même si la requête n'est pas encore terminée. Cependant, il est important d'invalider les queries après la mutation pour s'assurer que les données affichées sont à jour et reflètent les changements effectués par la mutation.
// // Tanstask : mise en cahe central pour les requetes et les mutations
// // onMutate : mise à jour optimiste de la liste des incidents avant que la mutation ne soit terminée
// // onSettled : invalider les queries après la mutation pour s'assurer que les données affichées sont à jour et reflètent les changements effectués par la mutation.
// // que fait useQueryClient ?
// // useQueryClient est un hook fourni par React Query qui permet d'accéder au client de requêtes (query client) dans n'importe quel composant de votre application. Le query client est responsable de la gestion du cache des données, de l'invalidation des queries, et de la coordination des requêtes et des mutations. En utilisant useQueryClient, vous pouvez effectuer des actions telles que l'invalidation des queries après une mutation, la mise à jour du cache avec de nouvelles données, ou la récupération de données mises en cache.

