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
  exportWithdrawals,
  withdrawalStatsQuery,
  withdrawalsQuery,
} from "@/features/withdrawals/api";
import {
  type WithdrawalsSearch,
  withdrawalsSearchSchema,
} from "@/features/withdrawals/schemas";
import { WithdrawalStatCards } from "@/features/withdrawals/stat-cards";
import { WithdrawalsTable } from "@/features/withdrawals/withdrawals-table";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID, login, адрес, транзакции";

export const Route = createFileRoute("/admin/_app/users/withdrawals")({
  staticData: {
    title: "Пользователи",
    subtitle: "Управление выводами пользователей",
  },
  validateSearch: withdrawalsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(withdrawalsQuery(deps));
    void queryClient.prefetchQuery(withdrawalStatsQuery());
  },
  component: WithdrawalsPage,
});

function WithdrawalsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["withdrawals"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<WithdrawalsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col">
      <WithdrawalStatCards />
      <div className="mt-10 mb-5 flex items-center gap-4">
        <SearchInput
          className="flex-1"
          value={text}
          onChange={(event) => setText(event.target.value)}
          loading={fetching}
          placeholder={searchHint}
          aria-label={searchHint}
        />
        <span aria-hidden className="h-7 w-px bg-border/80" />
        <ExportButton
          load={() => exportWithdrawals(search)}
          fileName={`withdrawals-${format(new Date(), "yyyy-MM-dd")}.csv`}
        />
        <Button
          variant="secondary"
          aria-label="Обновить"
          title="Обновить"
          className="size-11 rounded-[14px] border-border p-0"
          onClick={() =>
            client.invalidateQueries({ queryKey: ["withdrawals"] })
          }
        >
          <ReloadIcon className={cn("size-5", fetching && "animate-spin")} />
        </Button>
      </div>
      <WithdrawalsTable search={search} onChange={setSearch} />
    </div>
  );
}
