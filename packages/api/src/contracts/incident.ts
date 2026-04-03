import { z } from "zod";

export const incidentTypeValues = [
  "ACCIDENT",
  "VOL",
  "INCENDIE",
  "INONDATION",
  "ROUTE_DANGEREUSE",
  "URGENCE_MEDICALE",
] as const;

export const incidentStatusValues = [
  "EN_COURS",
  "RESOLU",
  "ANNULE",
] as const;

export const villeValues = ["NDJAMENA"] as const;

export const quartierValues = ["FARCHA", "DIGUEL"] as const;

export const axeRoutierValues = [
  "Avenue_MOBUTU",
  "Route_NDjamena_Moundou",
  "Route_Charles_de_Gaulle",
  "Route_Globe_Terrestre",
] as const;

export const incidentTypeSchema = z.enum(incidentTypeValues);
export const incidentStatusSchema = z.enum(incidentStatusValues);
export const villeSchema = z.enum(villeValues);
export const quartierSchema = z.enum(quartierValues);
export const axeRoutierSchema = z.enum(axeRoutierValues);

export const createIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: incidentTypeSchema,
  ville: villeSchema,
  quartier: quartierSchema,
  axeRoutier: axeRoutierSchema,
});

export const getIncidentByIdSchema = z.object({
  id: z.string().min(1),
});

export type IncidentType = z.infer<typeof incidentTypeSchema>;
export type IncidentStatus = z.infer<typeof incidentStatusSchema>;
export type Ville = z.infer<typeof villeSchema>;
export type Quartier = z.infer<typeof quartierSchema>;
export type AxeRoutier = z.infer<typeof axeRoutierSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type GetIncidentByIdInput = z.infer<typeof getIncidentByIdSchema>;

export type IncidentReporter = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
};

export type IncidentMedia = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  mediaType: "IMAGE" | "VIDEO";
  createdAt: string | Date;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  ville: Ville;
  quartier: Quartier;
  axeRoutier: AxeRoutier;
  createdAt: string | Date;
  updatedAt: string | Date;
  reporterId: string;
  reporter?: IncidentReporter;
  medias?: IncidentMedia[];
};