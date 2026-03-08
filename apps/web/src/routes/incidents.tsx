import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/incidents")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}