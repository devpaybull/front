import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { debtsQuery } from "@/features/debtors/api";
import { DebtorsTable } from "@/features/debtors/debtors-table";
import {
  type DebtorsSearch,
  debtorsSearchSchema,
} from "@/features/debtors/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID, login, адрес, транзакции";

export const Route = createFileRoute("/admin/_app/users/debtors")({
  staticData: {
    title: "Пользователи",
    subtitle: "Управление задолжавшими пользователями",
  },
  validateSearch: debtorsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(debtsQuery(deps));
  },
  component: DebtorsPage,
});

function DebtorsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["debts", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<DebtorsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col gap-5">
      <SearchInput
        value={text}
        onChange={(event) => setText(event.target.value)}
        loading={fetching}
        placeholder={searchHint}
        aria-label={searchHint}
      />
      <DebtorsTable search={search} onChange={setSearch} />
    </div>
  );
}
