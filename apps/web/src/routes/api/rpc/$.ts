import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [onError((error) => { console.error(error); })],
});

const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [new OpenAPIReferencePlugin({ schemaConverters: [new ZodToJsonSchemaConverter()] })],
  interceptors: [onError((error) => { console.error(error); })],
});

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);

  const allowedOrigins = [
    ...(process.env.CORS_ORIGIN ?? "").split(","),
    "http://localhost:3001",
    "http://localhost:8081",
  ]
    .map((o) => o.trim())
    .filter(Boolean);

  const inferredExpoOrigin = `${requestUrl.protocol}//${requestUrl.hostname}:8081`;

  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins.includes(inferredExpoOrigin)
        ? inferredExpoOrigin
        : allowedOrigins[0] ?? "http://localhost:3001";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

async function handle({ request }: { request: Request }) {
  console.log("URL reçue:", request.url);
  const CORS_HEADERS = getCorsHeaders(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext({ req: request }),
  });

  if (rpcResult.response) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => rpcResult.response!.headers.set(k, v));
    return rpcResult.response;
  }

  const apiResult = await apiHandler.handle(request, {
    prefix: "/api/rpc/api-reference",
    context: await createContext({ req: request }),
  });

  if (apiResult.response) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => apiResult.response!.headers.set(k, v));
    return apiResult.response;
  }

  return new Response("Not found", { status: 404, headers: CORS_HEADERS });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
    },
  },
});