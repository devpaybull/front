import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/")({
  staticData: { title: "Страница" },
  component: PagePlaceholder,
});
