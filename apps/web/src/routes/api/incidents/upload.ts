import { createFileRoute } from "@tanstack/react-router";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createIncidentMedia } from "@my-better-t-app/api";
import { MediaType } from "@my-better-t-app/db";

export const Route = createFileRoute("/api/incidents/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();

          const file = formData.get("file");
          const incidentId = formData.get("incidentId");

          if (!(file instanceof File) || typeof incidentId !== "string" || !incidentId) {
            return new Response("Missing file or incidentId", { status: 400 });
          }

          if (!file.type.startsWith("image/")) {
            return new Response("Only image files are allowed", { status: 400 });
          }

          const uploadsDir = path.join(process.cwd(), "uploads");
          await mkdir(uploadsDir, { recursive: true });

          const safeName = file.name.replace(/\s+/g, "-");
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
          return new Response("Upload failed", { status: 500 });
        }
      },
    },
  },
});