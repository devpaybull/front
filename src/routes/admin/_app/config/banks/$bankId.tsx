import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/config/banks/$bankId")({
  staticData: { title: "Банк" },
  component: PagePlaceholder,
});
