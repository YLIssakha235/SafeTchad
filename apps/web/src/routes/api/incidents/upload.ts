import { createFileRoute } from "@tanstack/react-router";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import prisma, { MediaType } from "@my-better-t-app/db";
import { auth } from "@my-better-t-app/auth";
import { createIncidentMedia } from "@my-better-t-app/api";

export const Route = createFileRoute("/api/incidents/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user?.id) {
            return new Response("Vous devez être connecté.", { status: 401 });
          }

          const formData = await request.formData();

          const file = formData.get("file");
          const incidentId = formData.get("incidentId");

          if (!(file instanceof File) || typeof incidentId !== "string" || !incidentId) {
            return new Response("Image ou incident manquant.", { status: 400 });
          }

          if (!file.type.startsWith("image/")) {
            return new Response("Seules les images sont autorisées.", { status: 400 });
          }

          const maxSize = 10 * 1024 * 1024;

          if (file.size > maxSize) {
            return new Response("Image trop lourde. Maximum 10 MB.", { status: 400 });
          }

          const incident = await prisma.incident.findUnique({
            where: { id: incidentId },
            select: {
              id: true,
              reporterId: true,
              status: true,
            },
          });

          if (!incident) {
            return new Response("Incident introuvable.", { status: 404 });
          }

          if (incident.status !== "EN_COURS") {
            return new Response(
              "L’ajout d’image est désactivé car cet incident n’est plus en cours.",
              { status: 403 }
            );
          }

          const user = session.user as typeof session.user & { role?: string };

          const isAdmin = user.role === "ADMIN";
          const isOwner = incident.reporterId === user.id;

          if (!isAdmin && !isOwner) {
            return new Response(
              "Vous ne pouvez pas ajouter d’image sur cet incident.",
              { status: 403 }
            );
          }

          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          await mkdir(uploadsDir, { recursive: true });

          const safeName = file.name
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9._-]/g, "");

          const fileName = `${Date.now()}-${safeName}`;
          const filePath = path.join(uploadsDir, fileName);

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          await writeFile(filePath, buffer);

          const media = await createIncidentMedia({
            incidentId,
            url: `/uploads/${fileName}`,
            filename: fileName,
            mimeType: file.type,
            mediaType: MediaType.IMAGE,
          });

          return Response.json(media, { status: 201 });
        } catch (error) {
          console.error("Upload failed:", error);
          return new Response("Erreur lors de l’upload.", { status: 500 });
        }
      },
    },
  },
});