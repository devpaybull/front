import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/admin/_app/cascades/$cascadeId")({
  staticData: { title: "Каскад", menuItem: "/admin/cascades" },
  component: PagePlaceholder,
});
