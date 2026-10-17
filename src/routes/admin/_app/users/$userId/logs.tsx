import { createFileRoute } from "@tanstack/react-router";
import { userLogsQuery } from "@/features/users/api";
import { LogsTab } from "@/features/users/profile/tabs/logs-tab";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId/logs")({
  loader: ({ params }) => {
    void queryClient.prefetchQuery(userLogsQuery(params.userId));
  },
  component: function Tab() {
    const { userId } = Route.useParams();
    return <LogsTab userId={userId} />;
  },
});
