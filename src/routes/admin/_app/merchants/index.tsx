import { useIsFetching } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { FilterSelect } from "@/components/filter-select";
import { SearchInput } from "@/components/ui/search-input";
import { merchantsQuery } from "@/features/merchants/api";
import { MerchantsTable } from "@/features/merchants/merchants-table";
import {
  type MerchantPeriod,
  type MerchantsSearch,
  merchantsSearchSchema,
} from "@/features/merchants/schemas";
import { useLiveSearch } from "@/hooks/use-live-search";
import { queryClient } from "@/lib/query-client";

const searchHint = "Поиск по ID, названию или внутреннему имени...";

const periodOptions: { value: MerchantPeriod; label: string }[] = [
  { value: "yesterday", label: "Вчера" },
  { value: "week", label: "7 дней" },
  { value: "month", label: "30 дней" },
  { value: "all", label: "Всё время" },
];
const statusOptions = [
  { value: "on", label: "Включены" },
  { value: "off", label: "Выключены" },
];
const exclusiveOptions = [
  { value: "on", label: "Включен" },
  { value: "off", label: "Выключен" },
];

export const Route = createFileRoute("/admin/_app/merchants/")({
  staticData: { title: "Мерчанты", subtitle: "Список мерчантов" },
  validateSearch: merchantsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    void queryClient.prefetchQuery(merchantsQuery(deps));
  },
  component: MerchantsPage,
});

function MerchantsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetching = useIsFetching({ queryKey: ["merchants", "list"] }) > 0;

  const setSearch = useCallback(
    (patch: Partial<MerchantsSearch>) =>
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
        <FilterSelect
          label="Период:"
          allLabel="Сегодня"
          options={periodOptions}
          value={search.period}
          onChange={(period) =>
            setSearch({ period: period as MerchantPeriod | undefined })
          }
          className="w-[210px]"
        />
        <FilterSelect
          label="Статус:"
          allLabel="Все"
          options={statusOptions}
          value={search.status}
          onChange={(status) =>
            setSearch({ status: status as MerchantsSearch["status"] })
          }
          className="w-[210px]"
        />
        <FilterSelect
          label="Искл.:"
          allLabel="Все"
          options={exclusiveOptions}
          value={search.exclusive}
          onChange={(exclusive) =>
            setSearch({ exclusive: exclusive as MerchantsSearch["exclusive"] })
          }
          className="w-[210px]"
        />
      </div>
      <MerchantsTable search={search} onChange={setSearch} />
    </div>
  );
}
