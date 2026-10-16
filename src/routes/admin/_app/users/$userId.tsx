import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TableMessage } from "@/components/table/table-message";
import { Button } from "@/components/ui/button";
import { userQuery } from "@/features/users/api";
import { AdminNote } from "@/features/users/profile/admin-note";
import { BalanceCard } from "@/features/users/profile/balance-card";
import { ProfileHeader } from "@/features/users/profile/profile-header";
import { ProfileTabs } from "@/features/users/profile/profile-tabs";
import {
  TabToolbarProvider,
  TabToolbarSlot,
} from "@/features/users/profile/tabs/tab-toolbar";
import { TelegramCard } from "@/features/users/profile/telegram-card";
import { ApiError, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId")({
  staticData: {
    title: "Страница пользователя",
    subtitle: "Управление пользователем",
    menuItem: "/admin/users",
  },
  loader: ({ params }) => {
    void queryClient.prefetchQuery(userQuery(params.userId));
  },
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams();
  const { data: user, isPending, error, refetch } = useQuery(userQuery(userId));

  if (isPending) return <TableMessage>Загрузка…</TableMessage>;
  if (error) {
    return (
      <TableMessage>
        {error instanceof ApiError && error.status === 404
          ? "Пользователь не найден"
          : errorMessage(error)}
        <Button variant="secondary" onClick={() => refetch()}>
          Повторить
        </Button>
      </TableMessage>
    );
  }

  return (
    <TabToolbarProvider>
      <div className="flex flex-col">
        <div className="flex flex-col gap-5 border-b border-border/80 pb-[30px]">
          <ProfileHeader user={user} />
          {user.note && <AdminNote user={user} note={user.note} />}
        </div>
        <div className="grid gap-5 border-b border-border/80 py-[30px] lg:grid-cols-2">
          <BalanceCard user={user} />
          <TelegramCard user={user} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 py-[30px]">
          <ProfileTabs userId={userId} />
          <TabToolbarSlot />
        </div>
        <Outlet />
      </div>
    </TabToolbarProvider>
  );
}
