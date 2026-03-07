import { z } from "zod";
import prisma from "@my-better-t-app/db";
import { publicProcedure } from "../index"; 


const IncidentTypeEnum = z.enum([
  "ACCIDENT",
  "VOL",
  "INCENDIE",
  "INONDATION",
  "ROUTE_DANGEREUSE",
  "URGENCE_MEDICALE",
]);

const VilleEnum = z.enum(["NDJAMENA"]);
const QuartierEnum = z.enum(["FARCHA", "DIGUEL"]);

const CreateIncidentInput = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: IncidentTypeEnum,
  ville: VilleEnum,
  quartier: QuartierEnum.optional(),
  axeRoutier: z.string().optional(),
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