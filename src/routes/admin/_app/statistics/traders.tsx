import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/statistics/traders")({
  staticData: { title: "Статистика по трейдерам" },
  component: PagePlaceholder,
});
