import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { useCallback } from "react";
import ReloadIcon from "@/assets/icons/reload.svg?react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { cascadeRequestsQuery } from "@/features/cascades/api";
import { CascadeRequestFiltersPopover } from "@/features/cascades/cascade-request-filters";
import { CascadeRequestsTable } from "@/features/cascades/cascade-requests-table";
import {
  type CascadeRequestFilters,
  type CascadeRequestsSearch,
  cascadeRequestsSearchSchema,
} from "@/features/cascades/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по названию или ID каскада";

const noFilters: Record<keyof CascadeRequestFilters, undefined> = {
  from: undefined,
  to: undefined,
  cascade: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  bank: undefined,
  method: undefined,
};

export const Route = createFileRoute("/admin/_app/cascades/history")({
  staticData: { title: "Каскады", subtitle: "История запросов" },
  validateSearch: cascadeRequestsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(cascadeRequestsQuery(deps));
  },
  component: CascadeHistoryPage,
});

function CascadeHistoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["cascades", "requests"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<CascadeRequestsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));
  const { from, to, cascade, amountFrom, amountTo, bank, method } = search;
  const filters = { from, to, cascade, amountFrom, amountTo, bank, method };
  const active = [
    from || to,
    cascade,
    amountFrom,
    amountTo,
    bank,
    method,
  ].filter((v) => v !== undefined && v !== "").length;

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
        <CascadeRequestFiltersPopover
          value={filters}
          onApply={(next) => setSearch({ ...noFilters, ...next })}
          activeCount={active}
          onClear={() => setSearch(noFilters)}
        />
        <Button
          variant="secondary"
          aria-label="Обновить"
          title="Обновить"
          className="size-11 rounded-[14px] border-border p-0"
          onClick={() =>
            client.invalidateQueries({ queryKey: ["cascades", "requests"] })
          }
        >
          <ReloadIcon className={cn("size-5", fetching && "animate-spin")} />
        </Button>
      </div>
      <CascadeRequestsTable search={search} onChange={setSearch} />
    </div>
  );
}
