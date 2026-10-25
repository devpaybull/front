import { createFileRoute } from "@tanstack/react-router";
import { broadcastsQuery } from "@/features/broadcasts/api";
import { BroadcastsPage } from "@/features/broadcasts/broadcasts-page";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/notifications")({
  staticData: {
    title: "Оповещения",
    subtitle: "Управляйте рассылками для трейдеров",
  },
  loader: () => {
    void queryClient.prefetchQuery(broadcastsQuery());
  },
  component: BroadcastsPage,
});
