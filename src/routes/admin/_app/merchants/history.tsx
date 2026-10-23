import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { format } from "date-fns";
import { useCallback } from "react";
import ReloadIcon from "@/assets/icons/reload.svg?react";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  exportRequests,
  requestsQuery,
} from "@/features/merchant-requests/api";
import { RequestFiltersPopover } from "@/features/merchant-requests/request-filters";
import { RequestsTable } from "@/features/merchant-requests/requests-table";
import {
  type RequestFilters,
  type RequestsSearch,
  requestsSearchSchema,
} from "@/features/merchant-requests/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID или мерчанту";

const noFilters: Record<keyof RequestFilters, undefined> = {
  from: undefined,
  to: undefined,
  amountFrom: undefined,
  amountTo: undefined,
  bank: undefined,
  method: undefined,
  direction: undefined,
};

export const Route = createFileRoute("/admin/_app/merchants/history")({
  staticData: { title: "Мерчанты", subtitle: "История запросов" },
  validateSearch: requestsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(requestsQuery(deps));
  },
  component: HistoryPage,
});

function HistoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const client = useQueryClient();
  const fetching =
    useIsFetching({ queryKey: ["merchant-requests", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<RequestsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));
  const { from, to, amountFrom, amountTo, bank, method, direction } = search;
  const filters = { from, to, amountFrom, amountTo, bank, method, direction };
  const active = [
    from || to,
    amountFrom,
    amountTo,
    bank,
    method,
    direction,
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
        <RequestFiltersPopover
          value={filters}
          onApply={(next) => setSearch({ ...noFilters, ...next })}
          activeCount={active}
          onClear={() => setSearch(noFilters)}
        />
        <ExportButton
          load={() => exportRequests(search)}
          fileName={`merchant-requests-${format(new Date(), "yyyy-MM-dd")}.csv`}
        />
        <Button
          variant="secondary"
          aria-label="Обновить"
          title="Обновить"
          className="size-11 rounded-[14px] border-border p-0"
          onClick={() =>
            client.invalidateQueries({ queryKey: ["merchant-requests"] })
          }
        >
          <ReloadIcon className={cn("size-5", fetching && "animate-spin")} />
        </Button>
      </div>
      <RequestsTable search={search} onChange={setSearch} />
    </div>
  );
}
