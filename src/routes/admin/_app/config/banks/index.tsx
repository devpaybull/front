import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/config/banks/")({
  staticData: { title: "Конфигурация" },
  component: PagePlaceholder,
});
