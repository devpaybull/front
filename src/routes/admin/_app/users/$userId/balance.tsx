import { createFileRoute } from "@tanstack/react-router";
import { userBalanceQuery } from "@/features/users/api";
import { BalanceTab } from "@/features/users/profile/tabs/balance-tab";
import { balanceSearchSchema } from "@/features/users/schemas";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId/balance")({
  validateSearch: balanceSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => {
    void queryClient.prefetchQuery(userBalanceQuery(params.userId, deps));
  },
  component: function Tab() {
    const { userId } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
      <BalanceTab
        userId={userId}
        search={search}
        onSearch={(next) => navigate({ search: next, replace: true })}
      />
    );
  },
});
