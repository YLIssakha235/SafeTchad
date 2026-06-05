import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",

  client: {},

  server: {
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),

    // IMPORTANT
    CORS_ORIGIN: z.string(),

    DATABASE_URL: z.string(),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});