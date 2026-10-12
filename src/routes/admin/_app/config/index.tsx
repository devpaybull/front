import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/config/")({
  staticData: { title: "Конфигурация" },
  component: PagePlaceholder,
});
