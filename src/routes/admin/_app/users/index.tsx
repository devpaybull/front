import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/users/")({
  staticData: { title: "Пользователи" },
  component: PagePlaceholder,
});
