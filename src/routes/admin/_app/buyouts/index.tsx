import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { dealsQuery } from "@/features/deals/api";
import { DealsListPage } from "@/features/deals/deals-list-page";
import {
  type DealListSearch,
  dealListSearchSchema,
} from "@/features/deals/schemas";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/admin/_app/buyouts/")({
  staticData: { title: "Откупы", subtitle: "Управление операциями" },
  validateSearch: dealListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(dealsQuery(deps, "buyout"));
  },
  component: BuyoutsRoute,
});

function BuyoutsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearch = useCallback(
    (patch: Partial<DealListSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  return <DealsListPage kind="buyout" search={search} onSearch={onSearch} />;
}
