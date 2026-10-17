import { createFileRoute } from "@tanstack/react-router";
import { userDealsQuery } from "@/features/users/api";
import { DealsTab } from "@/features/users/profile/tabs/deals-tab";
import { dealsSearchSchema } from "@/features/users/schemas";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId/deals")({
  validateSearch: dealsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => {
    void queryClient.prefetchQuery(userDealsQuery(params.userId, deps));
  },
  component: function Tab() {
    const { userId } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
      <DealsTab
        userId={userId}
        search={search}
        onSearch={(next) => navigate({ search: next, replace: true })}
      />
    );
  },
});
