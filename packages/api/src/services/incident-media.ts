import prisma, { MediaType } from "@my-better-t-app/db";

export async function createIncidentMedia(data: {
  incidentId: string;
  url: string;
  filename: string;
  mimeType: string;
  mediaType: MediaType;
}) {
  return prisma.incidentMedia.create({
    data,
  });
}