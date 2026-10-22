import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { counterpartiesQuery } from "@/features/counterparties/api";
import { CounterpartiesTable } from "@/features/counterparties/counterparties-table";
import { CounterpartyFiltersDialog } from "@/features/counterparties/filters-dialog";
import {
  type CounterpartiesSearch,
  type CounterpartyFilters,
  counterpartiesSearchSchema,
  counterpartyFiltersSchema,
} from "@/features/counterparties/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по трейдеру, реквизиту или мерчанту";
const filterKeys = counterpartyFiltersSchema.keyof().options;

const filtersOf = (search: CounterpartiesSearch) =>
  Object.fromEntries(
    filterKeys.flatMap((key) =>
      search[key] === undefined ? [] : [[key, search[key]]],
    ),
  ) as CounterpartyFilters;

export const Route = createFileRoute("/admin/_app/merchants/counterparties/")({
  staticData: { title: "Мерчанты", subtitle: "Управление контрагентами" },
  validateSearch: counterpartiesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(counterpartiesQuery(deps));
  },
  component: CounterpartiesPage,
});

function CounterpartiesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["counterparties", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<CounterpartiesSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-center gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onClear={() => setText("")}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <span aria-hidden className="h-7 w-px bg-border/80" />
        <CounterpartyFiltersDialog
          value={filtersOf(search)}
          onApply={setSearch}
        />
      </div>
      <CounterpartiesTable search={search} onChange={setSearch} />
    </div>
  );
}
