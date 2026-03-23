import { z } from "zod";
import prisma, { IncidentType, Ville, Quartier, AxeRoutier } from "@my-better-t-app/db";
import { publicProcedure, protectedProcedure } from "../index";

const CreateIncidentInput = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.nativeEnum(IncidentType),
  ville: z.nativeEnum(Ville),
  quartier: z.nativeEnum(Quartier),
  axeRoutier: z.nativeEnum(AxeRoutier),
});

export const incidentRouter = {
  create: protectedProcedure
    .input(CreateIncidentInput)
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;

      if (!userId){throw new Error("Utilisateur non authentifié");}

      return await prisma.incident.create({
        data: {
          title : input.title,
          description : input.description,
          type : input.type,
          ville : input.ville,
          quartier : input.quartier,
          axeRoutier : input.axeRoutier,
          reporterId : userId,
        },
        include: {
          reporter: true,
          medias: true,
        },  
      }); 
     
    }),

  list: publicProcedure.handler(async () => {
      return await prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          reporter: true,
          medias: true,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const incident = await prisma.incident.findUnique({
        where: { id: input.id },
        include: {
          reporter: true,
          medias: true,
        },
      });

      if (!incident) throw new Error("Incident non trouvé");
      
      return incident;
    }),
};
