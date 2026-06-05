import prisma from "@my-better-t-app/db";
import { env } from "@my-better-t-app/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  trustedOrigins: [
    env.CORS_ORIGIN,
    "http://localhost:3001",
    "my-better-t-app://",
    "http://192.168.1.65:3001",
    "http://192.168.129.22:3001",
    ...(env.NODE_ENV === "development"
      ? [
          "exp://",
          "exp://**",
          "exp://192.168.*.*:*/**",
          "http://localhost:8081",
          "http://192.168.1.65:8081",
          "http://192.168.129.22:8081",
        ]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [],
});