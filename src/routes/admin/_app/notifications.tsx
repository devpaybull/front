import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/notifications")({
  staticData: { title: "Оповещения" },
  component: PagePlaceholder,
});
