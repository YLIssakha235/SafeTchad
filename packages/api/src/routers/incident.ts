import { os } from "@orpc/server";
import { z } from "zod";
import prisma from "@my-better-t-app/db";
import { title } from "process";

// enums zod
const IncidentTypeEnum = z.enum([
    
"ACCIDENT",
"VOL",
"INCENDIE",
"INONDATION",
"ROUTE_DANGEUREUSE",
"URGENCE_MEDICALE",
]);

const IncidentStatusEnum = z.enum(["EN_COURS", "RESOLU", "ANNULE"]);

const VilleEnum = z.enum(["NDJAMENA"]);

const QuartierEnum = z.enum(["FARCHA", "DIGUEL"])


// creation de l'incident

const CreateIncidentInput = z.object({
    title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
    description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
    type: IncidentTypeEnum,
    ville: VilleEnum,
    quartier: QuartierEnum,
    axeRoutier: z.string().optional(),
});



