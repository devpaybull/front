import { useIsFetching, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import DocumentIcon from "@/assets/icons/document.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { AddBankDialog } from "@/features/banks/add-bank-dialog";
import { banksQuery } from "@/features/banks/api";
import { BanksTable, currencyOf } from "@/features/banks/banks-table";
import { type BanksSearch, banksSearchSchema } from "@/features/banks/schemas";
import { useDialog } from "@/hooks/use-dialog";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по названию или идентификатору";

export const Route = createFileRoute("/admin/_app/config/banks/")({
  staticData: { title: "Конфигурация", subtitle: "Управление банками" },
  validateSearch: banksSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(banksQuery(deps));
  },
  component: BanksPage,
});

function BanksPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["banks", "list"] }) > 0;
  const { data } = useQuery(banksQuery(search));
  const addBank = useDialog();

  const setSearch = useCallback(
    (patch: Partial<BanksSearch>) =>
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
        <Button
          variant="secondary"
          disabled
          className="gap-[7px] rounded-[14px] border-border px-6"
        >
          <DocumentIcon className="size-5" />
          Черный список отправителей
        </Button>
        <Button
          className="h-10 gap-2.5 rounded-[14px] px-5"
          onClick={addBank.show}
        >
          <PlusIcon className="size-5" />
          Добавить новый банк
        </Button>
      </div>
      <BanksTable search={search} onChange={setSearch} />
      {addBank.mounted && (
        <AddBankDialog
          key={addBank.key}
          currency={currencyOf(search, data)}
          open={addBank.open}
          onOpenChange={addBank.onOpenChange}
        />
      )}
    </div>
  );
}
