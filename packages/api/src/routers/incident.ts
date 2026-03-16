import { z } from "zod";
import prisma, { IncidentType, Ville, Quartier, AxeRoutier } from "@my-better-t-app/db";
import { publicProcedure } from "../index";

const CreateIncidentInput = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.nativeEnum(IncidentType),
  ville: z.nativeEnum(Ville),
  quartier: z.nativeEnum(Quartier),
  axeRoutier: z.nativeEnum(AxeRoutier),
});

export const incidentRouter = {
  create: publicProcedure
    .input(CreateIncidentInput)
    .handler(async ({ input }) => {
      return prisma.incident.create({ data: input });
    }),

  list: publicProcedure
    .handler(async () => {
      return prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const incident = await prisma.incident.findUnique({
        where: { id: input.id },
      });
      if (!incident) throw new Error("Incident non trouvé");
      return incident;
    }),
};
