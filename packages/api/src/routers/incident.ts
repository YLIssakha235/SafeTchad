import { ORPCError } from "@orpc/server";
import prisma from "@my-better-t-app/db";
import {createIncidentSchema, getIncidentByIdSchema,
} from "../contracts/incident";
import { publicProcedure, protectedProcedure } from "../index";

export const incidentRouter = {
  create: protectedProcedure
    .input(createIncidentSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      return await prisma.incident.create({
        data: {
          title: input.title,
          description: input.description,
          type: input.type,
          ville: input.ville,
          quartier: input.quartier,
          axeRoutier: input.axeRoutier,
          reporterId: userId,
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
    .input(getIncidentByIdSchema)
    .handler(async ({ input }) => {
      const incident = await prisma.incident.findUnique({
        where: { id: input.id },
        include: {
          reporter: true,
          medias: true,
        },
      });

      if (!incident) {
        throw new ORPCError("NOT_FOUND");
      }

      return incident;
    }),
};

