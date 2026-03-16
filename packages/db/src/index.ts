import { env } from "@my-better-t-app/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

export * from "../prisma/generated/enums";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

// j'ajoute ici le client afin que je peux faire appel a mes villes 
export * from "../prisma/generated/client";