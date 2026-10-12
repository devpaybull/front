import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/statistics/merchants")({
  staticData: { title: "Статистика по мерчантам" },
  component: PagePlaceholder,
});
