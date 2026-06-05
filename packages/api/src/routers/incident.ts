import { ORPCError } from "@orpc/server";
import prisma from "@my-better-t-app/db";
import {createIncidentSchema, getIncidentByIdSchema, updateIncidentStatusSchema
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

          latitude: input.latitude,
          longitude: input.longitude,
          locationAccuracy: input.locationAccuracy,

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

  updateStatus: protectedProcedure
  .input(updateIncidentStatusSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const incident = await prisma.incident.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        reporterId: true,
        status: true,
      },
    });

    if (!incident) {
      throw new ORPCError("NOT_FOUND");
    }

    const isAdmin = user.role === "ADMIN";
    const isOwner = incident.reporterId === user.id;

    if (isAdmin) {
      return prisma.incident.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
        include: {
          reporter: true,
          medias: true,
        },
      });
    }

    if (!isOwner) {
      throw new ORPCError("FORBIDDEN");
    }

    if (input.status !== "ANNULE") {
      throw new ORPCError("FORBIDDEN");
    }

    if (incident.status === "RESOLU") {
      throw new ORPCError("BAD_REQUEST");
    }

    return prisma.incident.update({
      where: { id: input.id },
      data: {
        status: "ANNULE",
      },
      include: {
        reporter: true,
        medias: true,
      },
    });
  }),
};
