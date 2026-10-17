import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { userRequisitesQuery } from "@/features/users/api";
import { RequisitesTab } from "@/features/users/profile/tabs/requisites-tab";
import {
  type RequisitesSearch,
  requisitesSearchSchema,
} from "@/features/users/schemas";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/users/$userId/requisites")({
  validateSearch: requisitesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => {
    void queryClient.prefetchQuery(userRequisitesQuery(params.userId, deps));
  },
  component: Tab,
});

function Tab() {
  const { userId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearch = useCallback(
    (patch: Partial<RequisitesSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  return <RequisitesTab userId={userId} search={search} onSearch={onSearch} />;
}
