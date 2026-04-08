import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// dotenv.config({
//   path: "../../apps/web/.env",
// });

// chargmeent automatique .env (docker local )

dotenv.config({ path: path.join(__dirname, "../../apps/web/.env") });

dotenv.config();

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/my-better-t-app", //
  },
});
