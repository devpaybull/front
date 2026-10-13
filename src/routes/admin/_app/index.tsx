import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_app/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/inventory" });
  },
});
