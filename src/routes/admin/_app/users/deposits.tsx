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
  depositStatsQuery,
  depositsQuery,
  exportDeposits,
} from "@/features/deposits/api";
import { DepositsTable } from "@/features/deposits/deposits-table";
import {
  type DepositsSearch,
  depositsSearchSchema,
} from "@/features/deposits/schemas";
import { DepositStatCards } from "@/features/deposits/stat-cards";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID, login, адрес, tx hash";

export const Route = createFileRoute("/admin/_app/users/deposits")({
  staticData: {
    title: "Пользователи",
    subtitle: "Управление пополнениями пользователей",
  },
  validateSearch: depositsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(depositsQuery(deps));
    void queryClient.prefetchQuery(depositStatsQuery());
  },
  component: DepositsPage,
});

function DepositsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["deposits"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<DepositsSearch>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true }),
    [navigate],
  );
  const [text, setText] = useLiveSearch(search.q, (q) => setSearch({ q }));

  return (
    <div className="flex flex-col">
      <DepositStatCards />
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
          load={() => exportDeposits(search)}
          fileName={`deposits-${format(new Date(), "yyyy-MM-dd")}.csv`}
        />
        <Button
          variant="secondary"
          aria-label="Обновить"
          title="Обновить"
          className="size-11 rounded-[14px] border-border p-0"
          onClick={() => client.invalidateQueries({ queryKey: ["deposits"] })}
        >
          <ReloadIcon className={cn("size-5", fetching && "animate-spin")} />
        </Button>
      </div>
      <DepositsTable search={search} onChange={setSearch} />
    </div>
  );
}
