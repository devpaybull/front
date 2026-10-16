import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { userQuery, userStatsQuery } from "@/features/users/api";
import { SettingsCards } from "@/features/users/profile/settings-cards";
import { UserStats } from "@/features/users/profile/user-stats";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId/")({
  loader: ({ params }) => {
    void queryClient.prefetchQuery(userStatsQuery(params.userId));
  },
  component: SettingsTab,
});

function SettingsTab() {
  const { userId } = Route.useParams();
  const { data: user } = useQuery(userQuery(userId));
  if (!user) return null;

  return (
    <div className="flex flex-col gap-[30px]">
      <SettingsCards user={user} />
      <UserStats userId={userId} />
    </div>
  );
}
